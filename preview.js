(function () {
  var VARIANTS = [
    { id: "03-spread", title: "Альбом" }, // "Цветочный магазин" }, // Ромашка
    { id: "08-tabs", title: "Вкладки" }, // "Веломастерская" }, // Ласточка
    { id: "04-chapters", title: "Главы" }, // "Частный фотограф" }, // Катя Лучик
    { id: "07-magazine", title: "Журнал" }, // "Ментальная арифметика" }, // Радость
    { id: "01-classic", title: "Классика" }, // "Студия красоты" }, // Улыбка
    { id: "06-scroll", title: "Книжка" }, // "Робототехника для детей" }, // Искорка
    { id: "05-mosaic", title: "Мозайка" }, // "Пекарня" }, // Теплота
    { id: "02-rail", title: "Рельсы" }, // "Мастер на час" }, // Солнышко
  ];

  /* ff-fonts: start — те же --sans / --serif, что и цвета через ff-theme */
  var FONTS = [
    { id: "site", title: "Manrope и Newsreader", sans: "'Manrope', -apple-system, sans-serif", serif: "'Newsreader', Georgia, serif" },
    { id: "segoe", title: "Segoe и Georgia", sans: '"Segoe UI", sans-serif', serif: "Georgia, serif" },
    { id: "arial", title: "Arial и Times", sans: "Arial, sans-serif", serif: '"Times New Roman", serif' },
    { id: "tahoma", title: "Tahoma и Georgia", sans: "Tahoma, sans-serif", serif: "Georgia, serif" },
    { id: "calibri", title: "Calibri и Cambria", sans: 'Calibri, "Segoe UI", sans-serif', serif: "Cambria, Georgia, serif" },
    { id: "verdana", title: "Verdana и Palatino", sans: "Verdana, sans-serif", serif: 'Palatino, "Palatino Linotype", serif' },
  ];
  var currentFont = "site";
  /* ff-fonts: end */

  var TOKENS = [
    { key: "bg", label: "Фон" },
    { key: "text", label: "Текст" },
    { key: "accent", label: "Акцент" },
  ];

  var palette = {
    bg: "#F6F1EA",
    text: "#2E2420",
    accent: "#7C2F2E",
  };

  var current = "01-classic";
  var activeToken = "bg";
  var list = document.getElementById("variants");
  var frame = document.getElementById("view");
  var variantBtn = document.getElementById("variantBtn");
  var variantPop = document.getElementById("variantPop");
  var colorBtn = document.getElementById("openColors");
  var colorPop = document.getElementById("colorPop");
  var fontBtn = document.getElementById("fontBtn");
  var fontPop = document.getElementById("fontPop");
  var fontList = document.getElementById("fonts");
  var tokenTabs = document.getElementById("tokenTabs");
  var ui = {
    map: document.getElementById("map"),
    thumb: document.querySelector("#map i"),
    hue: document.getElementById("hue"),
    drop: document.getElementById("drop"),
    hex: document.getElementById("hex"),
    rand: document.getElementById("randColors"),
  };

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  function hexToRgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (Number.isNaN(n) || h.length !== 6) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(function (v) {
          return clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
        })
        .join("")
        .toUpperCase()
    );
  }

  function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var d = max - min;
    var h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h: h, s: max ? d / max : 0, v: max };
  }

  function hsvToRgb(h, s, v) {
    var c = v * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = v - c;
    var r = 0;
    var g = 0;
    var b = 0;
    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  }

  function mix(a, b, t) {
    var A = hexToRgb(a);
    var B = hexToRgb(b);
    return rgbToHex(A.r + (B.r - A.r) * t, A.g + (B.g - A.g) * t, A.b + (B.b - A.b) * t);
  }

  function luma(hex) {
    var c = hexToRgb(hex);
    return (c.r * 299 + c.g * 587 + c.b * 114) / 1000;
  }

  function buildVars() {
    var bg = palette.bg;
    var text = palette.text;
    var accent = palette.accent;
    var surface = mix(bg, "#FFFFFF", 0.62);
    var gold = mix(accent, "#E8C48A", 0.55);
    var line = mix(text, bg, 0.78);
    var inkRgb = hexToRgb(text);
    var pair = FONTS.filter(function (item) { return item.id === currentFont; })[0] || FONTS[0];
    return {
      "--bg": bg,
      "--bg-soft": mix(bg, surface, 0.45),
      "--surface": surface,
      "--text": text,
      "--ink": text,
      "--ink-soft": mix(text, bg, 0.42),
      "--ink-faint": mix(text, bg, 0.58),
      "--accent": accent,
      "--accent-ink": luma(accent) > 160 ? "#2E2420" : "#FFF6F1",
      "--gold": gold,
      "--line": line,
      "--blush": mix(accent, bg, 0.78),
      "--shadow":
        "0 20px 60px -25px rgba(" +
        inkRgb.r +
        ", " +
        inkRgb.g +
        ", " +
        inkRgb.b +
        ", 0.35)",
      "--sans": pair.sans,
      "--serif": pair.serif,
    };
  }

  function paintFrame() {
    var vars = buildVars();
    var doc;
    try {
      doc = frame.contentDocument;
    } catch (err) {
      doc = null;
    }
    if (doc && doc.documentElement) {
      Object.keys(vars).forEach(function (name) {
        doc.documentElement.style.setProperty(name, vars[name]);
      });
      var meta = doc.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", palette.accent);
    }
    if (frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "ff-theme", vars: vars }, "*");
    }
  }

  /* ff-fonts: start */
  function markFont() {
    if (!fontList) return;
    [].slice.call(fontList.querySelectorAll("button")).forEach(function (btn) {
      var on = btn.dataset.id === currentFont;
      btn.classList.toggle("is-on", on);
      if (on) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
  }
  /* ff-fonts: end */

  function hsvOf(key) {
    var rgb = hexToRgb(palette[key]) || { r: 0, g: 0, b: 0 };
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
  }

  function paintSwatches() {
    [].slice.call(colorBtn.querySelectorAll("i")).forEach(function (dot) {
      dot.style.background = palette[dot.dataset.key];
    });
    var cube = document.querySelector(".rand-cube");
    if (!cube) return;
    var faces = { top: palette.accent, left: palette.bg, right: palette.text };
    cube.querySelectorAll(".rand-face").forEach(function (face) {
      var hex = faces[face.getAttribute("data-face")];
      if (hex) face.setAttribute("fill", hex);
    });
  }

  function syncEditor() {
    var hsv = hsvOf(activeToken);
    var hex = palette[activeToken];
    var hueColor = hsvToRgb(hsv.h, 1, 1);
    ui.map.style.background =
      "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, " +
      rgbToHex(hueColor.r, hueColor.g, hueColor.b) +
      ")";
    ui.thumb.style.left = hsv.s * 100 + "%";
    ui.thumb.style.top = (1 - hsv.v) * 100 + "%";
    ui.hue.value = String(Math.round(hsv.h));
    ui.drop.value = hex;
    ui.hex.value = hex;
    [].slice.call(tokenTabs.querySelectorAll("button")).forEach(function (btn) {
      btn.classList.toggle("is-on", btn.dataset.key === activeToken);
    });
    paintSwatches();
  }

  function setColor(hex, fromMap) {
    var rgb = hexToRgb(hex);
    if (!rgb) return;
    palette[activeToken] = rgbToHex(rgb.r, rgb.g, rgb.b);
    if (!fromMap) syncEditor();
    else {
      ui.drop.value = palette[activeToken];
      ui.hex.value = palette[activeToken];
      paintSwatches();
    }
    paintFrame();
  }

  function pickFromMap(ev) {
    var box = ui.map.getBoundingClientRect();
    var s = clamp((ev.clientX - box.left) / box.width, 0, 1);
    var v = 1 - clamp((ev.clientY - box.top) / box.height, 0, 1);
    var hsv = hsvOf(activeToken);
    var rgb = hsvToRgb(hsv.h, s, v);
    ui.thumb.style.left = s * 100 + "%";
    ui.thumb.style.top = (1 - v) * 100 + "%";
    setColor(rgbToHex(rgb.r, rgb.g, rgb.b), true);
  }

  function closePops() {
    variantPop.hidden = true;
    colorPop.hidden = true;
    variantBtn.classList.remove("is-open");
    colorBtn.classList.remove("is-open");
    variantBtn.setAttribute("aria-expanded", "false");
    colorBtn.setAttribute("aria-expanded", "false");
    if (fontPop) fontPop.hidden = true;
    if (fontBtn) {
      fontBtn.classList.remove("is-open");
      fontBtn.setAttribute("aria-expanded", "false");
    }
  }

  function togglePop(pop, btn) {
    var open = pop.hidden;
    closePops();
    if (!open) return;
    pop.hidden = false;
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
  }

  function openVariant(id) {
    current = id;
    [].slice.call(list.querySelectorAll("button")).forEach(function (btn) {
      var on = btn.dataset.id === id;
      btn.classList.toggle("is-on", on);
      if (on) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
    frame.src = id + "/index.html";
    closePops();
  }

  TOKENS.forEach(function (token) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.key = token.key;
    btn.textContent = token.label;
    btn.addEventListener("click", function () {
      activeToken = token.key;
      syncEditor();
    });
    tokenTabs.appendChild(btn);
  });

  VARIANTS.forEach(function (item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.id = item.id;
    btn.textContent = item.title;
    btn.addEventListener("click", function () {
      openVariant(item.id);
    });
    list.appendChild(btn);
  });

  variantBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    togglePop(variantPop, variantBtn);
  });
  colorBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    togglePop(colorPop, colorBtn);
    syncEditor();
  });
  variantPop.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  colorPop.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  /* ff-fonts: start */
  if (fontList && fontBtn && fontPop) {
    FONTS.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.id = item.id;
      btn.textContent = item.title;
      btn.style.fontFamily = item.sans || "inherit";
      btn.addEventListener("click", function () {
        currentFont = item.id;
        markFont();
        paintFrame();
      });
      fontList.appendChild(btn);
    });
    markFont();
    fontBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      togglePop(fontPop, fontBtn);
    });
    fontPop.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
  /* ff-fonts: end */
  document.addEventListener("click", closePops);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePops();
  });

  var drag = false;
  function move(ev) {
    if (!drag) return;
    ev.preventDefault();
    pickFromMap(ev);
  }
  function up() {
    drag = false;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  }
  ui.map.addEventListener("pointerdown", function (ev) {
    drag = true;
    ui.map.setPointerCapture(ev.pointerId);
    pickFromMap(ev);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });
  ui.hue.addEventListener("input", function () {
    var hsv = hsvOf(activeToken);
    var rgb = hsvToRgb(Number(ui.hue.value), hsv.s, hsv.v);
    var hueColor = hsvToRgb(Number(ui.hue.value), 1, 1);
    ui.map.style.background =
      "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, " +
      rgbToHex(hueColor.r, hueColor.g, hueColor.b) +
      ")";
    setColor(rgbToHex(rgb.r, rgb.g, rgb.b), true);
  });
  ui.drop.addEventListener("input", function () {
    setColor(ui.drop.value);
  });
  ui.hex.addEventListener("change", function () {
    var val = ui.hex.value.trim();
    if (val[0] !== "#") val = "#" + val;
    setColor(val);
  });

  function hsvHex(h, s, v) {
    var rgb = hsvToRgb(((h % 360) + 360) % 360, s, v);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  function rollPalette() {
    var h = Math.random() * 360;
    var dark = Math.random() < 0.4;
    palette.bg = hsvHex(h, 0.05 + Math.random() * 0.2, dark ? 0.1 + Math.random() * 0.14 : 0.88 + Math.random() * 0.1);
    palette.text = hsvHex(h + 10, 0.1 + Math.random() * 0.22, dark ? 0.9 + Math.random() * 0.08 : 0.1 + Math.random() * 0.12);
    palette.accent = hsvHex(h + 150 + Math.random() * 70, 0.5 + Math.random() * 0.35, 0.48 + Math.random() * 0.28);
    syncEditor();
    paintFrame();
  }

  ui.rand.addEventListener("click", function (e) {
    e.stopPropagation();
    rollPalette();
  });

  paintSwatches();
  syncEditor();
  frame.addEventListener("load", paintFrame);
  openVariant(current);
})();
