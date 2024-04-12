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

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
const auth = getAuth();

import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

var cachedBadges = null;

async function loadBadges(uid) {
    if (cachedBadges == null) {
        var badges_ref = doc(db, "users", uid);
        var badges = await getDoc(badges_ref).then((res) => {
            if (!res.exists()) {
                return null;
            }
            return res.data().badges;
        });
        if (badges == null || badges == undefined) { return; }
        cachedBadges = badges;
    }
    var w = window.innerWidth;
    let amountToShow = 5;
    console.log(w);
    if (w < 1450) {
        amountToShow = 4;
    }
    if (w < 1365) {
        amountToShow = 3;
    }
    if (w < 1125) {
        amountToShow = 2;
    }
    if (w < 1000) {
        amountToShow = 1;
    }
    if (w < 900) {
        amountToShow = 0;
    }
    // const children = document.getElementById("badges").children;
    // for (let i = 0; i < children.length; i++) {
    //     const child = children[i];
    //     if (child.id == "badgeex" || child.id == "showAllBadges") {continue;}
    //     child.remove();
    // }

    for (let i = 0; i < cachedBadges.length; i++) {
        const badgeName = cachedBadges[i];
        const clone = document.getElementById("badgeex").cloneNode(true);
        clone.id = "";
        const friendlyName = badgeName.replace(" ", "");
        clone.children[0].src = `../asset/badges/${friendlyName}.png`;
        clone.children[1].innerHTML = badgeName;

        if (i >= amountToShow) {
            document.getElementById("showAllBadges").style.display = "unset";
            document.getElementById("badges2").appendChild(clone.cloneNode(true));
            continue;
        }

        document.getElementById("badges").appendChild(clone);
        document.getElementById("badges2").appendChild(clone.cloneNode(true));
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    var userData = await getDoc(doc_).then((res) => {
        if (!res.exists()) {
            return "UNKNOWN";
        }
        return res.data();
    });
    document.getElementById("username").innerText = userData.username;

    loadBadges(uid);

    var time = (Date.parse(userData.creation) - new Date()); // milliseconds between now & user creation
    var diffDays = -Math.floor(time / 86400000); // days
    
    document.getElementById("creationDate").innerHTML = `Been a user for ${diffDays} days.`;
    document.getElementById("fullCreation").innerHTML = `Created on ${userData.creation}`;

    document.getElementById("tokens").innerHTML = `${parseInt(userData.tokens).toLocaleString()} Tokens`;

    if (userData.version == undefined) {
        document.getElementById("upgradeData").showModal();
    }

    document.getElementById("logout").addEventListener("click", async () => {
        await signOut(auth);
        location.href = "../index.html";
    })
})