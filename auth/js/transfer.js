import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
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

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
const auth = getAuth();

import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

import { getRedirectUrl } from "../../js/util/redirectUrl.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        document.getElementById("login_a").href = "login.html?redirect=" + getRedirectUrl();
        document.getElementById("transfer").style.display = "none";
        document.getElementById("login").style.display = "unset";
        return;
    }
    const userData = doc(db, "users", user.uid);
    const data = await getDoc(userData).then((res) => res.data());
    if (data.version != undefined && data.version == 2) {
        document.getElementById("already").style.display = "unset";
        document.getElementById("transfer").style.display = "none";
    }
});

document.getElementById("upgrade").addEventListener("click", () => {
    document.getElementById("transfere").showModal();
});