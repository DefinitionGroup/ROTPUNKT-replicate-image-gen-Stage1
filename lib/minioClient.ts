import 'server-only'

import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import pRetry from 'p-retry'
import { Client } from 'minio'

type ObjectMetaData = Record<string, string | number>
type UploadImagesOptions = {
  deterministicPrefix?: string
}
type MinioConfig = {
  domain: string
  accessKey: string
  secretKey: string
}

const BUCKET = 'vision-images' as const
const streamPipeline = promisify(pipeline)

function getSafeObjectName(originURL: string): string {
  let baseName = 'image'
  try {
    const parsed = new URL(originURL)
    baseName = path.basename(parsed.pathname) || baseName
  } catch {
    baseName = path.basename(originURL) || baseName
  }

  const cleaned = baseName.split('?')[0].replace(/[^a-zA-Z0-9._-]/g, '_')
  const suffix = cleaned || 'image'
  return `${crypto.randomUUID()}-${suffix}`
}

function getObjectExtension(originURL: string): string {
  let ext = ''
  try {
    const parsed = new URL(originURL)
    ext = path.extname(parsed.pathname)
  } catch {
    ext = path.extname(originURL)
  }

  const sanitized = ext.toLowerCase()
  if (/^\.[a-z0-9]{1,8}$/.test(sanitized)) return sanitized
  return '.webp'
}

function getDeterministicObjectName(originURL: string, index: number, prefix: string): string {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9._-]/g, '_') || 'image'
  return `${safePrefix}-${index}${getObjectExtension(originURL)}`
}

export class Minio_Error extends Error {
  constructor(message: string | undefined) {
    super(message)
    this.name = 'Minio_Error'
  }
}

function getMinioConfig(): MinioConfig {
  const domain = process.env.MINIO_DOMAIN
  const accessKey = process.env.MINIO_ACCESS_KEY
  const secretKey = process.env.MINIO_SECRET_KEY

  const missing: string[] = []
  if (!domain) missing.push('MINIO_DOMAIN')
  if (!accessKey) missing.push('MINIO_ACCESS_KEY')
  if (!secretKey) missing.push('MINIO_SECRET_KEY')

  if (missing.length > 0) {
    throw new Minio_Error(`Missing MinIO env variables: ${missing.join(', ')}`)
  }

  return {
    domain: domain!,
    accessKey: accessKey!,
    secretKey: secretKey!,
  }
}

let minioClient: Client | null = null
function getMinioClient(): Client {
  if (minioClient) return minioClient

  const config = getMinioConfig()
  minioClient = new Client({
    endPoint: config.domain,
    port: 443,
    useSSL: true,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
  })
  return minioClient
}

export function getObjectUrl(objectName: string): string {
  const { domain } = getMinioConfig()
  return `https://${domain}/${BUCKET}/${objectName}`
}

/**
 * Uploads an image to bucket
 * @param sourcePath
 * @param destinationName hash/part.webp
 * @param metadata
 */
async function uploadImage(sourcePath: string, destinationName: string, metadata: ObjectMetaData) {
  console.debug('Uploading image', sourcePath, destinationName)
  try {
    console.debug('uploading', sourcePath, destinationName, metadata)
    const result = await getMinioClient().fPutObject(BUCKET, destinationName, sourcePath, metadata)
    if (!result) throw new Error('No result')
    console.debug('✅ Uploaded image successfully!', result)
    return result
  } catch (error) {
    console.error('Minio_Error', error)
    throw new Minio_Error(`File upload error: ${error}`)
  }
}

async function downloadImageTmp(tempDir: string, originURL: string, destinationName: string) {
  try {
    const response = await fetch(originURL)
    if (!response.ok) throw new Minio_Error(`Failed to fetch ${originURL}, ${response.status}`)

    const filePath = path.join(tempDir, destinationName)
    const fileStream = fs.createWriteStream(filePath)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await streamPipeline(response.body as any , fileStream)
    console.debug('✅ Downloaded image', filePath)
    return filePath
  } catch (error) {
    console.error(error)
    throw new Minio_Error(`File download error: ${error}`)
  }
}

async function downloadImage(tempDir: string, originURL: string, destinationName: string) {
  const filePath = await downloadImageTmp(tempDir, originURL, destinationName)
  await uploadImage(filePath, destinationName, {})
  return getObjectUrl(destinationName)
}

async function uploadImages(images: string[], options?: UploadImagesOptions): Promise<string[]> {
  const tempDir = fs.mkdtempSync(path.join(tmpdir(), crypto.randomUUID()))
  try {
    const result = await Promise.all(images.map(async (imageURL, index) => await pRetry(
      async () => {
        const destinationName = options?.deterministicPrefix
          ? getDeterministicObjectName(imageURL, index, options.deterministicPrefix)
          : getSafeObjectName(imageURL)
        return await downloadImage(tempDir, imageURL, destinationName)
      },
      {
        retries: 6,
        minTimeout: 10,
        maxTimeout: 200,
        onFailedAttempt: (error) => {
          console.debug(`🔄 Failed attempt ${error.attemptNumber} to download ${imageURL}`)
        },
      },
    )))

    console.debug(`✅ Uploaded ${images.length} images`)
    return result
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

export {
  uploadImages
}
