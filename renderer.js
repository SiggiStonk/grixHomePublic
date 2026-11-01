import { areas } from './data/areas.js';
const rgb = hex => hex.slice(1).match(/../g).map(x => parseInt(x, 16));
const originalWall = [229, 199, 179];
export class HouseView {
  constructor(view, canvas) { this.view = view; this.canvas = canvas; this.context = canvas.getContext('2d'); }
  async load() {
    const image = new Image(); image.src = `./assets/${this.view.id}.jpg`; await image.decode();
    const {width:w,height:h} = this.view;
    if (image.naturalWidth !== w || image.naturalHeight !== h) throw new Error(`Unexpected image size: ${this.view.id}`);
    this.canvas.width = w; this.canvas.height = h;
    this.context.drawImage(image, 0, 0); this.original = this.context.getImageData(0, 0, w, h);
    this.output = new ImageData(new Uint8ClampedArray(this.original.data), w, h);
    this.ids = new Uint8Array(w*h); this.alpha = new Float32Array(w*h); this.light = new Float32Array(w*h);
    const mask = document.createElement('canvas'); mask.width=w; mask.height=h;
    const ctx = mask.getContext('2d', {willReadFrequently:true});
    const source = this.original.data;
    const foliage = new Path2D((this.view.foliage || []).join(' '));
    ctx.fillStyle='white';ctx.fill(foliage);
    const vegetation=ctx.getImageData(0,0,w,h).data;
    for (const area of areas) {
      ctx.clearRect(0,0,w,h); ctx.fillStyle='white'; ctx.globalCompositeOperation='source-over';
      for (const zone of this.view.zones.filter(z=>z.id===area.id)) {
        // An opening partly outside its wall must not create a filled island there.
        ctx.save();ctx.clip(new Path2D(zone.p));
        ctx.fill(new Path2D([zone.p,...(zone.holes||[])].join(' ')), 'evenodd');
        ctx.restore();
      }
      ctx.globalCompositeOperation='destination-out';
      for (const p of this.view.exclude) ctx.fill(new Path2D(p));
      const m=ctx.getImageData(0,0,w,h).data;
      for(let i=0;i<w*h;i++) {
        if(!m[i*4+3]) continue;
        const k=i*4,r=source[k],g=source[k+1],b=source[k+2];
        // Only classify plant colors inside explicitly traced foreground overlaps.
        // Global RGB thresholds punch holes in warm/dark wall shadows and JPEG edges.
        let coverage=m[k+3]/255;
        if(vegetation[k+3]) {
          const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
          const green=smooth(-2,12,g-r);
          const yellow=smooth(10,32,g-b)*(1-smooth(4,22,r-g));
          const red=smooth(10,32,(r-g)-1.8*(g-b));
          const dark=1-smooth(30,65,Math.max(r,g,b));
          coverage*=1-Math.max(green,yellow,red,dark);
        }
        if(coverage<.005)continue;
        this.ids[i]=area.id;
        // Adjacent antialiased surfaces must cover the whole pixel together,
        // rather than leaving a hairline of the original peach render between them.
        this.alpha[i]=Math.min(1,this.alpha[i]+coverage);
        // Remove the original peach cast channel-by-channel while retaining source illumination.
        const base=area.id===4 ? [78,71,65] : originalWall;
        this.light[i]=Math.max(.12, Math.min(1.25, (r/base[0]+g/base[1]+b/base[2])/3));
      }
    }
  }
  hit(x,y) { const r=this.canvas.getBoundingClientRect(); const px=Math.floor((x-r.left)/r.width*this.canvas.width),py=Math.floor((y-r.top)/r.height*this.canvas.height); return this.ids[py*this.canvas.width+px] || 0; }
  render(design, mode='design', selected=0, hover=0) {
    const data=this.output.data, src=this.original.data;
    data.set(src);
    const targets=design.map(x=>x ? rgb(x.hex) : null);
    const map=areas.map(a=>rgb(a.color));
    if(mode!=='original') {
      for(let i=0;i<this.ids.length;i++) {
        const id=this.ids[i]; if(!id)continue;
        const target=mode==='map'?map[id-1]:targets[id-1];
        const highlight=hover===id;
        if(!target&&!highlight)continue;
        const k=i*4, alpha=this.alpha[i], light=this.light[i];
        for(let c=0;c<3;c++) {
          let value=target ? Math.min(255,target[c]*light) : src[k+c];
          if(highlight)value=value*.75+map[id-1][c]*.25;
          data[k+c]=src[k+c]*(1-alpha)+value*alpha;
        }
      }
    }
    this.context.putImageData(this.output,0,0);
    if(mode==='map') {
      const ctx=this.context,s=this.view.width/1000;
      for(const [id,x,y] of this.view.labels) {
        const radius=17*s;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fillStyle=areas[id-1].color;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2*s;ctx.stroke();ctx.fillStyle='#183a2b';ctx.font=`bold ${18*s}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(id),x,y);
      }
    }
  }
}
