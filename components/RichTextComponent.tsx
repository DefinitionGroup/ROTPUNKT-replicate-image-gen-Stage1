// components/RichTextComponent.tsx
import * as React from 'react'
import Link from 'next/link'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import type { RichText as RichTextType } from '@/sanity/sanity.types'

export type RichTextProps = {
  // Usa los tipos generados por Sanity
  value: NonNullable<RichTextType['content']> | null | undefined
  className?: string
  internalLinkResolver?: (refId: string) => string | undefined
  externalRel?: string
}

// util: ids en headings
function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

function createComponents({
  internalLinkResolver,
  externalRel = 'noopener noreferrer',
}: Pick<RichTextProps, 'internalLinkResolver' | 'externalRel'>): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p className="mb-5 leading-8 tracking-normal">{children}</p>,
      h1: ({ children }) => {
        const text = React.Children.toArray(children).join(' ')
        const id = slugify(String(text))
        return (
          <h1 id={id} className="scroll-mt-28 mt-14 mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            {children}
          </h1>
        )
      },
      h2: ({ children }) => {
        const text = React.Children.toArray(children).join(' ')
        const id = slugify(String(text))
        return (
          <h2 id={id} className="scroll-mt-28 mt-12 mb-4 text-3xl  leading-snug tracking-tight md:text-4xl">
            {children}
          </h2>
        )
      },
      h3: ({ children }) => {
        const text = React.Children.toArray(children).join(' ')
        const id = slugify(String(text))
        return (
          <h3 id={id} className="scroll-mt-28 mt-10 mb-3 text-2xl  leading-snug tracking-tight md:text-3xl">
            {children}
          </h3>
        )
      },
      h4: ({ children }) => {
        const text = React.Children.toArray(children).join(' ')
        const id = slugify(String(text))
        return (
          <h4 id={id} className="scroll-mt-28 mt-8 mb-2 text-xl leading-snug tracking-tight md:text-2xl">
            {children}
          </h4>
        )
      },
      blockquote: ({ children }) => (
        <blockquote className="my-8 rounded-md border-l-4 border-gray-300 bg-gray-50 px-5 py-4 italic dark:border-gray-700 dark:bg-gray-900/40">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="my-5 ml-6 list-disc space-y-2 md:ml-7">{children}</ul>,
      number: ({ children }) => <ol className="my-5 ml-6 list-decimal space-y-2 md:ml-7">{children}</ol>,
    },
    listItem: ({ children }) => <li className="pl-1">{children}</li>,
    marks: {
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      underline: ({ children }) => <u className="underline">{children}</u>,
      'strike-through': ({ children }) => <s className="line-through">{children}</s>,
      code: ({ children }) => (
        <code className="rounded-md border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-[0.95em] dark:border-gray-700 dark:bg-gray-800">
          {children}
        </code>
      ),
      // link externo
      link: ({ children, value }) => {
        const href: string | undefined = (value as any)?.href
        const openInNewTab: boolean | undefined = (value as any)?.openInNewTab ?? true
        const nofollow: boolean | undefined = (value as any)?.nofollow
        if (!href) return <>{children}</>
        const rel = [externalRel, nofollow ? 'nofollow' : undefined].filter(Boolean).join(' ')
        const cls =
          'underline decoration-2 underline-offset-4 text-red-600 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-blue-400'
        return openInNewTab ? (
          <Link href={href} target="_blank" rel={rel} className={cls}>
            {children}
          </Link>
        ) : (
          <Link href={href} rel={rel} className={cls}>
            {children}
          </Link>
        )
      },
      // link interno
      internalLink: ({ children, value }) => {
        const refId: string | undefined = (value as any)?.reference?._ref
        const href = refId && internalLinkResolver ? internalLinkResolver(refId) : undefined
        if (!href) return <>{children}</>
        return (
          <Link
            href={href}
            className="underline decoration-2 underline-offset-4 text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-blue-400"
          >
            {children}
          </Link>
        )
      },
    },
  }
}

export default function RichTextComponent({
  value,
  className,
  internalLinkResolver,
  externalRel,
}: RichTextProps) {
  if (!value || value.length === 0) return null

  const components = React.useMemo(
    () => createComponents({ internalLinkResolver, externalRel }),
    [internalLinkResolver, externalRel]
  )

  return (
    <div
      className={[
        'richtext',
        'space-y-5 md:space-y-6',
        'text-base leading-relaxed',
        // NOTA: `className` va al final para que Tailwind la gane si hay conflicto (p. ej. `text-white`)
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* `PortableText` acepta cualquier shape compatible; casteamos para no pelear con sus tipos */}
      <PortableText value={value as any} components={components} />
    </div>
  )
}