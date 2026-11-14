const fs=require('fs'),http=require('http'),assert=require('assert'),{chromium}=require('playwright');
(async()=>{
 const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html;charset=utf-8');r.end(fs.readFileSync(require('path').join(__dirname,'..','index.html')))});
 await new Promise(ok=>server.listen(8798,'127.0.0.1',ok));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const p=await browser.newPage();await p.goto('http://127.0.0.1:8798',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>ready,null,{timeout:60000});await p.locator('#begin').click();
  await p.evaluate(()=>{window.musicProbe=musicState.context.createAnalyser();musicState.master.connect(window.musicProbe)});await p.waitForTimeout(1000);
  const signal=await p.evaluate(()=>{const a=new Float32Array(musicProbe.fftSize);musicProbe.getFloatTimeDomainData(a);return Math.max(...a.map(Math.abs))});assert(signal>.00001,'BGM produced no audible signal');
  const moods=await p.evaluate(()=>{const a=[];sceneId='lake';contest={active:true};musicTick();a.push(musicState.track);contest.active=false;forestEvening=true;musicTick();a.push(musicState.track);storyEvent.active=true;storyEvent.stage={dead:true,mood:'evening'};musicTick();a.push(musicState.track);storyEvent.stage={intruder:true,mood:'night'};musicTick();a.push(musicState.track);storyEvent.active=false;adultState.active=true;adultState.endShot=true;musicTick();a.push(musicState.track);return a});assert.deepStrictEqual(moods,['contest','night','sorrow','horror',null]);
  await p.locator('#musicToggle').click();await p.locator('#musicVolume').fill('65');await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>ready);assert(await p.evaluate(()=>musicState.muted&&musicState.volume===.65));console.log('BGM signal, scene changes, ending silence, volume and mute persistence PASS');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
