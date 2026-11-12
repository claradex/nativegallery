(() => {
  const recent = document.getElementById('recent-photos');
  const button = document.getElementById('loadmore');
  if (!recent || !button) return;

  function makePhoto(photo) {
    const tile = document.createElement('div');
    tile.className = 'prw-grid-item';
    const wrapper = document.createElement('div');
    wrapper.className = 'prw-wrapper';
    const decoded = new DOMParser().parseFromString(photo.place, 'text/html');
    wrapper.append(document.createTextNode(decoded.body.textContent ?? ''));
    const date = document.createElement('div');
    date.textContent = photo.date;
    wrapper.append(date);

    const link = document.createElement('a');
    link.href = '/photo/' + Number(photo.id) + '/';
    link.target = '_blank';
    link.className = 'prw-animate blur-load';
    const full = new URL(photo.photourl_small, location.origin);
    const tiny = new URL(photo.photourl_extrasmall, location.origin);
    link.dataset.src = full.href;
    link.style.backgroundImage = 'url(' + JSON.stringify(tiny.href) + ')';
    if (Number(photo.ccnt) > 0) {
      const shade = document.createElement('div');
      shade.className = 'hdshade';
      const count = document.createElement('div');
      count.className = 'com-icon';
      count.textContent = String(photo.ccnt);
      shade.append(count);
      link.append(shade);
    }
    const image = new Image();
    image.onload = () => {
      link.style.backgroundImage = 'url(' + JSON.stringify(full.href) + ')';
      link.classList.add('loaded');
    };
    image.src = full.href;
    tile.append(wrapper, link);
    return tile;
  }

  let exhausted = false;
  async function load() {
    if (button.disabled || exhausted) return;
    button.disabled = true;
    button.classList.add('loader-button');
    button.value = ' ';
    try {
      const query = new URLSearchParams({ lastpid: recent.getAttribute('lastpid') ?? '0' });
      const response = await fetch('/api/photo/loadrecent?' + query);
      if (!response.ok) throw new Error('Unable to load photos');
      const photos = await response.json();
      if (!Array.isArray(photos)) throw new Error('Unexpected photo list');
      if (!photos.length) {
        exhausted = true;
        button.hidden = true;
        return;
      }
      recent.append(...photos.map(makePhoto));
      recent.setAttribute('lastpid', String(photos.at(-1).id));
    } catch (error) {
      console.error(error);
    } finally {
      button.disabled = false;
      button.classList.remove('loader-button');
      button.value = 'Загрузить ещё';
    }
  }

  button.addEventListener('click', load);
  void load();
})();
