import{adjectiveWords,animals,auth,collection,db,finishLoading,FirebaseHelper,functions,getDocs,httpsCallable,insertLoadingScreen,onAuthStateChanged,onValue,realtime,realtimeGet,realtimeRemove,realtimeUpdate,ref,updateLoadingInfo}from"../util/firebase.js";import generateBlueSelection from"../util/blueutil.js";let __allGamemodes=await fetch("../../asset/gamemodes.json"),allGamemodes=await __allGamemodes.json(),parms=new URLSearchParams(location.search),hasLoadedBlues=!1,hasAccount=!1,accountData=null,gameDetails={gameId:-1,active:!1,ref:null,hasStarted:!1},clientPage=null,clientPageRedirect=null;function convertDictToArray(e){var t,n=[];for(t in e)e.hasOwnProperty(t)&&n.push([t,e[t]]);return n}function addBlueListeners(){var n=document.getElementsByClassName("bluechar");for(let t=0;t<n.length;t++){let e=n[t];null!=e.getAttribute("given")&&e.addEventListener("click",()=>{document.getElementById("chooseBlue").close(),(async(e,t)=>{(gameDetails.active?(await realtimeUpdate(ref(realtime,"games/"+gameDetails.gameId+"/players/"+auth.currentUser.uid),{icon:e}),document.getElementById("postjoinUserProfileImg").src=t,document.getElementById("postjoinUserProfileImg")):(document.getElementById("userProfileImg").src=t,document.getElementById("userProfileImg"))).setAttribute("relativelocation",e)})(e.getAttribute("relativelocation"),e.children[0].src)})}}function refreshPlayers(t){document.getElementById("playerCount").innerHTML=t.length,document.getElementById("players").innerHTML="",document.getElementById("noPlayers").style.display=t.length<=1?"unset":"none";for(let e=0;e<t.length;e++){var n=t[e][1],a=t[e][0];if(a!=auth.currentUser.uid){var i=document.getElementById("plrex").cloneNode(!0);if(i.id="user__"+a,i.children[0].children[0].src="../asset/char/"+n.icon,i.children[0].children[1].children[0].innerText=n.username,null!=n.badges)for(let e=0;e<n.badges.length;e++){var l=n.badges[e],o=document.createElement("img");o.src="../../asset/badges/"+l.replace(" ","")+".png",o.alt="badge",o.width="24",i.children[0].children[1].children[1].appendChild(o)}i.children[1].children[0].href="../profile/user/index.html?id="+a,n.isLoggedIn&&0!=n.userPrivacy.publicProfile||i.children[1].children[0].remove(),document.getElementById("players").append(i)}}}async function gameStart(){var e=document.createElement("script");e.async=!0,e.type="module",e.src=clientPageRedirect+"/client.js",document.getElementById("game").setAttribute("show",""),document.getElementById("gamecontent").innerHTML=clientPage,document.getElementById("gamecontent").append(e)}async function setupListeners(t){var e=ref(realtime,"games/"+t),n=ref(realtime,"games/"+t+"/players");async function a(){var e={uid:auth.currentUser.uid,gameId:t};navigator.sendBeacon("https://hosting-leave-fzexuypcsq-uc.a.run.app",JSON.stringify(e))}console.log("Adding listeners.."),gameDetails={gameId:parms.get("id"),active:!0,ref:e,hasStarted:!1,userInfo:{username:document.getElementById("username").value,icon:document.getElementById("userProfileImg").getAttribute("relativelocation")}},document.game=gameDetails,onValue(e,e=>{e.exists()?"ingame"==e.val().state&&0==gameDetails.hasStarted&&(gameDetails.hasStarted=!0,gameStart()):location.replace("../join.html?error=game_deleted")}),onValue(n,e=>{if(e.exists()){var n=convertDictToArray(e.val());let t=!1;for(let e=0;e<n.length;e++)if(n[e][0]==auth.currentUser.uid){t=!0;break}t?refreshPlayers(n):location.replace("../join.html?error=kicked")}else location.replace("../join.html?error=kicked")}),document.getElementById("postjoinUserProfileImg").parentElement.addEventListener("click",async()=>{document.getElementById("chooseBlue").showModal(),0==hasLoadedBlues&&(hasLoadedBlues=!0,insertLoadingScreen("loadBlues",document.getElementById("blueContainer")),await generateBlueSelection(auth,document.getElementById("blueContainer")),addBlueListeners(),finishLoading("loadBlues"))}),window.addEventListener("beforeunload",async function(e){null!=t&&await a()});let i;document.addEventListener("visibilitychange",()=>{null!=t&&(i=document.hidden?setTimeout(()=>{a(),location.href="../join.html?error=inactive"},3e5):(clearTimeout(i),-1))})}async function join(){if(""==document.getElementById("username").value)alert("please enter a valid name.");else{document.getElementById("confirmJoin").setAttribute("disabled",""),document.getElementById("confirmJoin").innerHTML='<i class="fa-light fa-spinner-third fa-spin"></i>';var e=await httpsCallable(functions,"hosting-joinGame")({code:parms.get("id"),username:document.getElementById("username").value,icon:document.getElementById("userProfileImg").getAttribute("relativelocation"),privacy:{publicProfile:document.getElementById("publicProfile").checked}});if(0==e.data.success)switch(e.data.error){case"game/invalid":location.href="../join.html?error=game_deleted";break;case"game/already_in":location.href="../join.html?error=unknown"}document.getElementById("postjoinUserProfileImg").src=document.getElementById("userProfileImg").src,document.getElementById("postgameusername").innerText=document.getElementById("username").value;e=await realtimeGet(ref(realtime,"games/"+parms.get("id"))),e=(document.getElementById("gamemode").innerHTML=allGamemodes.gamemodes[e.val().gamemodeIdx].display,(clientPageRedirect="../game/"+allGamemodes.gamemodes[e.val().gamemodeIdx].id)+"/client.html");fetch(e).then(e=>e.text()).then(e=>{clientPage=e}),setupListeners(parms.get("id")),document.getElementById("prejoin").style.display="none",document.getElementById("postjoin").style.display="flex"}}function getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e)+e)}onAuthStateChanged(auth,async e=>{if(null==e)alert("please join via join screen first."),location.replace("../join.html");else{insertLoadingScreen("main");var t=ref(realtime,"games/"+parms.get("id")),t=await realtimeGet(t);if(0==t.exists())location.replace("../join.html?error=game_not_exist");else{t.val().settings.playerSettings&&1==t.val().settings.playerSettings.randomizedUsernames&&(document.getElementById("username").setAttribute("readonly",""),document.getElementById("requiresRandom").style.display="unset"),document.getElementById("notLoggedIn").close();e.isAnonymous?document.getElementById("publicProfile").setAttribute("disabled",""):(updateLoadingInfo("main","Fetching user data"),hasAccount=!0,accountData=await FirebaseHelper.getUserData(e.uid),console.log(accountData),0==t.val().settings.playerSettings.randomizedUsernames&&(document.getElementById("username").value=accountData.username),document.getElementById("userProfileImg").src="../asset/char/"+accountData.profileBlue,document.getElementById("userProfileImg").setAttribute("relativelocation",accountData.profileBlue)),updateLoadingInfo("main","Loading kit data");var n,e=t.val().kitData;console.log(e),document.getElementById("kitimg").src=e.cover,document.getElementById("title").innerText=e.displayname,document.getElementById("desc").innerText=e.description;switch(document.getElementById("kitPrivacy").innerHTML=(t=e.visibility).charAt(0).toUpperCase()+t.slice(1),document.getElementById("kitCreator").href="../profile/user/index.html?id="+e.author,e.visibility){case"private":break;case"friends":document.getElementById("kitPrivacyIcon").className="fa-light fa-user fa-lg";break;case"public":document.getElementById("kitPrivacyIcon").className="fa-light fa-globe fa-lg"}"private"==e.visibility?document.getElementById("likesContainer").style.display="none":((t=((e.publicInfo||{}).peopleWhoLike||[]).length)<(e=((e.publicInfo||{}).peopleWhoDislike||[]).length)&&(n=e/(t+e)*100,document.getElementById("likesContainer").innerHTML=`
                <i class="fa-light fa-thumbs-down fa-lg"></i>
                <span>${e} (${n}%)</span>
            `),n=t/(t+e)*100,document.getElementById("likesContainer").innerHTML=`
            <i class="fa-light fa-thumbs-up fa-lg"></i>
            <span>${t} (${n}%)</span>
        `),document.getElementById("userProfileImg").parentElement.addEventListener("click",async()=>{document.getElementById("chooseBlue").showModal(),0==hasLoadedBlues&&(hasLoadedBlues=!0,insertLoadingScreen("loadBlues",document.getElementById("blueContainer")),await generateBlueSelection(auth,document.getElementById("blueContainer")),addBlueListeners(),finishLoading("loadBlues"))}),document.getElementById("confirmJoin").addEventListener("click",()=>{0==hasAccount?document.getElementById("notLoggedIn").showModal():join()}),document.getElementById("joinAnyway").addEventListener("click",()=>{1!=hasAccount&&(document.getElementById("notLoggedIn").close(),join())}),document.getElementById("login").addEventListener("click",()=>{window.open("../auth/popup/login.html",null,"width=578,height=708,toolbar=no,menubar=no,location=no")||showNotification(3,"Popup failed.")}),document.getElementById("randomize").addEventListener("click",()=>{var e=adjectiveWords[getRandomInt(0,adjectiveWords.length)],t=animals[getRandomInt(0,animals.length)];document.getElementById("username").value=e+t}),finishLoading("main")}}});