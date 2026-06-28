// ── BLOBINFO — aquarium.js ──
// Aquarium d'axolotls animé en Canvas

(function () {
  const canvas = document.getElementById('aquariumCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Resize
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight || 160;
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Bulles ──
  const bubbles = Array.from({ length: 28 }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 40,
    r: 2 + Math.random() * 5,
    speed: 0.4 + Math.random() * 0.8,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.02 + Math.random() * 0.03,
    opacity: 0.3 + Math.random() * 0.5
  }));

  // ── Plantes / algues ──
  const plants = Array.from({ length: 7 }, (_, i) => ({
    x: 60 + (i * (canvas.width / 6)),
    segments: 5 + Math.floor(Math.random() * 4),
    height: 28 + Math.random() * 30,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.015 + Math.random() * 0.01,
    color: `hsl(${170 + Math.random() * 30}, 60%, ${35 + Math.random() * 15}%)`
  }));

  // ── Axolotls ──
  class Axolotl {
    constructor(x, y, scale, dir) {
      this.x = x;
      this.y = y;
      this.scale = scale || 1;
      this.dir = dir || 1; // 1 = droite, -1 = gauche
      this.speed = (0.3 + Math.random() * 0.5) * this.dir;
      this.bobOffset = Math.random() * Math.PI * 2;
      this.bobSpeed = 0.02 + Math.random() * 0.015;
      this.tailWag = Math.random() * Math.PI * 2;
      this.tailSpeed = 0.06 + Math.random() * 0.04;
      this.gillWave = Math.random() * Math.PI * 2;
      this.gillSpeed = 0.04 + Math.random() * 0.02;
      // Couleur : rose, blanc, ou mauve
      const palette = [
        { body: '#f9a8d4', gill: '#ec4899', belly: '#fce7f3', eye: '#1e3a5f' },
        { body: '#e0c8ff', gill: '#a78bfa', belly: '#f3e8ff', eye: '#1e3a5f' },
        { body: '#fbcfe8', gill: '#f472b6', belly: '#fdf2f8', eye: '#1e3a5f' },
        { body: '#bfdbfe', gill: '#60a5fa', belly: '#eff6ff', eye: '#1e3a5f' },
      ];
      this.colors = palette[Math.floor(Math.random() * palette.length)];
    }

    update(W, H) {
      this.x += this.speed;
      this.bobOffset += this.bobSpeed;
      this.tailWag += this.tailSpeed;
      this.gillWave += this.gillSpeed;

      const margin = 120 * this.scale;
      if (this.x > W + margin) this.x = -margin, this.dir = 1, this.speed = Math.abs(this.speed);
      if (this.x < -margin) this.x = W + margin, this.dir = -1, this.speed = -Math.abs(this.speed);
    }

    draw(ctx) {
      const s = this.scale;
      const yBob = Math.sin(this.bobOffset) * 4;
      const cx = this.x;
      const cy = this.y + yBob;
      const flip = this.dir < 0 ? -1 : 1;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(flip * s, s);

      // ── Corps ──
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.body;
      ctx.fill();

      // Ventre clair
      ctx.beginPath();
      ctx.ellipse(2, 4, 18, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.belly;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;

      // ── Queue ──
      const wagAngle = Math.sin(this.tailWag) * 0.35;
      ctx.save();
      ctx.translate(-28, 0);
      ctx.rotate(wagAngle);
      // Corps queue
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.quadraticCurveTo(-22, -12, -34, 0);
      ctx.quadraticCurveTo(-22, 12, 0, 8);
      ctx.closePath();
      ctx.fillStyle = this.colors.body;
      ctx.fill();
      // Nageoire queue
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.quadraticCurveTo(-30, -22, -38, -4);
      ctx.quadraticCurveTo(-30, 4, -10, 8);
      ctx.closePath();
      ctx.fillStyle = this.colors.gill;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();

      // ── Pattes avant ──
      ctx.beginPath();
      ctx.ellipse(14, 12, 7, 4, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.body;
      ctx.fill();
      // doigts
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(16 + i * 3, 17, 1.5, 3, i * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.body;
        ctx.fill();
      }

      // ── Pattes arrière ──
      ctx.beginPath();
      ctx.ellipse(-14, 12, 7, 4, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.body;
      ctx.fill();
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(-12 + i * 3, 17, 1.5, 3, i * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.body;
        ctx.fill();
      }

      // ── Tête ──
      ctx.beginPath();
      ctx.ellipse(26, -1, 15, 12, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.body;
      ctx.fill();

      // ── Œil ──
      ctx.beginPath();
      ctx.arc(34, -4, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(35, -4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.eye;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(35.5, -4.8, 1, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // ── Sourire ──
      ctx.beginPath();
      ctx.arc(36, 2, 5, 0.1, Math.PI * 0.9);
      ctx.strokeStyle = this.colors.gill;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Branchies (3 de chaque côté) ──
      const gillPositions = [-4, 0, 4];
      gillPositions.forEach((offset, i) => {
        const gillWag = Math.sin(this.gillWave + i * 0.8) * 0.3;
        ctx.save();
        ctx.translate(22 + offset, -12);
        ctx.rotate(-0.8 + gillWag);
        // Tige
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -10);
        ctx.strokeStyle = this.colors.gill;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Pompons
        ctx.beginPath();
        ctx.arc(0, -10, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.gill;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3, -7, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-2, -6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ── Nageoire dorsale ──
      ctx.beginPath();
      ctx.moveTo(-20, -14);
      ctx.quadraticCurveTo(0, -24, 20, -14);
      ctx.quadraticCurveTo(0, -18, -20, -14);
      ctx.fillStyle = this.colors.gill;
      ctx.globalAlpha = 0.45;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.restore();
    }
  }

  // Instancier 4 axolotls
  const axolotls = [
    new Axolotl(100,  80, 0.95,  1),
    new Axolotl(400,  55, 0.75, -1),
    new Axolotl(700, 100, 1.05,  1),
    new Axolotl(950,  65, 0.80, -1),
  ];

  // ── Fond : graviers ──
  const pebbles = Array.from({ length: 45 }, () => ({
    x: Math.random(),
    r: 3 + Math.random() * 6,
    color: `hsl(${210 + Math.random() * 40}, ${20 + Math.random() * 20}%, ${30 + Math.random() * 20}%)`
  }));

  // ── Boucle d'animation ──
  let t = 0;
  function loop() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Fond dégradé eau
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#051c3a');
    grad.addColorStop(1, '#03102a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Rayons lumineux
    for (let i = 0; i < 5; i++) {
      const lx = (W * (i + 0.5)) / 5;
      const rayGrad = ctx.createLinearGradient(lx - 20, 0, lx + 20, H);
      rayGrad.addColorStop(0, 'rgba(96, 165, 250, 0.06)');
      rayGrad.addColorStop(1, 'rgba(96, 165, 250, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(lx - 25 + Math.sin(t * 0.5 + i) * 8, 0);
      ctx.lineTo(lx + 25 + Math.sin(t * 0.5 + i) * 8, 0);
      ctx.lineTo(lx + 60, H);
      ctx.lineTo(lx - 60, H);
      ctx.fill();
    }

    // Graviers
    pebbles.forEach(p => {
      ctx.beginPath();
      ctx.ellipse(p.x * W, H - 6, p.r * 1.4, p.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    // Algues
    plants.forEach(pl => {
      pl.sway += pl.swaySpeed;
      const segH = pl.height / pl.segments;
      for (let s = pl.segments; s >= 0; s--) {
        const py = H - 8 - s * segH;
        const sway = Math.sin(pl.sway + s * 0.4) * (s * 3);
        const px = pl.x + sway;
        if (s < pl.segments) {
          const prevSway = Math.sin(pl.sway + (s + 1) * 0.4) * ((s + 1) * 3);
          ctx.beginPath();
          ctx.moveTo(pl.x + prevSway, py + segH);
          ctx.quadraticCurveTo(px + 8, py + segH / 2, px, py);
          ctx.strokeStyle = pl.color;
          ctx.lineWidth = 3 - s * 0.2;
          ctx.stroke();
          // Feuilles
          if (s % 2 === 0) {
            ctx.beginPath();
            ctx.ellipse(px + 8, py, 7, 3, 0.5, 0, Math.PI * 2);
            ctx.fillStyle = pl.color;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }
    });

    // Axolotls
    axolotls.forEach(a => {
      a.update(W, H);
      a.draw(ctx);
    });

    // Bulles
    bubbles.forEach(b => {
      b.y -= b.speed;
      b.wobble += b.wobbleSpeed;
      const bx = b.x + Math.sin(b.wobble) * 3;
      if (b.y < -10) {
        b.y = H + 10;
        b.x = Math.random() * W;
      }
      ctx.beginPath();
      ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(147, 197, 253, ${b.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      // Reflet
      ctx.beginPath();
      ctx.arc(bx - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${b.opacity * 0.6})`;
      ctx.fill();
    });

    // Ligne de fond sable
    const sandGrad = ctx.createLinearGradient(0, H - 14, 0, H);
    sandGrad.addColorStop(0, '#1a3050');
    sandGrad.addColorStop(1, '#0f1e35');
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, H - 14, W, 14);

    t += 0.016;
    requestAnimationFrame(loop);
  }

  loop();
})();
