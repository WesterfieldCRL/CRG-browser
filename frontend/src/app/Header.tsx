'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMediaQuery } from 'react-responsive'
import { Home, Dna, GitCompare } from "lucide-react"

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browser', label: 'Gene Browser', icon: Dna },
  { href: '/comparison', label: 'Gene Comparison', icon: GitCompare },
] as const

export default function Header() {
  const pathname = usePathname()
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="header">
        <nav className="nav-container" role="navigation" aria-label="Main navigation">
          <Link href="/" className="logo" aria-label="CoRGi - Home">
            <span className="logo-text">CoRGi</span>
          </Link>
          <ul className="nav-links" role="list">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`nav-link ${active ? 'active' : ''}`}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                  >
                    {isMobile ? (
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    ) : (
                      <>
                        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                        <span>{label}</span>
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>

      <style jsx>{`
        .header {
          background: linear-gradient(135deg, #0a6080 0%, #1a8fa0 50%, #2db4b6 100%);
          color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        .nav-container {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.375rem 3rem;
          gap: 3rem;
        }

        .logo {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          color: white;
          text-decoration: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .logo:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .logo:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 6px;
          border-radius: 6px;
        }

        .logo-text {
          font-size: 1.375rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .logo-subtitle {
          font-size: 0.6875rem;
          font-weight: 500;
          opacity: 0.9;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
          align-items: center;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.95);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          white-space: nowrap;
        }

        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .nav-link:active {
          transform: translateY(0);
        }

        .nav-link:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 3px;
        }

        .nav-link.active {
          background-color: rgba(255, 255, 255, 0.25);
          color: white;
          font-weight: 600;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3),
                      0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background-color: white;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0.625rem 1.5rem;
            gap: 1.5rem;
          }

          .logo-subtitle {
            display: none;
          }

          .logo-text {
            font-size: 1.625rem;
          }

          .nav-links {
            gap: 0.5rem;
          }

          .nav-link {
            padding: 0.75rem;
            width: 48px;
            height: 48px;
            justify-content: center;
            border-radius: 12px;
          }

          .nav-link.active::after {
            bottom: -0.125rem;
            width: 4px;
            height: 4px;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0.875rem 1rem;
          }

          .logo-text {
            font-size: 1.5rem;
          }

          .nav-link {
            width: 44px;
            height: 44px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo,
          .nav-link {
            transition: none;
          }
        }
      `}</style>
    </>
  )
}
