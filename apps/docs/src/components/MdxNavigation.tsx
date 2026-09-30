import { type MarkdownHeading } from 'astro'
import { useMemo } from 'react'
import styles from './mdxNavigation.module.css'
import { type ToAbsoluteUrl } from './toAbsoluteUrl'

export type PageId = 'home' | 'base' | 'react' | 'why'

type PageMetadata = {
  title: string
  path: string
}

export const pagePaths: Record<PageId, PageMetadata> = {
  home: {
    path: '/home',
    title: 'Home',
  },
  base: {
    path: '/base/README.md',
    title: 'Base',
  },
  react: {
    path: '/react/README.md',
    title: 'React',
  },
  why: {
    path: '/why',
    title: 'Why?',
  },
}

type NavigationBranch = {
  slug: string
  text: string
  children: NavigationBranch[]
}

export function MdxNavigation({
  headings,
  page,
  toAbsoluteUrl,
}: {
  headings: readonly MarkdownHeading[]
  page: string
  toAbsoluteUrl: ToAbsoluteUrl
}) {
  const branches = useMemo<readonly NavigationBranch[]>(
    () =>
      headings.reduce<NavigationBranch[]>((acc, { depth, slug, text }) => {
        let branches = acc
        while (depth > 1) {
          const branch = branches.at(-1)
          if (branch != null) {
            branches = branch.children
          }
          depth--
        }
        if (text !== 'Footnotes' && text !== '') {
          branches.push({
            slug,
            text,
            children: [],
          })
        }
        return acc
      }, []),
    [headings],
  )
  return (
    <ul className={styles.root}>
      {Object.entries(pagePaths).map(([pageId, { title, path: navPath }]) => (
        <li
          className={styles.root}
          key={pageId}
        >
          {page === pageId ? (
            <span className={styles.current}>{title}</span>
          ) : (
            <a
              className={styles.navItem}
              href={toAbsoluteUrl(navPath)}
            >
              {title}
            </a>
          )}
          {page === pageId && <MdxNavigationLayer branches={branches} />}
        </li>
      ))}
    </ul>
  )
}

function MdxNavigationLayer({
  branches,
}: {
  branches: readonly NavigationBranch[]
}) {
  if (branches.length === 0) {
    return null
  }
  return (
    <ul className={styles.branch}>
      {branches.map(({ children, slug, text }) => (
        <li key={slug}>
          <a
            className={styles.navItem}
            href={`#${slug}`}
          >
            {text}
          </a>
          <MdxNavigationLayer branches={children} />
        </li>
      ))}
    </ul>
  )
}
