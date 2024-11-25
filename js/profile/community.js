import { onAuthStateChanged, auth, db, doc, getDoc, signOut, query, where, getDocs, limit, collection, FirebaseHelper, ONLINE_TEXT, updateDoc, OFFLINE_TEXT, hasBluekidPlus } from "../util/firebase.js";

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

function updateFriends(localuserid, acceptingid) {
    return new Promise(async (res, rej) => {
        const localUserData = await getDoc(doc(db, "users", localuserid)).then((res) => { return res.data() });
        let friends = [];
        let requests = [];
        if (localUserData.friends != undefined) {
            friends = localUserData.friends;
        }
        if (localUserData.requests != undefined) {
            requests = localUserData.requests;
        }
        friends.push(acceptingid);
        requests.splice(requests.indexOf(acceptingid), 1);

        const friendData = await getDoc(doc(db, "users", acceptingid)).then((res) => { return res.data() });
        let _friends = [];
        if (friendData.friends != undefined) {
            _friends = friendData.friends;
        }
        _friends.push(localuserid);

        let sentRequests = friendData.sentRequests;
        sentRequests.splice(sentRequests.indexOf(localuserid), 1);

        await updateDoc(doc(db, "users", localuserid), {
            friends,
            requests
        });
        await updateDoc(doc(db, "users", acceptingid), {
            friends: _friends,
            sentRequests
        });

        res();
    });
}
async function loadFriendRequests(data) {
    const requests = data.requests;

    if (requests == undefined) {
        document.getElementById("requestsloading").remove();
        return;
    }
    
    for (let i = 0; i < requests.length; i++) {
        if (document.getElementById("norequests") != null) {
            document.getElementById("norequests").remove();
        }
        const request = requests[i];
        const doci = await getDoc(doc(db, "users", request)).then((res) => { return res });
        const requestdata = doci.data();

        if (doci.exists() == false) {
            continue;
        }

        const clone = document.getElementById("requestex").cloneNode(true);
        clone.id = "";
            clone.children[0].children[0].innerText = requestdata.username;
        clone.children[0].children[1].innerText = "UID: " + request;
        clone.children[1].children[0].addEventListener("click", async () => {
            // Accept
            clone.children[1].children[0].innerHTML = "Working...";
            clone.children[1].children[0].setAttribute("disabled", "true");
            await CommunityUtilites.acceptFriendReq(auth.currentUser, request);
            clone.remove();
            location.reload();
        });
        clone.children[1].children[1].addEventListener("click", async () => {
            clone.children[1].children[1].innerHTML = "Working...";
            clone.children[1].children[1].setAttribute("disabled", "true");
            await CommunityUtilites.ignoreFriendReq(auth.currentUser, request);

            showNotification(4, "Success! Some factors may not be updated so please refresh.");
            clone.remove();
        });
        clone.children[1].children[2].addEventListener("click", async () => {
            // Block
            showNotification(3, "no. not yet");
        });

        document.getElementById("allRequests").append(clone);
    }

    document.getElementById("requestsloading").remove();
}
async function loadSentRequests(data) {
    const sentRequests = data.sentRequests;

    if (sentRequests == undefined) { document.getElementById("allSentRequests").append(clone); return;}

    for (let i = 0; i < sentRequests.length; i++) {
        if (document.getElementById("nosentrequests") != null) {
            document.getElementById("nosentrequests").remove();
        }
        const request = sentRequests[i];
        const doci = await getDoc(doc(db, "users", request)).then((res) => { return res });
        const requestdata = doci.data();
        if (doci.exists() == false) {
            continue;
        }

        const clone = document.getElementById("sentrequestex").cloneNode(true);
        clone.id = "";
        clone.children[0].children[0].innerText = requestdata.username;
        clone.children[0].children[1].innerText = "UID: " + request;
        clone.children[1].children[0].addEventListener("click", async () => {
            clone.children[1].children[0].innerHTML = "Working...";
            clone.children[1].children[0].setAttribute("disabled", "true");
            // Cancel
            const localuid = auth.currentUser.uid;
            
            const localdoc = doc(db, "users", localuid);
            let _sentRequests = [];
            const localdata = await getDoc(localdoc).then((doc) => {return doc.data()});
            _sentRequests = localdata.sentRequests;
            _sentRequests.splice(_sentRequests.indexOf(request), 1);
            await updateDoc(localdoc, {
                sentRequests: _sentRequests
            });

            const otherdoc = doc(db, "users", request);
            let _requests = [];
            const otherdata = await getDoc(otherdoc).then((doc) => { return doc.data() });
            _requests = otherdata.requests;
            _requests.splice(_requests.indexOf(request), 1);
            await updateDoc(otherdoc, {
                requests: _requests
            });

            showNotification(4, "Success! Some factors may not be updated so please refresh.");
            clone.remove();
        });

        document.getElementById("allSentRequests").append(clone);
    }

    document.getElementById("sentrequestsloading").remove();
}
const limitReached = async (length) => {
    const hasbkp = await hasBluekidPlus();
    return length >= 50 && !hasbkp;
}
let friendlgtnh = 0;
async function loadFriends() {
    document.getElementById("friendLoadingStatus").innerHTML = "Fetching friends...";
    const friendspromise = await fetch("https://bluekidapi.netlify.app/.netlify/functions/api/social", {
        headers: {
            user: auth.currentUser.uid,
            "Content-Type": "application/json"
        }
    });
    const friends = await friendspromise.json();
    console.log(friends);

    if (await limitReached(friends.length)) {
        document.getElementById("limitReached").setAttribute("show", "");
        document.getElementById("addfriend").setAttribute("disabled", "");
    }
    friendlgtnh = friends.length;

    for (let i = 0; i < friends.length; i++) {
        if (document.getElementById("nofriends") != null) {
            document.getElementById("nofriends").remove();
        }
        const friend = friends[i];
        const clone = document.getElementById("friendex").cloneNode(true);
        clone.children[1].href = "./user/index.html?id=" + friend.uid;
        if (friend.deleted == true) {
            // clone.children[0].children[0].innerText = "[DELETED ACCOUNT]";
            // clone.children[0].children[1].innerText = "UID: unknown";
            continue;

        }
        clone.children[1].children[0].innerText = friend.data.username;
        clone.id = friend.data.username;

        // clone.children[1].children[1].innerText = "UID: " + friend;

        const updateStatus = async () => {
            const status = await FirebaseHelper.getUserStatus(friend.uid);
            if (status.status == ONLINE_TEXT) {
                clone.children[1].children[1].innerHTML = ONLINE_TEXT;
                clone.children[1].children[1].style.color = "lime";
                if (friend.data.communitySettings && friend.data.communitySettings.privacy.showStatus == "none") {
                    clone.children[1].children[1].innerHTML = "";
                }
            }
            if (status.status == OFFLINE_TEXT) {
                const time = -(Date.parse(status.lastOnline) - new Date()); // milliseconds between now & user creation
                const diffSeconds = Math.floor(time / 1000);
                const diffMin = Math.floor(time / 60000);
                const diffDays = Math.floor(time / 86400000); // days
                const diffHours = Math.floor(time / 3.6e+6);
                const diffWeeks = Math.floor(time / 6.048e+8);
                const diffMonth = Math.floor(time / 2.628e+9);
                if (diffMonth > 0) {
                    clone.children[1].children[1].innerHTML = `Last online ${diffMonth} month${diffMonth == 1 ? '' : 's'} ago.`;
                } else if (diffWeeks > 0) {
                    clone.children[1].children[1].innerHTML = `Last online ${diffWeeks} week${diffWeeks == 1 ? '' : 's'} ago.`;
                } else if (diffDays > 0) {
                    clone.children[1].children[1].innerHTML = `Last online ${diffDays} day${diffDays == 1 ? '' : 's'} ago.`;
                } else if (diffHours > 0) {
                    clone.children[1].children[1].innerHTML = `Last online ${diffHours} hour${diffHours == 1 ? '' : 's'} ago.`;
                } else if (diffMin > 0) {
                    clone.children[1].children[1].innerHTML = `Last online ${diffMin} minute${diffMin == 1 ? '' : 's'} ago.`;
                } else if (diffSeconds > 0) {
                    clone.children[1].children[1].innerHTML = `Last online ${diffSeconds} second${diffSeconds == 1 ? '' : 's'} ago.`;
                }
                clone.children[1].children[1].style.color = "rgb(200,200,200)";
                if (friend.data.communitySettings && friend.data.communitySettings.privacy.showStatus == "none") {
                    clone.children[1].children[1].innerHTML = "";
                }
                if (friend.data.communitySettings && friend.data.communitySettings.privacy.showLastOnline == "none") {
                    clone.children[1].children[1].innerHTML = OFFLINE_TEXT;
                }
            }
        }

        setInterval(updateStatus, 5 * 1000)
        updateStatus();

        document.getElementById("allFriends").append(clone);
    }

    document.getElementById("friendsloading").remove();
}
async function searchUsers(query_username) {
    return new Promise(async (res, rej) => {
        const col = collection(db, "users");
        let q = query(col, where("username", "in", [query_username, query_username.toLowerCase(), query_username.toUpperCase()]), limit(10));
        const all = await getDocs(q);
        let allDocs = [];
        all.forEach((doc) => {
            allDocs.push(doc);
        });
        console.log(allDocs);
        res(allDocs);
    });
}
async function sendRequest(fuid) {
    return new Promise(async (res, rej) => {
        const doc_ = doc(db, "users", auth.currentUser.uid);
        /**
         * @type {Array}
         */
        const allFriends = await getDoc(doc_).then((res) => {
            return res.data().sentRequests
        });
        if (allFriends == undefined || allFriends == []) {
            await updateDoc(doc_, {
                sentRequests: [fuid]
            })
        } else {
            allFriends.push(fuid);
            await updateDoc(doc_, {
                sentRequests: allFriends
            });
        }

        let requestingPerson = await getDoc(doc(db, "users", fuid)).then((res) => {
            return res.data().requests;
        });

        if (requestingPerson == undefined) {
            requestingPerson = [];
        }
        const requests = requestingPerson;
        requests.push(auth.currentUser.uid);
        await updateDoc(doc(db, "users", fuid), {
            requests
        });
        res()
    });
}

