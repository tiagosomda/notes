# Client-Side Tag & Category Filtering

## Summary

Replace the current tag/category navigation (which links to separate Hugo taxonomy pages) with in-place client-side filtering on the home page. Clicking a tag or category pill on a post card filters the visible posts instantly without a page reload.

## Current Behavior

- Tags and categories on post cards link to Hugo-generated taxonomy pages (e.g., `/tags/ai/`, `/categories/thoughts/`)
- Each taxonomy page is a separate static HTML page showing all matching posts
- The home page uses Hugo pagination, splitting posts across `/page/2/`, `/page/3/`, etc.

## Desired Behavior

1. Clicking a tag or category on a post card on the home page **filters posts in-place**
2. A **filter pill bar** appears below the page title showing active filters
3. Each pill has an "x" to remove that filter, plus a "Clear all" button
4. The pill bar **sticks to the top** of the viewport when scrolling
5. Filtering works across **all posts**, not just the current paginated page
6. Clicking a tag on an **individual post page** navigates to the home page with a query param (e.g., `?tag=ai`)
7. When no filters are active, the page displays the normal Hugo-paginated view

## Approach: Hugo JSON Index + Client-Side Rendering

### Why this approach

Hugo is a static site generator — pages are pre-built at build time. Pagination creates separate HTML files (`/page/2/`, etc.), so client-side filtering can't reach posts on other pages. To filter across all posts, we need a complete dataset available to JavaScript.

This is the same pattern used by Hugo search implementations (e.g., Fuse.js). It's clean, future-proof, and doesn't require removing pagination from the unfiltered view.

### Implementation Steps

#### Step 1: Generate a JSON index of all posts

Create a Hugo layout that outputs a JSON file containing all posts with their metadata.

- **File:** `layouts/index.json` (site-level override)
- **Output format:** Add `json` to Hugo's output formats in `config.toml`
- **JSON structure per post:**
  ```json
  {
    "title": "Post Title",
    "url": "/post/thoughts/my-post/",
    "date": "2026-03-20",
    "summary": "Post summary text...",
    "tags": ["ai", "gamedev"],
    "categories": ["thoughts"],
    "readingTime": 5
  }
  ```
- **Config change in `config.toml`:**
  ```toml
  [outputs]
    home = ["HTML", "RSS", "JSON"]
  ```

#### Step 2: Override the home page template

Create a site-level override of the home page to add:
- A filter pill bar container (hidden by default)
- Data attributes on post cards for initial-page filtering
- A container that JS can swap between paginated HTML and filtered results

- **File:** `layouts/index.html` (site-level override)

#### Step 3: Override the post card list template

Add `data-tags` and `data-categories` attributes to each `<li>` post card so JS can identify what each card contains.

- **File:** `layouts/partials/note-list.html` (site-level override)

#### Step 4: Intercept tag/category clicks

On the home page:
- Prevent default link navigation for tag/category clicks
- Add the clicked value to the active filter set
- Trigger filtering

On individual post pages:
- Let tag/category links navigate to `/?tag=ai` or `/?category=thoughts`

- **File:** `static/js/post-filter.js`

#### Step 5: Filtering logic (JS)

When filters are active:
1. Fetch `/index.json` (cache it after first load)
2. Filter posts matching ALL active tags/categories
3. Render filtered post cards into the list container (replacing paginated HTML)
4. Show the filter pill bar with active filters
5. Hide pagination controls

When filters are cleared:
1. Restore the original paginated HTML
2. Hide the filter pill bar
3. Show pagination controls

- **File:** `static/js/post-filter.js`

#### Step 6: Filter pill bar UI + CSS

- Positioned below the page title / slogan
- `position: sticky; top: 0; z-index: 100` for scroll stickiness
- Pills styled to match the site theme (orange accent in dark mode)
- Each pill shows the filter name with an "x" button
- "Clear all" button at the end

- **File:** `assets/css/mods.css` (append styles)

#### Step 7: Handle URL query params

- On page load, check for `?tag=X` or `?category=X` query params
- If present, activate those filters immediately (supports navigation from post pages)
- Update the URL as filters change (using `history.replaceState`) so the filtered state is shareable/bookmarkable

- **File:** `static/js/post-filter.js`

### Files to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `config.toml` | Modify | Add JSON output format |
| `layouts/index.json` | Create | JSON template for post index |
| `layouts/index.html` | Create | Home page override with filter bar container |
| `layouts/partials/note-list.html` | Create | Post card override with data attributes |
| `static/js/post-filter.js` | Create | All filtering logic, rendering, URL handling |
| `assets/css/mods.css` | Modify | Filter pill bar styles, sticky behavior |

### Edge Cases to Consider

- **Empty results:** Show a "No posts match these filters" message
- **Multiple filters:** Posts must match ALL active filters (AND logic), or we could support OR within the same type (e.g., two tags = either tag matches). AND is simpler and more intuitive to start.
- **Tag clicks within filtered results:** The JS-rendered cards also need click handlers for their tags
- **Mobile:** The filter bar should wrap nicely on small screens
- **Dark mode:** Pills and bar must respect the site's dark mode theme
- **Performance:** The JSON index is small (just metadata, no full content), so fetching it is fast even with many posts

### Out of Scope (for now)

- Full-text search within posts
- Combining tag + category filters with OR logic between groups
- Persistent filter state across page visits (beyond URL params)
