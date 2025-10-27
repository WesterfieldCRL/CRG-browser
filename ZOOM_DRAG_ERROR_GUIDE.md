# How to Properly Describe Zoom & Drag Errors

## 📋 Error Reporting Template

When reporting zoom/drag issues, include these details:

### 1. **What Were You Trying to Do?**
Example answers:
- "I was trying to zoom into a specific region of the gene sequence"
- "I was dragging the slider handles to select a range"
- "I clicked 'Enlarge Data' after selecting a region"
- "I was trying to go back to a previous zoom level"

### 2. **What Did You Expect to Happen?**
Example answers:
- "The zoomed region should load and show more detail"
- "The handles should move when I drag them"
- "The color bars should update to show the selected region"
- "The page should show individual nucleotides"

### 3. **What Actually Happened?**
Example answers:
- "Nothing happened when I clicked the button"
- "The handles moved but the button stays disabled"
- "I get an error message in the console"
- "The page freezes/spins"
- "The color bars disappeared"
- "The slider is not visible"
- "The handles are hard to grab/see"

### 4. **Steps to Reproduce**
Example:
```
1. Go to http://localhost:3030/browser
2. Select gene "DRD4" from dropdown
3. Click "Iterative Zoom" button
4. Drag left handle to position 1000
5. Drag right handle to position 2000
6. Click "Enlarge Data"
7. [Describe what goes wrong]
```

### 5. **Browser & Console Errors**
Check the browser console (F12) and copy any errors:
- Press F12 to open Developer Tools
- Click the "Console" tab
- Look for red error messages
- Copy the full error text

Example errors you might see:
```
Failed to fetch condensed_sequences
TypeError: Cannot read property 'start' of undefined
Network Error: 307 Temporary Redirect
```

### 6. **Visual Issues** (if applicable)
- Take a screenshot showing the problem
- Describe colors: "The slider handles are invisible in dark mode"
- Describe layout: "The color bars are off-screen"
- Describe behavior: "The handles snap back to start position"

---

## 🐛 Common Zoom/Drag Issues & Their Descriptions

### Issue 1: Slider Not Visible
**Description:** "The zoom slider is not appearing on the browser page after clicking 'Iterative Zoom'. I can see the color bars but no handles to drag."

**What to check:**
- Are the handles too thin (2px) to see?
- Is the height too tall (230px) extending off-screen?
- Are colors invisible in dark mode?

### Issue 2: Can't Drag Handles
**Description:** "I can see the slider handles but when I try to drag them, they don't move or snap back to the starting position."

**What to check:**
- Does clicking and holding work?
- Does it work better on one handle vs the other?
- Does it work with mouse vs touch?

### Issue 3: Button Stays Disabled
**Description:** "After selecting a region by dragging the handles, the 'Enlarge Data' button remains grayed out and I can't click it."

**What to check:**
- What are the Start/End values shown above the slider?
- Is the selected range less than 100 base pairs?
- Is the button actually disabled or just styled that way?

### Issue 4: No Data After Zoom
**Description:** "When I click 'Enlarge Data', the page shows 'Loading Data...' but never finishes loading. The color bars disappear."

**What to check:**
- Check browser console for API errors (F12)
- Look for 307 redirects or 404 errors
- Check Network tab to see if API calls are being made

### Issue 5: Wrong Data Displayed
**Description:** "After zooming in, the color bars show but they don't match the region I selected. The Start/End positions are different from what I chose."

**What to check:**
- Note the before/after Start/End values
- Check if it's showing the full sequence instead of the selected range

### Issue 6: Can't Go Back
**Description:** "The 'Back' button doesn't appear after I zoom in, so I'm stuck at this zoom level and can't zoom out."

**What to check:**
- Is `prevRange` being populated?
- Does the button appear but is invisible (check with inspector)?

### Issue 7: Slider Handles Hard to Grab
**Description:** "The slider handles are only 2px wide, making them extremely difficult to click and drag accurately, especially on mobile or trackpad."

**What to check:**
- Try using keyboard arrow keys (if supported)
- Check if there's a larger hit area around the handle

### Issue 8: Dark Mode Slider Issues
**Description:** "In dark mode, the slider handles and track are barely visible against the dark background."

**What to check:**
- Check the handle colors in dark mode
- Look at the slider CSS in globals.css (rc-slider styles)

---

## 🔍 Debugging Checklist

Before reporting, check these:

