// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/browser");
  };

  return (
    <main
      style={{
        height: "100vh",
        margin: 0,
        backgroundColor: "#ff7f50", // coral/orange color
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "0.5em" }}>
        Welcome to the Comparative Regulatory Genomics Project
      </h1>
      <p style={{ fontSize: "1.25rem", marginBottom: "2em" }}>
        Explore genomic data with our interactive Genome Browser.
      </p>
      <button
        onClick={handleClick}
        style={{
          cursor: "pointer",
          backgroundColor: "#ff4500", // orange red color for button
          color: "white",
          border: "none",
          padding: "1em 2em",
          borderRadius: "8px",
          fontSize: "1.25rem",
          fontWeight: "bold",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e03e00")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff4500")}
      >
        See the Genome Browser
      </button>
    </main>
  );
}
