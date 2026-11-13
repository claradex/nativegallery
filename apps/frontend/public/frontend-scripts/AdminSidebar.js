document.getElementById('header-toggle')?.addEventListener('click', event => {
  document.getElementById('navbar')?.classList.toggle('show-menu');
  event.currentTarget.classList.toggle('bx-x');
});
