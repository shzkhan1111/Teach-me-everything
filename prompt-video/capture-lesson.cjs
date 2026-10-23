// Capture the actual studio renderer's drawing commands without needing a browser.
const lesson = require('./lesson.js');
const frames = [], fps = 8;
for (let i=0;i<lesson.duration*fps;i++) {
  const commands=[];
  const context={save(){},restore(){},scale(){},fillRect(x,y,w,h){commands.push(['rect',x,y,w,h,this.fillStyle]);},fillText(text,x,y){commands.push(['text',text,x,y,this.font,this.fillStyle,this.textAlign]);}};
  lesson.draw(context,1280,720,i/fps);frames.push(commands);
}
require('node:fs').writeFileSync(require('node:path').join(__dirname,'lesson-frames.json'),JSON.stringify({width:1280,height:720,fps,frames}));
console.log(`Captured ${frames.length} frames from the studio LCM renderer.`);
