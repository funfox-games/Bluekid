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

import { getFirestore, doc, collection, getDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

import * as __data from "../../asset/blues.json" assert { type: "json" };

var pack_data = __data.default;

var cachedBlues = null;
var allAddedSections = [];

var currentlySelected = "";
var currentAmount = -1;

async function getAllUserBlues(uid) {
    return new Promise(async (res, rej) => {
        if (cachedBlues != null) {
            res(cachedBlues);
            return;
        }
        var blues = collection(db, "users", uid, "blues");
        var snapshot = await getDocs(blues);
        var all = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            all.push({
                id,
                data
            });
        });
        cachedBlues = all;
        res(all);
    });
}
async function updateBluesAmount(id, subtract) {
    return new Promise(async (res) => {
        document.getElementById("transaction").showModal();
        var newamount = 0;
        for (let i = 0; i < cachedBlues.length; i++) {
            if (cachedBlues[i].id == id) {
                console.log(cachedBlues[i].data.amount, subtract);
                newamount = cachedBlues[i].data.amount - subtract;
                cachedBlues[i].data.amount = newamount;
                break;
            }
        }

        var docref = doc(db, "users", auth.currentUser.uid, "blues", currentlySelected);
        await updateDoc(docref, {
            amount: newamount
        });

        document.getElementById("preview_amount").innerHTML = newamount + " Owned";
        document.getElementById("transaction").close();
        res(newamount);
    })
}

function createSection(id) {
    if (!allAddedSections.includes(id) && !allAddedSections.includes("undefined")) {
        var setid = "undefined";
        const header = document.createElement("h2");
        if (id == undefined || pack_data.packs[id] == undefined) {
            header.innerHTML = "Bugged Blues";
            allAddedSections.push("undefined");
        } else {
            header.innerHTML = pack_data.packs[id].display_name;
            allAddedSections.push(id);
            setid = id;
        }
        document.getElementById("allBlues").append(header);
        const sect = document.getElementById("sectex").cloneNode(true);
        sect.id = setid;
        document.getElementById("allBlues").append(sect);
    }
}
function clickListener(obj) {
    obj.addEventListener("click", async () => {
        if (obj.getAttribute("given") == null) {return;}
        currentlySelected = obj.id;

        if (pack_data.blues[obj.id] == undefined) {
            document.getElementById("preview_img").src = "../asset/char/blue_notexture.png";
        } else {
            document.getElementById("preview_img").src = "../asset/char/" + pack_data.blues[obj.id].imgPath;
        }
        
        document.getElementById("preview_name").innerHTML = obj.id;
        const blues = await getAllUserBlues(auth.currentUser.uid);
        for (let i = 0; i < blues.length; i++) {
            if (blues[i].id == obj.id) {
                console.log(blues[i]);
                document.getElementById("preview_amount").innerHTML = blues[i].data.amount + " Owned";
                currentAmount = blues[i].data.amount;
                break;
            }
        }

    });
}

function getPriceFromRarity(rarity) {
    switch (rarity.toLocaleLowerCase()) {
        case "common":
            return 2;
        case "uncommon":
            return 5;
        case "rare":
            return 25;
        case "lengendary":
            return 75;
        case "mystical":
            return 200;
    }
}

function resetPreview() {
    currentlySelected = "";
    currentAmount = 0;
    document.getElementById("preview_name").innerHTML = "None selected.";
    document.getElementById("preview_amount").innerHTML = "0 Owned";
    document.getElementById("preview_img").src = "../asset/char/blue_notexture.png";
}

function sellBluePopup() {
    const data = pack_data.blues[currentlySelected];
    if (data == null) {
        document.getElementById("bugged").showModal();
        return;
    }
    const amount = getPriceFromRarity(data.rarity);
    console.log(currentlySelected, data);
    document.getElementById("sell_name").innerHTML = currentlySelected;
    document.getElementById("sell_price").innerHTML = amount;
    document.getElementById("sell_amount").max = currentAmount;
    document.getElementById('sell_amount').value = "1";

    document.getElementById("sellblue").showModal();
}

async function sellBlue() {
    const data = pack_data.blues[currentlySelected];
    const amount = getPriceFromRarity(data.rarity);
    const amountToSell = parseInt(document.getElementById("sell_amount").value);
    if (amountToSell == 0) {
        showNotification(3, `Canceled sell.`);
        return;
    }
    if (amountToSell.toString() == "NaN") {
        showNotification(3, "Can't sell NaN blues");
        return;
    }

    const doc__ = doc(db, "users", auth.currentUser.uid);

    const doccc = await getDoc(doc__);
    const tokens = doccc.data().tokens;

    console.log(tokens, amount * amountToSell);

    var newTokenAmount = tokens + (amount * amountToSell)
    await updateDoc(doc__, {
        tokens: newTokenAmount
    });
    showNotification(4, `You now have <b>${newTokenAmount.toLocaleString()}</b> tokens! (+${amountToSell * amount})`);
    var newBlueAmount = await updateBluesAmount(currentlySelected, amountToSell);
    if (newBlueAmount == 0) {
        document.getElementById(currentlySelected).removeAttribute("given");
        resetPreview();
        return;
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }
    var uid = user.uid;
    var allBlues = pack_data.blues;

    Object.entries(allBlues).forEach(([key, val]) => {
        var blue = key;
        var data = val;
        // console.log(data);
        if (blue == "//") {return;}

        createSection(data.pack);

        const clone = document.getElementById("bluex").cloneNode(true);
        clone.id = blue;
        if (pack_data.blues[blue] == undefined) {
            clone.children[0].src = "../asset/char/blue_notexture.png";
        } else {
            clone.children[0].src = "../asset/char/" + pack_data.blues[blue].imgPath;
        }
        clickListener(clone);
        if (data.pack == undefined) {
            document.getElementById("undefined").append(clone);
        } else {
            document.getElementById(data.pack).append(clone);
        }
    });

    var userBlues = await getAllUserBlues(uid);
    for (let i = 0; i < userBlues.length; i++) {
        var blue = userBlues[i].id;
        var data = userBlues[i].data;

        if (data.amount <= 0) {
            continue;
        }

        if (data.pack == "memes") {
            data.pack = "meme";
        }

        createSection(data.pack);
        if (document.getElementById(blue) == undefined) {
            createSection("undefined");
            const clone = document.getElementById("bluex").cloneNode(true);
            clone.id = blue;
            if (pack_data.blues[blue] == undefined) {
                clone.children[0].src = "../asset/char/blue_notexture.png";
            } else {
                clone.children[0].src = "../asset/char/" + pack_data.blues[blue].imgPath;
            }
            clickListener(clone);
            document.getElementById("undefined").append(clone);
        }
        document.getElementById(blue.toString()).setAttribute("given", "");
    }

    document.getElementById("sell").addEventListener("click", sellBluePopup);
    document.getElementById("info").addEventListener("click", () => {
        const data = pack_data.blues[currentlySelected];
        if (data == null) {
            document.getElementById("bugged").showModal();
            return;
        }
        const amount = getPriceFromRarity(data.rarity);
        document.getElementById("info_icon").src = "../asset/char/" + data.imgPath;
        document.getElementById("info_name").innerHTML = currentlySelected;
        document.getElementById("info_price").innerHTML = amount;
        document.getElementById("info_rarity").innerHTML = data.rarity;
        document.getElementById("info_chance").innerHTML = data.chance + "%";

        document.getElementById("blueInfo").showModal();
    });
    document.getElementById("sellbtn").addEventListener("click", sellBlue);

    document.getElementById("loading").style.display = "none";
});