import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
test('paste interception runs in the editor MAIN world, storage remains isolated', () => {
 const manifest = JSON.parse(read('manifest.json'));
 const paste = manifest.content_scripts.find(script => script.js.includes('content.js'));
 const storage = manifest.content_scripts.find(script => script.js.includes('settings.js'));
 assert.equal(paste.world,'MAIN');assert.equal(storage.world,'ISOLATED');
 assert.equal(paste.run_at,'document_start');assert.equal(paste.all_frames,false);assert.equal(paste.match_about_blank,true);
 assert.doesNotMatch(read('content.js'), /chrome\.storage/);
});
