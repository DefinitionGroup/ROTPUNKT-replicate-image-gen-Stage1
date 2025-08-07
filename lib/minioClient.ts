import 'server-only'

import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import pRetry from 'p-retry'
import { Client } from 'minio'
import * as https from 'https'

type ObjectMetaData = Record<string, string | number>

if (!process.env.MINIO_DOMAIN) throw new Error('Missing MINIO_DOMAIN in env variables')

const BUCKET = 'vision-images' as const
const streamPipeline = promisify(pipeline)

export function getObjectUrl(objectName: string): string {
  return `https://${process.env.MINIO_DOMAIN}/${BUCKET}/${objectName}`
}

const insecureAgent = new https.Agent({
  keepAlive: true,
  timeout: 10_000,
  rejectUnauthorized: false,
});

const minioClient = new Client({
  endPoint: process.env.MINIO_DOMAIN,
  port: 443,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  transportAgent: insecureAgent,
});
export class Minio_Error extends Error {
  constructor(message: string | undefined) {
    super(message)
    this.name = 'Minio_Error'
  }
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
    const result = await minioClient.fPutObject(BUCKET, destinationName, sourcePath, metadata)
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

async function uploadImages(images: string[]): Promise<string[]> {
  const tempDir = fs.mkdtempSync(path.join(tmpdir(), crypto.randomUUID()))

  const result = await Promise.all(images.map(async (imageURL) => await pRetry(
    async () => await downloadImage(tempDir, imageURL, imageURL.split('/').at(-1)!),
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
}

export {
  uploadImages
}
