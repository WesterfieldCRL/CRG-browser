# Legacy to Next.js Functionality Migration Report

## Executive Summary

This document outlines the migration of legacy functionality from static HTML files to the Next.js application.

## Issues Fixed

### 1. Dark/Light Mode Consistency ✅ FIXED
- **Problem**: Theme switching was inconsistent across CSS files
- **Solution**:
  - Updated `frontend/src/app/globals.css` with CSS variables and `[data-theme="dark"]` selectors
  - Updated `frontend/public/globals.css` with proper theme support
  - Fixed rc-slider styles to respond to theme changes

### 2. Data Retrieval Typo ✅ FIXED
- **Problem**: `fetchRegulatoryELementLines` had capital L instead of lowercase
- **Solution**: Renamed to `fetchRegulatoryElementLines` in all files

### 3. Unused Frontend Files ✅ IDENTIFIED
- **Removed**: `frontend/src/app/page.tsx.bak`
- **Unused**: `Navbar.tsx`, `NavbarMobile.tsx` (replaced by `Header.tsx`)
- **Legacy Files**: HTML files in `frontend/public/` (documented below)

---

## Functionality Migration Status

### Home Page (/) ✅ COMPLETED

**Migrated:**
- ✅ Clean React implementation (removed `dangerouslySetInnerHTML`)
- ✅ PWA install prompt with `beforeinstallprompt` handling
- ✅ Haptic feedback on interactive elements
- ✅ Performance monitoring (LCP tracking)
- ✅ About section with project description
- ✅ Statistics section (3 species, 100+ genes, 1M+ base pairs)
- ✅ Feature cards with proper routing

**File**: `frontend/src/app/page.tsx`

---

### Contact Page (/contact) ✅ COMPLETED

**Migrated:**
- ✅ Detailed email section
- ✅ Four feature cards: Open Data, Research, Tools, Community
- ✅ Better styling and layout matching legacy
- ✅ Theme-aware styling with CSS variables

**File**: `frontend/src/app/contact/page.tsx`

---

### Browser Page (/browser) ⚠️ PARTIALLY MIGRATED

**Current State:**
The Next.js browser page uses API calls (`fetchGenes`, `fetchSequence`, `fetchSpecies`) while the legacy version used CSV parsing from a local `data.csv` file.

**Already Implemented:**
- ✅ Gene selection (dropdown)
- ✅ Species loading
- ✅ Sequence viewing with pagination
- ✅ IterativeZoom component
- ✅ Tooltip on hover

**Missing from Legacy (browser-genes.html + browse-genes.js):**

#### 1. Gene Search with Button Grid
**Legacy**: Interactive grid of gene buttons with search filter
```javascript
// Key features:
- Search input with real-time filtering
- Gene count display ("Showing X of Y genes")
- Button-based gene selection (not dropdown)
- Scroll to section after selection
- Visual selection state
```

**Current**: Simple dropdown select

**Migration Path**: Create a new `GeneSelector` component with:
- Search input with filtering
- Grid layout of gene buttons
- Selection state management
- Haptic feedback on touch

#### 2. CSV Data Parsing
**Legacy**: Parses `data.csv` file locally
```javascript
// CSV Parser features:
- Handles both "long" format (gene, species, sequence columns)
- Handles "wide" format (gene column + species as column headers)
- Proper quote handling in CSV
- Stores in sequenceData object
```

**Current**: Uses API calls

**Note**: Current approach with API is actually better architecture. CSV parsing only needed if switching back to static data.

#### 3. Overview Bars with Drag-to-Zoom
**Legacy**: Color-coded overview of entire sequence with drag selection
```javascript
// Key features:
- Renders ~200 overview bars showing conservation
- Color coding: all same (teal), two same (orange), all different (gray)
- Mouse/touch drag to select zoom region
- Highlights selected region
- Updates zoom range display
- Scrolls to detailed view after zoom
```

**Current**: Has IterativeZoom but no overview bars

**Migration Path**: Create `OverviewDragZoom` component:
- Calculate nucleotide match categories for entire sequence
- Render condensed overview bars
- Implement drag selection (mouse + touch)
- Update zoom range and trigger detailed view

#### 4. Download FASTA Sequences
**Legacy**: Downloads currently viewed sequences as FASTA format
```javascript
// Download features:
- Exports current page of sequences
- FASTA format with headers (>gene_species)
- 60-character line wrapping
- Triggers browser download
```

**Current**: No download functionality

