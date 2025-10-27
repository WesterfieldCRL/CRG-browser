export default function Navbar() {
  return (
    <div dangerouslySetInnerHTML={{ __html: '<header class="navbar" role="banner">\n  <div class="navbar-inner">\n    <a href="index.html" class="site-title" aria-label="CoRGi homepage">\n      <span role="img" aria-label="DNA molecule">🧬</span> CoRGi\n    </a>\n\n    <nav class="nav-tabs" role="navigation" aria-label="Main navigation">\n      <a class="nav-tab" href="index.html">\n        <span class="sr-only">Navigate to </span>Home\n      </a>\n      <a class="nav-tab" href="browse-genes.html">\n        <span class="sr-only">Navigate to </span>Browse Genes\n      </a>\n      <a class="nav-tab" href="compare-genomes.html">\n        <span class="sr-only">Navigate to </span>Compare\n      </a>\n      <a class="nav-tab" href="contact.html">\n        <span class="sr-only">Navigate to </span>Contact\n      </a>\n    </nav>\n  </div>\n</header>\n' as unknown as string }} />
  );
}
