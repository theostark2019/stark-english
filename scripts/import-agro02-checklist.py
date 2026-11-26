"""Extract the supplied checklist without changing the original workbook."""
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
records = []
with ZipFile(sys.argv[1]) as z:
    strings = [''.join(s.itertext()) for s in ET.fromstring(z.read('xl/sharedStrings.xml'))]
    for index, level in enumerate(('A1', 'A2', 'B1', 'B2'), 1):
        for row in ET.fromstring(z.read(f'xl/worksheets/sheet{index}.xml')).findall('.//m:sheetData/m:row', ns):
            values = {}
            for cell in row:
                value = cell.find('m:v', ns)
                if value is not None:
                    text = strings[int(value.text)] if cell.get('t') == 's' else value.text
                    values[''.join(filter(str.isalpha, cell.get('r')))] = text
            if values.get('A', '').isdigit() and values.get('B'):
                number = int(values['A'])
                records.append(dict(number=number, episode=(number-1) % 24+1, level=level,
                    code=f'AGRO02-{level}-{(number-1) % 24+1:02}',
                    title=values['B'], resources=values['C'], task=values['D'],
                    evidence=values['E'], modality=values['F']))
assert len(records) == 96
Path('src/data/agro02-checklist.json').write_text(json.dumps(records, ensure_ascii=False, indent=2)+'\n')
print('Imported 96 source competencies: 24 each at A1, A2, B1 and B2.')
