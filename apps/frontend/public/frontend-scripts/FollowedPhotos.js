document.querySelector('.mark-btn .button')?.addEventListener('click', function (event) {
  event.preventDefault();
  if (window.confirm('Действительно отметить эти фотографии просмотренными?')) {
    window.location.href = '/api/photo/checkall';
  }
});
