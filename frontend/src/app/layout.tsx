import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // import font
import "./globals.css";
import Header from "./Header";

export const metadata: Metadata = {
  title: "CoRGi - Comparative Regulatory Genomics",
  description: "Interactive comparative genomics analysis platform for exploring gene expression patterns and evolutionary relationships across species",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // add font to className, also add antialiased and dark mode
    <html lang="en" className={`${GeistSans.className} antialiased`}>

      <body>
          <Header/>
          {children}
        </body>
    </html>
  );
}
