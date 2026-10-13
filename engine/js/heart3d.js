/* ---------- heart3d: a heart in 3D with its twelve leads ----------
   The heart stands upright with its anterior wall facing the viewer; the leads are fixed to the body round it:
   V1–V6 on the chest in front, aVR, I and aVL above, III, aVF and II below (I between the arms). Drag to turn the
   body. A wall's button turns that wall to the front and lights it (one teal for every wall), shows its own leads
   with ST elevation and its mirror leads (dashed) with ST depression, placed far below the heart (above it for the
   inferior wall, whose own leads are below), and hides the rest. V7–V9 and V4R appear only with their walls.
   The reset button clears the wall and turns back to the front. The page embeds three.js (engine/vendor) only when
   the topic has this pattern; without it the slide stays empty. Approved as a prototype on 2026-10-13
   (art/drafts/cardiology/turn-the-heart-prototype.html). */
function buildHearts() {
  if (!window.THREE) return;
  $$(".h3d").forEach(box => {
    const stage = $(".h3d-stage", box), walls = $$(".h3d-wall", box), reset = $(".h3d-reset", box);
    let ready = null, running = false;
    const css = n => getComputedStyle(box).getPropertyValue(n).trim();

    function init() {
      const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z);
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      stage.prepend(renderer.domElement);
      const scene = new T.Scene(), camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
      scene.add(new T.AmbientLight(0xffffff, 0.82));
      const sun = new T.DirectionalLight(0xffffff, 0.3); sun.position.set(0, 0, 1); camera.add(sun); scene.add(camera);
      const root = new T.Group(); scene.add(root);
      // the heart's frame: long axis up, anterior (+z) towards the viewer, +x the patient's left
      const heart = new T.Group(); heart.scale.setScalar(1.3); heart.position.y = -0.5; root.add(heart);

      const LIT = new T.Color("#5EC0D2"), GREY = new T.Color("#D3DAE3");
      const ART = { lad: new T.Color(css("--cat-solid")), lcx: new T.Color(css("--par-solid")), rca: new T.Color(css("--se-solid")) };
      const mat = c => new T.MeshStandardMaterial({ color: c, roughness: 0.62, metalness: 0 });

      // a sphere tapered into a chamber, pointed at the apex
      const H = 1.5;
      const taper = y => y < 0 ? 0.42 + 0.58 * Math.pow(1 + y / H, 0.85) : 1 - 0.12 * Math.pow(y / H, 3);
      const chamber = (rx, h, rz) => {
        const g = new T.SphereGeometry(1, 72, 54), p = g.attributes.position;
        for (let i = 0; i < p.count; i++) { const y = p.getY(i) * h, t = taper(y * H / h); p.setXYZ(i, p.getX(i) * rx * t, y, p.getZ(i) * rz * t); }
        g.computeVertexNormals(); return g;
      };

      // the left ventricle; each wall a soft patch that fades at its edges
      const lvGeo = chamber(1.02, H, 1.0), pos = lvGeo.attributes.position;
      const sstep = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
      const adist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
      const CENTRE = { anterior: 90, septal: 155, posterior: -100, lateral: -5 }, WGT = {};
      ["inferior", ...Object.keys(CENTRE)].forEach(w => { WGT[w] = new Float32Array(pos.count); });
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), a = T.MathUtils.radToDeg(Math.atan2(z, x));
        const band = sstep(1.25, 0.85, y) * sstep(-1.05, -0.45, y);
        for (const [w, c] of Object.entries(CENTRE)) {
          const sep = w === "septal";
          WGT[w][i] = Math.exp(-((adist(a, c) / (sep ? 42 : 34)) ** 2)) * band * (sep ? 1.6 : 1);
        }
        WGT.inferior[i] = sstep(-0.4, -1.1, y);
      }
      lvGeo.setAttribute("color", new T.BufferAttribute(new Float32Array(pos.count * 3), 3));
      heart.add(new T.Mesh(lvGeo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0 })));

      // the right ventricle wraps the right front and stops short of the apex
      const rvMat = mat(GREY.clone());
      const rv = new T.Mesh(chamber(0.78, 1.18, 0.7), rvMat); rv.position.set(-0.78, 0.2, 0.32); rv.rotation.z = -0.12; heart.add(rv);

      // the atria and their appendages, a short aorta and pulmonary trunk
      const atMat = mat(new T.Color("#C9D1DC")), vesMat = mat(new T.Color("#C3CCD8"));
      const blob = (sx, sy, sz, x, y, z, rz) => { const m = new T.Mesh(new T.SphereGeometry(1, 36, 24), atMat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.rotation.z = rz || 0; heart.add(m); };
      blob(0.62, 0.66, 0.6, -1.38, 1.05, -0.12); blob(0.42, 0.22, 0.3, -1.0, 1.5, 0.42, 0.5);
      blob(0.8, 0.5, 0.55, 0.25, 1.35, -0.78); blob(0.38, 0.2, 0.28, 0.98, 1.32, 0.28, -0.5);
      const vessel = (pts, r) => {
        heart.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 48, r, 20, false), vesMat));
        const c = new T.Mesh(new T.SphereGeometry(r, 20, 14), vesMat); c.position.copy(pts[pts.length - 1]); heart.add(c);
      };
      vessel([V(-0.25, 1.15, 0.05), V(-0.28, 1.75, 0.1), V(-0.22, 2.15, 0.05)], 0.3);
      vessel([V(0.2, 1.3, 0.55), V(0.28, 1.75, 0.45), V(0.32, 2.0, 0.3)], 0.26);

      // the three coronary arteries, one smooth line each
      const surf = (a, y) => { const r = Math.sqrt(Math.max(0.02, 1 - (y / H) ** 2)) * taper(y) + 0.05, t = T.MathUtils.degToRad(a); return V(Math.cos(t) * r * 1.02, y, Math.sin(t) * r); };
      const run = (a0, a1, y0, y1, n) => Array.from({ length: n + 1 }, (_, i) => surf(a0 + (a1 - a0) * i / n, y0 + (y1 - y0) * i / n));
      const tube = (pts, color) => heart.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 80, 0.06, 10, false), new T.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0 })));
      tube(run(118, 102, 1.2, -1.4, 8), ART.lad);
      tube(run(112, -80, 1.05, 0.9, 10), ART.lcx);
      tube([V(-0.45, 1.28, 0.3), V(-1.2, 1.1, 0.62), V(-1.68, 0.7, 0.05), V(-1.3, 0.65, -0.65), surf(-128, 0.5), surf(-122, -0.4), surf(-118, -1.2)], ART.rca);

      // the leads, where each looks from
      const LEADS = {
        aVR: V(-3.3, 2.8, 0), I: V(0, 3.7, 0), aVL: V(3.3, 2.8, 0), III: V(-2.4, -3.2, 0), aVF: V(0, -3.6, 0), II: V(2.4, -3.2, 0),
        V1: V(-2.0, -0.1, 3.0), V2: V(-1.0, -0.1, 3.0), V3: V(-0.32, -0.55, 2.85), V4: V(0.32, -1.0, 2.6), V5: V(1.15, -1.0, 2.1), V6: V(2.0, -1.0, 0.6),
        V7: V(2.6, -0.8, -1.9), V8: V(1.4, -0.8, -2.8), V9: V(0.2, -0.8, -3.1), V4R: V(-2.9, -1.0, 2.2)
      };
      const EXTRA = new Set(["V7", "V8", "V9", "V4R"]);
      const OWN = { inferior: ["II", "III", "aVF"], septal: ["V1", "V2"], anterior: ["V3", "V4"], lateral: ["I", "aVL", "V5", "V6"], posterior: ["V7", "V8", "V9"], rv: ["V4R"] };
      const MIRROR = { inferior: ["I", "aVL"], lateral: ["III", "aVF"], anterior: ["II", "III", "aVF"], posterior: ["V1", "V2", "V3"], septal: [], rv: [] };
      const AT = { inferior: V(0, -2.52, 0), septal: V(-0.57, -0.3, 1.09), anterior: V(0.26, -0.4, 1.3), lateral: V(1.3, -0.3, 0), posterior: V(0.31, -0.3, -1.25), rv: V(-1.4, -0.4, 0.78) };
      const VIEW = { front: [0, 0], inferior: [55, 0], septal: [0, 20], anterior: [0, 0], lateral: [0, -80], posterior: [0, 180], rv: [0, 45] };
      const viewQ = n => new T.Quaternion().setFromEuler(new T.Euler(T.MathUtils.degToRad(-VIEW[n][0]), T.MathUtils.degToRad(VIEW[n][1]), 0, "XYZ"));

      // a lead's label: its name in a pill, with a small beat whose ST segment goes up (its own wall) or down (the mirror)
      const markers = {};
      const paint = (s, fg, bg, bd, st, dashed) => {
        const c = s.userData.canvas, g = c.getContext("2d"); g.clearRect(0, 0, 384, 128);
        g.font = "600 52px Inter, Segoe UI, sans-serif";
        const tw = g.measureText(s.userData.text).width, w = Math.max(110, tw + 56 + (st ? 120 : 0)), x = (384 - w) / 2;
        g.beginPath(); if (g.roundRect) g.roundRect(x, 24, w, 80, 40); else g.rect(x, 24, w, 80);
        g.fillStyle = bg; g.fill(); g.lineWidth = 5; g.strokeStyle = bd; g.setLineDash(dashed ? [14, 10] : []); g.stroke(); g.setLineDash([]);
        g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s.userData.text, x + 28 + tw / 2, 66);
        if (st) {
          const x0 = x + 40 + tw, b = 76, k = st === "up" ? -1 : 1;
          g.beginPath(); g.lineWidth = 5; g.lineJoin = "round"; g.strokeStyle = bd;
          g.moveTo(x0, b); g.lineTo(x0 + 12, b); g.lineTo(x0 + 18, b + 6); g.lineTo(x0 + 26, b - 42); g.lineTo(x0 + 33, b + 8);
          g.lineTo(x0 + 38, b + 14 * k); g.lineTo(x0 + 58, b + 14 * k); g.quadraticCurveTo(x0 + 72, b + 14 * k - 22, x0 + 86, b); g.lineTo(x0 + 100, b); g.stroke();
        }
        s.material.map.needsUpdate = true;
      };
      for (const [name, p] of Object.entries(LEADS)) {
        const c = document.createElement("canvas"); c.width = 384; c.height = 128;
        const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false, transparent: true }));
        s.userData = { canvas: c, text: name }; s.scale.set(2.3, 0.77, 1); s.renderOrder = 10; s.position.copy(p); root.add(s);
        const line = new T.Line(new T.BufferGeometry().setFromPoints([p, p]), new T.LineDashedMaterial({ color: 0x8d99a8, dashSize: 0.12, gapSize: 0.12 }));
        line.visible = false; root.add(line);
        markers[name] = { s, line, p };
      }

      let current = null, target = null;
      // the mirror leads stand far below the heart in the wall's view (above it when the wall's own leads are below)
      const placeMirror = () => {
        Object.values(markers).forEach(m => m.s.position.copy(m.p));
        const mir = current ? MIRROR[current] : [];
        if (!mir.length) return;
        const q = viewQ(current), qi = q.clone().invert(), c = V(0, -0.4, 0).applyQuaternion(q), d = V(0, 0, 0);
        OWN[current].forEach(n => d.add(markers[n].p.clone().applyQuaternion(q).sub(c)));
        const up = d.y / OWN[current].length < -1.5, along = V(1, 0, 0);
        mir.slice().sort((a, b) => markers[a].p.clone().applyQuaternion(q).x - markers[b].p.clone().applyQuaternion(q).x).forEach((n, k) => {
          const w = c.clone().add(V(0, up ? 3.4 : -3.4, 0)).addScaledVector(along, (k - (mir.length - 1) / 2) * 2.3);
          w.z = c.z + 1.2; markers[n].s.position.copy(w.applyQuaternion(qi));
        });
      };
      const apply = () => {
        const col = lvGeo.attributes.color, c = new T.Color();
        for (let i = 0; i < pos.count; i++) { c.copy(GREY); if (current && WGT[current]) c.lerp(LIT, Math.min(1, WGT[current][i] * 1.2)); col.setXYZ(i, c.r, c.g, c.b); }
        col.needsUpdate = true;
        // the septum sits behind the RV, so the RV turns see-through to show it
        rvMat.color.copy(current === "rv" ? LIT : GREY);
        rvMat.transparent = current === "septal"; rvMat.opacity = current === "septal" ? 0.35 : 1; rvMat.depthWrite = current !== "septal"; rvMat.needsUpdate = true;
        placeMirror();
        const own = current ? OWN[current] : [], mir = current ? MIRROR[current] : [];
        const ink = css("--text"), bg = css("--surface"), bd = css("--gray-bd"), soft = css("--muted");
        for (const [name, m] of Object.entries(markers)) {
          const on = own.includes(name), rec = mir.includes(name);
          m.s.visible = current ? on || rec : !EXTRA.has(name); m.line.visible = on || rec;
          if (on || rec) { const to = AT[current]; m.line.geometry.setFromPoints([m.s.position.clone().lerp(to, 0.12), to]); m.line.computeLineDistances(); }
          if (on) { paint(m.s, css("--se-ink"), css("--se-bg"), css("--se-solid"), "up"); m.line.material.color.set(css("--se-solid")); }
          else if (rec) { paint(m.s, ink, bg, soft, "down", true); m.line.material.color.set(soft); }
          else paint(m.s, ink, bg, bd);
        }
        walls.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.wall === current)));
        box.dataset.wall = current || "";
      };
      const reduce = typeof REDUCED_MOTION !== "undefined" && REDUCED_MOTION;
      const turnTo = n => { target = viewQ(n); if (reduce) { root.quaternion.copy(target); target = null; } };
      const fresh = () => { current = null; target = null; root.quaternion.copy(viewQ("front")); apply(); };

      walls.forEach(b => b.addEventListener("click", () => { current = current === b.dataset.wall ? null : b.dataset.wall; apply(); if (current) turnTo(current); }));
      reset.addEventListener("click", () => { current = null; apply(); turnTo("front"); });

      let drag = null;
      stage.addEventListener("pointerdown", e => { if (e.target.closest(".h3d-reset")) return; drag = { x: e.clientX, y: e.clientY }; target = null; stage.setPointerCapture(e.pointerId); });
      stage.addEventListener("pointermove", e => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
        root.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(V(0, 1, 0), dx * 0.01)).premultiply(new T.Quaternion().setFromAxisAngle(V(1, 0, 0), dy * 0.01));
      });
      ["pointerup", "pointercancel"].forEach(t => stage.addEventListener(t, () => { drag = null; }));

      // the camera stands back far enough for the whole ring of leads to fit
      const size = () => { const w = stage.clientWidth || 1, h = stage.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; const t = Math.tan(T.MathUtils.degToRad(16)); camera.position.z = Math.max(4.5 / t, 4.4 / (t * w / h)); camera.updateProjectionMatrix(); };
      new ResizeObserver(size).observe(stage); size();
      const frame = () => {
        if (!running) return;
        if (target) { root.quaternion.slerp(target, 0.12); if (root.quaternion.angleTo(target) < 0.002) { root.quaternion.copy(target); target = null; } }
        renderer.render(scene, camera); requestAnimationFrame(frame);
      };
      // the theme can change while the slide is open: repaint the labels
      new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      return { fresh, start() { if (!running) { running = true; size(); requestAnimationFrame(frame); } } };
    }

    const slide = box.closest(".slide");
    const enter = () => { try { if (!ready) ready = init(); ready.fresh(); ready.start(); } catch (err) { box.classList.add("h3d-off"); } };
    onEnter(box, enter);
    if (slide) slide.addEventListener("slideleave", () => { running = false; });
    if (slide && !slide.hidden && slide.classList.contains("active")) enter();
  });
}
