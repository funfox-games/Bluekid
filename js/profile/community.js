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

import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, limit, orderBy } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

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
            await updateFriends(auth.currentUser.uid, request);
            clone.remove();
            location.reload();
        });
        clone.children[1].children[1].addEventListener("click", async () => {
            clone.children[1].children[1].innerHTML = "Working...";
            clone.children[1].children[1].setAttribute("disabled", "true");
            // Remove sent request from other user
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

            showNotification(4, "Success! Some factors may not be updated so please refresh.");
            clone.remove();
        });
        clone.children[1].children[2].addEventListener("click", async () => {
            // Block
            showNotification(3, "no. not yet");
        });

        document.getElementById("allRequests").append(clone);
    }
}
async function loadSentRequests(data) {
    const sentRequests = data.sentRequests;

    if (sentRequests == undefined) {return;}

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
}
async function loadFriends(data) {
    const friends = data.friends;
    console.log(friends);

    if(friends == undefined) {return;}

    for (let i = 0; i < friends.length; i++) {
        if (document.getElementById("nofriends") != null) {
            document.getElementById("nofriends").remove();
        }
        const friend = friends[i];
        const friendd = await getDoc(doc(db, "users", friend)).then((res) => { return res });
        const frienddata = friendd.data();

        const clone = document.getElementById("friendex").cloneNode(true);
        clone.id = "";
        if (friendd.exists() == false) {
            clone.children[0].children[0].innerText = "[DELETED ACCOUNT]";
            clone.children[0].children[1].innerText = "UID: unknown";


        } else {
            clone.children[0].children[0].innerText = frienddata.username;
            clone.children[0].children[1].innerText = "UID: " + friend;

        }
        clone.children[1].children[0].addEventListener("click", async () => {
            // clone.children[1].children[0].innerHTML = "Working...";
            // clone.children[1].children[0].setAttribute("disabled", "true");
            // Unfriend
        });

        document.getElementById("allFriends").append(clone);
    }
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
        res(allDocs);
    });
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }

    let currentFriendUid = "";

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

        const doc_ = doc(db, "users", user.uid);

        /**
         * @type {Array}
         */
        const allFriends = await getDoc(doc_).then((res) => {
            return res.data().sentRequests
        });
        if (allFriends == undefined || allFriends == []) {
            await updateDoc(doc_, {
                sentRequests: [currentFriendUid]
            })
        } else {
            allFriends.push(currentFriendUid);
            await updateDoc(doc_, {
                sentRequests: allFriends
            });
        }

        let requestingPerson = await getDoc(doc(db, "users", currentFriendUid)).then((res) => {
            return res.data().requests;
        });

        if (requestingPerson == undefined) {
            requestingPerson = [];
        }
        const requests = requestingPerson;
        requests.push(user.uid);
        await updateDoc(doc(db, "users", currentFriendUid), {
            requests
        });

        location.reload();
    });
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

            if (!document.getElementById("allowFriends").checked && data.friends.includes(auth.currentUser.uid)) {
                continue;
            }

            const clone = document.getElementById("queryedex").cloneNode(true);
            clone.id = "";
            const top = clone.children[0];
            const usernamediv = top.children[0];
            usernamediv.children[0].innerText = data.username;
            top.children[1].innerHTML = "Friends: " + data.friends.length;
            for (let ii = 0; ii < data.badges.length; ii++) {
                const badge = data.badges[ii];
                const newImg = document.createElement("img");
                newImg.src = "../asset/badges/" + badge.replace(" ", "") + ".png";
                newImg.width = "24";
                newImg.alt = badge;
                newImg.title = badge;
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

    const userdoc = doc(db, "users", user.uid);
    const data = await getDoc(userdoc).then((res) => {
        return res.data();
    });
    loadFriendRequests(data);
    loadSentRequests(data);
    loadFriends(data);
});