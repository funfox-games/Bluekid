import { DEVELOPER_ALLOW_LIST, auth, db, doc, getDoc, onAuthStateChanged, updateDoc, collection, query, getDocs, where, limit, ref } from "../js/util/firebase.js";

let activeUserId;
let localBadges = [];

async function enterPassword() {
    return new Promise(async (res, rej) => {
        document.getElementById("enterPassword").showModal();

        const onunlock = () => {
            const pass = document.getElementById("passwordthing").value;

            if (btoa(pass) == "Ymx1ZWtpZGJsdWU/Pz8=") {
                res(true);
            } else {
                res(false);
            }

            document.getElementById("enterPassword").close();
        }

        document.getElementById("passwordthing").value = "";
        document.getElementById("unlock").addEventListener("click", onunlock, {once: true});
    });
}

async function banUser(uid, reason, date) {
    if (!await enterPassword()) {
        showNotification(3, "Wrong password.");
    }
    const user_ref = ref(db, `users/${uid}`);
    let banData = {
        reason          
    };
    if (date != null) {
        banData.endsOn = date;
    }
    await updateDoc(user_ref, {
        banned: banData
    });
    showNotification(4, `Banned! [${date == null ? 'PERM' : "TEMP"}]`);
}

async function unbanUser(uid) {
    if (!await enterPassword()) {
        showNotification(3, "Wrong password.");
    }
    const user_ref = ref(db, `users/${uid}`);
    await updateDoc(user_ref, {
        banned: null
    });
    showNotification(4, `Unbanned!`);
}

async function loadUser(uid) {
    const userRef = doc(db, "users", uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
        showNotification(3, "User not found.");
        return;
    }
    activeUserId = uid;

    document.getElementById("username__search").innerText = userData.data().username;
    document.getElementById("limitedAccess").checked = userData.data().limitedAccess || false;
    document.getElementById("tokens").value = userData.data().tokens || 0;
    localBadges = userData.data().badges || [];
    console.log(localBadges);
    document.getElementById("badgecontainer").innerHTML = "";
    for (let i = 0; i < localBadges.length; i++) {
        const clone = document.getElementById("badgeex").cloneNode(true);
        clone.src = "../asset/badges/" + localBadges[i].replace(" ", "") + ".png";
        clone.title = localBadges[i];
        clone.id = localBadges[i].replace(" ", "");
        document.getElementById("badgecontainer").appendChild(clone);
    }
    document.getElementById("userdata__searchSuccess").removeAttribute("hide");
}

function addBadge(bid) {
    if (localBadges.includes(bid)) {
        return;
    }
    localBadges.push(bid);
    const clone = document.getElementById("badgeex").cloneNode(true);
    clone.src = "../asset/badges/" + bid.replace(" ", "") + ".png";
    clone.title = bid += " | Added locally";
    clone.id = bid.replace(" ", "");
    clone.style.backgroundColor = `rgba(0,255,0, .25)`;
    document.getElementById("badgecontainer").appendChild(clone);
}
function removeBadge(bid) {
    document.getElementById(bid.replace(" ", "")).title += " | Deleted locally";
    document.getElementById(bid.replace(" ", "")).style.backgroundColor = `rgba(255,0,0, .25)`;
    localBadges.splice(localBadges.indexOf(bid));
}
async function update() {
    if (!await enterPassword()) {
        showNotification(3, "Wrong password.");
        return;
    }

    const userRef = doc(db, "users", activeUserId);

    await updateDoc(userRef, {
        badges: localBadges,
        limitedAccess: document.getElementById("limitedAccess").checked,
        tokens: parseInt(document.getElementById("tokens").value)
    });

    showNotification(4, "Successfully updated data! [changes not reflected]");
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        alert("Permission denied.");
        location.href = "../index.html";
        return;
    }
    if (!DEVELOPER_ALLOW_LIST.includes(user.uid)) {
        alert("Permission denied.");
        location.href = "../index.html";
        return;
    }

    document.getElementById("userDataSearch").addEventListener("click", () => {
        loadUser(document.getElementById("userDataUid").value);
    });
    document.getElementById("addBadge").addEventListener("click", () => {
        addBadge(document.getElementById("badgename").value);
    })
    document.getElementById("removeBadge").addEventListener("click", () => {
        removeBadge(document.getElementById("badgename").value);
    })
    document.getElementById("update").addEventListener("click", update);

    document.getElementById("userSearch").addEventListener("click", async () => {
        const username = document.getElementById("userSearchName").value;

        document.getElementById("searchuid").innerHTML = "Loading...";

        const col = collection(db, "users");
        let q = query(col, where("username", "in", [username, username.toLowerCase(), username.toUpperCase()]), limit(10));
        const all = await getDocs(q);
        let allDocs = [];
        all.forEach((doc) => {
            allDocs.push(doc);
        });
        console.log(allDocs[0]);

        if (allDocs.length == 0) {
            document.getElementById("searchuid").innerHTML = "Empty.";
            return;
        }
        document.getElementById("searchuid").innerHTML = "";
        for (let i = 0; i < allDocs.length; i++) {
            if (i == allDocs.length) {
                document.getElementById("searchuid").innerHTML += allDocs[i].id;
                break;
            }
            document.getElementById("searchuid").innerHTML += allDocs[i].id + ", ";
        }
    });
    document.getElementById("banProceed") // TODO: finish
})