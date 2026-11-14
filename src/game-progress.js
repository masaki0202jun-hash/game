const GAME_SAVE_KEY='insects-and-bottoms:save:v1';
let restoringProgress=false,saveToast='',saveToastUntil=0;
const progressMenu=document.createElement('div');progressMenu.id='progressMenu';progressMenu.hidden=true;
progressMenu.innerHTML='<button type="button" id="saveProgress">保存</button><button type="button" id="returnTitle">タイトル</button><span id="saveStatus" role="status"></span>';
document.querySelector('#wrap').append(progressMenu);
function readGameSave(){try{const d=JSON.parse(localStorage.getItem(GAME_SAVE_KEY)||'null');return d&&d.version===1?d:null}catch(e){return null}}
function checkpointLabel(){if(adultState.active)return '十年後の調査';if(storyEvent.active)return '帰宅後の出来事';if(forestEvening)return '夜の森';return scene.name}
function saveGameProgress(manual=false){
 if(!started||restoringProgress)return false;
 const d={version:1,time:Date.now(),label:checkpointLabel(),adult:adultState.active?adultSaveData():null};
 if(!d.adult)d.child={sceneId,player:{x:player.x,y:player.y,dir:player.dir},kuri:{x:kuri.x,y:kuri.y,dir:kuri.dir},inventory:[...inventory],stickerCount,prologueDone,livingIntroDone,outsideIntroDone,policeIntroDone,pepeInvited,pepeWarned,forestUnlocked,firstKiin,graveKiin,forestProgress:{...forestProgress},forestEvening,forestNightAmount,forestNightTransition,storyPhase,charlotteAlive,studyDreamLocked,charlotte:{x:charlotte.x,y:charlotte.y,angle:charlotte.angle},storyIndex:storyEvent.active?storyEvent.index:null};
 try{localStorage.setItem(GAME_SAVE_KEY,JSON.stringify(d));if(manual)showSaveToast('保存しました');updateContinueButton();return true}catch(e){if(manual)showSaveToast('このブラウザーでは保存できません');return false}
}
function showSaveToast(message){saveToast=message;saveToastUntil=Date.now()+3500;document.querySelector('#saveStatus').textContent=message}
function updateContinueButton(){const b=document.querySelector('#continueGame'),save=readGameSave();if(!b)return;b.hidden=!save;b.disabled=!ready;if(save)b.textContent='つづきから — '+save.label}
function restoreGameProgress(){
 const d=readGameSave();if(!d||!ready)return;restoringProgress=true;
 try{
  started=true;dialogue=null;queue=[];afterTalk=null;fadeTo=null;fade=0;clearMovement();document.querySelector('#start').style.display='none';
  if(d.adult){adultRestore(d.adult);return}
  const c=d.child;if(!c||!scenes[c.sceneId])throw new Error('保存した場所を読み込めません');adultState.active=false;storyEvent.active=false;
  inventory.clear();for(const id of c.inventory||[])if(itemData[id])inventory.add(id);
  stickerCount=c.stickerCount||0;prologueDone=!!c.prologueDone;livingIntroDone=!!c.livingIntroDone;outsideIntroDone=!!c.outsideIntroDone;policeIntroDone=!!c.policeIntroDone;pepeInvited=!!c.pepeInvited;pepeWarned=!!c.pepeWarned;forestUnlocked=!!c.forestUnlocked;
  firstKiin=!!c.firstKiin;graveKiin=!!c.graveKiin;Object.assign(forestProgress,c.forestProgress);forestEvening=!!c.forestEvening;forestNightAmount=c.forestNightAmount||0;forestNightTransition=!!c.forestNightTransition;storyPhase=c.storyPhase||'none';charlotteAlive=c.charlotteAlive!==false;studyDreamLocked=!!c.studyDreamLocked;Object.assign(charlotte,c.charlotte||{});mamaVisible=mamaEntering=mamaLeaving=false;contest=forestProgress.beetles?{active:false}:null;
  selectedItem=null;previewItem=null;sceneId=c.sceneId;scene=scenes[sceneId];Object.assign(player,c.player);Object.assign(kuri,c.kuri);trail=[];
  if(c.storyIndex!==null&&c.storyIndex!==undefined){storyEvent.active=true;storyEvent.index=Math.max(0,c.storyIndex)-1;storyEvent.cover=1;storyEvent.pending=false;nextAfterForestStage()}
  else if(!prologueDone)startPrologue();
  else{changeScene(sceneId,[player.x,player.y]);if(!actorBlocked(player,c.player.x,c.player.y)){player.x=c.player.x;player.y=c.player.y;player.dir=c.player.dir}exitLock=1}
  refreshInventory();
 }catch(e){started=false;document.querySelector('#start').style.display='grid';document.querySelector('#loadStatus').textContent='保存データを開けませんでした。「はじめから」で開始できます。'}finally{restoringProgress=false;refreshInventory();updateProgressMenu()}
}
function updateProgressMenu(){progressMenu.hidden=!started;if(Date.now()>saveToastUntil&&saveToast){saveToast='';document.querySelector('#saveStatus').textContent=''}updateContinueButton()}
function startNewGame(){
 if(!ready)return;started=true;adultState.active=false;adultHud.style.display='none';if(adultPuzzlePanel.open)adultPuzzlePanel.close();if(adultJournalPanel.open)adultJournalPanel.close();storyEvent.active=false;storyEvent.index=-1;storyEvent.pending=false;storyEvent.cover=0;storyPhase='none';charlotteAlive=true;studyDreamLocked=false;
 prologueDone=livingIntroDone=outsideIntroDone=policeIntroDone=pepeInvited=pepeWarned=forestUnlocked=firstKiin=graveKiin=false;
 Object.assign(forestProgress,{ruin:false,beetles:false,grave:false});forestEvening=forestNightTransition=false;forestNightAmount=0;inventory.clear();stickerCount=0;selectedItem=previewItem=null;contest=null;fadeTo=null;trail=[];danger=0;
 if(itemPanel.open)itemPanel.close();if(codePanel.open)codePanel.close();clearMovement();document.querySelector('#start').style.display='none';startPrologue();fade=1;refreshInventory();updateProgressMenu();saveGameProgress();
}
document.querySelector('#saveProgress').onclick=()=>saveGameProgress(true);
document.querySelector('#returnTitle').onclick=()=>{saveGameProgress();started=false;adultHud.style.display='none';clearMovement();document.querySelector('#start').style.display='grid';document.querySelector('#inventoryBar').style.display='none';progressMenu.hidden=true;updateContinueButton()};
document.querySelector('#continueGame').onclick=restoreGameProgress;
addEventListener('pagehide',()=>saveGameProgress());
addEventListener('keydown',e=>{if(e.code==='KeyS'&&(e.ctrlKey||e.metaKey)){e.preventDefault();saveGameProgress(true)}});
setInterval(()=>{updateProgressMenu();if(started&&!dialogue&&!fadeTo&&!codePanel.open&&!itemPanel.open&&!forestNightTransition)saveGameProgress()},5000);
