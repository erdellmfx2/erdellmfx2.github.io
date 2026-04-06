document.addEventListener('DOMContentLoaded', () => {
  const hobbiesSection = document.getElementById('hobbies');
  if (!hobbiesSection) return;

  const effectLayer = document.createElement('div');
  effectLayer.className = 'hobbies-effect-layer';
  hobbiesSection.prepend(effectLayer);
  hobbiesSection.classList.add('hobbies-effect-host');

  const effects = ['aurora', 'parallax', 'puzzle', 'icons', 'mesh', 'particles'];
  const choice = effects[Math.floor(Math.random() * effects.length)];
  effectLayer.dataset.effect = choice;
  effectLayer.classList.add(`effect-${choice}`);

  if (choice === 'icons') {
    effectLayer.innerHTML = '<span>🎮</span><span>🧩</span><span>🏀</span><span>📚</span>';
  }

  if (choice === 'particles') {
    const canvas = document.createElement('canvas');
    canvas.className = 'hobbies-effect-canvas';
    effectLayer.appendChild(canvas);
    initParticles(canvas);
  }

  function initParticles(canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let frame;

    function resize() {
      const rect = effectLayer.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function createParticles() {
      const rect = effectLayer.getBoundingClientRect();
      particles = Array.from({ length: Math.min(80, Math.floor(rect.width / 18)) }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2 + 0.8,
        opacity: Math.random() * 0.35 + 0.12
      }));
    }

    function draw() {
      const rect = effectLayer.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(238,118,36,${p.opacity})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = rect.width;
        if (p.x > rect.width) p.x = 0;
        if (p.y < 0) p.y = rect.height;
        if (p.y > rect.height) p.y = 0;
      });
      frame = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    window.addEventListener('resize', () => {
      cancelAnimationFrame(frame);
      resize();
      createParticles();
      draw();
    });
  }
});
