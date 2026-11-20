import sharp from "sharp";
async function edges(file, rows, leftBg, rightBg, thr=30){
  const {data,info} = await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const {width:W,channels:C}=info;
  const dist=(i,r,g,b)=>Math.hypot(data[i]-r,data[i+1]-g,data[i+2]-b);
  const out={};
  for(const y of rows){
    const il=(y*W+leftBg)*C, ir=(y*W+rightBg)*C;
    const l=[data[il],data[il+1],data[il+2]], r=[data[ir],data[ir+1],data[ir+2]];
    let L=null,R=null;
    for(let x=0;x<W;x++){const i=(y*W+x)*C; if(dist(i,...l)>thr){L=x;break;}}
    for(let x=W-1;x>=0;x--){const i=(y*W+x)*C; if(dist(i,...r)>thr){R=x;break;}}
    out[y]=[L,R];
  }
  return out;
}
console.log("JAR", await edges("WhatsApp Image 2026-11-18 at 6.00.24 AM.jpeg",[90,120,180,240,280,300,320,340,360,380,400,450,500,600,700,800,900,1000,1040,1060],8,912,34));
console.log("DROP", await edges("dfh.jpeg",[100,150,200,250,290,320,340,380,450,550,650,750,850,890],6,1018,28));
