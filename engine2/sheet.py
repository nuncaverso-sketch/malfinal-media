import sys,glob
from PIL import Image,ImageDraw
d=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 8
fs=sorted(glob.glob(d+'/f*.jpg')); ims=[Image.open(f) for f in fs]; w=180; h=320
rows=(len(ims)+cols-1)//cols; sh=Image.new('RGB',(w*cols,h*rows),'black'); dr=ImageDraw.Draw(sh)
for i,(f,im) in enumerate(zip(fs,ims)):
    x,y=(i%cols)*w,(i//cols)*h; sh.paste(im.resize((w,h)),(x,y)); dr.text((x+4,y+4),f.split('/')[-1][1:5],fill='yellow')
sh.save(out,quality=85)
