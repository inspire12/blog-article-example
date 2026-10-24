import {parseMarkdown, convert} from './table.mjs';

// Preserve surrounding prose and rich cell contents; the editor still performs
// its normal paste sanitization, selection replacement, and undo bookkeeping.
export function preparePaste(html, plain) {
  if (html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tables = [...doc.querySelectorAll('table')];
    if (tables.length) {
      let changed = false;
      for (const table of tables) {
        if (table.parentElement.closest('table') || table.querySelector('table')) continue;
        const rows = [...table.rows];
        if (!rows.length || !rows[0].cells.length) continue;
        if (rows.some(row => [...row.cells].some(cell => cell.colSpan !== 1 || cell.rowSpan !== 1))) continue;
        const width = rows[0].cells.length;
        if (rows.some(row => row.cells.length !== width)) continue;
        const empty = Array.from({length:width}, (_, i) => i).filter(i => rows.every(row => {
          const cell = row.cells[i];
          return !cell.textContent.trim() && !cell.querySelector('img,video,audio,svg,canvas,iframe,object,input');
        }));
        if (empty.length === width) continue;
        // Move the header inside tbody so Tistory cannot detach thead contents.
        const body = doc.createElement('tbody');
        rows.forEach((row, index) => {
          [...row.cells].forEach((cell, col) => {
            if (empty.includes(col)) { cell.remove(); return; }
            let td = cell;
            if (cell.tagName === 'TH') {
              td = doc.createElement('td');
              for (const attribute of cell.attributes) {
                if (!['scope','abbr'].includes(attribute.name)) td.setAttribute(attribute.name, attribute.value);
              }
              while (cell.firstChild) td.append(cell.firstChild);
              cell.replaceWith(td);
            }
            Object.assign(td.style, {border:'1px solid #d4d9e2',padding:'12px 14px',verticalAlign:'top',overflowWrap:'anywhere'});
            if (index === 0) {
              Object.assign(td.style, {backgroundColor:'#edf2f7',color:'#202939',fontWeight:'bold'});
              const strong = doc.createElement('strong');
              while (td.firstChild) strong.append(td.firstChild);
              td.append(strong);
            }
          });
          body.append(row);
        });
        table.querySelectorAll(':scope > thead,:scope > tbody,:scope > tfoot,:scope > colgroup').forEach(node => node.remove());
        table.append(body);
        Object.assign(table.style, {borderCollapse:'collapse',width:'100%'});
        changed = true;
      }
      return changed ? doc.body.innerHTML : null;
    }
    // Rich content without tables belongs to the editor's ordinary paste path.
    if (!plain || doc.body.querySelector("img,video,audio,iframe,object")) return null;
  }
  // Only accept a standalone Markdown table block: never discard surrounding text.
  const lines = plain.trim().split(/\r?\n/);
  if (lines.length < 2 || lines.some(line => !line.trim() || !line.includes('|'))) return null;
  try {
    const tables = parseMarkdown(plain);
    if (tables.length !== 1 || tables[0].length + 1 !== lines.length) return null;
    return convert(tables, {markdown:true}).html;
  } catch { return null; }
}

export function installAutoPaste(win, settings) {
  // The top document also binds editor frames directly. TinyMCE can create
  // javascript:/about:blank frames after extension injection has completed.
  const bound = new WeakMap();
  function bind(frameWindow, force = false) {
    let doc;
    try { doc = frameWindow.document; } catch { return; }
    if (bound.has(doc) && !force) return;
    const previous = bound.get(doc);
    if (previous) {
      frameWindow.removeEventListener('paste', previous.handler, true);
      previous.observer.disconnect();
    }
    const handler = event => {
      if (!settings.enabled || event.defaultPrevented || !event.clipboardData || event.clipboardData.files.length) return;
      const target = event.composedPath()[0];
      if (!target?.isContentEditable || target.closest('[contenteditable="plaintext-only"]')) return;
      let url;
      try { url = new URL(win.top.location.href); } catch { return; }
      if (!url.hostname.endsWith('.tistory.com') || !/^\/manage\/(?:newpost|post)(?:\/|$)/.test(url.pathname)) return;
      try {
        const original = event.clipboardData;
        const html = preparePaste(original.getData('text/html'), original.getData('text/plain'));
        if (!html) return;
        const managers = [frameWindow.tinymce, win.tinymce, win.top.tinymce];
        const editors = managers.flatMap(manager => manager?.get?.() || []);
        const editor = editors.find(item => item.getBody?.()?.contains(target));
        if (editor?.insertContent && editor.undoManager?.transact) {
          editor.undoManager.transact(() => editor.insertContent(html));
          event.preventDefault();
          event.stopImmediatePropagation();
          editor.nodeChanged?.();
          return;
        }
        // Keep a fallback for editors that consume clipboardData themselves.
        const replacement = new DataTransfer();
        for (const type of original.types) replacement.setData(type, original.getData(type));
        replacement.setData('text/html', html);
        Object.defineProperty(event, 'clipboardData', {value:replacement, configurable:true});
      } catch { /* Unsupported content falls through unchanged. */ }
    };
    frameWindow.addEventListener('paste', handler, true);
    const observer = new MutationObserver(scan);
    bound.set(doc, {handler, observer});
    function scan() {
      doc.querySelectorAll('iframe').forEach(frame => {
        if (!frame.dataset.tistoryHelperBound) {
          frame.dataset.tistoryHelperBound = 'true';
          frame.addEventListener('load', () => bind(frame.contentWindow, true));
        }
        if (frame.contentWindow) bind(frame.contentWindow);
      });
    }
    scan();
    observer.observe(doc, {childList:true,subtree:true});
    frameWindow.addEventListener('pagehide', () => observer.disconnect(), {once:true});
  }
  bind(win);
}