onAuthStateChanged(auth, async (user) => {
    if (document.getElementById("COMMUNITY_PAGE") == null) {
        return;
    }
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
    let currentFriendUid = "";

    loadFriendRequests(userData);
    loadSentRequests(userData);
    loadFriends();

    let params = new URLSearchParams(document.location.search);
    (async function() {
        if (params.get("friend") == null) {
            return;
        }
        if (userData.friends != null && userData.friends.includes(params.get("friend"))) {
            document.getElementById("friendresult").innerHTML = `
                <h1><i class="fa-solid fa-check fa-lg"></i> Already friends!</h1>
                <form method="dialog">
                    <button class="puffy_button primary">Ok</button>
                </form>
            `;
            document.getElementById("friendresult").showModal();
            return
        }
        if (userData.friends != null && userData.sentRequests.includes(params.get("friend"))) {
            document.getElementById("friendresult").innerHTML = `
                <h1><i class="fa-solid fa-check fa-lg"></i> Already sent a request!</h1>
                <form method="dialog">
                    <button class="puffy_button primary">Ok</button>
                </form>
            `;
            document.getElementById("friendresult").showModal();
            return
        }
        document.getElementById("friendprocessing").showModal();
        await sendRequest(params.get("friend"));
        document.getElementById("friendprocessing").close();
        document.getElementById("friendresult").showModal();
    })();
    if (params.get("friend") != null) {
        console.log("rwarawr");
        window.history.pushState({page: location.pathname}, document.title, window.location.pathname);

    }

    document.getElementById("friendSearch").addEventListener("change", () => {
        const allfriends = document.getElementById("allFriends").children;
        for (let i = 0; i < allfriends.length; i++) {
            allfriends[i].style.display = "none";
        }
        for (let i = 0; i < allfriends.length; i++) {
            if (allfriends[i].id.includes(document.getElementById("friendSearch").value)) {
                allfriends[i].style.display = "flex";
            }
        }
    });
    const limitreach = await limitReached(friendlgtnh)
    if (limitreach == false) {
        document.getElementById("addfriend").addEventListener("click", async () => {
            document.getElementById("addfriend").innerHTML = "Working...";
            document.getElementById("addfriend").setAttribute("disabled", "true");
            const searchuid = document.getElementById("friendid").value;

            if (searchuid == user.uid) {
                showNotification(3, "You're not that lonely... aren't you?");
                document.getElementById("addfriend").innerHTML = `<i class="fa-solid fa-user-group"></i> Add friend`;
                document.getElementById("addfriend").removeAttribute("disabled");
                return;
            }

            if (searchuid == "") {
                document.getElementById("addfriend").innerHTML = `<i class="fa-solid fa-user-group"></i> Add friend`;
                document.getElementById("addfriend").removeAttribute("disabled");
                return;
            }
            var doc_ = doc(db, "users", searchuid);
            var snapshot = await getDoc(doc_).then((res) => {
                return res;
            });
            if (snapshot.exists() == false) {
                document.getElementById("addfriend").innerHTML = `<i class="fa-solid fa-user-group"></i> Add friend`;
                document.getElementById("addfriend").removeAttribute("disabled");
                return;
            }
            if (snapshot.data().communitySettings != null && snapshot.data().communitySettings.allowFriendRequests == false) {
                showNotification(3, "This person isn't accepting friend requests right now.");
                document.getElementById("addfriend").innerHTML = `<i class="fa-solid fa-user-group"></i> Add friend`;
                document.getElementById("addfriend").removeAttribute("disabled");
                return;
            }
            currentFriendUid = searchuid;
            const data = snapshot.data();
            const username = data.username;
            const friends = data.friends;
            const requests = data.requests;

            if (friends != undefined && friends.includes(user.uid)) {
                showNotification(3, `You are already friends with ${username}.`);
                document.getElementById("addfriend").innerHTML = `<i class="fa-solid fa-user-group"></i> Add friend`;
                document.getElementById("addfriend").removeAttribute("disabled");
                return;
            }
            
            if (requests != undefined && requests.includes(user.uid)) {
                showNotification(3, `You have already sent a request to ${username}.`);
                document.getElementById("addfriend").innerHTML = `<i class="fa-solid fa-user-group"></i> Add friend`;
                document.getElementById("addfriend").removeAttribute("disabled");
                return;
            }


            document.getElementById("friendingperson").innerText = username;
            document.getElementById("confirm").showModal();


            document.getElementById("addfriend").innerHTML = `<i class="fa-solid fa-user-group"></i> Add friend`;
            document.getElementById("addfriend").removeAttribute("disabled");
        });
        document.getElementById("sendrequest").addEventListener("click", async () => {
            document.getElementById("sendrequest").innerHTML = "Working...";
            document.getElementById("sendrequest").setAttribute("disabled", "");

            await sendRequest(currentFriendUid);

            location.reload();
        });
    }
    document.getElementById("searchFriends").addEventListener("click", () => {
        document.getElementById("searchuser").showModal();
    });
    document.getElementById("searchusers").addEventListener("click", async () => {
        console.log(document.getElementById("allowFriends").checked);
        const allUsers = await searchUsers(document.getElementById("username_seaching").value);

        document.getElementById("allsearched").innerHTML = "";

        for (let i = 0; i < allUsers.length; i++) {
            const data = allUsers[i].data();
            const id = allUsers[i].id;

            console.log(data);
            if (!document.getElementById("allowFriends").checked && data.friends != null && data.friends.includes(auth.currentUser.uid)) {
                continue;
            }

            const clone = document.getElementById("queryedex").cloneNode(true);
            clone.id = "";
            const top = clone.children[0];
            const usernamediv = top.children[0];
            usernamediv.children[0].innerText = data.username;
            if (data.friends == null) {
                top.children[1].innerHTML = "Friends: 0";
            } else {
                top.children[1].innerHTML = "Friends: " + data.friends.length || 0;
            }
            
            const badges = await FirebaseHelper.getBadges(id);
            console.log(badges);
            for (let ii = 0; ii < badges.length; ii++) {
                const badge = badges[ii];
                const newImg = document.createElement("img");
                newImg.src = "../asset/badges/" + badge.replace(" ", "") + ".png";
                newImg.width = "24";
                newImg.alt = badge;
                newImg.title = badge;
                if (badge == "Bluekid Plus") {
                    newImg.classList.add("badge--bkp");
                }
                usernamediv.children[1].append(newImg);
            }
            

            const interactibles = clone.children[1];
            interactibles.children[0].addEventListener("click", () => {
                document.getElementById("friendid").value = id;
                document.getElementById("searchuser").close();
            });
            

            document.getElementById("allsearched").append(clone);
        }
    });
    
});

export class CommunityUtilites {
    static async acceptFriendReq(user, uid) {
        return new Promise(async (res, rej) => {
            await updateFriends(user.uid, uid);
            res();
        });
    }

    static async ignoreFriendReq(user, uid) {
        return new Promise(async (res, rej) => {
            const localdoc = doc(db, "users", request);
            let _sentRequests = [];
            const localdata = await getDoc(localdoc).then((doc) => { return doc.data() });
            _sentRequests = localdata.sentRequests;
            _sentRequests.splice(_sentRequests.indexOf(request), 1);
            await updateDoc(localdoc, {
                sentRequests: _sentRequests
            });

            // Remove request from this user
            const otherdoc = doc(db, "users", auth.currentUser.uid);
            let _requests = [];
            const otherdata = await getDoc(otherdoc).then((doc) => { return doc.data() });
            _requests = otherdata.requests;
            _requests.splice(_requests.indexOf(request), 1);
            await updateDoc(otherdoc, {
                requests: _requests
            });
            res();
        });
    }

    static async getAllRequests(user) {
        return new Promise(async (res, rej) => {
            const data = await getDoc(doc(db, "users", user.uid));
            res(data.data().requests);
        });
    }
}