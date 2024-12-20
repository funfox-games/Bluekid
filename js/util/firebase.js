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
    if (localStorage.getItem("disclaimer__" + id) == true) {
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
        <i class="fa-solid fa-spinner-third fa-spin" style="--fa-animation-duration: 0.75s;--fa-animation-timing: ease-in-out;"></i>
        <p class="_loading_info">Extra info</p>
    `;
    let creation = document.createElement("div");
    creation.className = "__loading_screen";
    creation.id = "LOADING__" + id;
    creation.innerHTML = innerHTML;
    _parent.append(creation);
    updateLoadingInfo(id);
    return creation;
}

export function updateLoadingInfo(id, info) {
    const loadingscreen = document.getElementById("LOADING__" + id);
    loadingscreen.children[1].style.display = "unset";
    if (info == "" || info == null) {
        loadingscreen.children[1].style.display = "none";
    }
    loadingscreen.children[1].innerHTML = info;
}

export function finishLoading(id) {
    document.getElementById("LOADING__" + id).remove();
}

export class FirebaseHelper {
    static async getUserStatus(uid) {
        return new Promise(async (res, rej) => {
            const result = await realtimeGet(ref(realtime, "statuses/" + uid)).catch((err) => {
                console.log(err);
                rej(err);
            });

            if (!result.exists() || result.val().status == null) {
                res({ status: OFFLINE_TEXT, lastOnline: null });
                return;
            }
            res({status: result.val().status, lastOnline: result.val().lastOnline});
        });
    }
    static async getUserMetadata(uid) {
        return new Promise(async (res, rej) => {
            const result = await fetch("https://bluekidapi.netlify.app/.netlify/functions/api/user/profile/", {
                "headers": {
                    "user": uid,
                    "Content-Type": "application/json"
                }
            }).then(async (val) => {
                return val.json();
            });
            res(result.data);
        });
        
    }
    static async getUserData(uid) {
        return new Promise(async (res, rej) => {
            const result = await getDoc(doc(db, "users", uid)).catch((err) => {
                console.log(err);
                rej(err);
            });
            res(result.data());
        });
    }

    static async getBadges(uid) {
        return new Promise(async (res, rej) => {
            const func = httpsCallable(functions, "getBadges");
            const result = await func(uid);

            res(result.data);
        });
    }
}

const HOSTING_VERSION = "1.0.0-alpha.1";

const firefoxHtml = `
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
`;

let userAgentString = navigator.userAgent;
let firefoxAgent = userAgentString.indexOf("Firefox") > -1; 

if (firefoxAgent) {
    document.body.innerHTML += firefoxHtml;
    document.getElementById("firefoxWarningthing").addEventListener("click", () => {
        document.getElementById("firefoxWarning").showModal();
    });
}

// Not added: 
export { HOSTING_VERSION, signInAnonymously, firefoxAgent, reauthenticateWithPopup, Timestamp, hasBluekidPlus, EmailAuthProvider, reauthenticateWithCredential, functions, httpsCallable, storageref, startAfter, uploadBytes, deleteObject, listAll, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail, getDownloadURL, doc, getDoc, ref, onDisconnect, signOut, getDocs, updateDoc, deleteDoc, collection, query, where, limit, orderBy, setDoc, deleteUser, updateEmail, addDoc, realtimeSet, realtimeUpdate, realtimeGet, realtimeRemove, onValue };