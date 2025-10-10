'use client'

import Link from "next/link"

export default function Header() {
    return (
        <>
            <header className="header">
            <nav className="nav-container">
            <Link href="/" className="logo">GenomeHub</Link>
            <ul className="nav-links">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/browser">Genome Browser</Link></li>
                <li><Link href="/comparison">Genome Comparison</Link></li>
                <li><Link href="/reg_comparison">Regulatory Comparison</Link></li>
            </ul>
            </nav>
        </header>

        <style jsx>{
            `
                .header {
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                position: sticky;
                top: 0;
                z-index: 100;
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
                transition: background-color 0.3s ease;
                }

                .nav-links a:hover {
                background-color: rgba(255, 255, 255, 0.1);
                }`
            }
            </style>
        </>
    )
}