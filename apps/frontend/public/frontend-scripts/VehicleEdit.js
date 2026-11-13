(() => {
  const form = document.getElementById('mform');
  if (!form) return;
  const number = form.elements.namedItem('num');
  const name = form.elements.namedItem('gos');
  const type = form.elements.namedItem('type');
  const submit = document.getElementById('submit');

  function update() {
    const byName = form.elements.namedItem('link_gos').value === '1';
    number.disabled = byName;
    name.disabled = !byName;
    submit.disabled = !type.value || !(byName ? name : number).value.trim();
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
