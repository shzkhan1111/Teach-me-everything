'use strict';
const $ = id => document.getElementById(id);
const canvas = $('canvas'), ctx = canvas.getContext('2d');
let config, frame = 0, playing = true, lastTime = performance.now(), exporting = false, outputURL;
const names = { lcm: 'LCM LESSON', space: 'SPACE VOYAGE', ocean: 'OCEAN ESCAPE', city: 'CITY LIGHTS', mountains: 'MOUNTAIN ESCAPE' };
function hash(text) { let n = 2166136261; for (const char of text) { n ^= char.charCodeAt(0); n = Math.imul(n, 16777619); } return n >>> 0; }
function random(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function settings() {
  const prompt = $('prompt').value.trim();
  if (!prompt) { $('status').textContent = 'Add a prompt to create your scene.'; $('prompt').focus(); return null; }
  const text = prompt.toLowerCase();
  let scene = $('theme').value;
  if (scene === 'auto') scene = /\blcm\b|lowest common multiple|least common multiple/.test(text) ? 'lcm' : /space|rocket|planet|galaxy|star|moon|cosmos/.test(text) ? 'space' : /sea|ocean|beach|wave|water|island/.test(text) ? 'ocean' : /city|building|neon|street|train|skyline/.test(text) ? 'city' : 'mountains';
  let mood = $('palette').value;
  if (mood === 'auto') mood = /gold|sun|warm|orange|morning/.test(text) ? 'warm' : /blue|turquoise|cool|ice/.test(text) ? 'cool' : 'violet';
  return { prompt, scene, mood, duration: scene === 'lcm' ? 36 : Number($('duration').value), format: scene === 'lcm' ? 'landscape' : $('format').value, captions: $('captions').checked, sentences: (prompt.match(/[^.!?\n]+[.!?]?/g) || [prompt]).map(s => s.trim()).filter(Boolean), seed: hash(prompt) };
}
function applySettings() {
  const next = settings(); if (!next) return;
  config = next; frame = 0; playing = true; $('play').textContent = 'Ⅱ'; $('play').setAttribute('aria-label', 'Pause preview');
  [canvas.width, canvas.height] = config.format === 'portrait' ? [720, 1280] : config.format === 'square' ? [960, 960] : [1280, 720];
  canvas.style.aspectRatio = `${canvas.width}/${canvas.height}`;
  $('scene-tag').textContent = names[config.scene];
  $('video-details').textContent = `${canvas.width} × ${canvas.height} · 30 fps`;
  $('status').textContent = 'Preview ready. Export records this scene in real time.';
  render(0);
}
function circle(x, y, radius, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); }
function polygon(points, fill) { ctx.fillStyle = fill; ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath(); ctx.fill(); }
function render(time) {
  if (config.scene === 'lcm') { LCMLesson.draw(ctx,canvas.width,canvas.height,time); return; }
  const w = canvas.width, h = canvas.height, t = time / config.duration;
  const rand = random(config.seed), warm = config.mood === 'warm', cool = config.mood === 'cool';
  const accent = warm ? '#ffca87' : cool ? '#7ce8ea' : '#c4a5ff';
  const sky = ctx.createLinearGradient(0,0,w*.3,h);
  sky.addColorStop(0, warm ? '#281b39' : cool ? '#071e38' : '#0e112e');
  sky.addColorStop(.65, warm ? '#b55e6e' : cool ? '#28516d' : '#493b83');
  sky.addColorStop(1, warm ? '#ffbb7e' : cool ? '#98d9ca' : '#b487b4');
  ctx.fillStyle = sky; ctx.fillRect(0,0,w,h);
  if (config.scene === 'space' || config.scene === 'city') {
    for (let i=0;i<125;i++) { const x=rand()*w, y=rand()*h*.8, r=rand()*1.9+.4; ctx.globalAlpha=.2+.7*(.5+.5*Math.sin(time*.9+i)); circle((x+time*(i%3+1))%w,y,r,'#fff'); }
    ctx.globalAlpha=1;
  }
  const glow = ctx.createRadialGradient(w*.72,h*.32,5,w*.72,h*.32,w*.45);
  glow.addColorStop(0,warm ? '#ffba6e55' : '#b3b5ff33'); glow.addColorStop(1,'#ffffff00'); ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);
  if (config.scene === 'space') {
    ctx.save(); ctx.translate(w*.72,h*.32); ctx.rotate(-.35);
    ctx.strokeStyle=accent+'66'; ctx.lineWidth=w*.015; ctx.beginPath(); ctx.ellipse(0,0,w*.19,w*.05,0,0,Math.PI*2); ctx.stroke();
    const planet=ctx.createLinearGradient(-80,-80,100,120); planet.addColorStop(0,accent); planet.addColorStop(1,'#35345c'); circle(0,0,w*.093,planet); ctx.restore();
    ctx.save(); ctx.translate(w*(.17+.43*t),h*(.68-.22*t)+Math.sin(time)*h*.012); ctx.rotate(.75);
    polygon([[-15,40],[0,90+8*Math.sin(time*16)],[15,40]],'#ffc275');
    polygon([[-16,5],[-35,42],[0,31],[35,42],[16,5]],accent);
    ctx.fillStyle='#eff3ed'; ctx.beginPath(); ctx.ellipse(0,0,18,45,0,0,Math.PI*2); ctx.fill(); circle(0,-12,9,'#213f68'); ctx.restore();
  } else if (config.scene === 'mountains') {
    circle(w*.72,h*.30,w*.065,accent);
    for(let layer=0;layer<4;layer++) { const points=[[0,h]]; for(let i=-1;i<=9;i++) points.push([i*w/7-Math.sin(time*.12+layer)*20,h*(.40+layer*.115)-(rand()*.19*h)]); points.push([w,h]); polygon(points,['#76748c','#4c576a','#2d424b','#182f35'][layer]); }
    for(let i=0;i<28;i++){const x=rand()*w,y=h*(.72+rand()*.28),s=10+rand()*30;polygon([[x,y-s],[x-s*.4,y],[x+s*.4,y]],'#142c30');}
  } else if (config.scene === 'ocean') {
    circle(w*.68,h*.39,w*.07,accent);
    const sea=ctx.createLinearGradient(0,h*.48,0,h); sea.addColorStop(0,'#3d7187');sea.addColorStop(1,'#102d43');ctx.fillStyle=sea;ctx.fillRect(0,h*.49,w,h);
    for(let row=0;row<25;row++){const y=h*(.51+row*.021);ctx.beginPath();for(let x=0;x<=w;x+=12){const yy=y+Math.sin(x*.015+time*1.7+row*.8)*(2+row*.3);x?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.strokeStyle=row%3===0?accent+'77':'#91c9dc33';ctx.lineWidth=1+row*.08;ctx.stroke();}
    const bx=w*(.15+.5*t),by=h*.64;polygon([[bx-35,by],[bx+45,by],[bx+25,by+13],[bx-20,by+13]],'#13283a');polygon([[bx,by-70],[bx,by-4],[bx+38,by-4]],'#f9e7c4');
  } else {
    circle(w*.78,h*.25,w*.045,accent);
    for(let layer=0;layer<3;layer++) for(let i=-1;i<18;i++){const bw=w/13,x=i*bw-(time*(layer+1)*5)%bw,bh=h*(.12+rand()*.3),y=h*(.78+layer*.07)-bh;ctx.fillStyle=['#363b58','#242c46','#141e34'][layer];ctx.fillRect(x,y,bw*.85,bh+h*.3);for(let row=0;row<Math.floor(bh/22);row++)for(let col=0;col<3;col++)if(rand()>.45){ctx.fillStyle=rand()>.5?accent+'99':'#78c5ef77';ctx.fillRect(x+8+col*bw*.23,y+10+row*22,4,7);}}
    ctx.fillStyle='#0d162b';ctx.fillRect(0,h*.88,w,h*.12);ctx.fillStyle=accent;ctx.fillRect((time*w*.16)%(w+200)-200,h*.9,180,4);
  }
  const vignette=ctx.createLinearGradient(0,h*.56,0,h);vignette.addColorStop(0,'#070b1700');vignette.addColorStop(1,'#070b17cc');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
  if(config.captions){
    const n=config.sentences.length, index=Math.min(n-1,Math.floor(t*n));
    const local=t*n-index;ctx.globalAlpha=Math.min(1,local*10,(1-local)*10);
    const fontSize=Math.round(w*(config.format==='portrait'?.053:.032));ctx.font=`500 ${fontSize}px Segoe UI, sans-serif`;ctx.textAlign='center';ctx.fillStyle='#fff';
    const words=config.sentences[index].split(/\s+/), lines=[];let line='';
    // Wrap by Unicode character when a single word exceeds the caption width.
    for(const word of words){let candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width>w*.82&&line){lines.push(line);line='';}for(const char of (line?' '+word:word)){if(ctx.measureText(line+char).width>w*.82){lines.push(line);line='';}line+=char;}}if(line)lines.push(line);
    const maxLines=config.format==='portrait'?6:4, shown=lines.slice(0,maxLines);if(lines.length>maxLines)shown[maxLines-1]=shown[maxLines-1].slice(0,-1)+'…';
    shown.forEach((s,i)=>ctx.fillText(s,w/2,h*.85-(shown.length-1-i)*fontSize*1.35));ctx.globalAlpha=1;
  }
}
function updateTransport(){ $('timeline').value=Math.round(frame/config.duration*1000); const fmt=s=>`00:${String(Math.floor(s)).padStart(2,'0')}`; $('time').textContent=`${fmt(frame)} / ${fmt(config.duration)}`; }
function tick(now){const elapsed=Math.min((now-lastTime)/1000,.1);lastTime=now;if(config&&!exporting){if(playing)frame=(frame+elapsed)%config.duration;render(frame);updateTransport();}requestAnimationFrame(tick);}
$('generate').addEventListener('click',applySettings);
$('prompt').addEventListener('input',()=>{$('count').textContent=`${$('prompt').value.length} / 1000`;});
document.querySelectorAll('[data-prompt]').forEach(button=>button.addEventListener('click',()=>{$('prompt').value=button.dataset.prompt;$('prompt').dispatchEvent(new Event('input'));applySettings();}));
$('play').addEventListener('click',()=>{playing=!playing;$('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'Pause preview':'Play preview');});
$('timeline').addEventListener('input',()=>{frame=Number($('timeline').value)/1000*config.duration;render(frame);updateTransport();});
async function exportVideo(){
  if(exporting)return;
  if(!canvas.captureStream||!window.MediaRecorder){$('status').textContent='Video export needs a recent Chrome or Edge browser. Preview is still available.';return;}
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
  if(!mime){$('status').textContent='This browser does not support the available video formats. Open this project in Chrome or Edge.';return;}
  applySettings(); if(!$('prompt').value.trim())return;
  exporting=true;const disabled=[...document.querySelectorAll('button,select,textarea,input')];disabled.forEach(e=>e.disabled=true);
  $('download').hidden=true;$('result').hidden=true;$('progress').hidden=false;$('progress').value=0;
  let stream, recorder, chunks=[], animation, watchdog;
  const restore=()=>{cancelAnimationFrame(animation);clearTimeout(watchdog);stream?.getTracks().forEach(track=>track.stop());exporting=false;disabled.forEach(e=>e.disabled=false);$('progress').hidden=true;frame=0;lastTime=performance.now();};
  try{
    render(0);stream=canvas.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    recorder.onerror=()=>{restore();$('status').textContent='Video recording failed. Please try again in Chrome or Edge.';};
    recorder.onstop=()=>{
      const blob=new Blob(chunks,{type:mime});restore();
      if(!blob.size){$('status').textContent='The recording was empty. Keep this tab visible and try again.';return;}
      if(outputURL)URL.revokeObjectURL(outputURL);outputURL=URL.createObjectURL(blob);
      $('download').href=outputURL;$('download').download=`frame-${config.scene}-${Date.now()}.${mime.includes('mp4')?'mp4':'webm'}`;$('download').hidden=false;
      $('result').src=outputURL;$('result').hidden=false;$('status').textContent=`Your video is ready (${(blob.size/1024/1024).toFixed(1)} MB). Use the download link to save it.`;
    };
    recorder.start(250);const start=performance.now();
    const record=now=>{const time=Math.min((now-start)/1000,config.duration);render(time);frame=time;updateTransport();$('progress').value=time/config.duration*100;$('status').textContent=`Recording… ${Math.round(time/config.duration*100)}%. Keep this tab visible.`;if(time>=config.duration){recorder.stop();return;}animation=requestAnimationFrame(record);};
    animation=requestAnimationFrame(record);
    watchdog=setTimeout(()=>{if(recorder.state==='recording'){cancelAnimationFrame(animation);recorder.stop();}},(config.duration+15)*1000);
  }catch(error){if(recorder?.state==='recording'){recorder.onstop=null;recorder.stop();}restore();$('status').textContent=`Could not export video: ${error.message}`;}
}
$('export').addEventListener('click',exportVideo);
window.addEventListener('beforeunload',()=>{if(outputURL)URL.revokeObjectURL(outputURL);});
$('lcm-lesson').addEventListener('click',()=>{ $('prompt').value='Teach me about LCM: lowest common multiple.'; $('theme').value='auto'; $('prompt').dispatchEvent(new Event('input')); applySettings(); });
$('lcm-voice').addEventListener('click',()=>{
  const video = $('result'); video.src = 'LCM-lesson-with-voice.mp4'; video.hidden = false;
  playing = false; $('play').textContent = 'Play'; $('play').setAttribute('aria-label','Play preview');
  $('status').textContent = 'LCM lesson with spoken narration. Pause at the final question to try it yourself.';
  video.play().catch(()=>{ $('status').textContent = 'Press play on the video below to hear the LCM lesson.'; });
  video.scrollIntoView({behavior:'smooth',block:'center'});
});
if (new URLSearchParams(location.search).get('lesson') === 'lcm') { $('prompt').value='Teach me about LCM: lowest common multiple.'; $('theme').value='auto'; }
$('prompt').dispatchEvent(new Event('input'));applySettings();requestAnimationFrame(tick);
