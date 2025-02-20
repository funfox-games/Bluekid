<<<<<<< Updated upstream
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { FIREBASE_API_KEY, FIREBASE_APP_ID } from "../config.js";
const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: "bluekid-303db.firebaseapp.com",
    databaseURL: "https://bluekid-303db-default-rtdb.firebaseio.com",
    projectId: "bluekid-303db",
    storageBucket: "bluekid-303db.appspot.com",
    messagingSenderId: "207140973406",
    appId: FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { getAuth, signInAnonymously, reauthenticateWithPopup, onAuthStateChanged, EmailAuthProvider, signOut, sendPasswordResetEmail, deleteUser, updateEmail, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
export const auth = getAuth();

import { getFirestore, Timestamp, doc, getDoc, getDocs, updateDoc, deleteDoc, collection, query, where, limit, orderBy, setDoc, addDoc, startAfter } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
export const db = getFirestore(app);

import { getDatabase, ref, set as realtimeSet, update as realtimeUpdate, get as realtimeGet, remove as realtimeRemove, onDisconnect, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
export const realtime = getDatabase(app);

import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
export const analytics = getAnalytics(app);

import { getStorage, ref as storageref, uploadBytes, getDownloadURL, deleteObject, listAll } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
export const storage = getStorage();

import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";
const functions = getFunctions(app);

export const ONLINE_TEXT = "Online";
export const OFFLINE_TEXT = "Offline";

export const KIT_COVER_LOCATION = "kit/cover";

let currentDisconnect;
let shouldBeChecked = true;

export const DEVELOPER_ALLOW_LIST = ["SfgsyTdWadMcWNkoKzMcr5vZANz1", "IRQFJKtbT0UKx9OfrhGEsj557bB2"];
export const MODERATOR_ALLOW_LIST = ["SfgsyTdWadMcWNkoKzMcr5vZANz1", "IRQFJKtbT0UKx9OfrhGEsj557bB2", "L9DshmPRcQYemY4E0tlHJqk5X053"];

export const adjectiveWords = [
    "Blue",
    "Long",
    "Important",
    "Stupendous",
    "Avaricous",
    "Arrogant",
    "Whimsical",
    "Wacky",
    "Attractive",
    "Rapacious",
    "Preposterous",
    "Luscious",
    "Red",
    "Purple",
    "Orange"
]
export const animals = [
    "Dog",
    "Cat",
    "Cow",
    "Frog",
    "Jellyfish",
    "Lizard",
    "Llama",
    "Turtle",
    "Gorilla",
    "Fox",
    "Wolf",
    "Eel",
    "Hawk",
    "Rat",
    "Snake",
    "Peacock",
    "Bear",
    "Racoon",
    "Duck",
    "Kangaroo"
]

let _hasBKP = null;

export function forceOffline() {
    return new Promise(async (res, rej) => {
        if (currentDisconnect != null) {
            currentDisconnect.cancel();
            shouldBeChecked = false;
        }
        const statusref = ref(realtime, "statuses/" + auth.currentUser.uid);
        await realtimeUpdate(statusref, { status: OFFLINE_TEXT, lastOnline: new Date() }).catch((err) => {
            console.error(err);
            rej(err);
        });
        res();
    });
}

const hasBluekidPlus = async () => {
    if (_hasBKP == null) {
        const func = httpsCallable(functions, "hasBluekidPlus");
        _hasBKP = await func(auth.currentUser.uid);
        _hasBKP = _hasBKP.data.active;
    }
    return _hasBKP;
}

const filterMessage = async (msg) => {
    const __content = await fetch("../../asset/no-nos.txt");
    const _content = await __content.text();

    const splitmsg = msg.split(" ");
    msg = "";
    for (let i = 0; i < splitmsg.length; i++) {
        let word = splitmsg[i];
        // if (_content.includes(word)) {
        //     word = word.length;
        // }
        msg += word + " ";
    }
    msg.trim();
    return msg;
}

document.body.onload = () => {
    if (localStorage.getItem("settings-allowThemes") == "false") {
        document.body.setAttribute("disableThemes", "true");
    }
}

/**
 * 
 * @param {string} id 
 * @param {string} title
 * @param {string} message 
 * @param {Date} expires 
 */
function addDisclaimer(id, title, message, expires) {
    if (new Date() > expires) {
        localStorage.removeItem("disclaimer__" + id);
        return;
    }
    if (localStorage.getItem("disclaimer__" + id) != null) {
        return;
    }
    const dialog = document.createElement("dialog");
    dialog.id = id;
    dialog.innerHTML = title;
    var time = (expires - new Date()); // milliseconds between now & user creation
    var diffHours = Math.floor((time / 86400000) * 24); // days
    dialog.innerHTML = `
    <h1>${title}</h1>
    <p>${message}</p>
    <label class="toggle" for="${id}__showAgain">
        <input class="toggle_input" type="checkbox" id="${id}__showAgain">
        <div class="toggle_fill"></div>
        Don't show again
    </label>
    <b style="font-size:1.5rem;">Notice expires in <span title="${expires}">${diffHours}</span> hours</b>
    <button class="puffy_button primary" id="${id}__btn">Close</button>
    `;
    document.body.prepend(dialog);

    document.getElementById(id + "__btn").addEventListener("click", () => {
        if (document.getElementById(id + "__showAgain").checked) {
            localStorage.setItem("disclaimer__" + id, true);
        }
        dialog.close();
    });
    dialog.showModal();
}

onAuthStateChanged(auth, async (user) => {
    if (user && !user.isAnonymous) {
        addDisclaimer(
            "temp__someAspects",
            "Some Bluekid pages are down.",
            "Due to a backend issue of mine, Bluekid will be temporarily down.",
            new Date("2024-12-20T15:00:00-05:00")
        );
        const statusref = ref(realtime, "statuses/" + user.uid);
        console.log("alr");
        onValue(statusref, (snapshot) => {
            // if (snapshot.exists() == false) {
            //     return;
            // };
            currentDisconnect = onDisconnect(statusref)
            currentDisconnect.update({ status: OFFLINE_TEXT, lastOnline: new Date() }).then(function () {
                if (!shouldBeChecked) {return;}
                realtimeUpdate(statusref, { status: ONLINE_TEXT });
            });
        });

        const hasBKP = await hasBluekidPlus();
        if (hasBKP) {
            const elems = document.getElementsByClassName("subscription_btn");
            for (let i = 0; i < elems.length; i++) {
                const elem = elems[i];
                elem.style.display = "none";
            }   
        }
        // console.log(await filterMessage("hello users, im going to cream"));
    }
});

export function insertLoadingScreen(id, parent) {
    let _parent = parent;
    if (parent == null) {
        _parent = document.body;
    } else {
        _parent.style.position = "relative";
    }

    let innerHTML = `
=======
import{initializeApp}from"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import{FIREBASE_API_KEY,FIREBASE_APP_ID}from"../config.js";let firebaseConfig={apiKey:FIREBASE_API_KEY,authDomain:"bluekid-303db.firebaseapp.com",databaseURL:"https://bluekid-303db-default-rtdb.firebaseio.com",projectId:"bluekid-303db",storageBucket:"bluekid-303db.appspot.com",messagingSenderId:"207140973406",appId:FIREBASE_APP_ID},app=initializeApp(firebaseConfig);import{getAuth,linkWithPopup,signInAnonymously,unlink,linkWithCredential,reauthenticateWithPopup,onAuthStateChanged,EmailAuthProvider,signOut,sendPasswordResetEmail,deleteUser,updateEmail,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword,reauthenticateWithCredential}from"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";let auth=getAuth();import{getFirestore,arrayUnion,arrayRemove,Timestamp,doc,getDoc,getDocs,updateDoc,deleteDoc,collection,query,where,limit,orderBy,setDoc,addDoc,startAfter,increment,onSnapshot}from"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";let db=getFirestore(app);import{getDatabase,ref,set as realtimeSet,update as realtimeUpdate,get as realtimeGet,remove as realtimeRemove,onDisconnect,onValue}from"https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";let realtime=getDatabase(app);import{getAnalytics}from"https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";let analytics=getAnalytics(app);import{getStorage,ref as storageref,uploadBytes,getDownloadURL,deleteObject,listAll}from"https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";let storage=getStorage();import{getFunctions,httpsCallable}from"https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";let functions=getFunctions(app),ONLINE_TEXT="Online",OFFLINE_TEXT="Offline",KIT_COVER_LOCATION="kit/cover",currentDisconnect,shouldBeChecked=!0,DEVELOPER_ALLOW_LIST=["SfgsyTdWadMcWNkoKzMcr5vZANz1","IRQFJKtbT0UKx9OfrhGEsj557bB2"],MODERATOR_ALLOW_LIST=["SfgsyTdWadMcWNkoKzMcr5vZANz1","IRQFJKtbT0UKx9OfrhGEsj557bB2","L9DshmPRcQYemY4E0tlHJqk5X053"],adjectiveWords=["Silly","Black","White","Gray","Brown","Red","Pink","Crimson","Carnelian","Orange","Yellow","Ivory","Cream","Green","Viridian","Aquamarine","Cyan","Blue","Cerulean","Azure","Indigo","Navy","Violet","Purple","Lavender","Magenta","Rainbow","Iridescent","Spectrum","Prism","Bold","Vivid","Pale","Clear","Glass","Translucent","Misty","Dark","Light","Gold","Silver","Copper","Bronze","Steel","Iron","Brass","Mercury","Zinc","Chrome","Platinum","Titanium","Nickel","Lead","Pewter","Rust","Metal","Stone","Quartz","Granite","Marble","Alabaster","Agate","Jasper","Pebble","Pyrite","Crystal","Geode","Obsidian","Mica","Flint","Sand","Gravel","Boulder","Basalt","Ruby","Beryl","Scarlet","Citrine","Sulpher","Topaz","Amber","Emerald","Malachite","Jade","Abalone","Lapis","Sapphire","Diamond","Peridot","Gem","Jewel","Bevel","Coral","Jet","Ebony","Wood","Tree","Cherry","Maple","Cedar","Branch","Bramble","Rowan","Ash","Fir","Pine","Cactus","Alder","Grove","Forest","Jungle","Palm","Bush","Mulberry","Juniper","Vine","Ivy","Rose","Lily","Tulip","Daffodil","Honeysuckle","Fuschia","Hazel","Walnut","Almond","Lime","Lemon","Apple","Blossom","Bloom","Crocus","Rose","Buttercup","Dandelion","Iris","Carnation","Fern","Root","Branch","Leaf","Seed","Flower","Petal","Pollen","Orchid","Mangrove","Cypress","Sequoia","Sage","Heather","Snapdragon","Daisy","Mountain","Hill","Alpine","Chestnut","Valley","Glacier","Forest","Grove","Glen","Tree","Thorn","Stump","Desert","Canyon","Dune","Oasis","Mirage","Well","Spring","Meadow","Field","Prairie","Grass","Tundra","Island","Shore","Sand","Shell","Surf","Wave","Foam","Tide","Lake","River","Brook","Stream","Pool","Pond","Sun","Sprinkle","Shade","Shadow","Rain","Cloud","Storm","Hail","Snow","Sleet","Thunder","Lightning","Wind","Hurricane","Typhoon","Dawn","Sunrise","Morning","Noon","Twilight","Evening","Sunset","Midnight","Night","Sky","Star","Stellar","Comet","Nebula","Quasar","Solar","Lunar","Planet","Meteor","Sprout","Pear","Plum","Kiwi","Berry","Apricot","Peach","Mango","Pineapple","Coconut","Olive","Ginger","Root","Plain","Fancy","Stripe","Spot","Speckle","Spangle","Ring","Band","Blaze","Paint","Pinto","Shade","Tabby","Brindle","Patch","Calico","Checker","Dot","Pattern","Glitter","Glimmer","Shimmer","Dull","Dust","Dirt","Glaze","Scratch","Quick","Swift","Fast","Slow","Clever","Fire","Flicker","Flash","Spark","Ember","Coal","Flame","Chocolate","Vanilla","Sugar","Spice","Cake","Pie","Cookie","Candy","Caramel","Spiral","Round","Jelly","Square","Narrow","Long","Short","Small","Tiny","Big","Giant","Great","Atom","Peppermint","Mint","Butter","Fringe","Rag","Quilt","Truth","Lie","Holy","Curse","Noble","Sly","Brave","Shy","Lava","Foul","Leather","Fantasy","Keen","Luminous","Feather","Sticky","Gossamer","Cotton","Rattle","Silk","Satin","Cord","Denim","Flannel","Plaid","Wool","Linen","Silent","Flax","Weak","Valiant","Fierce","Gentle","Rhinestone","Splash","North","South","East","West","Summer","Winter","Autumn","Spring","Season","Equinox","Solstice","Paper","Motley","Torch","Ballistic","Rampant","Shag","Freckle","Wild","Free","Chain","Sheer","Crazy","Mad","Candle","Ribbon","Lace","Notch","Wax","Shine","Shallow","Deep","Bubble","Harvest","Fluff","Venom","Boom","Slash","Rune","Cold","Quill","Love","Hate","Garnet","Zircon","Power","Bone","Void","Horn","Glory","Cyber","Nova","Hot","Helix","Cosmic","Quark","Quiver","Holly","Clover","Polar","Regal","Ripple","Ebony","Wheat","Phantom","Dew","Chisel","Crack","Chatter","Laser","Foil","Tin","Clever","Treasure","Maze","Twisty","Curly","Fortune","Fate","Destiny","Cute","Slime","Ink","Disco","Plume","Time","Psychadelic","Relic","Fossil","Water","Savage","Ancient","Rapid","Road","Trail","Stitch","Button","Bow","Nimble","Zest","Sour","Bitter","Phase","Fan","Frill","Plump","Pickle","Mud","Puddle","Pond","River","Spring","Stream","Battle","Arrow","Plume","Roan","Pitch","Tar","Cat","Dog","Horse","Lizard","Bird","Fish","Saber","Scythe","Sharp","Soft","Razor","Neon","Dandy","Weed","Swamp","Marsh","Bog","Peat","Moor","Muck","Mire","Grave","Fair","Just","Brick","Puzzle","Skitter","Prong","Fork","Dent","Dour","Warp","Luck","Coffee","Split","Chip","Hollow","Heavy","Legend","Hickory","Mesquite","Nettle","Rogue","Charm","Prickle","Bead","Sponge","Whip","Bald","Frost","Fog","Oil","Veil","Cliff","Volcano","Rift","Maze","Proud","Dew","Mirror","Shard","Salt","Pepper","Honey","Thread","Bristle","Ripple","Glow","Zenith"],animals=["guy","head","crest","crown","tooth","fang","horn","frill","skull","bone","tongue","throat","voice","nose","snout","chin","eye","sight","seer","speaker","singer","song","chanter","howler","chatter","shrieker","shriek","jaw","bite","biter","neck","shoulder","fin","wing","arm","lifter","grasp","grabber","hand","paw","foot","finger","toe","thumb","talon","palm","touch","racer","runner","hoof","fly","flier","swoop","roar","hiss","hisser","snarl","dive","diver","rib","chest","back","ridge","leg","legs","tail","beak","walker","lasher","swisher","carver","kicker","roarer","crusher","spike","shaker","charger","hunter","weaver","crafter","binder","scribe","muse","snap","snapper","slayer","stalker","track","tracker","scar","scarer","fright","killer","death","doom","healer","saver","friend","foe","guardian","thunder","lightning","cloud","storm","forger","scale","hair","braid","nape","belly","thief","stealer","reaper","giver","taker","dancer","player","gambler","twister","turner","painter","dart","drifter","sting","stinger","venom","spur","ripper","swallow","devourer","knight","lady","lord","queen","king","master","mistress","prince","princess","duke","dutchess","samurai","ninja","knave","slave","servant","sage","wizard","witch","warlock","warrior","jester","paladin","bard","trader","sword","shield","knife","dagger","arrow","bow","fighter","bane","follower","leader","scourge","watcher","cat","panther","tiger","cougar","puma","jaguar","ocelot","lynx","lion","leopard","ferret","weasel","wolverine","bear","raccoon","dog","wolf","kitten","puppy","cub","fox","hound","terrier","coyote","hyena","jackal","pig","horse","donkey","stallion","mare","zebra","antelope","gazelle","deer","buffalo","bison","boar","elk","whale","dolphin","shark","fish","minnow","salmon","ray","fisher","otter","gull","duck","goose","crow","raven","bird","eagle","raptor","hawk","falcon","moose","heron","owl","stork","crane","sparrow","robin","parrot","cockatoo","carp","lizard","gecko","iguana","snake","python","viper","boa","condor","vulture","spider","fly","scorpion","heron","oriole","toucan","bee","wasp","hornet","rabbit","bunny","hare","brow","mustang","ox","piper","soarer","flasher","moth","mask","hide","hero","antler","chill","chiller","gem","ogre","myth","elf","fairy","pixie","dragon","griffin","unicorn","pegasus","sprite","fancier","chopper","slicer","skinner","butterfly","legend","wanderer","rover","raver","loon","lancer","glass","glazer","flame","crystal","lantern","lighter","cloak","bell","ringer","keeper","centaur","bolt","catcher","whimsey","quester","rat","mouse","serpent","wyrm","gargoyle","thorn","whip","rider","spirit","sentry","bat","beetle","burn","cowl","stone","gem","collar","mark","grin","scowl","spear","razor","edge","seeker","jay","ape","monkey","gorilla","koala","kangaroo","yak","sloth","ant","roach","weed","seed","eater","razor","shirt","face","goat","mind","shift","rider","face","mole","vole","pirate","llama","stag","bug","cap","boot","drop","hugger","sargent","snagglefoot","carpet","curtain"],supportedProviders={Google:{name:"google.com",connectedId:"google",linkId:"linkgoogle"},Password:{name:"password",connectedId:"pass",linkId:"linkpass"}};function isLinkedWithProvider(i){var e=auth.currentUser;if(null==e)return null;let n=!1,o={username:null,email:null,photo:null};return e.providerData.forEach(e=>{var a=e.providerId,t=e.displayName,r=e.email,e=e.photoURL;a==i.name&&(n=!0,"password"!=a)&&(o.username=t,o.email=r,o.photo=e)}),{connected:n,data:o}}let _hasBKP=null;function forceOffline(){return new Promise(async(e,a)=>{null!=currentDisconnect&&(currentDisconnect.cancel(),shouldBeChecked=!1);var t=ref(realtime,"statuses/"+auth.currentUser.uid);await realtimeUpdate(t,{status:OFFLINE_TEXT,lastOnline:new Date,lastWebpage:location.pathname}).catch(e=>{console.error(e),a(e)}),e()})}let hasBluekidPlus=async()=>{var e;return null==_hasBKP&&(e=httpsCallable(functions,"hasBluekidPlus"),_hasBKP=(_hasBKP=await e(auth.currentUser.uid)).data.active),_hasBKP},filterMessage=async a=>{await(await fetch("../../asset/no-nos.txt")).text();var t=a.split(" ");a="";for(let e=0;e<t.length;e++)a+=t[e]+" ";return a.trim(),a};function insertLoadingScreen(e,a){let t=a;null==a?t=document.body:t.style.position="relative";a=document.createElement("div");return a.className="__loading_screen",a.id="LOADING__"+e,a.innerHTML=`
>>>>>>> Stashed changes
        <i class="fa-solid fa-spinner-third fa-spin" style="--fa-animation-duration: 0.75s;--fa-animation-timing: ease-in-out;"></i>
        <p class="_loading_info">Extra info</p>
    `,t.append(a),updateLoadingInfo(e),a}function updateLoadingInfo(e,a){e=document.getElementById("LOADING__"+e);e.children[1].style.display="unset",""!=a&&null!=a||(e.children[1].style.display="none"),e.children[1].innerHTML=a}function finishLoading(e){document.getElementById("LOADING__"+e).remove()}document.body.onload=()=>{"false"==localStorage.getItem("settings-allowThemes")&&document.body.setAttribute("disableThemes","true")},onAuthStateChanged(auth,async e=>{if(e&&!e.isAnonymous){let a=ref(realtime,"statuses/"+e.uid);if(console.log("alr"),onValue(a,e=>{(currentDisconnect=onDisconnect(a)).update({status:OFFLINE_TEXT,lastOnline:new Date,lastWebpage:location.pathname}).then(function(){shouldBeChecked&&realtimeUpdate(a,{status:ONLINE_TEXT,lastWebpage:location.pathname})})}),await hasBluekidPlus()){var t=document.getElementsByClassName("bkp");for(let e=0;e<t.length;e++)t[e].style.display="none"}}});class FirebaseHelper{static async getUserStatus(r){return new Promise(async(e,a)=>{var t=await realtimeGet(ref(realtime,"statuses/"+r)).catch(e=>{console.log(e),a(e)});t.exists()&&null!=t.val().status?e({status:t.val().status,lastOnline:t.val().lastOnline,lastWebpage:t.val().lastWebpage,ingame:t.val().ingame}):e({status:OFFLINE_TEXT,lastOnline:null})})}static async getUserMetadata(t){return new Promise(async(e,a)=>{e((await fetch("https://bluekidapi.netlify.app/.netlify/functions/api/user/profile/",{headers:{user:t,"Content-Type":"application/json"}}).then(async e=>e.json())).data)})}static async getUserData(t){return new Promise(async(e,a)=>{e((await getDoc(doc(db,"users",t)).catch(e=>{console.log(e),a(e)})).data())})}static async getBadges(t){return new Promise(async(e,a)=>{e((await httpsCallable(functions,"getBadges")(t)).data)})}}let HOSTING_VERSION="0.0.0-Unavailable",firefoxHtml=`
    <div id="firefoxWarningthing">
        <i class="fa-light fa-triangle-exclamation"></i>
    </div>
    <dialog id="firefoxWarning">
        <h1>Firefox is experimental</h1>
        <p>I, the developer, have recently switched to FireFox. Opon entering, a lot of the UI was messed up. If something looks off, just blame your browser.<br><b>This does NOT mean to switch! I will slowly start adding more browser support in the future.</b></p>
        <form method="dialog">
            <button class="puffy_button primary">Got it</button>
        </form>
    </dialog>
`,userAgentString=navigator.userAgent,firefoxAgent=-1<userAgentString.indexOf("Firefox");firefoxAgent&&(document.body.innerHTML+=firefoxHtml,document.getElementById("firefoxWarningthing").addEventListener("click",()=>{document.getElementById("firefoxWarning").showModal()}));export{auth,db,realtime,analytics,storage,ONLINE_TEXT,OFFLINE_TEXT,KIT_COVER_LOCATION,DEVELOPER_ALLOW_LIST,MODERATOR_ALLOW_LIST,adjectiveWords,animals,supportedProviders,isLinkedWithProvider,forceOffline,insertLoadingScreen,updateLoadingInfo,finishLoading,FirebaseHelper,increment,arrayUnion,arrayRemove,linkWithPopup,onSnapshot,unlink,linkWithCredential,HOSTING_VERSION,signInAnonymously,firefoxAgent,reauthenticateWithPopup,Timestamp,hasBluekidPlus,EmailAuthProvider,reauthenticateWithCredential,functions,httpsCallable,storageref,startAfter,uploadBytes,deleteObject,listAll,onAuthStateChanged,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword,sendPasswordResetEmail,getDownloadURL,doc,getDoc,ref,onDisconnect,signOut,getDocs,updateDoc,deleteDoc,collection,query,where,limit,orderBy,setDoc,deleteUser,updateEmail,addDoc,realtimeSet,realtimeUpdate,realtimeGet,realtimeRemove,onValue};