- [ ] **Backend is running** - Check Docker logs or terminal for backend errors
- [ ] **Gene data loads** - Can you see gene options in the dropdown?
- [ ] **Iterative Zoom button works** - Does clicking it change the view?
- [ ] **Color bars appear** - Do you see the colored visualization bars?
- [ ] **Start/End values update** - Do the numbers change when you drag?
- [ ] **Console has no errors** - F12 > Console tab shows no red errors
- [ ] **API calls succeed** - F12 > Network tab shows 200 responses (not 307 or 404)

---

## 📊 Current Known Issues

### Backend 307 Redirects
**Status:** In your logs
```
INFO: 172.19.0.4:36996 - "GET /sequences/condensed_sequences?gene_name=DRD4 HTTP/1.1" 307 Temporary Redirect
```

**What this means:**
- The API endpoint `/sequences/condensed_sequences` is redirecting (307)
- This might be due to a trailing slash issue
- The API might expect `/sequences/condensed_sequences/` (with slash)
- Or the endpoint might have been renamed/moved

**How to report:**
"The condensed_sequences API endpoint returns 307 redirects instead of data. This prevents the zoom feature from loading the color bars. Check backend routing for this endpoint."

### Slider Styling Issues
**Status:** Needs testing

**Potential issues:**
- Handles are 2px wide (very thin)
- Handle height is 230px (may be too tall)
- No hover state or cursor change on handles
- No visual feedback when dragging

**How to report:**
"The slider handles are too thin (2px) and lack visual feedback. They should be wider for easier interaction and show a cursor change on hover."

---

## 📝 Example Good Bug Report

**Title:** "Zoom Feature - Color Bars Don't Load After Selecting Region"

**Description:**
I'm trying to use the zoom feature on the genome browser page but it's not working properly.

**Steps to Reproduce:**
1. Navigate to http://localhost:3030/browser
2. Select gene "DRD4" from the dropdown
3. Click the "Iterative Zoom" button
4. Wait for the page to load - I see "Loading Data..." message
5. The color bars appear with species names (Homo sapiens, Mus musculus, Macaca mulatta)
6. I drag the left slider handle from 0 to position 5000
7. I drag the right slider handle from end to position 10000
8. The Start/End display updates correctly showing "Start: 5000, End: 10000"
9. I click the "Enlarge Data" button

**Expected Result:**
The view should zoom into the selected region (5000-10000) and show more detailed color bars for that specific range.

**Actual Result:**
The page shows "Loading Data..." and gets stuck. The color bars disappear.

**Console Errors:**
```
Failed to proxy http://localhost:8000/sequences/condensed_sequences_in_range?gene_name=DRD4&start=5000&end=10000
[AggregateError: ] { code: 'ECONNREFUSED' }
```

**Browser:** Chrome 120.0 on Windows 11
**Screen Size:** 1920x1080
**Theme:** Dark mode
**Screenshot:** [Attached]

---

## 🎯 Quick Error Description Generator

Fill in the blanks:

"When I **[action you took]**, I expected **[what should happen]**, but instead **[what actually happened]**. The error occurs at **[which step]** and I see **[visual description or error message]**."

Example:
"When I **dragged the slider handles to select a region and clicked Enlarge Data**, I expected **the color bars to update with a zoomed-in view**, but instead **the page shows a loading spinner indefinitely**. The error occurs **after clicking the button** and I see **'Loading Data...' that never completes**."

---

## 🛠️ Technical Details for Developers

### Current Implementation
- **Component:** `frontend/src/app/browser/IterativeZoom.tsx`
- **Slider Library:** `rc-slider` from npm
- **API Calls:**
  - `/sequences/condensed_sequences?gene_name={gene}` - Initial load
  - `/sequences/condensed_sequences_in_range?gene_name={gene}&start={start}&end={end}` - Zoom
- **State Management:** React useState for value, range, sequences, loading

### Slider Configuration
```typescript
<Slider
  range={{ draggableTrack: true }}
  min={range[0]}
  max={range[1]}
  value={value}
  onChange={handleSliderChange}
  allowCross={true}
/>
```

### Known Backend Issues
From your Docker logs:
1. 307 redirects on `/sequences/condensed_sequences`
2. API successfully returns data on retry (seen in logs)
3. All other endpoints (genes, species, sequence) work fine

---

Use this guide to describe exactly what's going wrong with your zoom/drag feature!
