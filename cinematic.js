/* MeMiasma Cinematic entry + ambient particle field + restrained 3D pointer depth. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const body = document.body;

  // Entry experience: intentionally short, with a failsafe for slow devices.
  const loader = document.createElement('div');
  loader.id = 'cinematic-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-label', 'Загрузка портфолио MeMiasma');
  loader.innerHTML = `<canvas aria-hidden="true"></canvas><div class="cin-loader-grid"></div><div class="cin-loader-vignette"></div><div class="cin-scanline"></div><div class="cin-loader-core"><div class="cin-loader-mark"><span>&lt;/&gt;</span></div><div class="cin-kicker">INITIALIZING CREATIVE SYSTEMS</div><div class="cin-loader-title">MeMiasma<span>.dev</span></div><p class="cin-loader-copy">Архитектура. Точность. Код, который работает.</p><div class="cin-loader-meter"><span></span></div><div class="cin-loader-meta"><span>BOOT SEQUENCE</span><strong id="cinLoadPct">00%</strong><span>READY</span></div></div>`;
  body.classList.add('cin-loading');
  body.prepend(loader);

  const loadCanvas = loader.querySelector('canvas');
  const loadCtx = loadCanvas.getContext('2d', { alpha: true });
  const ambient = document.createElement('canvas'); ambient.id = 'cinAmbientCanvas';
  ambient.setAttribute('aria-hidden', 'true'); body.insertBefore(ambient, body.children[1] || null);
  const ambientCtx = ambient.getContext('2d', { alpha: true });
  let w=0,h=0,dpr=1,particles=[],raf=0,frame=0;
  const rand=(a,b)=>a+Math.random()*(b-a);
  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,1.7);w=window.innerWidth;h=window.innerHeight;
    [loadCanvas,ambient].forEach(c=>{c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.width=w+'px';c.style.height=h+'px'});
    loadCtx?.setTransform(dpr,0,0,dpr,0,0);ambientCtx?.setTransform(dpr,0,0,dpr,0,0);
    const count=Math.min(100,Math.max(34,Math.round(w*h/15000)));
    particles=Array.from({length:count},()=>({x:rand(0,w),y:rand(0,h),z:rand(.25,1),vx:rand(-.16,.16),vy:rand(-.12,.12),r:rand(.45,1.7),phase:rand(0,6.28)}));
  }
  function paint(ctx,loaderMode=false){
    if(!ctx)return;ctx.clearRect(0,0,w,h);frame++;
    const cx=w*.5,cy=h*.48;
    // Fine constellation points, with occasional connecting lines.
    for(let i=0;i<particles.length;i++){
      const p=particles[i];p.x+=p.vx*(reduce?.15:1);p.y+=p.vy*(reduce?.15:1);
      if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;
      const pulse=.45+.35*Math.sin(frame*.018+p.phase),alpha=pulse*p.z*(loaderMode?.8:.55);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.z,0,Math.PI*2);ctx.fillStyle=`rgba(${i%5===0?'183,255,103':'164,151,255'},${alpha})`;ctx.fill();
      if(loaderMode){
        for(let j=i+1;j<particles.length;j++){
          const q=particles[j],dx=p.x-q.x,dy=p.y-q.y,dist=Math.hypot(dx,dy);
          if(dist<92){ctx.strokeStyle=`rgba(154,147,220,${(1-dist/92)*.13*p.z})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}
        }
      }
    }
    // Soft orbital traces behind the central mark.
    if(loaderMode){ctx.save();ctx.translate(cx,cy);ctx.rotate(frame*.0018);for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,0,Math.min(w*.27,270)+k*13,Math.min(w*.09,88)+k*9,k*.82,0,Math.PI*2);ctx.strokeStyle=`rgba(${k===1?'183,255,103':'164,151,255'},${.12-k*.025})`;ctx.lineWidth=1;ctx.stroke()}ctx.restore()}
  }
  let loaderStart=performance.now();
  function animate(){
    paint(ambientCtx,false);
    if(loader.isConnected&&!loader.classList.contains('is-leaving'))paint(loadCtx,true);
    const pct=Math.min(100,Math.round((performance.now()-loaderStart)/19));const label=loader.querySelector('#cinLoadPct');if(label)label.textContent=String(pct).padStart(2,'0')+'%';
    raf=requestAnimationFrame(animate);
  }
  resize();if(!reduce)animate();else{paint(ambientCtx,false);paint(loadCtx,true);}
  window.addEventListener('resize',resize,{passive:true});
  const finish=()=>{if(!loader.isConnected)return;loader.classList.add('is-leaving');body.classList.remove('cin-loading');window.setTimeout(()=>loader.remove(),950);};
  const minimum=reduce?120:1250;
  const start=performance.now();
  const ready=()=>window.setTimeout(finish,Math.max(0,minimum-(performance.now()-start)));
  if(document.readyState==='complete')ready();else window.addEventListener('load',ready,{once:true});
  // Mobile browsers/webviews can delay the load event for remote fonts; start the short intro anyway.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.setTimeout(finish,1250),{once:true});
  // Never leave the visitor behind the loader if a remote font or resource stalls.
  window.setTimeout(finish,2600);

  // Section entrances, only animate once and never hide content if observers are unavailable.
  if('IntersectionObserver' in window&&!reduce){
    const targets=document.querySelectorAll('main section,.site-footer,.trust-strip');
    targets.forEach((el,i)=>{if(el.id==='home')return;el.classList.add('cin-reveal');el.style.transitionDelay=Math.min(i%4,3)*55+'ms'});
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('cin-seen');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -35px 0px'});
    document.querySelectorAll('.cin-reveal').forEach(el=>io.observe(el));
  }

  // Gentle cursor parallax on the hero only; no global page wobble.
  if(fine&&!reduce){
    const hero=document.querySelector('.hero'),visual=document.querySelector('.hero-visual'),window3d=document.querySelector('.code-window');
    let tx=0,ty=0,px=0,py=0;
    hero?.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5);ty=((e.clientY-r.top)/r.height-.5);},{passive:true});
    hero?.addEventListener('pointerleave',()=>{tx=0;ty=0},{passive:true});
    const tilt=()=>{px+=(tx-px)*.045;py+=(ty-py)*.045;if(window3d&&visual){window3d.style.setProperty('--cin-tilt-x',(-py*3).toFixed(2)+'deg');window3d.style.setProperty('--cin-tilt-y',(-px*4).toFixed(2)+'deg');if(!visual.matches(':hover'))window3d.style.transform=`rotateY(calc(-9deg + var(--cin-tilt-y))) rotateX(calc(4deg + var(--cin-tilt-x))) translateZ(34px)`;}requestAnimationFrame(tilt)};
    // CSS variables keep the interaction smooth and avoid event-per-frame layout work.
    hero?.addEventListener('pointermove',()=>{if(window3d){window3d.style.setProperty('--cin-tilt-x',(-ty*3).toFixed(2)+'deg');window3d.style.setProperty('--cin-tilt-y',(-tx*4).toFixed(2)+'deg')}},{passive:true});
  }
  // Rebuild the particle field after tab restore without restarting the entry sequence.
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf)cancelAnimationFrame(raf);else if(!reduce)animate()});
})();
