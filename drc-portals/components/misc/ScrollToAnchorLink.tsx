'use client'

import { AnchorHTMLAttributes, DetailedHTMLProps } from "react"

/**
 * Scroll's to the anchor
 * @param href: #anchor
 */
export default function ScrollToAnchorLink({ children, href, ...props }: Omit<DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, 'onClick'> & { href: string }) {
  return <a {...props} onClick={() => {
    const m = /#(.+)$/.exec(href)
    if (!m) return
    const [_0, anchor] = m
    if (!anchor) return
    const el = document.getElementById(anchor)
    if (el === null) return
    history.replaceState(undefined, '', href)
    window.scrollTo({
        top: el.offsetTop,
        behavior: "smooth",
    });
  }}>{children}</a>
}
