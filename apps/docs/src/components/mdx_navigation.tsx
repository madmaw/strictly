import { type MarkdownHeading } from 'astro'
import { useMemo } from 'react'
import styles from './mdx_navigation.module.css'
import { type ToAbsoluteUrl } from './to_absolute_url'

export type PageId = 'home' | 'base' | 'define' | 'react-form' | 'why'

type PageMetadata = {
  title: string,
  path: string,
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
  define: {
    path: '/define/README.md',
    title: 'Define',
  },
  'react-form': {
    path: '/react-form/README.md',
    title: 'React Form',
  },
  why: {
    path: '/why',
    title: 'Why?',
  },
}

type NavigationBranch = {
  slug: string,
  text: string,
  children: NavigationBranch[],
}

export function MdxNavigation({
  headings,
  page,
  toAbsoluteUrl,
}: {
  headings: readonly MarkdownHeading[],
  page: string,
  toAbsoluteUrl: ToAbsoluteUrl,
}) {
  const branches = useMemo<readonly NavigationBranch[]>(function () {
    return headings.reduce<NavigationBranch[]>(function (
      acc,
      {
        depth,
        slug,
        text,
      },
    ) {
      let branches = acc
      while (depth > 1) {
        const branch = branches[branches.length - 1]
        if (branch != null) {
          branches = branch.children
        }
        depth--
      }
      if (text !== 'Footnotes' && text !== '') {
        ;(branches ?? acc).push({
          slug,
          text,
          children: [],
        })
      }
      return acc
    }, [])
  }, [headings])
  return (
    <ul className={styles.root}>
      {Object.entries(pagePaths).map(function ([
        pageId,
        {
          title,
          path: navPath,
        },
      ]) {
        return (
          <li
            className={styles.root}
            key={pageId}
          >
            {page === pageId
              ? (
                <span className={styles.current}>
                  {title}
                </span>
              )
              : (
                <a
                  className={styles.navItem}
                  href={toAbsoluteUrl(navPath)}
                >
                  {title}
                </a>
              )}
            {page === pageId && <MdxNavigationLayer branches={branches} />}
          </li>
        )
      })}
    </ul>
  )
}

function MdxNavigationLayer({
  branches,
}: {
  branches: readonly NavigationBranch[],
}) {
  if (branches.length === 0) {
    return null
  }
  return (
    <ul
      className={styles.branch}
    >
      {branches.map(function ({
        children,
        slug,
        text,
      }) {
        return (
          <li key={slug}>
            <a
              className={styles.navItem}
              href={`#${slug}`}
            >
              {text}
            </a>
            <MdxNavigationLayer branches={children} />
          </li>
        )
      })}
    </ul>
  )
}
