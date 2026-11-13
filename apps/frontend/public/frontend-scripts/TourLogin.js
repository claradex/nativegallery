const tour = document.getElementById('tour');

if (tour) {
  const buttons = Array.from(tour.querySelectorAll('[data-tour-tab]'));
  const panels = tour.querySelectorAll('.tabcontent');
  for (const button of buttons) {
    button.addEventListener('click', () => {
      for (const item of buttons) item.classList.toggle('active', item === button);
      for (const panel of panels) panel.style.display = panel.id === button.dataset.tourTab ? 'block' : 'none';
    });
  }
}
