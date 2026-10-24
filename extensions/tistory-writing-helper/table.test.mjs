import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMarkdown, convert, splitRow} from './table.mjs';
test('reported four-column input retains header and removes two empty columns', () => {
 const tables = parseMarkdown('| 역할 | 함께 볼 핵심 헤더 | | |\n| ------ | ------ | - | - |\n| 인증 | `Authorization`, `WWW-Authenticate` | | |\n| 상태 유지 | `Set-Cookie`, `Cookie` | | |');
 const result = convert(tables, {markdown:true});
 assert.equal(result.removed, 2);
 assert.equal((result.html.match(/<td /g) || []).length, 6);
 assert.match(result.html, /<tbody><tr><td[^>]*><strong>역할<\/strong>/);
 assert.match(result.html, /<code>Authorization<\/code>/);
 assert.doesNotMatch(result.html, /<thead|<th[ >]/);
});
test('escapes executable markup', () => {
 const {html} = convert([['<script>alert(1)</script>', '<img src=x onerror=alert(1)>'].map(x=>[x])]);
 assert.doesNotMatch(html, /<script|<img/);
 assert.match(html, /&lt;script&gt;/);
});
test('preserves pipes in code spans and escaped pipes', () => {
 assert.deepEqual(splitRow('| a\\|b | `x|y` |'), ['a|b', '`x|y`']);
 assert.deepEqual(splitRow('| ``x`|y`` | z |'), ['``x`|y``', 'z']);
});
test('keeps empty columns when requested and populated columns always', () => {
 const rows = [['a','',''], ['b','','value']];
 assert.equal(convert([rows]).removed, 1);
 assert.equal(convert([rows],{trimEmpty:false}).removed, 0);
});
test('rejects malformed and empty input', () => {
 assert.throws(()=>parseMarkdown('plain text'));
 assert.throws(()=>parseMarkdown('| a | b |\n| - | - |\n| c | d | e |'));
 assert.throws(()=>convert([[['','']]]));
});
test('extracts multiple tables', () => {
 assert.equal(parseMarkdown('| a | b |\n| - | - |\n| c | d |\n\ntext\n\n| e | f |\n| - | - |').length, 2);
});
