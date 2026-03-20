// Client-side tag & category filtering for the home page
(function () {
  var isHomePage =
    window.location.pathname === '/' ||
    window.location.pathname === '/index.html';
  if (!isHomePage) {
    rewriteLabelsForNavigation();
    return;
  }

  var filterBar = document.getElementById('filter-bar');
  var filterPills = document.getElementById('filter-pills');
  var filterClear = document.getElementById('filter-clear');
  var paginatedContainer = document.getElementById('post-list-paginated');
  var filteredContainer = document.getElementById('post-list-filtered');
  var paginationContainer = document.getElementById('pagination-container');
  var filterEmpty = document.getElementById('filter-empty');

  if (!filterBar || !paginatedContainer) return;

  var activeTags = [];
  var activeCategories = [];
  var jsonCache = null;

  // Read filters from URL on load
  var params = new URLSearchParams(window.location.search);
  params.getAll('tag').forEach(function (t) {
    if (t && activeTags.indexOf(t) === -1) activeTags.push(t);
  });
  params.getAll('category').forEach(function (c) {
    if (c && activeCategories.indexOf(c) === -1) activeCategories.push(c);
  });

  // Intercept tag/category clicks on the paginated list
  paginatedContainer.addEventListener('click', handleLabelClick);

  filterClear.addEventListener('click', function () {
    activeTags = [];
    activeCategories = [];
    applyFilters();
  });

  // Apply filters from URL params on load
  if (activeTags.length > 0 || activeCategories.length > 0) {
    applyFilters();
  }

  function handleLabelClick(e) {
    var link = e.target.closest('.tag, .category');
    if (!link) return;
    e.preventDefault();

    var isTag = link.classList.contains('tag');
    var label = link.textContent.trim();
    var list = isTag ? activeTags : activeCategories;

    if (list.indexOf(label) === -1) {
      list.push(label);
    }
    applyFilters();
  }

  function applyFilters() {
    updateURL();
    renderPills();

    if (activeTags.length === 0 && activeCategories.length === 0) {
      // No filters — show paginated view
      filterBar.style.display = 'none';
      paginatedContainer.style.display = '';
      filteredContainer.style.display = 'none';
      paginationContainer.style.display = '';
      filterEmpty.style.display = 'none';
      return;
    }

    // Show filter bar, hide pagination
    filterBar.style.display = '';
    paginationContainer.style.display = 'none';

    fetchJSON(function (posts) {
      var filtered = posts.filter(function (post) {
        var matchesTags = activeTags.every(function (tag) {
          return post.tags.indexOf(tag) !== -1;
        });
        var matchesCategories = activeCategories.every(function (cat) {
          return post.categories.indexOf(cat) !== -1;
        });
        return matchesTags && matchesCategories;
      });

      if (filtered.length === 0) {
        paginatedContainer.style.display = 'none';
        filteredContainer.style.display = 'none';
        filterEmpty.style.display = '';
        return;
      }

      filterEmpty.style.display = 'none';
      paginatedContainer.style.display = 'none';
      filteredContainer.innerHTML = renderPostList(filtered);
      filteredContainer.style.display = '';

      // Attach click handlers to the newly rendered labels
      filteredContainer.addEventListener('click', handleLabelClick);
    });
  }

  function fetchJSON(callback) {
    if (jsonCache) {
      callback(jsonCache);
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/index.json');
    xhr.onload = function () {
      if (xhr.status === 200) {
        jsonCache = JSON.parse(xhr.responseText);
        callback(jsonCache);
      }
    };
    xhr.send();
  }

  function renderPostList(posts) {
    var html = '<ul class="note list">';
    posts.forEach(function (post) {
      var url = post.external ? escapeHTML(post.externalUrl) : escapeHTML(post.url);
      var externalIcon = post.external ? ' ⇗' : '';
      var tagsAttr = escapeAttr(post.tags.join(','));
      var catsAttr = escapeAttr(post.categories.join(','));

      html += '<li class="item" data-tags="' + tagsAttr + '" data-categories="' + catsAttr + '">';
      html += '<a class="note" href="' + url + '">';
      html += '<p class="note title">' + escapeHTML(post.title) + externalIcon + '</p>';
      if (post.dateFormatted) {
        html += '<p class="note date">' + escapeHTML(post.dateFormatted) + '</p>';
      }
      if (post.summary) {
        html += '<p class="note content">' + escapeHTML(post.summary);
        if (post.truncated) html += '<span class="mldr">&mldr;</span>';
        html += '</p>';
      }
      html += '</a>';

      // Render labels
      if (post.categories.length > 0 || post.tags.length > 0) {
        html += '<p class="note labels">';
        post.categories.forEach(function (cat) {
          var catSlug = slugify(cat);
          html +=
            '<a class="category" href="/categories/' + catSlug + '/">' +
            escapeHTML(cat) +
            '</a>';
        });
        post.tags.forEach(function (tag) {
          var tagSlug = slugify(tag);
          html +=
            '<a class="tag" href="/tags/' + tagSlug + '/">' +
            escapeHTML(tag) +
            '</a>';
        });
        html += '</p>';
      }

      html += '</li>';
    });
    html += '</ul>';
    return html;
  }

  function renderPills() {
    var html = '';
    activeTags.forEach(function (tag) {
      html +=
        '<span class="filter-pill filter-pill-tag" data-type="tag" data-value="' +
        escapeAttr(tag) +
        '">' +
        escapeHTML(tag) +
        '<button class="filter-pill-remove" aria-label="Remove filter">&times;</button></span>';
    });
    activeCategories.forEach(function (cat) {
      html +=
        '<span class="filter-pill filter-pill-category" data-type="category" data-value="' +
        escapeAttr(cat) +
        '">' +
        escapeHTML(cat) +
        '<button class="filter-pill-remove" aria-label="Remove filter">&times;</button></span>';
    });
    filterPills.innerHTML = html;

    // Attach remove handlers
    var removeBtns = filterPills.querySelectorAll('.filter-pill-remove');
    for (var i = 0; i < removeBtns.length; i++) {
      removeBtns[i].addEventListener('click', function (e) {
        var pill = e.target.closest('.filter-pill');
        var type = pill.getAttribute('data-type');
        var value = pill.getAttribute('data-value');
        if (type === 'tag') {
          activeTags = activeTags.filter(function (t) { return t !== value; });
        } else {
          activeCategories = activeCategories.filter(function (c) { return c !== value; });
        }
        applyFilters();
      });
    }
  }

  function updateURL() {
    var params = new URLSearchParams();
    activeTags.forEach(function (t) { params.append('tag', t); });
    activeCategories.forEach(function (c) { params.append('category', c); });
    var qs = params.toString();
    var newURL = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', newURL);
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // On non-home pages, rewrite tag/category links to navigate to home with filter params
  function rewriteLabelsForNavigation() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('.note.labels .tag, .note.labels .category, .article.labels .tag, .article.labels .category');
      if (!link) return;
      e.preventDefault();

      var isTag = link.classList.contains('tag');
      var label = link.textContent.trim();
      var paramName = isTag ? 'tag' : 'category';
      window.location.href = '/?' + paramName + '=' + encodeURIComponent(label);
    });
  }
})();
