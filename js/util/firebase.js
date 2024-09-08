import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
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

import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser, updateEmail, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
export const auth = getAuth();

import { getFirestore, doc, getDoc, getDocs, updateDoc, deleteDoc, collection, query, where, limit, orderBy, setDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
export const db = getFirestore(app);

import { getDatabase, ref, set as realtimeSet, update as realtimeUpdate, get as realtimeGet, remove as realtimeRemove, onDisconnect, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
export const realtime = getDatabase(app);

import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
export const analytics = getAnalytics(app);

import { getStorage, ref as storageref, uploadBytes, getDownloadURL, deleteObject, listAll } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
export const storage = getStorage();

export const ONLINE_TEXT = "Online";
export const OFFLINE_TEXT = "Offline";

export const KIT_COVER_LOCATION = "kit/cover";

let currentDisconnect;
let shouldBeChecked = true;

export const DEVELOPER_ALLOW_LIST = ["SfgsyTdWadMcWNkoKzMcr5vZANz1"];
export const MODERATOR_ALLOW_LIST = ["SfgsyTdWadMcWNkoKzMcr5vZANz1"];

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

onAuthStateChanged(auth, (user) => {
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
}

const HOSTING_VERSION = "1.0.0-alpha.1"

// Not added: 
export { HOSTING_VERSION, storageref, uploadBytes, deleteObject, listAll, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail, getDownloadURL, doc, getDoc, ref, onDisconnect, signOut, getDocs, updateDoc, deleteDoc, collection, query, where, limit, orderBy, setDoc, deleteUser, updateEmail, addDoc, realtimeSet, realtimeUpdate, realtimeGet, realtimeRemove, onValue };