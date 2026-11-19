"""Create a minimal CWS ZIP and rasterize the code-native table icon."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, zipfile, hashlib, subprocess
ROOT = Path(__file__).resolve().parents[3]
EXT = ROOT / 'extensions/tistory-writing-helper'
OUT = Path(__file__).resolve().parent
subprocess.run(['node', str(EXT/'build.mjs')], check=True)
# Geometry mirrors icons/icon.svg; supersampling keeps the toolbar icon crisp.
im = Image.new('RGBA', (512,512))
d = ImageDraw.Draw(im)
def box(coords): return tuple(v*4 for v in coords)
d.rounded_rectangle(box((16,16,112,112)), radius=88, fill='#e65b2f')
d.rounded_rectangle(box((31,34,97,94)), radius=20, fill='white')
for a,b in [((34,54),(94,54)),((34,74),(94,74)),((55,54),(55,91))]:
    d.line([tuple(v*4 for v in a),tuple(v*4 for v in b)], fill='#e65b2f',width=20)
d.rounded_rectangle(box((35,38,93,50)),radius=8,fill='#ffd6c5')
for size in (16,32,48,128):
    im.resize((size,size),Image.Resampling.LANCZOS).save(EXT/f'icons/icon-{size}.png')
manifest=json.loads((EXT/'manifest.json').read_text())
files=['manifest.json','content.js','settings.js','popup.html','popup.css','popup.mjs','table.mjs','privacy.html']
files += [f'icons/icon-{s}.png' for s in (16,32,48,128)]
archive=OUT/f'tistory-writing-helper-{manifest["version"]}.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for name in files:
        info=zipfile.ZipInfo(name, (2026,11,19,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        z.writestr(info,(EXT/name).read_bytes())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert json.loads(z.read('manifest.json'))['version']==manifest['version']
(OUT/'SHA256SUMS').write_text(hashlib.sha256(archive.read_bytes()).hexdigest()+'  '+archive.name+'\n')
print(archive)
