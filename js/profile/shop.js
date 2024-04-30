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

import { getFirestore, doc, getDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

import packdata from "../../asset/blues.json" assert { type: "json" };;

const allPacks = packdata.packs;
let localCost = 0;
let isSaving = false;
const confetti = new JSConfetti();

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
        await updateDoc(docref, {
            tokens: localCost
        });
        isSaving = false;
        console.log("save success");
        res();
    });
}

async function buyPack(id) {
    const cost = allPacks[id].cost;
    if (isSaving) {showNotification(3, "Trying to save. Please try again."); return;}
    if (cost > localCost) { showNotification(3, "Not enough tokens!"); return;}
    // localCost -= cost;
    const packblues = packdata.packs[id].blues;
    const rarities = [];
    Object.entries(packblues).forEach((val, idx) =>{
        const data = packdata.blues[val[1]];
        rarities.push(data.chance);
    })
    const blue = weighted_random(packblues, rarities);
    // saveLocalCoins();
    startAnimationSequence("../asset/packs/" + allPacks[id].graphic, blue, packdata.blues[blue]);
}

async function startAnimationSequence(packimg, blue, bluedata) {
    const outside = document.getElementById("unlockScreen");
    const center = document.getElementById("unlockcenter");
    center.children[0].src = packimg;
    document.getElementById("unlockedimg").src = "../asset/char/" + bluedata.imgPath;
    document.getElementById("unlockedName").innerHTML = blue;
    document.getElementById("unlockedRarity").innerHTML = bluedata.rarity + ` (${bluedata.chance}%)`;
    console.log(bluedata);
    outside.removeAttribute("hide");
    await wait(.5);
    center.setAttribute("shake", "");
    await wait(1);
    center.removeAttribute("shake");
    center.setAttribute("leaveframe", "");
    await wait(.5);
    if (bluedata.chance <= 1) {
        confetti.addConfetti();
    }
    center.removeAttribute("leaveframe");
    center.setAttribute("hide", "");
    await wait(1);
    outside.setAttribute("hide", "");
    center.removeAttribute("hide");
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
                bottom.children[0].innerHTML = `<i title="Limited time! Click the info button to learn more." class="fa-solid fa-clock fa-xs"></i> ` + display;
            }
            bottom.children[1].innerHTML = "Cost: " + cost;
            bottom.children[2].children[0].addEventListener("click", () => { buyPack(id); bottom.children[2].children[0].blur() });
            bottom.children[2].children[1].addEventListener("click", () => showPackInfo(id));

            document.getElementById("allPacks").append(elem);
        });
        res();
    });
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    var data = await getDoc(doc_).then((res) => {
        return res.data();
    });

    await addAllPacks();

    localCost = data.tokens;
    console.log(localCost);
});