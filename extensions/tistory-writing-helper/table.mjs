export const escapeHTML = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function splitRow(line) {
  line = line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '');
  const cells = []; let cell = ''; let ticks = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\\' && line[i + 1] === '|') { cell += '|'; i++; }
    else if (ch === '`') {
      let end = i; while (line[end] === '`') end++;
      const count = end - i;
      ticks = ticks === count ? 0 : ticks || count;
      cell += line.slice(i, end); i = end - 1;
    } else if (ch === '|' && !ticks) { cells.push(cell.trim()); cell = ''; }
    else cell += ch;
  }
  cells.push(cell.trim()); return cells;
}

export function parseMarkdown(text) {
  const lines = text.replace(/\r/g, '').split('\n'); const tables = [];
  for (let i = 0; i < lines.length - 1; i++) {
    if (!lines[i].includes('|')) continue;
    const header = splitRow(lines[i]); const separator = splitRow(lines[i + 1]);
    if (header.length !== separator.length || !separator.every(c => /^:?-+:?$/.test(c))) continue;
    const rows = [header]; i += 2;
    while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
      const row = splitRow(lines[i]);
      if (row.length !== header.length) throw new Error('행마다 열 수가 다릅니다. 원본 표를 확인해 주세요.');
      rows.push(row); i++;
    }
    tables.push(rows); i--;
  }
  if (!tables.length) throw new Error('표를 찾지 못했습니다. 제목 행과 구분선이 있는 마크다운 표 또는 원본 표를 붙여 넣어 주세요.');
  return tables;
}

export function parseHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,template').forEach(node => node.remove());
  const tables = [...doc.querySelectorAll('table')];
  if (tables.some(t => t.querySelector('table'))) throw new Error('중첩 표는 지원하지 않습니다. 단순한 표로 나눠 주세요.');
  return tables.map(table => [...table.rows].map(row => [...row.cells].map(cell => {
    if (cell.colSpan !== 1 || cell.rowSpan !== 1) throw new Error('병합 셀이 있는 표는 지원하지 않습니다. 셀 병합을 해제해 주세요.');
    cell.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    return cell.textContent.trim();
  })));
}

export function convert(tables, {trimEmpty = true, markdown = false} = {}) {
  if (!tables.length || tables.some(rows => !rows.length || !rows[0].length)) throw new Error('비어 있는 표입니다.');
  let removed = 0;
  const clean = tables.map(rows => {
    const width = Math.max(...rows.map(row => row.length));
    const keep = Array.from({length: width}, (_, i) => i).filter(i => !trimEmpty || rows.some(r => (r[i] || '').trim()));
    removed += width - keep.length;
    if (!keep.length) throw new Error('내용이 있는 셀이 없습니다.');
    return rows.map(row => keep.map(i => row[i] || ''));
  });
  const inline = value => {
    const safe = escapeHTML(value);
    return (markdown ? safe.replace(/(`+)([\s\S]*?)\1/g, '<code>$2</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') : safe).replace(/\n/g, '<br>');
  };
  const html = clean.map(rows => '<table style="border-collapse:collapse;width:100%;border:1px solid #d4d9e2;color:#202939;background:#ffffff;font-size:15px;" data-ke-align="alignLeft"><tbody>' + rows.map((row, i) => '<tr>' + row.map(cell => '<td style="border:1px solid #d4d9e2;padding:12px 14px;text-align:left;vertical-align:top;overflow-wrap:anywhere;' + (i === 0 ? 'background:#edf2f7;font-weight:bold;' : '') + '">' + (i === 0 ? '<strong>' : '') + inline(cell) + (i === 0 ? '</strong>' : '') + '</td>').join('') + '</tr>').join('') + '</tbody></table>').join('<p><br></p>');
  return { html, plain: clean.map(rows => rows.map(row => row.join('\t')).join('\n')).join('\n\n'), removed, count: clean.length };
}
