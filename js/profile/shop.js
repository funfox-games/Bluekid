import{onAuthStateChanged,auth,db,doc,getDoc,getDocs,setDoc,updateDoc,collection,insertLoadingScreen,updateLoadingInfo,finishLoading,increment,onSnapshot}from"../util/firebase.js";import{isUserVaild,UserReasons}from"../util/auth_helper.js";import{SHOP_URI}from"../config.js";import*as packOpen from"../3d.js";let packdata=null,_packdata=await fetch("../../asset/blues.json");async function checkVaild(i,c){return new Promise(async(e,t)=>{var n=isUserVaild(i,c);if(n.reason==UserReasons.OVERDUE)location.href="../auth/overdue.html";else if(n.reason==UserReasons.BANNED)(a=document.createElement("dialog")).innerHTML=`
            <h1>You're banned.</h1>
            <p>Reason: ${n.banReason}</p>
            <br>
            <b>You can resolve this by contacting the developer.</b>
            <button class="puffy_button danger" id="logout__ban">Logout</button>
        `,document.body.append(a),a.showModal(),document.getElementById("logout__ban").addEventListener("click",async()=>{await signOut(auth),location.href="../index.html"});else if(n.reason==UserReasons.TEMPBANNED){var a=document.createElement("dialog"),o=1e3*n.endsOn.seconds,o=new Date(o).getTime();let e=Math.floor((o-Date.now())/864e5),t="days";console.log(e),0==e&&(e=Math.floor((o-Date.now())/36e5),t="hours",0==e)&&(e=Math.floor((o-Date.now())/6e4),t="minutes"),a.innerHTML=`
            <h1>You're banned.</h1>
            <p>Reason: ${n.banReason}</p>
            <p>Ends in ${e} ${t}.</p>
            <br>
            <b>You can resolve this sooner by contacting the developer.</b>
            <button class="puffy_button danger" id="logout__ban">Logout</button>
        `,document.body.append(a),a.showModal(),void document.getElementById("logout__ban").addEventListener("click",async()=>{await signOut(auth),location.href="../index.html"})}else n.reason==UserReasons.OTHER&&showNotification(3,"Something went wrong checking user info. Continuing as normal."),e()})}let allPacks=(packdata=await _packdata.json()).packs,allSpecials=packdata.specials,localCost=0,isSaving=!1,confetti=new JSConfetti;async function wait(n){return new Promise(async(e,t)=>{setTimeout(()=>{e()},1e3*n)})}function monthToText(e){switch(e){case 0:return"Janurary";case 1:return"Feburary";case 2:return"March";case 3:return"April";case 4:return"May";case 5:return"June";case 6:return"July";case 7:return"August";case 8:return"September";case 9:return"October";case 10:return"November";case 11:return"December"}}function weighted_random(e,t){for(var n=1;n<t.length;n++)t[n]+=t[n-1];var a=Math.random()*t[t.length-1];for(n=0;n<t.length&&!(a<t[n]);n++);return e[n]}async function saveBlue(c){return new Promise(async(e,t)=>{isSaving=!0;var n=doc(db,"users",auth.currentUser.uid,"blues",c);let a;var o=await getDoc(n).then(e=>(a=e.exists(),e.data()));let i=0;a?(i=o.amount,await updateDoc(n,{amount:i+1})):await setDoc(n,{amount:1,pack:packdata.blues[c].pack}),isSaving=!1,console.log("Success. new amount: "+(i+1)),e()})}async function buyPack(e){var t=allPacks[e].cost;if(isSaving)showNotification(3,"Trying to save. Please try again.");else if(t>localCost)showNotification(3,"Not enough tokens!");else{var a=packdata.packs[e].blues;let n=[];Object.entries(a).forEach((e,t)=>{e=packdata.blues[e[1]];n.push(e.chance)});a=weighted_random(a,n),e=(startAnimationSequence("../asset/packs/"+allPacks[e].graphic,a,packdata.blues[a]),document.getElementById("newUnlockScreen").style.backgroundImage=`linear-gradient(${allPacks[e].buyBackground[0]}, ${allPacks[e].buyBackground[1]})`,insertLoadingScreen("buyBlue",document.getElementById("content")),doc(db,"users",auth.currentUser.uid));updateLoadingInfo("buyBlue","Updating coins..."),await updateDoc(e,{tokens:increment(-t)}),updateLoadingInfo("buyBlue","Adding blue..."),await saveBlue(a),finishLoading("buyBlue")}}console.log(new Date(2024,5,25));let renderer;async function startAnimationSequence(e,t,n){var a=document.getElementById("quickTransition").checked;document.getElementById("newUnlockedblue").setAttribute("hide",""),document.getElementById("newUnlockedblue").setAttribute("offscreen",""),document.getElementById("newUnlockScreen").removeAttribute("hide"),document.getElementById("newunlockedimg").src="../asset/char/"+n.imgPath,document.getElementById("newunlockedName").innerHTML=t,document.getElementById("newunlockedRarity").innerHTML=n.rarity+` (${n.chance}%)`,await packOpen.default(renderer,a),document.getElementById("newUnlockedblue").removeAttribute("hide"),document.getElementById("newUnlockedblue").removeAttribute("offscreen"),await wait(1.25),document.getElementById("newUnlockScreen").setAttribute("hide","")}async function playSpecialUnlockAnim(){return new Promise(async(e,t)=>{document.getElementById("specialBlue").setAttribute("hide",""),document.getElementById("specialBlue").setAttribute("offscreen",""),document.getElementById("unlockSpecial").removeAttribute("hide"),await packOpen.default("unlockSpecial",!1),document.getElementById("specialBlue").removeAttribute("hide"),document.getElementById("specialBlue").removeAttribute("offscreen"),await wait(1.25),e()})}function showPackInfo(e){var e=allPacks[e],t=e.display_name,n=e.cost,a=e.graphic,o=e.blues;document.getElementById("info_icon").src="../asset/packs/"+a,document.getElementById("info_name").innerHTML=t,document.getElementById("info_price").innerHTML=n,document.getElementById("info_blues").innerHTML=o.toString(),document.getElementById("limited").style.display="none",null!=e.ends_on&&(document.getElementById("limited").style.display="unset",a=new Date(e.ends_on),document.getElementById("offer_end").innerHTML=`${monthToText(a.getMonth())} ${a.getDate()}, `+a.getFullYear()),document.getElementById("packdata").showModal()}async function addAllPacks(){return new Promise(async e=>{Object.entries(allPacks).forEach((t,e)=>{let n=t[0];var t=t[1],a=(console.log(n,t),t.buyable);if(0!=a){var a=t.display_name,o=t.cost,i=t.graphic;if(null!=t.ends_on)if(new Date(t.ends_on).getTime()-(new Date).getTime()<=0)return;var c=document.getElementById("packex").cloneNode(!0);c.id=n,c.children[0].src="../asset/packs/"+i;let e=c.children[1];e.children[0].innerHTML=a,null!=t.ends_on&&(e.children[0].innerHTML='<i title="Limited time! Click the info button to learn more." class="fa-light fa-clock fa-xs"></i> '+a),e.children[1].innerHTML="Cost: "+o+" coins",e.children[2].children[0].addEventListener("click",()=>{buyPack(n),e.children[2].children[0].blur()}),e.children[2].children[1].addEventListener("click",()=>showPackInfo(n)),document.getElementById("allPacks").append(c)}}),e()})}async function addAllSpecials(){return new Promise(async(e,t)=>{var n=Object.entries(allSpecials),a=await getDocs(collection(db,"users",auth.currentUser.uid,"blues"));let s=[];a.forEach((e,t)=>{s.push(e.id)}),n.forEach((n,e)=>{let a=n[0],o=n[1],i=(console.log(a,o),o.bluedata);var n=o.cost,c=packdata.blues[o.bluedata].imgPath,l=new Date(o.endsOn).getTime()-(new Date).getTime();if(!(l<=0)){l=Math.round(l/864e5);let e=document.getElementById("specialex").cloneNode(!0),t=(e.id=a,e.children[0].src="../asset/char/"+c,e.children[1]);s.includes(a)&&(t.children[2].children[1].innerHTML='<i class="fa-light fa-star"></i> Claimed',t.children[2].children[1].setAttribute("disabled","true")),document.getElementById("nolimitedtime")&&document.getElementById("nolimitedtime").remove(),""!=document.getElementById("specialsNotif").innerHTML?document.getElementById("specialsNotif").innerHTML=parseInt(document.getElementById("specialsNotif").innerHTML)+1:(document.getElementById("specialsNotif").innerHTML="1",document.getElementById("specialsNotif").setAttribute("show","")),t.children[0].innerHTML=i,t.children[1].innerHTML="Cost: "+n+" coins",t.children[2].children[0].children[0].innerHTML=l,t.children[2].children[1].addEventListener("click",async()=>{s.includes(a)||(t.children[2].children[1].innerHTML="Working...",await saveBlue(o.bluedata),document.getElementById("specialUnlock").src=e.children[0].src,document.getElementById("unlockeddd").innerHTML=i,await playSpecialUnlockAnim(),location.reload())}),document.getElementById("allSpecials").append(e)}}),e()})}function setupTabs(){let n=document.getElementById("tabs").children;for(let t=0;t<n.length;t++){let e=n[t];e.addEventListener("click",()=>{for(let e=0;e<n.length;e++)n[e].classList.remove("primary");e.classList.add("primary");for(let e=0;e<document.getElementsByClassName("section").length;e++)document.getElementsByClassName("section")[e].removeAttribute("show");document.getElementById(e.id.replace("btn__","")).setAttribute("show","")})}}onAuthStateChanged(auth,async e=>{var t,c;!e||e.isAnonymous?location.href="../auth/login.html":(renderer=packOpen.setupWEBGLRenderer("newUnlockScreen"),setupTabs(),insertLoadingScreen("content",document.getElementById("content")),t=e.uid,t=doc(db,"users",t),updateLoadingInfo("content","Fetching user data"),c=await getDoc(t).then(e=>e.data()),localCost=c.tokens,await checkVaild(e,c),document.getElementById("allcoins").innerHTML=localCost.toLocaleString(),"true"==localStorage.getItem("fastPackOpening")&&(document.getElementById("quickTransition").checked=!0),updateLoadingInfo("content","Retriving packs"),await addAllPacks(),updateLoadingInfo("content","Retriving specials"),await addAllSpecials(),onSnapshot(t,e=>{e.metadata.hasPendingWrites;localCost=parseInt(e.data().tokens),document.getElementById("allcoins").innerHTML=localCost.toLocaleString()}),document.getElementById("quickTransition").addEventListener("change",()=>{var e=document.getElementById("quickTransition").checked;localStorage.setItem("fastPackOpening",e)}),document.getElementById("submitsuggestion").addEventListener("click",async()=>{document.getElementById("submitsuggestion").innerHTML="Sending...",document.getElementById("submitsuggestion").setAttribute("disabled","");var e=document.getElementById("packnamesuggest").value,t=document.getElementById("packcostsuggest").value,n=document.getElementById("bluesuggestions").children;let a="";for(let e=0;e<n.length;e++){var o=n[e],i=o.children[0].children[0].value,o=o.children[1].value;a+=`
**${i}**: `+o}e={content:`# ${e}
*Cost:* ${t} coins
*Blues:*
----------${a}
----------

<<<<<<< Updated upstream
            document.body.append(popup);
            popup.showModal();
            document.getElementById("logout__ban").addEventListener("click", async () => {
                await signOut(auth);
                location.href = "../index.html";
            })
            return;
        }
        
        if (USER_CONFIRMATION_CHECK.reason == UserReasons.OTHER) {
            showNotification(3, "Something went wrong checking user info. Continuing as normal.");
        }
        res();
    });
}

const allPacks = packdata.packs;
const allSpecials = packdata.specials;
let localCost = 0;
let isSaving = false;
const confetti = new JSConfetti();

console.log(new Date(2024, 5, 25));

async function wait(sec) {
    return new Promise(async (res, rej) => {
        setTimeout(() => {
            res();
        }, sec * 1000);
    });
}

function monthToText(num) {
    switch (num) {
        case 0:
            return "Janurary";
        case 1:
            return "Feburary";
        case 2:
            return "March";
        case 3:
            return "April";
        case 4:
            return "May";
        case 5:
            return "June";
        case 6:
            return "July";
        case 7:
            return "August";
        case 8:
            return "September";
        case 9:
            return "October";
        case 10:
            return "November";
        case 11:
            return "December";

    }
}

function weighted_random(items, weights) {
    var i;

    for (i = 1; i < weights.length; i++)
        weights[i] += weights[i - 1];

    var random = Math.random() * weights[weights.length - 1];

    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;

    return items[i];
}

async function saveLocalCoins() {
    return new Promise(async (res, rej) => {
        isSaving = true;
        var docref = doc(db, "users", auth.currentUser.uid);
        document.getElementById("allcoins").innerHTML = localCost.toLocaleString();
        await updateDoc(docref, {
            tokens: localCost
        });
        isSaving = false;
        res();
    });
}

async function saveBlue(id) {
    return new Promise(async (res, rej) => {
        isSaving = true;
        const doc_ = doc(db, "users", auth.currentUser.uid, "blues", id);
        let exists;
        let data = await getDoc(doc_).then((snap) => {
            exists = snap.exists();
            return snap.data();
        });
        let amount = 0;
        if (exists) {
            amount = data.amount;
            await updateDoc(doc_, {
                amount: amount + 1
            });
        } else {
            await setDoc(doc_, {
                amount: 1,
                pack: packdata.blues[id].pack
            });
        }

        isSaving = false;
        console.log("Success. new amount: " + (amount + 1));
        res();
    });
    
}

async function buyPack(id) {
    const cost = allPacks[id].cost;
    if (isSaving) {showNotification(3, "Trying to save. Please try again."); return;}
    if (cost > localCost) { showNotification(3, "Not enough tokens!"); return;}
    localCost -= cost;
    const packblues = packdata.packs[id].blues;
    const rarities = [];
    Object.entries(packblues).forEach((val, idx) =>{
        const data = packdata.blues[val[1]];
        rarities.push(data.chance);
    })
    const blue = weighted_random(packblues, rarities);
    startAnimationSequence("../asset/packs/" + allPacks[id].graphic, blue, packdata.blues[blue]);
    document.getElementById("unlockScreen").style.backgroundImage = `linear-gradient(${allPacks[id].buyBackground[0]}, ${allPacks[id].buyBackground[1]})`
    allPacks[id].buyBackground
    await saveLocalCoins();
    saveBlue(blue);
}
async function startAnimationSequence(packimg, blue, bluedata) {
    const fast = document.getElementById("quickTransition").checked;
    const outside = document.getElementById("unlockScreen");
    const center = document.getElementById("unlockcenter");
    center.children[0].src = packimg;
    document.getElementById("unlockedimg").src = "../asset/char/" + bluedata.imgPath;
    document.getElementById("unlockedName").innerHTML = blue;
    document.getElementById("unlockedRarity").innerHTML = bluedata.rarity + ` (${bluedata.chance}%)`;
    console.log(bluedata);
    outside.removeAttribute("hide");
    if (!fast) {
        await wait(.5);
    }
    center.setAttribute("shake", "");
    if (!fast) {
        await wait(1);
    } else {
        await wait(.5);
    }
    center.removeAttribute("shake");
    center.setAttribute("leaveframe", "");
    if (!fast) {
        await wait(.5);
    } else {
        await wait(.25);
    }
    if (bluedata.chance <= 1) {
        confetti.addConfetti();
    }
    center.removeAttribute("leaveframe");
    center.setAttribute("hide", "");
    if (!fast) {
        await wait(1);
    } else {
        await wait(.5);
    }
    outside.setAttribute("hide", "");
    center.removeAttribute("hide");
}
async function playSpecialUnlockAnim() {
    return new Promise(async (res, rej) => {
        const image = document.getElementById("specialUnlock");
        image.parentElement.parentElement.removeAttribute("hide");
        await wait(.5);
        image.style.animation = `unlocked 1s infinite ease-in-out`;
        await wait(2);
        image.removeAttribute("hide");
        image.style.animation = `specialUnlock 750ms`;
        await wait(1);
        image.style.animation = "";
        await wait(.25);
        document.getElementById("unlockedText").removeAttribute("hide");
        await wait(1);
        res();
    });
}

function showPackInfo(id) {
    const data = allPacks[id];
    const display = data.display_name;
    const cost = data.cost;
    const img = data.graphic;
    const blues = data.blues;

    document.getElementById("info_icon").src = "../asset/packs/" + img;
    document.getElementById("info_name").innerHTML = display;
    document.getElementById("info_price").innerHTML = cost;
    document.getElementById("info_blues").innerHTML = blues.toString();
    document.getElementById("limited").style.display = "none";
    if (data.ends_on != undefined) {
        document.getElementById("limited").style.display = "unset";
        const time = new Date(data.ends_on);

        document.getElementById("offer_end").innerHTML = `${monthToText(time.getMonth())} ${time.getDate()}, ${time.getFullYear()}`;
    }

    document.getElementById("packdata").showModal();
}

async function addAllPacks() {
    return new Promise(async (res) => {
        const list = Object.entries(allPacks);
        list.forEach((val, i) => {
            const id = val[0];
            const data = val[1];
            console.log(id, data);

            const buyable = data.buyable;
            if (buyable == false) {return;}
            const display = data.display_name;
            const cost = data.cost;
            const img = data.graphic;

            if (data.ends_on != undefined) {
                const date = new Date(data.ends_on);
                const timeDiff = date.getTime() - new Date().getTime();
                if (timeDiff <= 0) {
                    return;
                }
            }

            const elem = document.getElementById("packex").cloneNode(true);
            elem.id = id;
            elem.children[0].src = "../asset/packs/" + img;
            const bottom = elem.children[1];
            bottom.children[0].innerHTML = display;
            if (data.ends_on != undefined) {
                bottom.children[0].innerHTML = `<i title="Limited time! Click the info button to learn more." class="fa-light fa-clock fa-xs"></i> ` + display;
            }
            bottom.children[1].innerHTML = "Cost: " + cost + " coins";
            bottom.children[2].children[0].addEventListener("click", () => { buyPack(id); bottom.children[2].children[0].blur() });
            bottom.children[2].children[1].addEventListener("click", () => showPackInfo(id));

            document.getElementById("allPacks").append(elem);
        });
        res();
    });
}

async function addAllSpecials() {
    return new Promise(async (res, rej) => {
        const list = Object.entries(allSpecials);
        const allBlues = await getDocs(collection(db, "users", auth.currentUser.uid, "blues")).catch((err) => {
            rej(err);
        });
        let allBlueIds = [];
        allBlues.forEach((val, _) => {
            allBlueIds.push(val.id);
        })
        list.forEach((val, i) => {
            const id = val[0];
            const data = val[1];
            console.log(id, data);
            if (document.getElementById("nolimitedtime")) document.getElementById("nolimitedtime").remove();

            

            const display = data.bluedata;
            const cost = data.cost;
            const img = packdata.blues[data.bluedata].imgPath;

            const date = new Date(data.endsOn);
            const timeDiff = date.getTime() - new Date().getTime();
            if (timeDiff <= 0) {
                return;
            }
            const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));

            const elem = document.getElementById("specialex").cloneNode(true);
            elem.id = id;
            elem.children[0].src = "../asset/char/" + img;
            const bottom = elem.children[1];

            if (allBlueIds.includes(id)) {
                bottom.children[2].children[1].innerHTML = `<i class="fa-light fa-star"></i> Claimed`;
                bottom.children[2].children[1].setAttribute("disabled", "true");
            }

            bottom.children[0].innerHTML = display;
            bottom.children[1].innerHTML = "Cost: " + cost + " coins";
            bottom.children[2].children[0].children[0].innerHTML = dayDiff;
            bottom.children[2].children[1].addEventListener("click", async () => {
                if (allBlueIds.includes(id)) {
                    return;
                }
                bottom.children[2].children[1].innerHTML = "Working...";
                await saveBlue(data.bluedata);
                document.getElementById("specialUnlock").src = elem.children[0].src;
                document.getElementById("unlockeddd").innerHTML = display;
                await playSpecialUnlockAnim();
                location.reload();
            });
            document.getElementById("allSpecials").append(elem);
        });
        res();
    });
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }
    insertLoadingScreen("content", document.getElementById("content"));
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    updateLoadingInfo("content", "Fetching user data");
    var data = await getDoc(doc_).then((res) => {
        return res.data();
    });
    localCost = data.tokens;
    await checkVaild(user, data);
    document.getElementById("allcoins").innerHTML = data.tokens.toLocaleString();
    if (localStorage.getItem("fastPackOpening") == "true") {
        document.getElementById("quickTransition").checked = true;
    }

    updateLoadingInfo("content", "Retriving packs");
    await addAllPacks();
    updateLoadingInfo("content", "Retriving specials");
    await addAllSpecials();

    document.getElementById("quickTransition").addEventListener("change", () => {
        const fastPackOn = document.getElementById("quickTransition").checked;
        localStorage.setItem("fastPackOpening", fastPackOn);
    });
    document.getElementById("submitsuggestion").addEventListener("click", async () => {
        document.getElementById("submitsuggestion").innerHTML = "Sending...";
        document.getElementById("submitsuggestion").setAttribute("disabled", "");
        const title = document.getElementById("packnamesuggest").value;
        const cost = document.getElementById("packcostsuggest").value;
        const blues = document.getElementById("packbluessuggest").value;

        const url = SHOP_URI;
        const msg = {
            "content": `UID: ${auth.currentUser.uid}\n----------------------\nPack name: ${title}\nPack cost: ${cost} coins\nBlues: ${blues}`,
            "username": data.username + " | BluekidPackRequest"
        }
        await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(msg)
        });
        document.getElementById("submitsuggestion").innerHTML = "Thanks!";
    });
    finishLoading("content");
});
=======
-# [Profile link](https://bluekid.netlify.app/profile/user?id=${auth.currentUser.uid})
-# UserID: `+auth.currentUser.uid,username:"[v2] Pack Request > "+c.username};await fetch(SHOP_URI,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e)}),document.getElementById("submitsuggestion").innerHTML="Thanks!"}),finishLoading("content"),document.getElementById("addblue").addEventListener("click",()=>{var e=document.getElementById("bluesuggestions").children.length+1;let n=document.getElementById("packbluessuggestex").cloneNode(!0);n.id="blue__"+e;var t=n.children[0];t.children[0].id="suggestblue__"+e,t.children[1].for="suggestblue__"+e,t.children[1].innerHTML="Blue #"+e,n.children[2].addEventListener("click",()=>{n.remove();for(let e=0;e<document.getElementById("bluesuggestions").children.length;e++){var t=document.getElementById("bluesuggestions").children[e].children[0];t.children[0].id="suggestblue__"+(e+1),t.children[1].for="suggestblue__"+(e+1),t.children[1].innerHTML="Blue #"+(e+1)}}),document.getElementById("bluesuggestions").append(n)}))});
>>>>>>> Stashed changes
