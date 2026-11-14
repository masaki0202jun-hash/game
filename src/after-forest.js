// The sequence follows Chanko's perception. Its hidden cause is not explained here.
let storyPhase='none',charlotteAlive=true,studyDreamLocked=false;
let forestEvening=false,forestNightAmount=0,forestNightTransition=false;
function isForestScene(){return ['entrance','roots','fallen','deep','clearing','gravePath','lake','ruin','grave'].includes(sceneId)}
function beginForestNight(){if(forestEvening)return;forestEvening=true;forestNightTransition=true;forestNightAmount=0;clearMovement();kuri.moving=false}
function updateForestNight(dt){
 if(!started||storyPhase!=='none'||!isForestScene()||codePanel.open||itemPanel.open)return false;
 if(!forestEvening&&forestVisitComplete()&&!dialogue&&!fadeTo)beginForestNight();
 if(!forestNightTransition)return false;
 forestNightAmount=Math.min(1,forestNightAmount+dt/3);
 if(forestNightAmount>=1){forestNightTransition=false;talk([['くりたけ','やばい、もうこんな時間！'],['ちゃんこ','いつの間に……。森の中、真っ暗だよ……。'],['くりたけ','ちゃんこ、急いで帰ろう！']],()=>{clearMovement();exitLock=.8})}
 return true;
}
function drawNightTint(amount){if(amount<=0)return;ctx.save();ctx.globalAlpha=amount*.85;ctx.globalCompositeOperation='multiply';ctx.fillStyle='#526b98';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=amount*.47;ctx.fillStyle='#051125';ctx.fillRect(0,0,W,H);const shade=ctx.createRadialGradient(480,310,100,480,300,620);shade.addColorStop(0,'#030b1800');shade.addColorStop(1,'#01050ec4');ctx.globalAlpha=amount*.7;ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);ctx.restore()}
const papa=actor('papa',430,360),brother=actor('brother',560,365);
const storyEvent={active:false,index:-1,pending:false,cover:0,time:0,stage:null};
const afterForestStages=[
 {scene:'artDistrict',mood:'dusk',cast:['player','kuri'],lines:[['くりたけ','村まで戻れた……！　急ごう、ちゃんこ！'],['ちゃんこ','このカブトムシに、だいじなものシールを貼っておこう。'],['system','捕まえたカブトムシに、シールを１枚貼った。']],enter(){if(stickerCount===4)stickerCount=3;refreshInventory()}},
 {scene:'outside',mood:'dusk',cast:['player','kuri','mama'],lines:[['ちゃんママ','ちゃんこ！　今、何時だと思ってるの！'],['ちゃんこ','ご、ごめんなさい……。'],['ちゃんママ','暗くなる前に帰ってきなさいって、言ったでしょう！'],['system','くりたけも迎えに来た親にこっぴどく叱られ、それぞれの家へ帰った。']]},
 {scene:'living',mood:'evening',cast:['player','mama','papa','brother'],lines:[['ちゃんママ','約束を守れない子に、今日の夕飯はありません！'],['ちゃんこ','ええっ……！'],['ちゃんパパ','ちゃんこ。お母さん、ずっと心配して待ってたんだよ。'],['弟','おにいちゃん……。'],['ちゃんこ','……ごめんなさい。']]},
 {scene:'living',mood:'evening',cast:['player','mama'],lines:[['ちゃんこ','ちゃんママ……おなか、すいた。'],['ちゃんママ','……そこに座りなさい。'],['ちゃんこ','ごはん、食べてもいいの？'],['ちゃんママ','これでも食っとけ。']],done(){inventory.add('telephone');refreshInventory()}},
 {scene:'living',mood:'evening',cast:['player','mama'],card:true,lines:[['system','オオカマキリのテレフォンカードを１枚渡された。'],['ちゃんこ','……１枚かぁ。'],['ちゃんママ','もう、お部屋に戻りなさい。']]},
 {scene:'room',mood:'evening',cast:['player'],dead:true,lines:[['ちゃんこ','……シャルロット？'],['ちゃんこ','……ねえ。どうしたの？'],['ちゃんこ','動いてよ……。シャルロット……。']],enter(){charlotteAlive=false;charlotte.x=690;charlotte.y=410;charlotte.angle=1.7}},
 {scene:'room',mood:'evening',cast:['player'],dead:true,cry:true,lines:[['ちゃんこ','いやだ……いやだ、いやだ！'],['ちゃんこ','シャルロット！　起きてよぉっ！'],['system','ちゃんこは泣き叫び、床を叩いた。']]},
 {scene:'room',mood:'evening',cast:['player','mama'],dead:true,lines:[['ちゃんママ','ちゃんこ！？　どうしたの、何があったの！'],['ちゃんこ','シャルロットが……死んじゃった……。'],['ちゃんママ','……そう。'],['ちゃんママ','悲しいね。……一緒に、お墓を作ろうね。'],['ちゃんこ','……うん……。'],['ちゃんママ','……こんな時間になっちゃったね。ごはん、食べようか。']]},
 {scene:'living',mood:'evening',cast:['player','mama'],meal:true,lines:[['ちゃんママ','ほら、座って。あったかいうちに食べなさい。'],['ちゃんこ','……いただきます。'],['system','ちゃんママは、さっきとは違うやさしい声で、ちゃんこのそばに座っていた。']]},
 {scene:'bedroom',mood:'night',cast:[],sleep:true,lines:[['ちゃんパパ','もう遅いね。今日は、みんな一緒に寝よう。'],['弟','おにいちゃん、こっち。'],['ちゃんママ','おやすみ、ちゃんこ。'],['ちゃんこ','……おやすみ。']]},
 {scene:'room',mood:'dream',cast:['player'],beetle:true,lines:[['シャルロット','ちゃんこ。'],['ちゃんこ','……シャルロット？'],['シャルロット','ちゃんこ、こっちを見て。'],['ちゃんこ','しゃ、しゃべった！　気持ち悪い！']]},
 {scene:'room',mood:'dream',cast:['player'],beetle:true,lines:[['system','ちゃんこはシャルロットをつかみ、右隣の勉強部屋へ投げ入れた。'],['system','扉を閉め、鍵をかけた。']],done(){studyDreamLocked=true;storySound('lock')}},
 {scene:'room',mood:'dream',cast:['player'],lines:[['シャルロット','……ちゃんこ。'],['シャルロット','このドアは決して開けてはいけないよ。'],['ちゃんこ','……。']]},
 {scene:'bedroom',mood:'night',cast:[],sleep:true,intruder:true,lines:[['system','窓の方で、かすかな音がした。'],['ちゃんこ','……だれ……？'],['system','窓から、黒い人影が入り込んできた。']],enter(){storySound('window')}},
 {scene:'bedroom',mood:'night',cast:[],sleep:true,intruder:true,attack:true,lines:[['ちゃんママ','――っ！'],['ちゃんパパ','な、何を……！'],['弟','うわああん！'],['ちゃんこ','やめて……！']],enter(){storySound('attack')}},
 {scene:'bedroom',mood:'night',cast:[],sleep:true,intruder:true,lines:[['？？？','……お前は俺と同じ目をしている。'],['ちゃんこ','……え……？'],['system','人影は、ちゃんこには手を出さなかった。']]},
 {scene:'bedroom',mood:'morning',cast:['player','mama','papa','brother'],injured:true,lines:[['ちゃんこ','ちゃんママ……？　ちゃんパパ……？'],['弟','……いたいよう……。'],['ちゃんこ','みんな、おしりが……！'],['ちゃんママ','ちゃんこ……。'],['ちゃんこ','おまわりさん、呼んでくる！']],enter(){storyPhase='morning';stickerCount=0;refreshInventory()}},
 {scene:'outside',mood:'morning',cast:['player','police'],lines:[['ちゃんこ','おまわりさん！　助けて！'],['警官','ちゃんこ！？　どうした！'],['ちゃんこ','家に、人が入ってきて……みんなのおしりが、切り取られちゃった！'],['警官','……！　家族は、家にいるんだな。'],['警官','すぐに行く。ちゃんこ、お前は無事か？'],['ちゃんこ','ぼくは……ぼくだけ……。']]},
 {scene:'artDistrict',mood:'morning',cast:['player','pepe'],lines:[['ペペ先生','ちゃんこ？　何があったんだい。'],['ちゃんこ','家族のおしりが、なくなっちゃった……！'],['ペペ先生','……まさか……。'],['ペペ先生','ちょっと待っておれ。すぐに描く。']]},
 {scene:'classroom',mood:'morning',cast:['player','pepe'],peaches:true,lines:[['system','ペペ先生は急いで、桃の絵を３枚描いた。'],['ペペ先生','これを持っておいき。三人に、付けてあげるんだ。'],['ちゃんこ','……桃の絵？'],['ペペ先生','早く。お母さんたちのところへ。']]},
 {scene:'living',mood:'morning',cast:['player','mama','papa','brother','police'],peaches:true,lines:[['system','ちゃんママ、ちゃんパパ、弟は生きていた。'],['system','三人は、おしりのあった場所に桃の絵を付けた。'],['警官','ちゃんこ。昨夜のこと、少しずつでいい。聞かせてくれるか。'],['ちゃんこ','……うん。'],['system','あの夜、何が起きたのか。ちゃんこは、まだ知らなかった。']],done(){storyPhase='treated'}}
];
function storySound(kind){try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(kind==='lock'?280:kind==='window'?110:55,t);o.frequency.exponentialRampToValueAtTime(35,t+.3);g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.4)}catch(e){}}
function startAfterForest(){if(storyPhase!=='none')return;storyPhase='afterforest';storyEvent.active=true;storyEvent.index=-1;storyEvent.pending=true;storyEvent.cover=0;clearMovement();selectedItem=null;refreshInventory()}
function nextAfterForestStage(){
 const stage=afterForestStages[++storyEvent.index];storyEvent.stage=stage;storyEvent.pending=false;storyEvent.time=0;
 if(!stage){storyEvent.active=false;fadeTo=null;fade=0;mamaVisible=false;clearMovement();startAdultChapter();updateProgressMenu();return}
 sceneId=stage.scene;scene=scenes[sceneId];fade=0;fadeTo=null;player.x=sceneId==='room'?650:sceneId==='bedroom'?430:sceneId==='outside'?690:480;player.y=sceneId==='room'?430:sceneId==='classroom'?370:420;player.dir=sceneId==='room'?'right':'up';player.moving=false;
 mama.x=sceneId==='room'?760:650;mama.y=sceneId==='room'?430:365;mama.dir='left';mama.moving=false;
 papa.x=390;papa.y=350;papa.dir='right';brother.x=535;brother.y=365;brother.dir='down';
 kuri.x=560;kuri.y=425;kuri.dir='left';police.x=310;police.y=380;police.dir='right';pepe.x=640;pepe.y=325;pepe.dir='left';
 stage.enter?.();talk(stage.lines,()=>{stage.done?.();storyEvent.pending=true;clearMovement()});saveGameProgress();
}
function updateAfterForest(dt){storyEvent.time+=dt;if(storyEvent.pending){storyEvent.cover=Math.min(1,storyEvent.cover+dt*2.6);if(storyEvent.cover>=1)nextAfterForestStage()}else storyEvent.cover=Math.max(0,storyEvent.cover-dt*2.6)}
function storySpeaker(who){return {'ちゃんこ':player,'くりたけ':kuri,'ちゃんママ':mama,'ちゃんパパ':papa,'弟':brother,'警官':police,'ペペ先生':pepe}[who]||null}
function drawSleepingFamily(){
 const people=[papa,mama,player,brother];people.forEach((a,i)=>{const im=img[a.type],cw=im.width/4,ch=im.height/4,x=535+i*82,y=205;ctx.drawImage(im,cw*.17,ch*.025,cw*.66,ch*.58,x-27,y,54,66)});
 // Redraw the existing blanket in front of the four heads.
 ctx.drawImage(img.bedroomNight,465,254,435,115,465,254,435,115);
}
function drawStoryMeal(){ctx.save();ctx.fillStyle='#f0e5cd';ctx.beginPath();ctx.ellipse(442,365,26,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff8df';ctx.beginPath();ctx.ellipse(442,360,22,9,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#61482b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(475,354);ctx.lineTo(510,365);ctx.moveTo(477,350);ctx.lineTo(512,361);ctx.stroke();ctx.restore()}
function drawPeachSheets(){for(let i=0;i<3;i++){ctx.save();ctx.translate(400+i*64,350);ctx.rotate((i-1)*.05);ctx.drawImage(img.peachPainting,0,0,53,64);ctx.restore()}}
function drawPeachOnBack(a){if(!['mama','papa','brother'].includes(a.type)||a.dir!=='up')return;const child=a.type==='brother';ctx.drawImage(img.peachPainting,a.x-(child?12:17),a.y-(child?37:52),child?24:34,child?28:39)}
function renderAfterForest(){
 updateRoomExit();ctx.clearRect(0,0,W,H);const stage=storyEvent.stage;if(!stage){ctx.fillStyle='#07110f';ctx.fillRect(0,0,W,H);return}
 const nightInterior=['night','evening','dream'].includes(stage.mood),nightKey={living:'livingNight',room:'roomNight',bedroom:'bedroomNight'}[sceneId];
 ctx.drawImage(nightInterior&&nightKey?img[nightKey]:img[scene.bg],0,0,W,H);
 if(stage.mood==='dream'){ctx.fillStyle='#152c4c77';ctx.fillRect(0,0,W,H)}
 if(sceneId==='classroom')drawMamaPainting();
 if(stage.sleep)drawSleepingFamily();
 (stage.cast||[]).map(name=>({player,kuri,mama,papa,brother,police,pepe})[name]).sort((a,b)=>a.y-b.y).forEach(a=>{ctx.save();if(stage.cry&&a===player)ctx.translate(Math.sin(storyEvent.time*22)*3,Math.abs(Math.sin(storyEvent.time*8))*-4);drawActor(a);ctx.restore()});
 if(stage.dead){drawCharlotte()}
 if(stage.beetle){ctx.save();ctx.translate(665-charlotte.x,410-charlotte.y);drawCharlotte();ctx.restore()}
 if(stage.card){ctx.fillStyle='#aabd8d';ctx.fillRect(490,340,95,57);ctx.fillStyle='#28492f';ctx.font='13px serif';ctx.fillText('オオカマキリ',497,362);ctx.fillText('テレフォンカード',493,383)}
 if(stage.meal)drawStoryMeal();if(stage.peaches)drawPeachSheets();
 if(stage.intruder){ctx.save();ctx.fillStyle='#080c13';ctx.beginPath();ctx.ellipse(360,270,24,31,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(340,295);ctx.lineTo(318,383);ctx.lineTo(408,383);ctx.lineTo(382,295);ctx.fill();ctx.fillRect(335,380,17,45);ctx.fillRect(375,380,17,45);ctx.restore()}
 if(stage.mood==='dusk')drawNightTint(1);
 if(stage.attack){ctx.fillStyle='rgba(4,5,12,.94)';ctx.fillRect(0,0,W,H)}
 ctx.fillStyle='#133c2ccc';roundRect(12,10,230,34,6);ctx.fill();ctx.fillStyle='#fff2c2';ctx.font='bold 18px serif';ctx.fillText(scene.name,25,33);
 drawDialogue();if(storyEvent.cover>0){ctx.fillStyle='rgba(4,12,10,'+storyEvent.cover+')';ctx.fillRect(0,0,W,H)}
}
