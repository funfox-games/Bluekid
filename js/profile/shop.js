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

import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

import packdata from "../../asset/blues.json" assert { type: "json" };;

const allPacks = packdata.packs;

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

async function buyPack(id) {
    const cost = allPacks[id].cost;
    showNotification(3, `Placeholder, cry about it (cost: ${cost})`);
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
            bottom.children[2].children[0].addEventListener("click", () => buyPack(id));
            bottom.children[2].children[1].addEventListener("click", () => showPackInfo(id));

            document.getElementById("allPacks").append(elem);
        });
    });
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }

    await addAllPacks();
});