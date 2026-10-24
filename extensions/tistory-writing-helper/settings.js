// Privileged storage access stays isolated. Only a boolean crosses to the page.
(() => {
  let enabled = false;
  const publish = () => window.dispatchEvent(new CustomEvent('tistory-helper-setting', {detail:enabled}));
  window.addEventListener('tistory-helper-ready', publish);
  chrome.storage.local.get({autoPaste:true}).then(value => {
    enabled = value.autoPaste !== false;
    publish();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.autoPaste) {
      enabled = changes.autoPaste.newValue !== false;
      publish();
    }
  });
})();