**Migration Path**: Add download button to PageNavigation component:
```typescript
const downloadFASTA = () => {
  let fastaText = '';
  speciesList.forEach((species) => {
    const seq = sequences[species].substring(start, end);
    const wrapped = seq.match(/.{1,60}/g)?.join('\n') || '';
    fastaText += `>${selectedGene}_${species.replace(/\s+/g, '_')}\n${wrapped}\n`;
  });

  const blob = new Blob([fastaText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${selectedGene}_sequences.fasta`;
  a.click();
  URL.revokeObjectURL(url);
};
```

#### 5. Haptic Feedback
**Legacy**: Vibration on button taps and interactions

**Current**: None

**Migration Path**: Add to component:
```typescript
const vibrate = (duration = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

// Add to button handlers:
onClick={() => {
  vibrate(10);
  handleGeneSelect(gene);
}}
```

#### 6. Reset Button
**Legacy**: Returns to gene selection view

**Current**: No reset functionality

**Migration Path**: Add reset button that:
- Clears selected gene
- Resets zoom state
- Scrolls to top
- Shows gene selection again

#### 7. Touch Optimizations
**Legacy**:
- Prevents double-tap zoom on nucleotide boxes
- Handles orientation changes
- Touch-friendly drag zones

**Current**: Basic touch support

---

### Comparison Page (/comparison) ✅ CURRENT IS BETTER

The current Next.js implementation is more developed than the legacy "under construction" page.

---

## Browser Page Migration Priority

If you want to add legacy browser features, prioritize in this order:

1. **HIGH PRIORITY**:
   - Download FASTA functionality (most useful, easy to add)
   - Haptic feedback (improves mobile UX)
   - Reset button (improves navigation)

2. **MEDIUM PRIORITY**:
   - Gene search with button grid (better UX than dropdown)
   - Touch optimizations (better mobile experience)

3. **LOW PRIORITY** (only if API approach isn't working):
   - CSV parsing (current API approach is better)
   - Overview drag-to-zoom (IterativeZoom might be sufficient)

---

## Code Examples for Key Migrations

### Download FASTA Button

Add to `frontend/src/app/browser/PageNavigation.tsx`:

```typescript
const handleDownload = () => {
  if (!sequences || !selectedGene) return;

  const start = pageIndex * pageSize;
  const end = Math.min(start + pageSize, Object.values(sequences)[0]?.length || 0);

  let fastaText = '';
  Object.entries(sequences).forEach(([species, seq]) => {
    const segment = seq.substring(start, end);
    const wrapped = segment.match(/.{1,60}/g)?.join('\n') || '';
    fastaText += `>${selectedGene}_${species.replace(/\s+/g, '_')}\n${wrapped}\n`;
  });

  const blob = new Blob([fastaText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${selectedGene}_sequences_page${pageIndex + 1}.fasta`;
  a.click();
  URL.revokeObjectURL(url);
};

// Add button:
<button onClick={handleDownload}>⬇️ Download FASTA</button>
```

### Haptic Feedback Hook

Create `frontend/src/app/hooks/useHaptic.ts`:

```typescript
export const useHaptic = () => {
  const vibrate = (duration = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  };

  return { vibrate };
};
```

---

## Files Requiring Attention

### To Update (for full browser migration):
1. `frontend/src/app/browser/desktop.tsx` - Add gene search, download, reset
2. `frontend/src/app/browser/PageNavigation.tsx` - Add download button
3. `frontend/src/app/browser/ColorBar.tsx` - Check if needs overview drag-zoom
4. Create: `frontend/src/app/hooks/useHaptic.ts` - Reusable haptic hook
5. Create: `frontend/src/app/browser/GeneSearchGrid.tsx` - Gene button grid with search

### Legacy Files (can be removed after verification):
- `frontend/public/index.html`
- `frontend/public/browse-genes.html`
- `frontend/public/browse-genes.js`
- `frontend/public/compare-genomes.html`
- `frontend/public/contact.html`
- `frontend/public/navbar.html`
- `frontend/public/navbar-mobile.html`

### Keep (still referenced or needed):
- `frontend/public/styles.css` - Global styles
- `frontend/public/styles-mobile.css` - Mobile styles
- `frontend/public/globals.css` - Theme variables
- `frontend/public/sw.js` - Service worker (update PRECACHE_URLS)
- `frontend/public/manifest.json` - PWA manifest (update URLs to Next.js routes)

---

## Service Worker & Manifest Updates Needed

### Update `frontend/public/sw.js`:

Change PRECACHE_URLS from:
```javascript
const PRECACHE_URLS = [
  './',
  './index.html',
  './browse-genes.html',
  // ...
];
```

To:
```javascript
const PRECACHE_URLS = [
  '/',
  '/browser',
  '/comparison',
  '/reg_comparison',
  '/contact',
  '/styles.css',
  '/styles-mobile.css',
  '/globals.css'
];
```

### Update `frontend/public/manifest.json`:

Change start_url and shortcuts from `.html` files to Next.js routes:
```json
{
  "start_url": "/",
  "shortcuts": [
    {
      "name": "Browse Genes",
      "url": "/browser"
    },
    {
      "name": "Compare Genomes",
      "url": "/comparison"
    }
  ]
}
```

---

## Testing Checklist

After completing migrations, test:

- [ ] Home page PWA install prompt appears on supported browsers
- [ ] Haptic feedback works on mobile devices
- [ ] Contact page displays all feature cards
- [ ] Browser page download FASTA works
- [ ] Theme switching works across all pages
- [ ] Service worker caches correct routes
- [ ] Dark mode consistency across all pages
- [ ] All API calls work correctly

---

## Summary

**Completed**: ✅
- Dark/light mode consistency fixes
- Home page migration (PWA, haptic, clean React)
- Contact page migration (feature cards, content)
- Data retrieval typo fixes
- Unused file identification

**Partially Complete**: ⚠️
- Browser page (has core functionality, missing UX enhancements)

**Recommended Next Steps**:
1. Add download FASTA to browser page
2. Add reset button to browser page
3. Add haptic feedback to browser interactions
4. Update service worker PRECACHE_URLS
5. Update PWA manifest URLs
6. (Optional) Add gene search grid if dropdown isn't sufficient

