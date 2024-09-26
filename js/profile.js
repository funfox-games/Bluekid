import { onAuthStateChanged, auth, db, doc, getDoc, signOut, forceOffline } from "./util/firebase.js";

import { isUserVaild, UserReasons } from "./util/auth_helper.js";

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
        if (USER_CONFIRMATION_CHECK.reason != UserReasons.EMAIL_NOT_VERIFIED) {
            document.getElementById("notemailverified").remove();
        }
        if (USER_CONFIRMATION_CHECK.reason == UserReasons.OTHER) {
            showNotification(3, "Something went wrong checking user info. Continuing as normal.");
        }

        res();
    });
}

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
    let amountToShow = Math.max;
    console.log(w);
    // if (w < 1450) {
    //     amountToShow = 4;
    // }
    // if (w < 1365) {
    //     amountToShow = 3;
    // }
    // if (w < 1125) {
    //     amountToShow = 2;
    // }
    // if (w < 1000) {
    //     amountToShow = 1;
    // }
    // if (w < 900) {
    //     amountToShow = 0;
    // }
    // const children = document.getElementById("badges").children;
    // for (let i = 0; i < children.length; i++) {
    //     const child = children[i];
    //     if (child.id == "badgeex" || child.id == "showAllBadges") {continue;}
    //     child.remove();
    // }

    var isOwner = false;
    for (let i = 0; i < cachedBadges.length; i++) {
        const badgeName = cachedBadges[i];
        const clone = document.getElementById("badgeex").cloneNode(true);
        clone.id = "";
        clone.title = badgeName;
        const friendlyName = badgeName.replace(" ", "");
        clone.children[0].src = `../asset/badges/${friendlyName}.png`;
        // clone.children[1].innerHTML = badgeName;
        if (friendlyName == "OfficialCreator") {
            isOwner = true;
        }

        if (i >= amountToShow) {
            document.getElementById("showAllBadges").style.display = "unset";
            document.getElementById("badges2").appendChild(clone.cloneNode(true));
            continue;
        }

        document.getElementById("badges").appendChild(clone);
        document.getElementById("badges2").appendChild(clone.cloneNode(true));
    }
    if (!isOwner) {
        document.getElementById("dev").remove();
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
    document.getElementById("username").innerText = userData.username;
    if (userData.friends != undefined) {
        document.getElementById("friends").innerHTML = userData.friends.length;
    }

    loadBadges(uid);

    var time = (Date.parse(userData.creation) - new Date()); // milliseconds between now & user creation
    var diffDays = -Math.floor(time / 86400000); // days
    document.getElementById("accountAge").innerHTML = diffDays;
    document.getElementById("accountAge").title = (userData.creation.toLocaleString());
    document.getElementById("tokens").innerHTML = userData.tokens.toLocaleString();
    
    if (userData.version == 2) {
        document.getElementById("datav2").remove();
    } else {
        document.getElementById("datav2Popup").showModal();
    }
    

    document.getElementById("logout").addEventListener("click", async () => {
        await forceOffline();
        await signOut(auth);
        location.href = "../index.html";
    })

    // document.getElementById("sendsuggestion").addEventListener("click", async () => {
    //     const suggestion = document.getElementById("suggestion").value;
    //     document.getElementById("sendsuggestion").setAttribute("disabled", "true");
    //     document.getElementById("sendsuggestion").innerHTML = "Working...";

    //     console.log(suggestion);

    //     const url = "https://discord.com/api/webhooks/1235048946330632293/DNu3A4R9c1CAqYsYQ6MSXO_sHznV7QdiSt7shOk9Gg7jHgUzDVHBlsLsbCPItJLvpp6G";
    //     const msg = {
    //         "content": suggestion + "\n-------\nEmail: " + user.email + "\nUID: " + user.uid + "\n<@784823225737019402>",
    //         "username": userData.username + " | BluekidProfileRequest"
    //     }
    //     await fetch(url, {
    //         method: "POST",
    //         headers: {"content-type": "application/json"},
    //         body: JSON.stringify(msg)
    //     });


    //     document.getElementById("sendsuggestion").innerHTML = "Thanks!";
    // });
})