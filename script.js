/* Open-Set Recognition + XAI · Coming Soon
   Vanilla JS, no dependencies. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header + mobile nav ---------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); toggle.focus(); }
  });

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + entry.target.id;
          a.classList.toggle("active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) sectionObs.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero background: radar scope ---------- */
  var canvas = document.getElementById("bg-canvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, cx = 0, cy = 0, R = 0, ang = -Math.PI / 2, blips = [], running = true, raf = null, last = 0;

    function seedBlips() {
      blips = [];
      var n = W < 700 ? 14 : 22;
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, d = R * (0.15 + Math.random() * 0.82);
        blips.push({ a: a, d: d, unknown: i % 4 === 0, drift: (Math.random() - 0.5) * 0.0006, glow: 0 });
      }
    }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (W < 900) { cx = W * 0.5; cy = H * 0.62; R = Math.max(W, H) * 0.55; }
      else { cx = W * 0.78; cy = H * 0.5; R = Math.min(W, H) * 0.62; }
      seedBlips(); draw(0);
    }
    function norm(x) { x %= Math.PI * 2; return x < 0 ? x + Math.PI * 2 : x; }
    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (var r = 1; r <= 4; r++) {
        ctx.beginPath(); ctx.arc(cx, cy, R * r / 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(59,130,246," + (0.10 + r * 0.015) + ")"; ctx.stroke();
      }
      for (var k = 0; k < 12; k++) {
        var t = k * Math.PI / 6;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(t) * R, cy + Math.sin(t) * R);
        ctx.strokeStyle = "rgba(59,130,246,0.05)"; ctx.stroke();
      }
      // sweep wedge
      var steps = 26, span = 0.55;
      for (var s2 = 0; s2 < steps; s2++) {
        var a0 = ang - span * (s2 + 1) / steps, a1 = ang - span * s2 / steps;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath();
        ctx.fillStyle = "rgba(34,211,238," + (0.10 * (1 - s2 / steps)).toFixed(3) + ")"; ctx.fill();
      }
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
      ctx.strokeStyle = "rgba(34,211,238,0.45)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
      blips.forEach(function (b) {
        b.a += b.drift * dt * 0.06;
        var diff = norm(ang - b.a);
        if (diff < 0.05) b.glow = 1;
        b.glow = Math.max(0, b.glow - dt * 0.00035);
        var x = cx + Math.cos(b.a) * b.d, y = cy + Math.sin(b.a) * b.d;
        var al = 0.12 + b.glow * 0.8;
        var col = b.unknown ? "203,213,225" : "34,211,238";
        ctx.beginPath(); ctx.arc(x, y, b.unknown ? 3 : 2.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + col + "," + al.toFixed(3) + ")"; ctx.fill();
        if (b.glow > 0.05) {
          ctx.beginPath(); ctx.arc(x, y, 6 + (1 - b.glow) * 10, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(" + col + "," + (b.glow * 0.35).toFixed(3) + ")"; ctx.stroke();
          if (b.unknown && b.glow > 0.3) {
            ctx.font = "10px ui-monospace, Menlo, monospace";
            ctx.fillStyle = "rgba(203,213,225," + (b.glow * 0.7).toFixed(3) + ")";
            ctx.fillText("u/i", x + 9, y - 7);
          }
        }
      });
    }
    function step(ts) {
      var dt = last ? Math.min(64, ts - last) : 16; last = ts;
      ang += dt * 0.00055;
      draw(dt);
      if (running) raf = requestAnimationFrame(step);
    }
    function start() { if (!running && !reduceMotion) { running = true; last = 0; raf = requestAnimationFrame(step); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
    if (reduceMotion) { running = false; blips.forEach(function (b) { b.glow = 0.5; }); draw(0); }
    else raf = requestAnimationFrame(step);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(canvas);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  }

  /* ---------- NER explorer (actual notebook outputs) ---------- */
  var nerSentence = document.getElementById("ner-sentence");
  if (nerSentence) {
    // Sentence pieces; entity slots keyed by id
    var parts = ["On ", "@date", ", ", "@n21", " unidentified flying objects, some of them ", "@qty",
      " in diameter, were sighted by multiple witnesses, both civilian and military, in ", "@four", " states: ",
      "@sp", ", ", "@rj", ", ", "@mg", " and ", "@go", "."];
    var text = { date: "May 19, 1986", n21: "21", qty: "up to 100 meters", four: "four", sp: "São Paulo", rj: "Rio de Janeiro", mg: "Minas Gerais", go: "Goiás" };
    var base = { date: "DATE", n21: "CARDINAL", qty: "QUANTITY", four: "CARDINAL" };
    function mk(o) { var r = {}; for (var k in base) r[k] = base[k]; for (var k2 in o) r[k2] = o[k2]; return r; }
    var steps = {
      sm: { labels: mk({ sp: "PERSON", rj: null, mg: "PERSON", go: "GPE" }), score: 1,
        note: "São Paulo and Minas Gerais were labelled as people, and Rio de Janeiro was not found at all." },
      ruler: { labels: mk({ sp: "GPE", rj: "GPE", mg: "GPE", go: "GPE" }), score: 4, fixed: ["sp", "rj", "mg"],
        note: "An EntityRuler with the four state names labels them all as places, but only these exact names." },
      md: { labels: mk({ sp: "PERSON", rj: "GPE", mg: "ORG", go: "PERSON" }), score: 1,
        note: "The medium model found Rio de Janeiro, but made two new errors: Goiás as PERSON and Minas Gerais as ORG." },
      ctx: { labels: mk({ sp: "GPE", rj: "GPE", mg: "GPE", go: "GPE" }), score: 4, fixed: ["sp", "mg", "go"],
        note: "A context rule (a name after “in” or listed after “states”) corrected all three errors without a list of names." }
    };
    var cls = { GPE: "gpe", PERSON: "person", ORG: "org", DATE: "num", CARDINAL: "num", QUANTITY: "num" };
    var scoreEl = document.getElementById("ner-score"), noteEl = document.getElementById("ner-note");
    function render(key) {
      var st = steps[key];
      nerSentence.innerHTML = "";
      parts.forEach(function (p) {
        if (p.charAt(0) !== "@") { nerSentence.appendChild(document.createTextNode(p)); return; }
        var id = p.slice(1), lab = st.labels[id];
        var span = document.createElement("span");
        span.className = "ent " + (lab ? cls[lab] : "miss") + (st.fixed && st.fixed.indexOf(id) > -1 ? " fixed" : "");
        span.appendChild(document.createTextNode(text[id]));
        var sub = document.createElement("sub");
        sub.textContent = lab ? lab : "missed";
        span.appendChild(sub);
        nerSentence.appendChild(span);
      });
      scoreEl.innerHTML = "States labelled as places: <b>" + st.score + "</b> / 4";
      noteEl.textContent = st.note + (st.fixed ? " Green outline = corrected." : "");
    }
    var tabs = document.querySelectorAll(".ner-tab");
    tabs.forEach(function (t, idx) {
      t.addEventListener("click", function () {
        tabs.forEach(function (o) { var on = o === t; o.classList.toggle("is-active", on); o.setAttribute("aria-selected", String(on)); o.tabIndex = on ? 0 : -1; });
        render(t.getAttribute("data-step"));
      });
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!n) return;
        var nx = tabs[(idx + n + tabs.length) % tabs.length]; nx.focus(); nx.click();
      });
      t.tabIndex = idx === 0 ? 0 : -1;
    });
    render("sm");
  }

  /* ---------- Terminal preview (illustrative code, no outputs) ---------- */
  var code = document.getElementById("term-code");
  if (code) {
    var lines = [
      [["c", "# Add an EntityRuler with the four Brazilian states"]],
      [["", "nlp_corrected = spacy."], ["f", "load"], ["", "("], ["s", "\"en_core_web_sm\""], ["", ")"]],
      [["", "ruler = nlp_corrected."], ["f", "add_pipe"], ["", "("]],
      [["", "    "], ["s", "\"entity_ruler\""], ["", ", after="], ["s", "\"ner\""], ["", ","]],
      [["", "    config={"], ["s", "\"overwrite_ents\""], ["", ": "], ["k", "True"], ["", "})"]],
      [["", "ruler."], ["f", "add_patterns"], ["", "(["]],
      [["", "    {"], ["s", "\"label\""], ["", ": "], ["s", "\"GPE\""], ["", ", "], ["s", "\"pattern\""], ["", ": "], ["s", "\"São Paulo\""], ["", "},"]],
      [["", "    {"], ["s", "\"label\""], ["", ": "], ["s", "\"GPE\""], ["", ", "], ["s", "\"pattern\""], ["", ": "], ["s", "\"Rio de Janeiro\""], ["", "},"]],
      [["", "    {"], ["s", "\"label\""], ["", ": "], ["s", "\"GPE\""], ["", ", "], ["s", "\"pattern\""], ["", ": "], ["s", "\"Minas Gerais\""], ["", "},"]],
      [["", "    {"], ["s", "\"label\""], ["", ": "], ["s", "\"GPE\""], ["", ", "], ["s", "\"pattern\""], ["", ": "], ["s", "\"Goiás\""], ["", "},"]],
      [["", "])"]],
      [],
      [["c", "# Output"]],
      [["", "São Paulo : "], ["n", "GPE"]],
      [["", "Rio de Janeiro : "], ["n", "GPE"]],
      [["", "Minas Gerais : "], ["n", "GPE"]],
      [["", "Goiás : "], ["n", "GPE"]]
    ];

    function renderAll() {
      code.innerHTML = "";
      lines.forEach(function (ln, idx) {
        ln.forEach(function (tok) {
          var s = document.createElement("span");
          if (tok[0]) s.className = tok[0];
          s.textContent = tok[1];
          code.appendChild(s);
        });
        if (idx < lines.length - 1) code.appendChild(document.createTextNode("\n"));
      });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      renderAll();
    } else {
      var started = false;
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting || started) return;
        started = true; obs.disconnect();
        var li = 0, ti = 0, ci = 0, span = null;
        (function type() {
          if (li >= lines.length) return;
          var ln = lines[li];
          if (ti >= ln.length) {
            li++; ti = 0; ci = 0; span = null;
            if (li < lines.length) code.appendChild(document.createTextNode("\n"));
            setTimeout(type, ln.length ? 140 : 60);
            return;
          }
          var tok = ln[ti];
          if (!span) { span = document.createElement("span"); if (tok[0]) span.className = tok[0]; code.appendChild(span); }
          span.textContent += tok[1].charAt(ci++);
          if (ci >= tok[1].length) { ti++; ci = 0; span = null; }
          setTimeout(type, 14 + Math.random() * 22);
        })();
      }, { threshold: 0.35 }).observe(code.closest(".terminal"));
    }
  }
})();
