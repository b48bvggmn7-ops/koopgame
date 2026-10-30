import sys, json, subprocess
from PIL import Image, ImageDraw
# blatt.py name box "[[label,query],...]"
name, box, shots = sys.argv[1], json.loads(sys.argv[2]), json.loads(sys.argv[3])
subprocess.run(['python3', 'shot.py', json.dumps([[f'b{i}', q] for i, (l, q) in enumerate(shots)])], check=True)
ims = []
for i, (l, q) in enumerate(shots):
    im = Image.open(f's_b{i}.png').crop(box); im = im.resize((im.width*2, im.height*2)); ImageDraw.Draw(im).text((8, 8), l, fill=(255,255,0)); ims.append(im)
n = 3; w, h = ims[0].size; rows = (len(ims) + n - 1)//n
W = Image.new('RGB', (w*n, h*rows))
for i, im in enumerate(ims): W.paste(im, ((i % n)*w, (i//n)*h))
W.save(name)
