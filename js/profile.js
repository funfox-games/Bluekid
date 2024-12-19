import { onAuthStateChanged, auth, db, doc, getDoc, signOut, forceOffline, hasBluekidPlus, FirebaseHelper, insertLoadingScreen, finishLoading, updateLoadingInfo } from "./util/firebase.js";

import { isUserVaild, UserReasons } from "./util/auth_helper.js";

import { CommunityUtilites } from "./profile/community.js";

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
    return new Promise(async (res, rej) => {
        const badges = await FirebaseHelper.getBadges(uid);
        for (let i = 0; i < badges.length; i++) {
            const badgeName = badges[i];
            const clone = document.getElementById("badgeex").cloneNode(true);
            clone.id = "";
            clone.title = badgeName;
            const friendlyName = badgeName.replace(" ", "");
            clone.children[0].src = `../asset/badges/${friendlyName}.png`;
            if (friendlyName == "BluekidPlus") {
                clone.classList.add("badge--bkp");
            }

            document.getElementById("badges").appendChild(clone);
        }
        res();
    });
}

onAuthStateChanged(auth, async (user) => {
    insertLoadingScreen("content", document.getElementById("content"));
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
    updateLoadingInfo("content", "Loading badges [This action can take a bit to warm up]");
    await loadBadges(uid);
    await checkVaild(user, userData);
    
    document.getElementById("username").innerText = userData.username;
    if (userData.friends != undefined) {
        document.getElementById("friends").innerHTML = userData.friends.length;
    }

    if (userData.profileBlue != null) {
        document.getElementById("pfp").src = "../asset/char/" + userData.profileBlue;
    }
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
    
    updateLoadingInfo("content", "Update friend requests");
    const friendrequests = await CommunityUtilites.getAllRequests(auth.currentUser);
    console.log(friendrequests);
    if (friendrequests != null) {
        for (let i = 0; i < friendrequests.length; i++) {
            const element = friendrequests[i];
            const data = await getDoc(doc(db, "users", element));
            if (!data.data() == null) {
                continue;
            }
            document.getElementById("noincomingfriends").style.display = "none;"
            const clone = document.getElementById("requestex").cloneNode(true);
            clone.id = "";
            clone.children[0].children[0].innerText = data.data().username;
            clone.children[0].children[1].innerHTML = element;
            clone.children[1].children[0].addEventListener("click", async () => {
                clone.children[1].children[0].innerHTML = `<i class="fa-light fa-ellipsis"></i>`;
                clone.children[1].children[0].setAttribute("disabled", "");
                await CommunityUtilites.acceptFriendReq(auth.currentUser, element);
                location.href = "./community.html";
            });
            clone.children[1].children[1].addEventListener("click", async () => {
                clone.children[1].children[1].innerHTML = `<i class="fa-light fa-ellipsis"></i>`;
                clone.children[1].children[1].setAttribute("disabled", "");
                await CommunityUtilites.ignoreFriendReq(auth.currentUser, element);
                location.href = "./community.html";
            });
            document.getElementById("incomingfriendreq").appendChild(clone);
        }
    }
    document.getElementById("logout").addEventListener("click", async () => {
        await forceOffline();
        await signOut(auth);
        location.href = "../index.html";
    })
    finishLoading("content");

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