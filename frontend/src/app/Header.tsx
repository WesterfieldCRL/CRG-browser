'use client'

import Link from "next/link"
import { useMediaQuery } from 'react-responsive'
import { Home, Dna, GitCompare, Activity } from "lucide-react"

export default function Header() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  return (
    <>
      <header className="header">
        <nav className="nav-container">
          <Link href="/" className="logo">CoRGi</Link>
          <ul className="nav-links">
            <li>
              <Link href="/" aria-label="Home">
                {isMobile ? <Home size={22} /> : 'Home'}
              </Link>
            </li>
            <li>
              <Link href="/browser" aria-label="Genome Browser">
                {isMobile ? <Dna size={22} /> : 'Genome Browser'}
              </Link>
            </li>
            <li>
              <Link href="/comparison" aria-label="Genome Comparison">
                {isMobile ? <GitCompare size={22} /> : 'Genome Comparison'}
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <style jsx>{`
        .header {
          background: linear-gradient(135deg, var(--primary, #0b7285) 0%, var(--accent, #2db4b6) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }

        .logo {
          font-size: 1.8rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
          transition: transform 0.2s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 2rem;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: background-color 0.3s ease, transform 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-links a:hover {
          background-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        .nav-links a:active {
          transform: translateY(0);
        }
      `}</style>
    </>
  )
}
