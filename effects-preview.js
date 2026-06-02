(function initPreviewParticles() {
  const canvas = document.getElementById('previewParticles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let frame;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function make() {
    const rect = canvas.getBoundingClientRect();
    particles = Array.from({ length: 34 }, function () {
      return {
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1
      };
    });
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    particles.forEach(function (particle) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(238,118,36,0.55)';
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0) particle.x = rect.width;
      if (particle.x > rect.width) particle.x = 0;
      if (particle.y < 0) particle.y = rect.height;
      if (particle.y > rect.height) particle.y = 0;
    });
    frame = requestAnimationFrame(draw);
  }

  resize();
  make();
  draw();

  window.addEventListener('resize', function () {
    cancelAnimationFrame(frame);
    resize();
    make();
    draw();
  });
})();
