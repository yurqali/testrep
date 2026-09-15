(function () {
  document.documentElement.classList.add("js");

  function initMenu() {
    var menu = document.getElementById("mmenu");
    var openBtn = document.querySelector(".burger");
    var closeBtn = document.querySelector(".mobile-close");
    if (!menu || !openBtn) return;

    function openMenu() {
      var y = window.scrollY;
      menu.classList.add("open");
      document.documentElement.classList.add("menu-open");
      document.body.classList.add("menu-open");
      document.body.dataset.menuScrollY = String(y);
      document.body.style.top = "-" + y + "px";
      openBtn.setAttribute("aria-expanded", "true");
      menu.removeAttribute("hidden");
      if (closeBtn) closeBtn.focus();
    }

    function closeMenu() {
      var y = parseInt(document.body.dataset.menuScrollY || "0", 10);
      menu.classList.remove("open");
      document.documentElement.classList.remove("menu-open");
      document.body.classList.remove("menu-open");
      document.body.style.top = "";
      delete document.body.dataset.menuScrollY;
      window.scrollTo(0, y);
      openBtn.setAttribute("aria-expanded", "false");
      openBtn.focus();
    }

    openBtn.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
    });
  }

  function initCarousel(root, opts) {
    if (!root) return;
    var viewport = root.querySelector(opts.viewport);
    var track = root.querySelector(opts.track);
    var prevBtn = root.querySelector(opts.prev);
    var nextBtn = root.querySelector(opts.next);
    if (!viewport || !track) return;
    var originals = Array.prototype.slice.call(track.children);
    var total = originals.length;
    if (!total) return;

    var index = 0;
    var perView = 1;
    var gap = opts.gap || 22;
    var step = 0;
    var animating = false;

    function perViewCount() {
      if (opts.perView) return opts.perView();
      return 1;
    }

    function layout(animate) {
      var pv = Math.min(perView, total);
      var w = viewport.clientWidth;
      var cardW = opts.fixed ? w : (w - gap * (pv - 1)) / pv;
      step = opts.fixed ? w : cardW + gap;
      viewport.style.setProperty("--card-w", cardW + "px");
      track.style.transition = animate === false ? "none" : "";
      track.style.transform = "translateX(" + -index * step + "px)";
      if (animate === false) {
        track.offsetHeight;
        track.style.transition = "";
      }
    }

    function toggleNav() {
      var show = total > perView;
      if (prevBtn) prevBtn.classList.toggle("is-hidden", !show);
      if (nextBtn) nextBtn.classList.toggle("is-hidden", !show);
    }

    function rebuild() {
      perView = Math.min(perViewCount(), total);
      track.innerHTML = "";
      if (total <= perView) {
        originals.forEach(function (c) {
          track.appendChild(c.cloneNode(true));
        });
        index = 0;
      } else if (opts.fixed) {
        track.appendChild(originals[total - 1].cloneNode(true));
        originals.forEach(function (c) {
          track.appendChild(c.cloneNode(true));
        });
        track.appendChild(originals[0].cloneNode(true));
        index = 1;
      } else {
        originals.slice(-perView).forEach(function (c) {
          track.appendChild(c.cloneNode(true));
        });
        originals.forEach(function (c) {
          track.appendChild(c.cloneNode(true));
        });
        originals.slice(0, perView).forEach(function (c) {
          track.appendChild(c.cloneNode(true));
        });
        index = perView;
      }
      layout(false);
      toggleNav();
    }

    function go(dir) {
      if (animating || total <= perView) return;
      animating = true;
      index += dir;
      layout(true);
    }

    track.addEventListener("transitionend", function (e) {
      if (e.propertyName !== "transform") return;
      if (opts.fixed) {
        if (index >= total + 1) {
          index = 1;
          layout(false);
        } else if (index <= 0) {
          index = total;
          layout(false);
        }
      } else if (index >= total + perView) {
        index = perView;
        layout(false);
      } else if (index < perView) {
        index = total + perView - 1;
        layout(false);
      }
      animating = false;
    });

    if (prevBtn) prevBtn.addEventListener("click", function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(1); });

    var startX = 0;
    viewport.addEventListener("pointerdown", function (e) {
      startX = e.clientX;
    });
    viewport.addEventListener("pointerup", function (e) {
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 150);
    });

    rebuild();
  }

  function initReveal() {
    var body = document.body;
    if (!body.classList.contains("t-reveal") && !body.classList.contains("t-scroll")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  }

  function initOverlayHeader() {
    var header = document.querySelector("body.t-overlay header");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("is-solid", window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initRail() {
    if (!document.body.classList.contains("t-rail")) return;
    var flow = document.querySelector(".rail-flow");
    if (!flow) return;
    var wide = window.matchMedia("(min-width: 1001px)");
    var panels = [].slice.call(flow.querySelectorAll("main > section, main > .closing"));
    var links = {};
    [].slice.call(document.querySelectorAll(".rail-nav a")).forEach(function (a) {
      links[(a.getAttribute("href") || "").slice(1)] = a;
    });

    var soft = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var lockUntil = 0;

    function step(dir) {
      var left = flow.getBoundingClientRect().left;
      var view = flow.clientWidth;
      var index = 0;
      panels.forEach(function (p, i) {
        if (p.getBoundingClientRect().left - left <= 8) index = i;
      });
      var current = panels[index];
      if (!current) return;
      var offset = current.getBoundingClientRect().left - left;
      var target;
      if (dir > 0) {
        var hidden = current.offsetWidth + offset - view;
        if (hidden > 24) target = flow.scrollLeft + Math.min(view, hidden);
        else if (panels[index + 1]) target = flow.scrollLeft + (panels[index + 1].getBoundingClientRect().left - left);
      } else if (offset < -24) {
        target = flow.scrollLeft + Math.max(-view, offset);
      } else if (panels[index - 1]) {
        target = flow.scrollLeft + (panels[index - 1].getBoundingClientRect().left - left);
      }
      if (target === undefined) return;
      flow.scrollTo({ left: target, behavior: soft ? "smooth" : "auto" });
    }

    flow.addEventListener(
      "wheel",
      function (e) {
        if (!wide.matches || e.ctrlKey || !e.deltaY) return;
        var panel = e.target.closest ? e.target.closest(".closing, main > section") : null;
        if (panel && panel.scrollHeight - panel.clientHeight > 2) {
          var atTop = panel.scrollTop <= 0;
          var atEnd = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 2;
          if (!(atEnd && e.deltaY > 0) && !(atTop && e.deltaY < 0)) return;
        }
        e.preventDefault();
        var now = Date.now();
        if (now < lockUntil) return;
        lockUntil = now + 620;
        step(e.deltaY > 0 ? 1 : -1);
      },
      { passive: false }
    );

    function markCurrent() {
      if (!wide.matches) return;
      var box = flow.getBoundingClientRect();
      var probe = box.left + flow.clientWidth * 0.35;
      var here = null;
      panels.forEach(function (p) {
        var inner = p.id ? p : p.querySelector("section[id]");
        if (!inner) return;
        var r = p.getBoundingClientRect();
        if (r.left <= probe && r.right > probe) here = inner.id;
      });
      if (!here) return;
      Object.keys(links).forEach(function (id) {
        if (id === here) links[id].setAttribute("aria-current", "true");
        else links[id].removeAttribute("aria-current");
      });
    }

    flow.addEventListener("scroll", markCurrent, { passive: true });
    window.addEventListener("resize", markCurrent);
    markCurrent();
  }

  function initChapters() {
    if (!document.body.classList.contains("t-chapters")) return;
    var stops = [].slice.call(document.querySelectorAll("main > section, main > .closing"));
    if (stops.length < 2) return;
    var soft = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var lockUntil = 0;

    function indexNow() {
      var best = 0;
      var bestGap = Infinity;
      stops.forEach(function (s, i) {
        var gap = Math.abs(s.getBoundingClientRect().top);
        if (gap < bestGap) {
          bestGap = gap;
          best = i;
        }
      });
      return best;
    }

    function go(dir) {
      var next = indexNow() + dir;
      if (next < 0 || next >= stops.length) return;
      stops[next].scrollIntoView({ behavior: soft ? "smooth" : "auto", block: "start" });
    }

    window.addEventListener(
      "wheel",
      function (e) {
        if (e.ctrlKey || !e.deltaY) return;
        var box = e.target.closest ? e.target.closest(".container, .hero-content") : null;
        if (box && box.scrollHeight - box.clientHeight > 2) {
          var atTop = box.scrollTop <= 0;
          var atEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 2;
          if (!(atEnd && e.deltaY > 0) && !(atTop && e.deltaY < 0)) return;
        }
        e.preventDefault();
        var now = Date.now();
        if (now < lockUntil) return;
        lockUntil = now + 700;
        go(e.deltaY > 0 ? 1 : -1);
      },
      { passive: false }
    );
  }

  function initSink() {
    if (!document.body.classList.contains("t-scroll")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var layers = [].slice.call(document.querySelectorAll("main > section, main > .closing"));
    if (layers.length < 2) return;
    var waiting = false;

    function apply() {
      waiting = false;
      var vh = window.innerHeight;
      layers.forEach(function (layer, i) {
        var next = layers[i + 1];
        if (!next) {
          layer.style.setProperty("--sink", "0");
          return;
        }
        var top = next.getBoundingClientRect().top;
        var part = 0;
        if (top < vh - 8) {
          part = top <= 0 ? 1 : 1 - top / vh;
        }
        layer.style.setProperty("--sink", part.toFixed(3));
      });
    }

    function onScroll() {
      if (waiting) return;
      waiting = true;
      window.requestAnimationFrame(apply);
    }

    layers.forEach(function (layer) {
      layer.style.setProperty("--sink", "0");
    });
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function initCurrentLink() {
    if (!document.body.classList.contains("t-magazine")) return;
    var links = {};
    [].slice.call(document.querySelectorAll("nav.main-nav a")).forEach(function (a) {
      var id = (a.getAttribute("href") || "").slice(1);
      if (id) links[id] = a;
    });
    var targets = [].slice.call(document.querySelectorAll("main section[id]"));
    if (!targets.length) return;

    function mark() {
      var here = "";
      targets.forEach(function (s) {
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.4) here = s.id;
      });
      Object.keys(links).forEach(function (id) {
        if (id === here) links[id].setAttribute("aria-current", "true");
        else links[id].removeAttribute("aria-current");
      });
    }

    mark();
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("resize", mark);
  }

  function initHomeLogo() {
    var logo = document.querySelector("header a.logo");
    if (!logo) return;
    logo.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initNavOffset() {
    if (!document.body.classList.contains("t-scroll")) return;
    var header = document.querySelector("header");
    var layers = [].slice.call(document.querySelectorAll("main > section, main > .closing"));
    if (!header || !layers.length) return;

    function syncHead() {
      document.body.style.setProperty("--head-h", header.offsetHeight + "px");
    }

    function layerOf(el) {
      if (!el) return null;
      if (layers.indexOf(el) >= 0) return el;
      return el.closest("main > section, main > .closing");
    }

    function layerTop(layer) {
      var y = 0;
      var prev = layer.previousElementSibling;
      while (prev) {
        y += prev.offsetHeight;
        prev = prev.previousElementSibling;
      }
      return y;
    }

    function currentLayer() {
      var y = window.scrollY;
      var acc = 0;
      var here = layers[0];
      layers.forEach(function (layer) {
        if (y >= acc - 2) here = layer;
        acc += layer.offsetHeight;
      });
      return here;
    }

    var lock = null;
    var lockTimer;

    function naturalStack() {
      layers.forEach(function (layer, i) {
        layer.style.zIndex = String(1 + i);
      });
    }

    function go(el, id) {
      var layer = layerOf(el) || layers[0];
      var from = layers.indexOf(currentLayer());
      var to = layers.indexOf(layer);
      lock = layer;
      if (to < from) {
        layers.forEach(function (item, i) {
          item.style.zIndex = item === layer ? "20" : String(1 + i);
        });
      } else {
        naturalStack();
      }
      window.scrollTo({ top: layer === layers[0] ? 0 : layerTop(layer), behavior: "smooth" });
      if (id && history.replaceState) history.replaceState(null, "", "#" + id);
    }

    function onScroll() {
      clearTimeout(lockTimer);
      lockTimer = setTimeout(function () {
        lock = null;
        naturalStack();
      }, 160);
    }

    syncHead();
    naturalStack();
    window.addEventListener("resize", syncHead);
    window.addEventListener("scroll", onScroll, { passive: true });

    document.querySelectorAll("a[href^='#']").forEach(function (link) {
      if (link.classList.contains("skip-link")) return;
      link.addEventListener("click", function (e) {
        var id = (link.getAttribute("href") || "").slice(1);
        if (!id) return;
        var el = id === "top" ? layers[0] : document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        syncHead();
        if (link.classList.contains("logo") || id === "top") go(layers[0], "top");
        else go(el, id);
      });
    });
  }

  initMenu();
  initHomeLogo();
  initNavOffset();
  initRail();
  initChapters();
  initSink();
  initCurrentLink();
  initCarousel(document.getElementById("mastersCarousel"), {
    viewport: ".masters-viewport",
    track: ".masters-track",
    prev: ".masters-prev",
    next: ".masters-next",
    perView: function () {
      if (window.innerWidth <= 640) return 2;
      if (window.innerWidth <= 1080) return 3;
      return 4;
    },
  });
  initCarousel(document.getElementById("teamCarousel"), {
    viewport: ".team-intro-photo",
    track: ".team-intro-track",
    prev: ".team-prev",
    next: ".team-next",
    fixed: true,
    gap: 0,
  });
  initCarousel(document.getElementById("galleryCarousel"), {
    viewport: ".gallery-viewport",
    track: ".gallery-track",
    prev: ".gallery-prev",
    next: ".gallery-next",
    perView: function () {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 1080) return 2;
      return 2;
    },
    gap: 14,
  });
  initReveal();
  initOverlayHeader();

  function initLeadForm() {
    var form = document.querySelector(".lead-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      var first = null;
      form.querySelectorAll("[required]").forEach(function (field) {
        var valid = field.type === "checkbox" ? field.checked : String(field.value || "").trim() !== "";
        if (field.type === "tel" && valid) {
          var digits = field.value.replace(/\D/g, "");
          valid = digits.length >= 10;
        }
        field.setAttribute("aria-invalid", valid ? "false" : "true");
        var err = document.getElementById(field.id + "-error");
        if (err) err.hidden = valid;
        if (!valid && !first) first = field;
      });
      if (first) {
        e.preventDefault();
        first.focus();
      }
    });
  }
  initLeadForm();

  window.addEventListener("message", function (e) {
    var data = e.data;
    if (!data || data.type !== "ff-theme" || !data.vars) return;
    var root = document.documentElement;
    Object.keys(data.vars).forEach(function (name) {
      root.style.setProperty(name, data.vars[name]);
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && data.vars["--accent"]) meta.setAttribute("content", data.vars["--accent"]);
  });
})();
