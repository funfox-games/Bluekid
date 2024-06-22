import { onAuthStateChanged, auth, db, doc, getDoc, getDocs, setDoc, updateDoc, collection } from "../util/firebase.js";

import packdata from "../../asset/blues.json" with { type: "json" };
import { isUserVaild, UserReasons } from "../util/auth_helper.js";

async function checkVaild(user, userData) {
    return new Promise(async (res, rej) => {

        const USER_CONFIRMATION_CHECK = isUserVaild(user, userData);
        if (USER_CONFIRMATION_CHECK.reason == UserReasons.OVERDUE) {
            location.href = "../auth/overdue.html";
            return;
        }
        if (USER_CONFIRMATION_CHECK.reason == UserReasons.BANNED) {
            const popup = document.createElement("dialog");
            popup.innerHTML = `
            <h1>You're banned.</h1>
            <p>Reason: ${USER_CONFIRMATION_CHECK.banReason}</p>
            <br>
            <b>You can resolve this by contacting the developer.</b>
            <button class="puffy_button danger" id="logout__ban">Logout</button>
        `;
            document.body.append(popup);
            popup.showModal();
            document.getElementById("logout__ban").addEventListener("click", async () => {
                await signOut(auth);
                location.href = "../index.html";
            })
            return;
        }
        if (USER_CONFIRMATION_CHECK.reason == UserReasons.TEMPBANNED) {
            const popup = document.createElement("dialog");
            const date = USER_CONFIRMATION_CHECK.endsOn.seconds * 1000;
            var createdAt = (new Date(date).getTime());
            let difference = Math.floor((createdAt - Date.now()) / 86400000);
            let timeType = "days";
            console.log(difference);
            if (difference == 0) {
                difference = Math.floor((createdAt - Date.now()) / 3600000);
                timeType = "hours";
                if (difference == 0) {
                    difference = Math.floor((createdAt - Date.now()) / 60000);
                    timeType = "minutes";
                }
            }
            popup.innerHTML = `
            <h1>You're banned.</h1>
            <p>Reason: ${USER_CONFIRMATION_CHECK.banReason}</p>
            <p>Ends in ${difference} ${timeType}.</p>
            <br>
            <b>You can resolve this sooner by contacting the developer.</b>
            <button class="puffy_button danger" id="logout__ban">Logout</button>
        `;

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
                bottom.children[0].innerHTML = `<i title="Limited time! Click the info button to learn more." class="fa-solid fa-clock fa-xs"></i> ` + display;
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
        const allBlues = await getDocs(collection(db, "users", auth.currentUser.uid, "blues"));
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
                bottom.children[2].children[1].innerHTML = `<i class="fa-solid fa-star"></i> Claimed`;
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
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    var data = await getDoc(doc_).then((res) => {
        return res.data();
    });
    await checkVaild(user, data);
    document.getElementById("allcoins").innerHTML = data.tokens.toLocaleString();
    if (localStorage.getItem("fastPackOpening") == "true") {
        document.getElementById("quickTransition").checked = true;
    }

    await addAllPacks();
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

        const url = "https://discord.com/api/webhooks/1244834902046937100/8AXTHuz1Y4CT7ru7KgQwI4HQ1SZdCxFGnlcEoAHAmcr6w0X9OQDdFNT2ZRzu2jqeq5tV";
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
    })

    localCost = data.tokens;
});