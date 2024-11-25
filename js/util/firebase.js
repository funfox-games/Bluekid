import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
const firebaseConfig = {
    apiKey: "AIzaSyDB3PJ-cXM9thcOYhajlz15b8LiirZ44Kk",
    authDomain: "bluekid-303db.firebaseapp.com",
    databaseURL: "https://bluekid-303db-default-rtdb.firebaseio.com",
    projectId: "bluekid-303db",
    storageBucket: "bluekid-303db.appspot.com",
    messagingSenderId: "207140973406",
    appId: "1:207140973406:web:888dcf699a0e7d1e30fdcf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { getAuth, reauthenticateWithPopup, onAuthStateChanged, EmailAuthProvider, signOut, sendPasswordResetEmail, deleteUser, updateEmail, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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

onAuthStateChanged(auth, async (user) => {
    if (user) {
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
        <i class="fa-solid fa-triangle-exclamation"></i>
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
export { HOSTING_VERSION, reauthenticateWithPopup, Timestamp, hasBluekidPlus, EmailAuthProvider, reauthenticateWithCredential, functions, httpsCallable, storageref, startAfter, uploadBytes, deleteObject, listAll, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail, getDownloadURL, doc, getDoc, ref, onDisconnect, signOut, getDocs, updateDoc, deleteDoc, collection, query, where, limit, orderBy, setDoc, deleteUser, updateEmail, addDoc, realtimeSet, realtimeUpdate, realtimeGet, realtimeRemove, onValue };