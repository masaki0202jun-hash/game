"""Build the single-file game served by GitHub Pages and the preview."""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parents[1]
source = (root / 'src/painted-game.template.html').read_text()
modules = ['after-forest.js', 'adult-story.js', 'game-progress.js', 'bgm.js']
source = source.replace('function loop(t){', '\n'.join((root / 'src' / name).read_text() for name in modules) + '\nfunction loop(t){')
source = source.replace('完全版</p>', '完全版 <small>v23</small></p>')
source = re.sub(r"'assets/([^']+\.webp)'", lambda m: '"data:image/webp;base64,' + base64.b64encode((root / 'assets' / m[1]).read_bytes()).decode() + '"', source)
for path in ['index.html', 'src/painted-game.html', 'preview/index.html', 'shirikiri-game.html']:
    (root / path).write_text(source)
print('Built browser game:', source.count('data:image/webp;base64,'), 'embedded images')
