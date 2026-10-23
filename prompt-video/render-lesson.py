"""Encode studio drawing commands as a WebM using Pillow's built-in VP8 encoder.
Every frame is a VP8 keyframe; no external encoder or network needed.
"""
import io, json, re, struct
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / 'lesson-frames.json').read_text(encoding='utf-8'))
W, H = data['width'], data['height']
fonts = {}
def font(spec):
    weight, size = re.match(r'(\d+) (\d+)px', spec).groups()
    key = (weight, size)
    if key not in fonts:
        filename = 'seguisb.ttf' if weight == '600' else 'segoeui.ttf'
        fonts[key] = ImageFont.truetype('C:/Windows/Fonts/' + filename, int(size))
    return fonts[key]

def vint(n):
    for length in range(1, 9):
        if n < (1 << (length * 7)) - 1:
            return ((1 << (length * 7)) | n).to_bytes(length, 'big')
    raise ValueError('Element too large')
def element(tag, payload):
    return bytes.fromhex(tag) + vint(len(payload)) + payload
def number(tag, n):
    return element(tag, n.to_bytes(max(1, (n.bit_length() + 7)//8), 'big'))

header = element('1A45DFA3', number('4286',1)+number('42F7',1)+number('42F2',4)+number('42F3',8)+element('4282',b'webm')+number('4287',2)+number('4285',2))
info = element('1549A966',number('2AD7B1',1000000)+element('4489',struct.pack('>d',len(data['frames'])/data['fps']*1000))+element('4D80',b'Frame Studio')+element('5741',b'Frame Studio'))
video = element('E0',number('B0',W)+number('BA',H))
tracks = element('1654AE6B',element('AE',number('D7',1)+number('73C5',1)+number('83',1)+element('86',b'V_VP8')+number('23E383',int(1e9/data['fps']))+video))
clusters=[]
for index, commands in enumerate(data['frames']):
    image=Image.new('RGB',(W,H)); draw=ImageDraw.Draw(image)
    for cmd in commands:
        if cmd[0]=='rect':
            _,x,y,w,h,color=cmd
            if w>0 and h>0: draw.rectangle((x,y,x+w-1,y+h-1),fill=color)
        else:
            _,text,x,y,spec,color,align=cmd
            draw.text((x,y),text,font=font(spec),fill=color,anchor={'left':'ls','right':'rs','center':'ms'}[align])
    if index in [0,24,72,120,168,216,264]: image.save(ROOT/f'lesson-check-{index}.png')
    buffer=io.BytesIO();image.save(buffer,format='WEBP',quality=85,method=3)
    webp=buffer.getvalue();offset=12;vp8=None
    while offset+8<=len(webp):
        tag=webp[offset:offset+4];length=int.from_bytes(webp[offset+4:offset+8],'little')
        if tag==b'VP8 ':vp8=webp[offset+8:offset+8+length];break
        offset+=8+length+(length%2)
    if vp8 is None:raise RuntimeError('Pillow did not return a lossy VP8 frame')
    # Each cluster starts at this frame's time. SimpleBlock timestamp is zero.
    timestamp=round(index/data['fps']*1000)
    clusters.append(element('1F43B675',number('E7',timestamp)+element('A3',b'\x81\x00\x00\x80'+vp8)))
    if index%48==0: print(f'Encoded {index}/{len(data["frames"])} frames',flush=True)
out=ROOT/'LCM-lesson.webm'
out.write_bytes(header+element('18538067',info+tracks+b''.join(clusters)))
print(f'Created {out.name}: 36 seconds, {W}x{H}, {out.stat().st_size:,} bytes')
