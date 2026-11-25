'use strict';

(() => {
  const root = document.documentElement;
  const key = 'unit-converter:theme';
  const legacyKeys = {
    length: 'length-converter-ex01:theme',
    weight: 'weight-converter-ex02:theme'
  };
  const buttons = {
    light: document.querySelector('#light-theme'),
    dark: document.querySelector('#dark-theme')
  };
  const pageLinks = document.querySelectorAll('.converter-menu a, .home-link');
  const localFile = location.protocol === 'file:';

  function readTheme() {
    if (localFile) {
      const theme = location.hash.slice(1);
      if (Object.hasOwn(buttons, theme)) return theme;
    }
    try {
      const stored = localStorage.getItem(key)
        ?? localStorage.getItem(legacyKeys[root.dataset.converter])
        ?? localStorage.getItem(legacyKeys.length)
        ?? localStorage.getItem(legacyKeys.weight);
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return root.dataset.theme;
    }
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    for (const [name, button] of Object.entries(buttons)) {
      button.setAttribute('aria-pressed', String(name === theme));
    }
    if (localFile) {
      // Browsers can isolate localStorage per file, so carry the theme in local links.
      for (const link of pageLinks) link.hash = theme;
    }
  }

  for (const [theme, button] of Object.entries(buttons)) {
    button.addEventListener('click', () => {
      applyTheme(theme);
      if (localFile) history.replaceState(null, '', '#' + theme);
      try {
        localStorage.setItem(key, theme);
      } catch {
        // The current page stays usable when storage is blocked.
      }
    });
  }

  window.addEventListener('pageshow', () => applyTheme(readTheme()));
  window.addEventListener('storage', event => {
    if (event.key === key) applyTheme(readTheme());
  });
  applyTheme(readTheme());
})();
