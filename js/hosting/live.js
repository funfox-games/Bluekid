import{auth,db,doc,finishLoading,FirebaseHelper,firefoxAgent,functions,getDoc,HOSTING_VERSION,httpsCallable,insertLoadingScreen,onAuthStateChanged,onValue,realtime,realtimeGet,realtimeRemove,realtimeUpdate,ref,updateLoadingInfo}from"../util/firebase.js";function generateSettingType(e,t){let n=document.getElementById(t.type).cloneNode(!0);switch(n.id=e,n.removeAttribute("example"),n.setAttribute("type",t.type),t.type){case"number":n.children[0].children[0].id=e,n.children[0].children[1].for=e,n.children[0].children[1].innerHTML=t.display+` (${t.defaultValue})`,n.children[0].children[0].value=t.defaultValue,null!=t.icon&&(n.children[0].children[1].prepend(" "),(i=document.createElement("i")).className="fa-light fa-"+t.icon,n.children[0].children[1].prepend(i)),null!=t.extraInfo&&((i=document.createElement("i")).className="fa-solid fa-circle-question",i.dataset.tooltip=t.extraInfo,n.children[0].children[1].append(" "),n.children[0].children[1].appendChild(i)),n.setAttribute("value",n.children[0].children[0].value),n.children[0].children[0].addEventListener("change",()=>{n.setAttribute("value",n.children[0].value)});break;case"bool":var i;n.id=e+"__parent",n.children[0].setAttribute("for",e),n.children[0].children[0].id=e,n.children[0].children[2].innerText=t.display+" ",null!=t.extraInfo&&((i=document.createElement("i")).className="fa-light fa-circle-question",i.dataset.tooltip=t.extraInfo,n.children[0].children[2].appendChild(i)),n.children[0].checked=t.defaultValue,n.setAttribute("value",n.children[0].checked),n.children[0].addEventListener("change",()=>{n.setAttribute("value",n.children[0].checked)})}return n}function convertDictToArray(e){var t,n=[];for(t in e)e.hasOwnProperty(t)&&n.push([t,e[t]]);return n}function generateSettingSection(e,t){var i=document.getElementById("sectex").cloneNode(!0),a=(i.id=e,i.children[0].innerHTML=t.display,convertDictToArray(t.settings));console.log(a);for(let n=0;n<a.length;n++){let e=a[n][0],t=a[n][1];i.children[1].append(generateSettingType(e,t))}document.getElementById("settings").append(i)}let gameId=null,hostPage=null,playerPage=null,settings={gamemodeSettings:{},privacySettings:{whoCanJoin:"friends",codeAlwaysVisible:!0,requireAccount:!1},playerSettings:{maxPlayers:8,randomizedUsernames:!1},debugSettings:{debugMode:!1,extraLogs:!1}};function updateSettings(){var t=document.getElementsByClassName("settingsSection");for(let e=0;e<t.length;e++){var n=t[e];if("sectex"!=n.id){settings.gamemodeSettings[n.id]={};var i=n.children[1].children;console.log(i);for(let e=0;e<i.length;e++){var a=i[e];settings.gamemodeSettings[n.id][a.id]={type:a.getAttribute("type"),value:a.getAttribute("value")}}}}settings.privacySettings.whoCanJoin=document.getElementById("privacy").value,settings.privacySettings.requireAccount=document.getElementById("requireAccount").checked,settings.privacySettings.codeAlwaysVisible=document.getElementById("codeAlwaysVisible").checked,settings.playerSettings.maxPlayers=document.getElementById("maxPlayers").value,settings.playerSettings.randomizedUsernames=document.getElementById("randomizedUsernames").checked,settings.debugSettings.debugMode=document.getElementById("debugMode").checked,settings.debugSettings.extraLogs=document.getElementById("logs").checked}function random(e,t){return Math.floor(Math.random()*(t-e+1))+e}function wait(n){return new Promise(async(e,t)=>{setTimeout(()=>e(),1e3*n)})}async function kickPlayer(e){await httpsCallable(functions,"hosting-kickPlayer")({gameId:gameId,userToKick:e})}async function startGame(){await httpsCallable(functions,"hosting-updateGameState")({gameId:gameId,state:"ingame"}),document.getElementById("game").setAttribute("show",""),document.getElementById("gamecontent").innerHTML=hostPage}function startGameListeners(){settings.debugSettings.debugMode&&document.getElementById("debugModeIndicator").setAttribute("show","");ref(realtime,"games/"+gameId);var e=ref(realtime,"games/"+gameId+"/players");document.getElementById("share").addEventListener("click",()=>{document.getElementById("shareGame").showModal()}),document.getElementById("inviteElsewhere").addEventListener("click",()=>{var e={title:"Bluekid",text:"Join a game on Bluekid!",url:location.origin+"/join?id="+gameId};navigator.canShare(e)?navigator.share(e):document.getElementById("noShareSupport").style.display="unset"}),document.getElementById("start").addEventListener("click",()=>{document.getElementById("start").setAttribute("disabled",""),document.getElementById("start").innerHTML='<i class="fa-light fa-spinner-third fa-spin"></i>',startGame()}),onValue(e,e=>{let i=e.val();if(console.log(i),null==i)document.getElementById("players").innerHTML="",document.getElementById("people").innerHTML=0;else{i=convertDictToArray(i),document.getElementById("people").innerHTML=i.length,document.getElementById("players").innerHTML="",document.getElementById("noplayers").style.display=i.length<1?"unset":"none";for(let n=0;n<i.length;n++){var a=i[n][1];let e=i[n][0],t=document.getElementById("plrex").cloneNode(!0);if(t.id=a.username,t.children[0].src="../asset/char/"+a.icon,t.children[1].children[0].innerText=a.username,null!=a.badges)for(let e=0;e<a.badges.length;e++){var d=a.badges[e],l=document.createElement("img");l.src="../../asset/badges/"+d.replace(" ","")+".png",l.alt="badge",l.width="24",t.children[1].children[1].appendChild(l)}t.children[2].children[0].addEventListener("click",()=>{t.children[2].children[0].setAttribute("disabled",""),t.children[2].children[0].innerHTML='<i class="fa-light fa-spinner-third fa-spin"></i>',kickPlayer(e)}),t.children[2].children[1].href="../profile/user/index.html?id="+e,a.isLoggedIn&&0!=a.userPrivacy.publicProfile||t.children[2].children[1].remove(),console.log(a,t),document.getElementById("players").append(t)}}})}let isHiden=!1,parms=new URLSearchParams(location.search);async function closeGameFromInactivity(){document.title="Game closed | Bluekid",document.getElementById("gameClosed").showModal();var e={uid:auth.currentUser.uid,gameId:gameId};navigator.sendBeacon("https://hosting-leave-fzexuypcsq-uc.a.run.app",JSON.stringify(e)),gameId=null}onAuthStateChanged(auth,async e=>{if(e){let i=()=>{(isHiden=!isHiden)?(document.getElementById("toggleCodeVisibility").innerHTML='<i class="fa-light fa-eye-slash"></i>',document.getElementById("code").innerHTML="-----"):(document.getElementById("toggleCodeVisibility").innerHTML='<i class="fa-light fa-eye"></i>',document.getElementById("code").innerHTML=gameId)};(await FirebaseHelper.getBadges(auth.currentUser.uid)||[]).includes("Tester")&&document.getElementById("testingSection").setAttribute("show",""),setInterval(()=>{document.getElementById("code1").hasAttribute("stoploading")||(document.getElementById("code1").innerHTML+=".","...."==document.getElementById("code1").innerHTML&&(document.getElementById("code1").innerHTML="."))},750);let a=document.getElementById("startHosting").innerHTML;document.getElementById("startHosting").addEventListener("click",async()=>{updateSettings(),document.getElementById("startHosting").setAttribute("disabled",""),document.getElementById("startHosting").innerHTML='<i class="fa-light fa-spinner fa-spin"></i> Preparing functions...';var e,t,n=httpsCallable(functions,"hosting-startHosting");console.log("start"),insertLoadingScreen("startHost"),updateLoadingInfo("startHost","[Action may take a while to warm up]"),"private"!=parms.get("type")?alert("Any kit type not 'private' isn't supported yet."):(t=await getDoc(doc(db,"users",auth.currentUser.uid,"kits",parms.get("kit")))).exists()?(n=await n({settings:settings,gamemodeIdx:parms.get("gamemode"),initalGameData:null,kitData:t.data()}),console.log(n),finishLoading("startHost"),0==n.data.success?"standard/maxplayerslimit"===n.data.error&&(document.getElementById("startHosting").removeAttribute("disabled"),document.getElementById("startHosting").innerHTML=a,document.getElementById("maxPlayersLimit").setAttribute("show",""),document.getElementById("maxPlayers").addEventListener("change",()=>{document.getElementById("maxPlayersLimit").removeAttribute("show")},{once:!0})):(gameId=n.data.code,startGameListeners(),e="../game/"+(t=await(await fetch("../asset/gamemodes.json")).json()).gamemodes[parms.get("gamemode")].id+"/host.html",t="../game/"+t.gamemodes[parms.get("gamemode")].id+"/client.html",fetch(e).then(e=>e.text()).then(e=>{hostPage=e}),fetch(t).then(e=>e.text()).then(e=>{playerPage=e}),document.getElementById("maxplayers").innerHTML=settings.playerSettings.maxPlayers,document.getElementById("startHosting").innerHTML="Done",console.log(n),document.getElementById("codeAnimation").setAttribute("enter",""),await wait(random(3,5)),document.getElementById("code1").setAttribute("stoploading",""),document.getElementById("code1").innerHTML=n.data.code,document.getElementById("code").innerHTML=n.data.code,new QRCode("qrcode",{text:"https://bluekid.netlify.app/join?id="+n.data.code,width:128,height:128,colorDark:"#e3fdee",colorLight:"#0d3446",correctLevel:QRCode.CorrectLevel.H}),1==settings.privacySettings.codeAlwaysVisible?document.getElementById("toggleCodeVisibility").style.display="none":i(),await wait(1),document.getElementById("codeAnimation").removeAttribute("enter",""),document.getElementById("codeAnimation").setAttribute("leave",""),document.getElementById("host_preperation").setAttribute("hide",""),await wait(1),document.getElementById("host_preperation").style.display="none")):alert("Kit doesn't exist.")}),document.getElementById("limitFixIt").addEventListener("click",()=>{document.getElementById("maxPlayers").value="45",document.getElementById("maxPlayersLimit").removeAttribute("show")}),document.getElementById("toggleCodeVisibility").addEventListener("click",i)}else alert("get out."),location.href="../auth/login.html"}),document.body.onload=async()=>{if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))document.getElementById("mobileNotSupported").showModal();else{document.getElementById("version").innerHTML=HOSTING_VERSION,window.addEventListener("beforeunload",async function(e){var t;console.log(gameId),null!=gameId&&(t={uid:auth.currentUser.uid,gameId:gameId},navigator.sendBeacon("https://hosting-leave-fzexuypcsq-uc.a.run.app",JSON.stringify(t)))});let e,t=(document.addEventListener("visibilitychange",()=>{null!=gameId&&(e=document.hidden?(document.title=`Code: ${isHiden?"HIDDEN":gameId} | Bluekid`,setTimeout(()=>{closeGameFromInactivity()},3e5)):(document.title="Host | Bluekid",clearTimeout(e),-1))}),document.getElementById("maxPlayers").addEventListener("change",()=>{200<parseInt(document.getElementById("maxPlayers").value)&&(document.getElementById("maxPlayers").value="200")}),document.getElementById("fullscreenToggle").addEventListener("click",()=>{null==document.fullscreenElement?document.documentElement.requestFullscreen():document.exitFullscreen()}),document.addEventListener("fullscreenchange",e=>{null==document.fullscreenElement?document.getElementById("fullscreenToggle").children[0].className="fa-light fa-expand":document.getElementById("fullscreenToggle").children[0].className="fa-light fa-compress"}),!0);document.getElementById("copyUrl").addEventListener("click",async()=>{0!=t&&(await navigator.clipboard.writeText(gameId),t=!1,document.getElementById("copyUrl").innerHTML='<i class="fa-light fa-check"></i>',setTimeout(()=>{t=!0,document.getElementById("copyUrl").innerHTML='<i class="fa-light fa-copy"></i>'},5e3))});var n=(await(await fetch("../asset/gamemodes.json")).json()).gamemodes[parms.get("gamemode")],i=convertDictToArray(n.settings);document.getElementById("gamemodename").innerHTML=n.display;for(let e=0;e<i.length;e++)generateSettingSection(i[e][0],i[e][1])}};