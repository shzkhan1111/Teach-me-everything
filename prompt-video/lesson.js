/* The same lesson renderer is used by the studio and the offline video exporter. */
(function(root) {
  function draw(ctx, width, height, seconds) {
    ctx.save(); ctx.scale(width / 1280, height / 720);
    const page = Math.min(5, Math.floor(seconds / 6)), local = seconds % 6;
    function box(x,y,w,h,color) {ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
    function text(s,x,y,size=30,color='#f4f6ef',align='left') {ctx.font=`${size >= 40 ? '600' : '400'} ${size}px Segoe UI`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);}
    box(0,0,1280,720,'#101713');box(0,0,10,720,'#d9f983');
    text('FRAME / MATHS IN MOTION',64,54,18,'#a7b89c');text(`${page+1} / 6`,1216,54,18,'#a7b89c','right');
    const titles=['What is LCM?','First: list multiples of 4','Next: list multiples of 6','Find the FIRST shared number','Why not 24?','Your turn: LCM of 3 and 5'];
    text(titles[page],64,144,48);
    function row(base,y,show,highlight) {
      const nums=base===4?[4,8,12,16,20,24]:base===6?[6,12,18,24]:base===3?[3,6,9,12,15]:[5,10,15,20];
      text(`Multiples of ${base}`,64,y-30,24,'#b6c6ac');
      nums.forEach((n,i)=>{if(i>=show)return;const x=64+i*185,on=highlight&&n===highlight;box(x,y,163,88,on?'#d9f983':'#27362d');text(String(n),x+81,y+59,42,on?'#15220e':'#f4f6ef','center');});
    }
    if(page===0){text('Lowest Common Multiple',64,246,54,'#d9f983');text('The smallest positive number that is',64,330,34);text('a multiple of BOTH numbers.',64,382,34);box(64,440,1152,116,'#27362d');text('Example: find the LCM of 4 and 6.',96,511,36);}
    if(page===1){text('Count in 4s: add 4 each time.',64,221,30,'#b6c6ac');row(4,298,Math.min(6,Math.floor(local/.65)+1),null);text('4 × 1 = 4       4 × 2 = 8       4 × 3 = 12',64,495,34);}
    if(page===2){row(4,240,6,null);row(6,426,Math.min(4,Math.floor(local/.9)+1),null);text('Count in 6s: 6, 12, 18, 24...',64,594,30,'#b6c6ac');}
    if(page===3){row(4,240,6,12);row(6,420,4,12);text('12 is the smallest number in BOTH lists.',64,594,36,'#d9f983');}
    if(page===4){row(4,240,6,24);row(6,420,4,24);text('24 is shared too, but 12 comes first.',64,582,32);text('LCM(4, 6) = 12',64,643,40,'#d9f983');}
    if(page===5){row(3,240,5,local>=4?15:null);row(5,420,4,local>=4?15:null);text(local<4?'Pause here. Which number is the first match?':'The first match is 15. LCM(3, 5) = 15.',64,594,32,'#d9f983');}
    box(64,682,1152,4,'#344434');box(64,682,1152*Math.min(1,seconds/36),4,'#d9f983');ctx.restore();
  }
  root.LCMLesson={draw,duration:36};
  if(typeof module!=='undefined')module.exports=root.LCMLesson;
})(typeof globalThis!=='undefined'?globalThis:this);
