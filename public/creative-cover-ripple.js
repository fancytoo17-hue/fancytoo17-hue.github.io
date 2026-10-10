/* Pointer-driven image refraction, inspired by 14islands' expanding brush trails.
   Own procedural shader; the approved DOM collage remains the idle/fallback view. */
(() => {
  document.querySelectorAll('.c2-cover-collage').forEach(initRipple);
  function initRipple(cover) {
  const grid = cover.querySelector('.c2-sheet-grid');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const surface = document.createElement('canvas');
  surface.className = 'c2-ripple-canvas';
  surface.setAttribute('aria-hidden', 'true');
  const gl = surface.getContext('webgl', {alpha: false, antialias: false, depth: false, powerPreference: 'low-power'});
  if (!gl) return;
  const vertex = `attribute vec2 position; varying vec2 uv;
    void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision mediump float;
    varying vec2 uv;
    uniform sampler2D picture;
    uniform sampler2D displacement;
    uniform vec2 size;
    void main(){
      float wave=texture2D(displacement,uv).r;
      float theta=wave*6.283185;
      vec2 offset=vec2(sin(theta),cos(theta))*wave*52.;
      vec2 edge=min(uv,1.-uv)*size;
      offset*=smoothstep(0.,24.,min(edge.x,edge.y));
      gl_FragColor=texture2D(picture,clamp(uv+offset/size,vec2(.001),vec2(.999)));
    }`;
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(result));
    return result;
  }
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  } catch { return; }
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const uniforms = Object.fromEntries(['picture','size','displacement'].map(key => [key, gl.getUniformLocation(program,key)]));
  gl.uniform1i(uniforms.picture, 0);
  gl.uniform1i(uniforms.displacement, 1);
  const field=document.createElement('canvas'), fieldContext=field.getContext('2d');
  const brush=document.createElement('canvas');brush.width=brush.height=128;
  const brushContext=brush.getContext('2d');
  const gradient=brushContext.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(255,255,255,0)');
  gradient.addColorStop(.48,'rgba(255,255,255,0)');
  gradient.addColorStop(.72,'rgba(255,255,255,.85)');
  gradient.addColorStop(.84,'rgba(255,255,255,1)');
  gradient.addColorStop(1,'rgba(255,255,255,0)');
  brushContext.fillStyle=gradient;brushContext.fillRect(0,0,128,128);
  const fieldTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,fieldTexture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.activeTexture(gl.TEXTURE0);
  cover.append(surface);
  const points = new Float32Array(32*4);
  let ready=false, visible=false, frame=0, cursor=0, last=null, lastEmission=0, lastWave=-Infinity, width=0, height=0, lost=false, settleTimer=0;
  function stop() {
    clearTimeout(settleTimer);cancelAnimationFrame(frame); frame=0; last=null; lastWave=-Infinity; points.fill(0);
    cover.classList.remove('is-rippling');
  }
  function allowed(){return ready && visible && !lost && !reduced.matches && pointer.matches && !document.hidden;}
  function draw() {
    const now=performance.now();
    frame=0;
    if (!allowed() || now-lastWave>2800) {stop();return;}
    fieldContext.globalCompositeOperation='source-over';fieldContext.globalAlpha=1;
    fieldContext.fillStyle='#000';fieldContext.fillRect(0,0,field.width,field.height);
    fieldContext.globalCompositeOperation='lighter';
    const scale=field.width/width;
    for(let i=0;i<32;i++){
      const age=now/1000-points[i*4+2],strength=points[i*4+3];
      if(!strength || age<0 || age>2.8)continue;
      const radius=(70+age*165)*scale;
      fieldContext.globalAlpha=strength*.48*Math.exp(-age*1.65)*Math.min(1,(2.8-age)/.6);
      fieldContext.drawImage(brush,points[i*4]*scale-radius,points[i*4+1]*scale-radius,radius*2,radius*2);
    }
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,fieldTexture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,field);
    gl.activeTexture(gl.TEXTURE0);
    gl.drawArrays(gl.TRIANGLES,0,6);
    cover.classList.add('is-rippling');
    frame=requestAnimationFrame(draw);
  }
  function compose() {
    stop(); ready=false;
    if(lost) return;
    width=cover.clientWidth; height=cover.clientHeight;
    if(!width || !height) return;
    const density=Math.min(2, Math.max(1, cover.getBoundingClientRect().width/width*devicePixelRatio));
    const source=document.createElement('canvas');
    source.width=Math.round(width*density); source.height=Math.round(height*density);
    const ctx=source.getContext('2d');
    ctx.scale(density,density); ctx.fillStyle=getComputedStyle(cover).backgroundColor;ctx.fillRect(0,0,width,height);
    ctx.translate(width/2,height/2);
    const transform=new DOMMatrix(getComputedStyle(grid).transform);
    ctx.rotate(Math.atan2(transform.b,transform.a));
    for(const img of grid.querySelectorAll('img')) {
      if(!img.complete || !img.naturalWidth) return;
      const w=img.clientWidth,h=img.clientHeight,ratio=Math.min(w/img.naturalWidth,h/img.naturalHeight);
      const iw=img.naturalWidth*ratio,ih=img.naturalHeight*ratio;
      ctx.drawImage(img,img.offsetLeft-grid.clientWidth/2+(w-iw)/2,img.offsetTop-grid.clientHeight/2+(h-ih)/2,iw,ih);
    }
    surface.width=source.width;surface.height=source.height;
    field.width=Math.ceil(width*.5);field.height=Math.ceil(height*.5);
    gl.viewport(0,0,surface.width,surface.height);
    gl.uniform2f(uniforms.size,width,height);
    try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);ready=true;}catch{ready=false;}
  }
  function emitRipple(event){
    const r=cover.getBoundingClientRect(),now=performance.now();
    // Pointer input is newer than a queued IntersectionObserver notification.
    visible=r.bottom>0 && r.top<innerHeight && r.right>0 && r.left<innerWidth;
    if(!allowed() || event.pointerType==='touch') return;
    const x=(event.clientX-r.left)/r.width*width,y=(event.clientY-r.top)/r.height*height;
    const distance=last?Math.hypot(x-last.x,y-last.y):8;
    const speed=last?distance/Math.max(8,now-last.time):.25;
    last={x,y,time:now};
    if(distance<1 || now-lastEmission<28) return;
    points.set([x,y,now/1000,Math.min(1.25,.65+speed*.5)],cursor*4);
    cursor=(cursor+1)%32;lastEmission=lastWave=now;
    clearTimeout(settleTimer);settleTimer=setTimeout(stop,2850);
    if(!frame) draw();
  }
  cover.addEventListener('pointerenter',emitRipple,{passive:true});
  cover.addEventListener('pointermove',emitRipple,{passive:true});
  cover.addEventListener('pointerleave',()=>{last=null;});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)stop();}).observe(cover);
  new ResizeObserver(()=>{if(ready)compose();}).observe(cover);
  window.addEventListener('resize',()=>{if(ready)compose();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  reduced.addEventListener('change',stop);pointer.addEventListener('change',stop);
  surface.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;ready=false;stop();});
  // If the GPU context is lost, retain the original DOM until the next page load.
  Promise.all([...grid.querySelectorAll('img')].map(img=>img.decode())).then(compose).catch(()=>{});
  }
})();
