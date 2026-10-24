import {parseMarkdown, parseHTML, convert} from './table.mjs';
const $ = id => document.getElementById(id);
let pastedTables = null; let output = null;
const status = text => { $('status').textContent = text; };
function invalidate() {
  output = null; $('copy').disabled = $('html').disabled = true;
  $('preview').replaceChildren();
}
function render() {
  invalidate();
  try {
    output = convert(pastedTables || parseMarkdown($('source').value), {trimEmpty: $('trim').checked, markdown: !pastedTables});
    $('preview').innerHTML = output.html;
    $('copy').disabled = $('html').disabled = false;
    status(`${output.count}개 표 변환 완료 · 빈 열 ${output.removed}개 제거`);
  } catch (error) { status(error.message); }
}
$('source').addEventListener('paste', event => {
  const html = event.clipboardData.getData('text/html');
  if (!html) return;
  try {
    const tables = parseHTML(html);
    if (!tables.length) return;
    event.preventDefault(); pastedTables = tables;
    $('source').value = tables.map(rows => rows.map(row => row.join('\t')).join('\n')).join('\n\n');
    render();
  } catch (error) { event.preventDefault(); invalidate(); pastedTables = null; $('source').value = ''; status(error.message); }
});
$('source').addEventListener('input', () => { pastedTables = null; invalidate(); status('마크다운 표를 입력한 뒤 변환해 주세요.'); });
$('trim').addEventListener('change', render);
$('convert').addEventListener('click', render);
$('example').addEventListener('click', () => {
  pastedTables = null;
  $('source').value = '| 역할 | 함께 볼 핵심 헤더 | | |\n| --- | --- | - | - |\n| 캐시·재검증 | `Cache-Control`, `ETag`, `If-None-Match`, `Last-Modified`, `If-Modified-Since`, `Vary` | | |\n| 인증 | `Authorization`, `WWW-Authenticate` | | |\n| 상태 유지 | `Set-Cookie`, `Cookie` | | |'; render();
});
async function copy(asHTML) {
  if (!output) return;
  try {
    if (asHTML) await navigator.clipboard.writeText(output.html);
    else await navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([output.html], {type: 'text/html'}),
      'text/plain': new Blob([output.plain], {type: 'text/plain'})
    })]);
    status(asHTML ? 'HTML 복사 완료! 티스토리 HTML 모드에 붙여 넣으세요.' : '표 복사 완료! 티스토리 기본 모드에 붙여 넣으세요.');
  } catch { status('복사하지 못했습니다. 창을 활성화한 뒤 다시 눌러 주세요.'); }
}
$('copy').addEventListener('click', () => copy(false));
$('html').addEventListener('click', () => copy(true));

chrome.storage.local.get({autoPaste:true}).then(value => { $('auto').checked = value.autoPaste; });
$('auto').addEventListener('change', async () => {
  try { await chrome.storage.local.set({autoPaste:$('auto').checked}); status($('auto').checked ? '자동 변환을 켰습니다.' : '자동 변환을 껐습니다.'); }
  catch { status('설정을 저장하지 못했습니다. 확장 프로그램을 다시 열어 주세요.'); }
});
