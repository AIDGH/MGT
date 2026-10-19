from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
out = root / 'dist'
out.mkdir(exist_ok=True)
for kind, slug in [('themes', 'mgt-classic'), ('plugins', 'mgt-content')]:
    source = root / 'wp-content' / kind / slug
    destination = out / f'{slug}.zip'
    with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
        for file in sorted(source.rglob('*')):
            if file.is_file():
                archive.write(file, file.relative_to(source.parent))
    print(destination)
