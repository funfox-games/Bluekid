import { onAuthStateChanged, auth, db, doc, getDoc, getDocs, updateDoc, deleteDoc, signOut, collection } from "../util/firebase.js";

import * as __data from "../../asset/blues.json" with { type: "json" };

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
        header.style.marginTop = "5px";
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

        document.getElementById("sell").innerHTML = `<i class="fa-solid fa-coins"></i> Sell`;
        if (pack_data.blues[obj.id] == undefined) {
            document.getElementById("preview_img").src = "../asset/char/blue_broken.png";
            document.getElementById("sell").innerHTML = "Remove";
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
        case "epic":
            return 50;
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
        if (currentlySelected == "") {
            document.getElementById("bugged").showModal();
            return;
        }
        document.getElementById("removename").innerText = currentlySelected;
        document.getElementById("removeamount").innerHTML = currentAmount;
        document.getElementById("removeblue").showModal();
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
    var doc_ = doc(db, "users", uid);
    var userData = await getDoc(doc_).then((res) => {
        if (!res.exists()) {
            return "UNKNOWN";
        }
        return res.data();
    });
    await checkVaild(user, userData);
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
            clone.children[0].src = "../asset/char/blue_broken.png";
        } else {
            clone.children[0].src = "../asset/char/" + pack_data.blues[blue].imgPath;
        }
        clickListener(clone);
        if (data.pack == undefined || data.pack == null || data.pack == "") {
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

        // Add outline here
        if(pack_data.blues[blue] != null) {
            const rarity = pack_data.blues[blue].rarity;
            let color = "#000000";
            switch (rarity.toLocaleLowerCase()) {
                case "common":
                    color = "#cfcfcf";
                    break;
                case "uncommon":
                    color = "#0bd900";
                    break;
                case "rare":
                    color = "#0090d9";
                    break;
                case "epic":
                    color = "#ae00ff";
                    break;
                case "lengendary":
                    color = "#ccb800";
                    break;
                case "mystical":
                    color = "#00d0f0";

                    if (pack_data.blues[blue].pack != "secret") {
                        const wheel = document.getElementById("wheelex").cloneNode(true);
                        wheel.id = "";

                        const bounding = document.getElementById(blue.toString()).getBoundingClientRect();
                        // wheel.style.right = (bounding.width / 2) - 75 + "px";
                        wheel.style.right = (bounding.width / 2) + "px";
                        wheel.style.left = (bounding.width/2) + "px";
                        
                        document.getElementById(blue.toString()).append(wheel);
                    }
                    

                    break;
                default:
                    break;
            }
            document.getElementById(blue.toString()).style.backgroundColor = color;
            document.getElementById(blue.toString()).style.border = `2px solid ${color}`;
            document.getElementById(blue.toString()).style.boxShadow = "0px 0px 10px 2px " + color;
        }
        

        if (document.getElementById(blue) == undefined) {
            createSection("undefined");
            const clone = document.getElementById("bluex").cloneNode(true);
            clone.id = blue;
            if (pack_data.blues[blue] == undefined) {
                clone.children[0].src = "../asset/char/blue_broken.png";
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
    document.getElementById("removeblue_confirm").addEventListener("click", async () => {
        document.getElementById("removeblue_confirm").innerHTML = "Waiting...";
        document.getElementById("removeblue_confirm").setAttribute("disabled", "");
        await deleteDoc(doc(db, "users", user.uid, "blues", currentlySelected));
        document.getElementById(currentlySelected).remove();
        document.getElementById("removeblue").close();
        document.getElementById("removeblue_confirm").innerHTML = "Remove (x<span id='removeamount'>1</span>)";
        document.getElementById("removeblue_confirm").removeAttribute("disabled");
    })

    document.getElementById("loading").style.display = "none";
});