(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const initHeaderBrand = () => {
    const header = document.querySelector("[data-site-header]");
    const brandOrb = header?.querySelector(".brand-bloch");
    const readout = brandOrb?.querySelector(".orb-readout");
    const readoutValue = readout?.querySelector("span");
    const segments = Array.from(header?.querySelectorAll("[data-brand-segment]") || []);
    if (!header || !readout || !readoutValue || !segments.length) return;

    const home = document.body.classList.contains("logs-page-home");
    const archive = document.querySelector("#archive");
    const letterSequence = Array.from("NOTES.TIAGO.DEV", (character) => (character === "." ? "·" : character));
    const fallbackSymbols = ["ψ", "λ", "Σ", "∇", "∞", "π", "ℏ", "φ", "Δ", "⊗", "|0⟩", "|1⟩"];
    let sequenceData = { symbols: fallbackSymbols, tags: [] };

    try {
      const source = document.querySelector("#brand-orb-data");
      if (source?.textContent) sequenceData = JSON.parse(source.textContent);
    } catch {
      sequenceData = { symbols: fallbackSymbols, tags: [] };
    }

    const compactTag = (tag) => {
      const words = String(tag).toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
      if (!words.length) return "#TG";
      const code = words.length > 1
        ? words.slice(0, 2).map((word) => Array.from(word)[0]).join("")
        : Array.from(words[0]).slice(0, 2).join("");
      return `#${code.toLocaleUpperCase()}`;
    };

    const symbolSequence = Array.from(new Set([
      ...(Array.isArray(sequenceData.symbols) ? sequenceData.symbols : fallbackSymbols),
      ...(Array.isArray(sequenceData.tags) ? sequenceData.tags.map(compactTag) : []),
    ])).filter(Boolean);

    let sequenceTimer = 0;
    let typingTimer = 0;
    let typingToken = 0;
    let currentSequence = letterSequence;
    let currentSpeed = 2560;
    let expanded = null;

    const showReadout = (value) => {
      readoutValue.textContent = value;
      if (reducedMotion.matches) return;
      readout.classList.remove("is-shifting");
      void readout.offsetWidth;
      readout.classList.add("is-shifting");
    };

    const setSequence = (sequence, speed) => {
      window.clearInterval(sequenceTimer);
      currentSequence = sequence.length ? sequence : fallbackSymbols;
      currentSpeed = speed;
      let index = 0;
      showReadout(currentSequence[index]);
      if (reducedMotion.matches) return;
      sequenceTimer = window.setInterval(() => {
        index = (index + 1) % currentSequence.length;
        showReadout(currentSequence[index]);
      }, speed);
    };

    const cancelTyping = () => {
      typingToken += 1;
      window.clearTimeout(typingTimer);
      header.classList.remove("brand-is-typing");
    };

    const restoreDomain = () => {
      segments.forEach((segment) => {
        segment.textContent = segment.dataset.text || "";
      });
    };

    const typeDomain = () => {
      cancelTyping();
      if (reducedMotion.matches) {
        restoreDomain();
        return;
      }

      const token = typingToken;
      const queue = [];
      segments.forEach((segment) => {
        const text = segment.dataset.text || "";
        segment.textContent = "";
        Array.from(text).forEach((character) => queue.push([segment, character]));
      });

      header.classList.add("brand-is-typing");
      let index = 0;
      const typeNext = () => {
        if (token !== typingToken) return;
        if (index >= queue.length) {
          header.classList.remove("brand-is-typing");
          return;
        }
        const [segment, character] = queue[index];
        segment.textContent += character;
        index += 1;
        typingTimer = window.setTimeout(typeNext, 42);
      };
      typeNext();
    };

    const setExpanded = (nextExpanded) => {
      if (expanded === nextExpanded) return;
      expanded = nextExpanded;
      if (nextExpanded) {
        segments.forEach((segment) => { segment.textContent = ""; });
        header.classList.add("brand-is-expanded");
        setSequence(symbolSequence, 2560);
        window.requestAnimationFrame(typeDomain);
      } else {
        cancelTyping();
        header.classList.remove("brand-is-expanded");
        restoreDomain();
        setSequence(letterSequence, 2560);
      }
    };

    if (!home || !archive) {
      expanded = true;
      header.classList.add("brand-is-expanded", "brand-is-static");
      restoreDomain();
      setSequence(symbolSequence, 2560);
    } else {
      let scheduled = false;
      const syncToArchive = () => {
        const reachedArchive = archive.getBoundingClientRect().top <= header.offsetHeight + 8;
        setExpanded(reachedArchive);
        scheduled = false;
      };
      const requestSync = () => {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(syncToArchive);
      };

      syncToArchive();
      window.addEventListener("scroll", requestSync, { passive: true });
      window.addEventListener("resize", requestSync, { passive: true });
    }

    reducedMotion.addEventListener?.("change", () => {
      if (expanded) restoreDomain();
      setSequence(currentSequence, currentSpeed);
    });
  };

  const initUtcClock = () => {
    const clocks = document.querySelectorAll("[data-utc-clock]");
    if (!clocks.length) return;

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const update = () => {
      const value = `${formatter.format(new Date())} UTC`;
      clocks.forEach((clock) => {
        clock.textContent = value;
      });
    };

    update();
    window.setInterval(update, 1000);
  };

  const initScrollProgress = () => {
    const indicator = document.querySelector("[data-scroll-progress]");
    if (!indicator) return;

    let scheduled = false;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      indicator.style.transform = `scaleX(${progress})`;
      scheduled = false;
    };

    const requestUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
  };

  const initStarfield = () => {
    const canvas = document.querySelector("#starfield");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let stars = [];
    let frame = 0;
    let animationFrame = 0;

    const buildStars = () => {
      const count = Math.min(150, Math.max(48, Math.round((width * height) / 14500)));
      stars = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.25 + Math.random() * 1.15,
        alpha: 0.15 + Math.random() * 0.65,
        pulse: 0.005 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
        color: index % 11 === 0 ? "255, 143, 42" : index % 7 === 0 ? "61, 213, 243" : "209, 232, 238",
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildStars();
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        const shimmer = reducedMotion.matches ? 0 : Math.sin(frame * star.pulse + star.phase) * 0.22;
        context.beginPath();
        context.fillStyle = `rgba(${star.color}, ${Math.max(0.06, star.alpha + shimmer)})`;
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      });
    };

    const animate = () => {
      frame += 1;
      draw();
      animationFrame = window.requestAnimationFrame(animate);
    };

    const syncMotion = () => {
      window.cancelAnimationFrame(animationFrame);
      if (reducedMotion.matches) {
        draw();
      } else {
        animate();
      }
    };

    resize();
    syncMotion();
    window.addEventListener("resize", resize, { passive: true });
    reducedMotion.addEventListener?.("change", syncMotion);
  };

  const initReveal = () => {
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (!elements.length) return;

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    elements.forEach((element) => observer.observe(element));
  };

  const initMobileNavigation = () => {
    const trigger = document.querySelector("[data-mobile-nav-trigger]");
    const panel = document.querySelector("[data-mobile-nav-panel]");
    const scrim = document.querySelector("[data-mobile-nav-scrim]");
    const closeButton = document.querySelector("[data-mobile-nav-close]");
    if (!trigger || !panel || !scrim) return;

    let previouslyFocused = null;

    const close = ({ restoreFocus = true } = {}) => {
      document.body.classList.remove("mobile-nav-open");
      trigger.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
      if (restoreFocus && previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };

    const open = () => {
      previouslyFocused = document.activeElement;
      document.body.classList.add("mobile-nav-open");
      trigger.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
      window.requestAnimationFrame(() => {
        panel.querySelector("a, button")?.focus();
      });
    };

    trigger.addEventListener("click", () => {
      if (document.body.classList.contains("mobile-nav-open")) close();
      else open();
    });
    closeButton?.addEventListener("click", () => close());
    scrim.addEventListener("click", () => close());
    panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => close({ restoreFocus: false })));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("mobile-nav-open")) close();
      if (event.key !== "Tab" || !document.body.classList.contains("mobile-nav-open")) return;

      const focusable = Array.from(panel.querySelectorAll("a[href], button:not([disabled])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.matchMedia("(min-width: 961px)").addEventListener?.("change", (event) => {
      if (event.matches) close({ restoreFocus: false });
    });
  };

  const initArchiveFilters = () => {
    const archive = document.querySelector("[data-log-archive]");
    if (!archive) return;

    const cards = Array.from(archive.querySelectorAll("[data-log-card]"));
    const filterButtons = Array.from(archive.querySelectorAll("[data-filter-button], [data-filter-trigger]"));
    const search = archive.querySelector("[data-log-search]");
    const searchControl = archive.querySelector("[data-search-control]");
    const searchToggle = archive.querySelector("[data-search-toggle]");
    const searchDismiss = archive.querySelector("[data-search-dismiss]");
    const filterDecks = Array.from(archive.querySelectorAll("[data-filter-deck]"));
    const visibleCount = archive.querySelector("[data-visible-count]");
    const emptyState = archive.querySelector("[data-filter-empty]");
    const filterStatus = archive.querySelector("[data-filter-status]");
    const activeFilters = archive.querySelector("[data-active-filters]");
    const clearButtons = Array.from(archive.querySelectorAll("[data-filter-clear]"));
    const state = {
      tag: new Set(),
      category: new Set(),
      query: "",
    };

    const normalize = (value) => value.trim().toLocaleLowerCase();
    const titleCase = (value) => value.replace(/(^|[-\s])\p{L}/gu, (character) => character.toUpperCase());

    const setSearchOpen = (open, { focus = true } = {}) => {
      if (!searchControl || !searchToggle) return;
      searchControl.classList.toggle("is-open", open);
      searchToggle.setAttribute("aria-expanded", String(open));
      searchToggle.setAttribute("aria-label", open ? "Close archive search" : "Search the archive");
      if (open && focus) window.requestAnimationFrame(() => search?.focus());
      if (!open && document.activeElement === search) search.blur();
    };

    const readUrl = () => {
      const params = new URLSearchParams(window.location.search);
      params.getAll("tag").map(normalize).filter(Boolean).forEach((value) => state.tag.add(value));
      params.getAll("category").map(normalize).filter(Boolean).forEach((value) => state.category.add(value));
      state.query = normalize(params.get("q") || "");
      if (search) search.value = params.get("q") || "";
    };

    const writeUrl = () => {
      const params = new URLSearchParams();
      Array.from(state.tag).sort().forEach((value) => params.append("tag", value));
      Array.from(state.category).sort().forEach((value) => params.append("category", value));
      if (state.query) params.set("q", state.query);
      const query = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    };

    const renderActiveFilters = () => {
      if (!activeFilters || !filterStatus) return;
      activeFilters.replaceChildren();

      ["category", "tag"].forEach((type) => {
        Array.from(state[type]).sort().forEach((value) => {
          const pill = document.createElement("span");
          pill.className = `active-filter active-filter-${type}`;
          pill.append(document.createTextNode(`${type === "tag" ? "#" : ""}${titleCase(value)} `));
          const remove = document.createElement("button");
          remove.type = "button";
          remove.setAttribute("aria-label", `Remove ${value} ${type} filter`);
          remove.textContent = "×";
          remove.addEventListener("click", () => {
            state[type].delete(value);
            applyFilters();
          });
          pill.append(remove);
          activeFilters.append(pill);
        });
      });

      if (state.query) {
        const pill = document.createElement("span");
        pill.className = "active-filter active-filter-search";
        pill.append(document.createTextNode(`SEARCH: ${state.query} `));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.setAttribute("aria-label", "Clear archive search");
        remove.textContent = "×";
        remove.addEventListener("click", () => {
          state.query = "";
          if (search) search.value = "";
          setSearchOpen(false, { focus: false });
          applyFilters();
        });
        pill.append(remove);
        activeFilters.append(pill);
      }

      filterStatus.hidden = state.tag.size === 0 && state.category.size === 0 && !state.query;
    };

    const syncButtons = () => {
      filterButtons.forEach((button) => {
        const type = button.dataset.filterType;
        const value = normalize(button.dataset.filterValue || "");
        const active = Boolean(type && state[type]?.has(value));
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      filterDecks.forEach((deck) => {
        const type = deck.dataset.filterDeckType;
        deck.classList.toggle("has-active", Boolean(type && state[type]?.size));
      });
      searchControl?.classList.toggle("has-query", Boolean(state.query));
    };

    const applyFilters = () => {
      let visible = 0;
      cards.forEach((card) => {
        const tags = new Set((card.dataset.tags || "").split("|").map(normalize).filter(Boolean));
        const categories = new Set((card.dataset.categories || "").split("|").map(normalize).filter(Boolean));
        const searchable = normalize(card.dataset.search || "");
        const matchesTags = Array.from(state.tag).every((value) => tags.has(value));
        const matchesCategories = Array.from(state.category).every((value) => categories.has(value));
        const matchesQuery = !state.query || searchable.includes(state.query);
        const matches = matchesTags && matchesCategories && matchesQuery;
        card.hidden = !matches;
        if (matches) visible += 1;
      });

      if (visibleCount) visibleCount.textContent = `${visible} ${visible === 1 ? "LOG" : "LOGS"} VISIBLE`;
      if (emptyState) emptyState.hidden = visible !== 0;
      syncButtons();
      renderActiveFilters();
      writeUrl();
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.dataset.filterType;
        const value = normalize(button.dataset.filterValue || "");
        if (!type || !value || !(state[type] instanceof Set)) return;
        if (state[type].has(value)) state[type].delete(value);
        else state[type].add(value);
        applyFilters();
      });
    });

    let searchTimer = 0;
    search?.addEventListener("input", () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        state.query = normalize(search.value);
        applyFilters();
      }, 120);
    });

    searchToggle?.addEventListener("click", () => {
      const open = !searchControl?.classList.contains("is-open");
      setSearchOpen(open);
    });

    searchDismiss?.addEventListener("click", () => {
      window.clearTimeout(searchTimer);
      state.query = "";
      if (search) search.value = "";
      setSearchOpen(false, { focus: false });
      applyFilters();
      searchToggle?.focus();
    });

    search?.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      window.clearTimeout(searchTimer);
      state.query = "";
      search.value = "";
      setSearchOpen(false, { focus: false });
      applyFilters();
      searchToggle?.focus();
    });

    filterDecks.forEach((deck) => {
      deck.addEventListener("toggle", () => {
        if (!deck.open) return;
        filterDecks.forEach((otherDeck) => {
          if (otherDeck !== deck) otherDeck.removeAttribute("open");
        });
      });
    });

    document.addEventListener("click", (event) => {
      filterDecks.forEach((deck) => {
        if (deck.open && !deck.contains(event.target)) deck.removeAttribute("open");
      });
      if (searchControl?.classList.contains("is-open") && !state.query && !searchControl.contains(event.target)) {
        setSearchOpen(false, { focus: false });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      filterDecks.forEach((deck) => deck.removeAttribute("open"));
    });

    clearButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.tag.clear();
        state.category.clear();
        state.query = "";
        if (search) search.value = "";
        setSearchOpen(false, { focus: false });
        applyFilters();
      });
    });

    readUrl();
    if (state.query) setSearchOpen(true, { focus: false });
    applyFilters();
  };

  const initStayingSpeedGraphs = () => {
    const figures = Array.from(document.querySelectorAll("[data-staying-speed-graph]"));
    if (!figures.length) return;

    const rootStyles = window.getComputedStyle(document.documentElement);
    const color = (name) => rootStyles.getPropertyValue(name).trim();
    const palette = {
      cyan: color("--cyan"),
      orange: color("--orange-hi"),
      red: color("--red"),
      muted: color("--muted"),
      line: color("--line-bright"),
      mono: color("--font-mono") || "monospace",
    };
    const parseHexColor = (value) => {
      const match = value.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
      return match ? match.slice(1).map((channel) => Number.parseInt(channel, 16)) : null;
    };
    const warningStart = parseHexColor(palette.orange);
    const warningEnd = parseHexColor(palette.red);
    const warningColor = (intensity) => {
      if (!warningStart || !warningEnd) return intensity > 0.5 ? palette.red : palette.orange;
      const amount = Math.min(1, Math.max(0, intensity));
      const channels = warningStart.map((channel, index) => Math.round(channel + ((warningEnd[index] - channel) * amount)));
      return `rgb(${channels.join(", ")})`;
    };

    figures.forEach((figure) => {
      const canvas = figure.querySelector("canvas");
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      let width = 0;
      let height = 0;
      let progress = reducedMotion.matches ? 1 : 0;
      let animationFrame = 0;
      let animationStart = 0;
      let started = false;

      const centerAt = (time) => 0.5 - (Math.sin(time * Math.PI * 1.2) * 0.025);
      const effortAt = (time) => {
        const correction = 0.36 * Math.exp(-2.25 * time) * Math.cos(4.5 * Math.PI * time);
        return Math.min(0.94, Math.max(0.06, centerAt(time) + correction));
      };

      const draw = () => {
        if (!width || !height) return;

        const ctx = context;
        const plot = { left: 10, right: width - 10, top: 9, bottom: height - 9 };
        const plotWidth = plot.right - plot.left;
        const plotHeight = plot.bottom - plot.top;
        const xAt = (time) => plot.left + (time * plotWidth);
        const yAt = (effort) => plot.top + (effort * plotHeight);
        const samples = Math.max(48, Math.round(plotWidth / 6));

        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.strokeStyle = palette.line;
        ctx.globalAlpha = 0.16;
        ctx.lineWidth = 1;
        for (let index = 0; index <= 5; index += 1) {
          const x = plot.left + ((plotWidth / 5) * index);
          ctx.beginPath();
          ctx.moveTo(x, plot.top);
          ctx.lineTo(x, plot.bottom);
          ctx.stroke();
        }
        for (let index = 0; index <= 4; index += 1) {
          const y = plot.top + ((plotHeight / 4) * index);
          ctx.beginPath();
          ctx.moveTo(plot.left, y);
          ctx.lineTo(plot.right, y);
          ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.fillStyle = palette.cyan;
        ctx.globalAlpha = 0.075;
        ctx.beginPath();
        for (let index = 0; index <= samples; index += 1) {
          const time = index / samples;
          const y = yAt(centerAt(time) - 0.105);
          if (index === 0) ctx.moveTo(xAt(time), y);
          else ctx.lineTo(xAt(time), y);
        }
        for (let index = samples; index >= 0; index -= 1) {
          const time = index / samples;
          ctx.lineTo(xAt(time), yAt(centerAt(time) + 0.105));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        [-0.105, 0.105].forEach((offset) => {
          ctx.save();
          ctx.strokeStyle = palette.cyan;
          ctx.globalAlpha = 0.34;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let index = 0; index <= samples; index += 1) {
            const time = index / samples;
            const x = xAt(time);
            const y = yAt(centerAt(time) + offset);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        });

        ctx.save();
        ctx.strokeStyle = palette.orange;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        for (let index = 0; index <= samples; index += 1) {
          const time = index / samples;
          const x = xAt(time);
          const y = yAt(centerAt(time));
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        const visibleSamples = Math.max(1, Math.round(samples * progress));
        const signalGradient = ctx.createLinearGradient(plot.left, 0, plot.right, 0);
        signalGradient.addColorStop(0, palette.orange);
        signalGradient.addColorStop(0.72, palette.orange);
        signalGradient.addColorStop(1, palette.cyan);

        const bandRadius = 0.105;
        const isStableAt = (time) => Math.abs(effortAt(time) - centerAt(time)) <= bandRadius;
        const warningIntensityAt = (time) => {
          const deviation = Math.abs(effortAt(time) - centerAt(time));
          const localAmplitude = 0.36 * Math.exp(-2.25 * time);
          if (deviation <= bandRadius) return 0;
          return (deviation - bandRadius) / Math.max(0.0001, localAmplitude - bandRadius);
        };
        ctx.save();
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 7;
        for (let index = 1; index <= visibleSamples; index += 1) {
          const startTime = ((index - 1) / visibleSamples) * progress;
          const endTime = (index / visibleSamples) * progress;
          const sampleTime = (startTime + endTime) / 2;
          const stable = isStableAt(sampleTime);
          const segmentColor = stable ? signalGradient : warningColor(warningIntensityAt(sampleTime));
          ctx.strokeStyle = segmentColor;
          ctx.shadowColor = stable ? palette.orange : segmentColor;
          ctx.beginPath();
          ctx.moveTo(xAt(startTime), yAt(effortAt(startTime)));
          ctx.lineTo(xAt(endTime), yAt(effortAt(endTime)));
          ctx.stroke();
        }
        ctx.restore();

        const markerX = xAt(progress);
        const markerY = yAt(effortAt(progress));
        const markerStable = isStableAt(progress);
        const markerColor = markerStable ? (progress > 0.84 ? palette.cyan : palette.orange) : warningColor(warningIntensityAt(progress));
        ctx.save();
        ctx.strokeStyle = markerStable ? palette.cyan : markerColor;
        ctx.fillStyle = markerColor;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 11;
        ctx.shadowColor = markerColor;
        ctx.beginPath();
        ctx.arc(markerX, markerY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        const labelSize = Math.max(6, Math.min(8, width / 72));
        ctx.save();
        ctx.fillStyle = palette.red;
        ctx.globalAlpha = 0.72;
        ctx.font = `${labelSize}px ${palette.mono}`;
        ctx.textAlign = "right";
        ctx.fillText("OVEREXTENSION", plot.right - 4, plot.top + labelSize + 2);
        ctx.fillText("UNDERLOAD", plot.right - 4, plot.bottom - 4);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = markerColor;
        ctx.font = `${labelSize + 1}px ${palette.mono}`;
        ctx.textAlign = markerX > plot.right - 42 ? "right" : "left";
        const markerLabelX = markerX > plot.right - 42 ? markerX - 8 : markerX + 8;
        ctx.fillText("Eᵣ", markerLabelX, markerY - 7);
        ctx.restore();

        if (progress > 0.84) {
          const arrival = Math.min(1, (progress - 0.84) / 0.16);
          ctx.save();
          ctx.fillStyle = palette.cyan;
          ctx.globalAlpha = arrival;
          ctx.font = `${labelSize + 2}px ${palette.mono}`;
          ctx.textAlign = "right";
          ctx.fillText("vₛ // STABLE", plot.right - 4, yAt(centerAt(0.96)) - 9);
          ctx.restore();
        }
      };

      const resize = () => {
        const bounds = canvas.getBoundingClientRect();
        const nextWidth = Math.max(1, Math.round(bounds.width));
        const nextHeight = Math.max(1, Math.round(bounds.height));
        const density = Math.min(window.devicePixelRatio || 1, 2);
        if (nextWidth === width && nextHeight === height) return;
        width = nextWidth;
        height = nextHeight;
        canvas.width = Math.round(width * density);
        canvas.height = Math.round(height * density);
        context.setTransform(density, 0, 0, density, 0, 0);
        draw();
      };

      const animate = (timestamp) => {
        if (!animationStart) animationStart = timestamp;
        progress = Math.min(1, (timestamp - animationStart) / 6200);
        draw();
        if (progress < 1 && !reducedMotion.matches) {
          animationFrame = window.requestAnimationFrame(animate);
        }
      };

      const start = () => {
        if (started) return;
        started = true;
        if (reducedMotion.matches) {
          progress = 1;
          draw();
          return;
        }
        animationFrame = window.requestAnimationFrame(animate);
      };

      resize();
      if ("ResizeObserver" in window) {
        new ResizeObserver(resize).observe(canvas);
      } else {
        window.addEventListener("resize", resize, { passive: true });
      }

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          start();
        }, { threshold: 0.25 });
        observer.observe(figure);
      } else {
        start();
      }

      reducedMotion.addEventListener?.("change", () => {
        if (!reducedMotion.matches) return;
        window.cancelAnimationFrame(animationFrame);
        progress = 1;
        draw();
      });
    });
  };

  const initCopyLink = () => {
    const button = document.querySelector("[data-copy-link]");
    if (!button) return;
    const label = button.querySelector("span");
    const initialLabel = label?.textContent || "Copy transmission link";

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        const input = document.createElement("textarea");
        input.value = window.location.href;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.append(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }

      if (label) label.textContent = "Transmission link copied";
      button.classList.add("is-copied");
      window.setTimeout(() => {
        if (label) label.textContent = initialLabel;
        button.classList.remove("is-copied");
      }, 1800);
    });
  };

  initHeaderBrand();
  initUtcClock();
  initScrollProgress();
  initStarfield();
  initReveal();
  initMobileNavigation();
  initArchiveFilters();
  initStayingSpeedGraphs();
  initCopyLink();
})();
