/* Display the original video frame; no grading, second photo or subject mask.
   Edge extension is sampled from this same frame, outside the subject only. */
(()=>{
 const stage=document.querySelector('.portrait'),video=document.querySelector('#cat');
 const canvas=document.querySelector('#portrait-frame'),ctx=canvas.getContext('2d',{alpha:false});
 const poster=new Image();poster.src=video.poster;
 const topEdge=document.createElement('canvas'),leftEdge=document.createElement('canvas'),rightEdge=document.createElement('canvas');
 topEdge.width=512;topEdge.height=1;leftEdge.width=1;leftEdge.height=1024;rightEdge.width=64;rightEdge.height=256;
 const topCtx=topEdge.getContext('2d'),leftCtx=leftEdge.getContext('2d'),rightCtx=rightEdge.getContext('2d');
 let geometry={x:0,y:0,width:1,height:1},scheduled=0,decoded=false;

 function draw(){
  scheduled=0;const w=stage.clientWidth,h=stage.clientHeight,screenDpr=Math.min((devicePixelRatio||1)*stage.getBoundingClientRect().width/w,2);
  if(!w||!h)return;
  const source=decoded&&video.readyState>=2?video:poster;
  const sw=source===video?video.videoWidth:poster.naturalWidth,sh=source===video?video.videoHeight:poster.naturalHeight;
  if(!sw||!sh)return;
  // Do not upscale the backing store beyond the source pixel density.
  const dw=1740*.979,dpr=Math.min(screenDpr,sw/dw);
  const dh=dw*sh/sw,dx=(w-1740)/2+1740*.0417,dy=h-dh;
  geometry={x:dx,y:dy,width:dw,height:dh};
  const bw=Math.round(w*dpr),bh=Math.round(h*dpr);
  if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // The extension joins sampled interior backdrop pixels, not the source's
  // compression-darkened border. Feathering is restricted to blue margins.
  const right=dx+dw, inset=12, feather=28;
  rightCtx.drawImage(source,sw-20,0,8,sh,0,0,64,256);
  leftCtx.drawImage(source,12,0,8,sh,0,0,1,1024);
  if(dx>0){
   ctx.save();ctx.translate(dx+feather,dy);ctx.scale(-1,1);
   ctx.drawImage(source,12,0,Math.min(sw*.3,(dx+feather)*sw/dw),sh,0,0,dx+feather,dh);
   ctx.restore();
  }
  const sample=rightCtx.getImageData(0,0,64,256),pixels=sample.data;
  const rows=Array.from({length:256},(_,y)=>[0,1,2].map(k=>{
   let sum=0;for(let x=0;x<64;x++)sum+=pixels[(y*64+x)*4+k];return sum/64;
  }));
  for(let y=0;y<256;y++)for(let k=0;k<3;k++){
   let sum=0,count=0;for(let yy=Math.max(0,y-18);yy<=Math.min(255,y+18);yy++){sum+=rows[yy][k];count++}
   for(let x=0;x<64;x++)pixels[(y*64+x)*4+k]=sum/count;
  }
  rightCtx.putImageData(sample,0,0);
  ctx.drawImage(rightEdge,0,0,64,256,right-feather,dy,Math.max(1,w-right+feather),dh);
  ctx.drawImage(source,0,0,sw,sh,dx,dy,dw,dh);
  ctx.save();
  for(let x=0;x<feather;x++){
   const alpha=(1+Math.cos(Math.PI*x/feather))/2;
   ctx.globalAlpha=alpha;
   ctx.drawImage(leftEdge,0,0,1,1024,dx+x,dy,1.1,dh);
   ctx.drawImage(rightEdge,0,0,64,256,right-x-1,dy,1.1,dh);
  }
  ctx.restore();
  // Continue the finished top row across the entire canvas in one operation.
  if(dy>0)ctx.drawImage(canvas,0,Math.ceil((dy+1)*dpr),bw,1,0,0,w,dy+2);
 }
 function schedule(){if(!scheduled)scheduled=requestAnimationFrame(draw)}
 poster.onload=()=>{
  schedule();
  // Paint the static hero before the video competes for download bandwidth.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{video.preload='auto';video.load()}));
 };
 poster.onerror=()=>{video.preload='auto';video.load()};
 video.addEventListener('loadeddata',()=>{decoded=true;schedule()});
 video.addEventListener('seeked',schedule);
 new ResizeObserver(schedule).observe(stage);window.addEventListener('resize',schedule);
 window.portraitFrameRect=()=>{const r=stage.getBoundingClientRect();const scale=r.width/stage.clientWidth;return{left:r.left+geometry.x*scale,top:r.top+geometry.y*scale,width:geometry.width*scale,height:geometry.height*scale}};
 window.portraitRenderingState=()=>({...geometry,source:decoded?'video':'poster',canvas:[canvas.width,canvas.height],compact:false});
 schedule();
})();
