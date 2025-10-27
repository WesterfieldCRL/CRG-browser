export default function NavbarMobile() {
  return (
    <div className="md:hidden" dangerouslySetInnerHTML={{ __html: '<header class="navbar">\n  <div class="navbar-inner">\n    <div class="site-title">🧬 CoRGi</div>\n\n    <nav class="nav-tabs" role="navigation" aria-label="Main navigation">\n      <a class="nav-tab" href="index-mobile.html">Home</a>\n      <a class="nav-tab" href="browse-genes-mobile.html">Browse Genes</a>\n      <a class="nav-tab" href="compare-genomes-mobile.html">Compare</a>\n      <a class="nav-tab" href="contact-mobile.html">Contact</a>\n    </nav>\n  </div>\n</header>\n' as unknown as string }} />
  );
}
