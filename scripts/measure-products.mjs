import sharp from "sharp";
const jar = await sharp("WhatsApp Image 2026-11-18 at 6.00.24 AM.jpeg").ensureAlpha().raw().toBuffer({resolveWithObject:true});
const {data,info} = jar; const {width:W,height:H,channels:C} = info;
function range(y0,y1,test){let min=1e9,max=-1; for(let y=y0;y<y1;y++){for(let x=0;x<W;x++){const i=(y*W+x)*C; if(test(data[i],data[i+1],data[i+2])){if(x<min)min=x;if(x>max)max=x;}}} return [min,max];}
const dark=(r,g,b)=> r<90&&g<120&&b<100&&g>r-5;
const copper=(r,g,b)=> r>110&&r<230&&g>50&&g<170&&b<130&&r>g+20;
console.log("jar label rows 500-900", range(500,900,dark));
console.log("jar label row 600", range(600,601,dark));
console.log("jar lid rows 100-280", range(100,280,copper));
console.log("jar lid row 150", range(150,151,copper));
const d = await sharp("dfh.jpeg").ensureAlpha().raw().toBuffer({resolveWithObject:true});
const D=d.data, DW=d.info.width, DH=d.info.height, DC=d.info.channels;
function range2(y0,y1,test){let min=1e9,max=-1; for(let y=y0;y<y1;y++){for(let x=0;x<DW;x++){const i=(y*DW+x)*DC; if(test(D[i],D[i+1],D[i+2])){if(x<min)min=x;if(x>max)max=x;}}} return [min,max];}
console.log("drop label rows 480-760", range2(480,760,dark));
console.log("drop label row 600", range2(600,601,dark));
console.log("drop gold rows 210-300", range2(210,300,copper));
console.log("drop bulb rows 100-200", range2(100,200,copper));
