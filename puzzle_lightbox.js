document.addEventListener('DOMContentLoaded', () => {
  const galleryItems = document.querySelectorAll('.puzzle-gallery-item');
  if (!galleryItems.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'puzzle-lightbox';
  overlay.innerHTML = `
    <div class="puzzle-lightbox-backdrop" data-close="true"></div>
    <div class="puzzle-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Puzzle image preview">
      <button class="puzzle-lightbox-close" aria-label="Close preview">×</button>
      <img class="puzzle-lightbox-image" alt="">
      <div class="puzzle-lightbox-caption">
        <h3 class="puzzle-lightbox-title"></h3>
        <p class="puzzle-lightbox-pieces"></p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector('.puzzle-lightbox-image');
  const title = overlay.querySelector('.puzzle-lightbox-title');
  const pieces = overlay.querySelector('.puzzle-lightbox-pieces');
  const closeBtn = overlay.querySelector('.puzzle-lightbox-close');

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.classList.remove('lightbox-open');
  }

  galleryItems.forEach(item => {
    const thumb = item.querySelector('.puzzle-gallery-image');
    const itemTitle = item.querySelector('.puzzle-gallery-meta h4')?.textContent || '';
    const itemPieces = item.querySelector('.puzzle-gallery-meta p')?.textContent || '';
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      img.src = thumb.src;
      img.alt = thumb.alt;
      title.textContent = itemTitle;
      pieces.textContent = itemPieces;
      overlay.classList.add('active');
      document.body.classList.add('lightbox-open');
    });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target.dataset.close === 'true' || e.target === closeBtn) closeLightbox();
  });
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeLightbox();
  });
});
