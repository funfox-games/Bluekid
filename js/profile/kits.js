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

import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

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

let cachedkits;

function wait(sec) {
    return new Promise((res) => {
        setTimeout(() => res(), sec * 1000);
    });
}
function filterChange(type) {
    const children = document.getElementById("kits").children;
    // console.log(cachedkits);
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id == "example") { continue; }
        child.style.display = "flex";
    }

    switch (type) {
        case 'ownedByMe':
            //haha
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.id == "example") {continue;}
                cachedkits.forEach((document_) => {
                    const data = document_.data();
                    const id = document_.id;
                    if (child.id != id) {return;}
                    if (data.author != auth.currentUser.uid) {
                        child.style.display = "none";
                    }
                })
            }
            break;
        case 'sharedWithMe':
            //haha
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.id == "example") { continue; }
                cachedkits.forEach((document_) => {
                    const data = document_.data();
                    const id = document_.id;
                    if (child.id != id) { return; }
                    if (data.author == auth.currentUser.uid) {
                        child.style.display = "none";
                    }
                })
            }
            break;
        case 'favorites':
            //haha
            showNotification(3, "no.");
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.id == "example") { continue; }
                child.style.display = "none";
            }
            break;
        default:
            break;
    }
}
function addContextMenuFunctionality(kitid, kitdata) {
    const contextmenu = document.getElementById("kit_contextmenu");
    const iconbtns = contextmenu.children[0];

    const favorite = iconbtns.children[0];
    const share = iconbtns.children[1];
    const _delete = iconbtns.children[2];
    //Icon buttons
    favorite.removeEventListener("mousedown", favorite.fn);
    share.removeEventListener("mousedown", share.fn);
    _delete.removeEventListener("mousedown", _delete.fn);
    favorite.addEventListener("mousedown", favorite.fn = () => {
        showNotification(3, "ehhh (" + kitid + ")");
    })
    share.addEventListener("mousedown", share.fn = () => {
        navigator.clipboard.writeText("https://bluekid.netlify.app/profile/kit/view?id=" + kitid);
        showNotification(4, "Copied to clipboard!");
    })
    _delete.addEventListener("mousedown", _delete.fn = async () => {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "kits", kitid));
        await deleteDoc(doc(db, "kits", kitid));
        showNotification(4, "Delete success!");
        document.getElementById(kitid).remove();
    });
    //Full buttons
    const editbtn = contextmenu.children[1];
    const exportBtn = contextmenu.children[2];
    const cloneBtn = contextmenu.children[3];
    editbtn.removeEventListener("mousedown", editbtn.fn);
    exportBtn.removeEventListener("mousedown", exportBtn.fn);
    cloneBtn.removeEventListener("mousedown", cloneBtn.fn);
    editbtn.addEventListener("mousedown", editbtn.fn = () => {
        location.href = "./kit/edit.html?id=" + kitid;
    })
    exportBtn.addEventListener("mousedown", exportBtn.fn = () => {
        showNotification(3, "no (" + kitid + ")");
    })
    cloneBtn.addEventListener("mousedown", cloneBtn.fn = async () => {
        showNotification(3, "waht?? (" + kitid + ")");
    });
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
    var allKits = await collection(db, "users", uid, "kits");
    var kits = await getDocs(allKits);
    if (kits.empty == true) {
        document.getElementById("loading").style.display = "none";
        return;
    }
    document.getElementById("nokits").remove();
    cachedkits = kits;
    kits.forEach(async (document_) => {
        const data = document_.data();
        const id = document_.id;
        
        const elem = document.getElementById("example").cloneNode(true);
        elem.id = id;
        const left = elem.children[0];

        if (data.cover != undefined) {
            left.children[0].children[0].src = data.cover;
        }
        const left_Data = left.children[1];
        left_Data.children[0].innerText = data.displayname;
        left_Data.children[1].innerText = data.author;
        var authordoc = doc(db, "users", data.author);
        var authorres = await getDoc(authordoc);
        
        // if (data.author)
        
        left_Data.children[2].innerHTML = `<i id="private_indicator" class="fa-solid fa-lock"></i> Unshared`;
        console.log(data.visibility);
        switch (data.visibility) {
            case "private":
                console.log("private");
                break;
            case "friends":
                console.log("friends");
                left_Data.children[2].innerHTML = `<i class="fa-solid fa-user-group"></i> Friends only`;
                break;
            case "public":
                console.log("world");
                left_Data.children[2].innerHTML = `<i class="fa-solid fa-globe"></i> Public`;
                break;
            default:
                break;
        }

        const right = elem.children[1];
        right.children[0].addEventListener("click", () => {
            showNotification(3, "Not ready for testing. Check back later.");
        });
        right.children[1].addEventListener("click", () => {
            location.href = "./kit/edit.html?id=" + id;
        });
        right.children[2].addEventListener("click", async () => {
            right.children[2].innerHTML = `<i class="fa-solid fa-gear fa-spin"></i> Working...`;
            right.children[2].setAttribute("disabled", "");
            const docref = doc(db, "kits", id);
            await setDoc(docref, {
                kitId: id,
                ownerUid: auth.currentUser.uid
            });
            document.getElementById("publishedKit").showModal();
            document.getElementById("share_kit").removeEventListener("click", document.getElementById("share_kit").fn);
            document.getElementById("share_kit").addEventListener("click", document.getElementById("share_kit").fn = () => {
                navigator.clipboard.writeText("https://bluekid.netlify.app/profile/kit/view?id=" + id);
                showNotification(4, "Copied to clipboard!");
            })

            right.children[2].remove();
        })
        right.children[3].addEventListener("mouseup", () => {
            document.getElementById("kit_contextmenu").toggleAttribute("show");
            const rect = right.children[3].getBoundingClientRect();
            const contextrect = document.getElementById("kit_contextmenu").getBoundingClientRect();
            console.log(rect, contextrect);
            document.getElementById("kit_contextmenu").style.left = rect.left - 155 - 25 + "px";
            document.getElementById("kit_contextmenu").style.top = rect.top + "px";
            addContextMenuFunctionality(id, data);
        });

        const publicDocData = await getDoc(doc(db, "kits", id));
        if (data.visibility == "private") {
            right.children[2].remove();
        } else {
            if (publicDocData.exists()) {
                right.children[2].remove();
            }
        }

        elem.addEventListener("contextmenu", (e) => {
            if (elem.hasAttribute("disablecontextmenu")) {return;}
            document.getElementById("kit_contextmenu").style.left = e.pageX + "px";
            document.getElementById("kit_contextmenu").style.top = e.pageY + "px";
            document.getElementById("kit_contextmenu").toggleAttribute("show", true);
            addContextMenuFunctionality(id, data);

            e.preventDefault();
        })

        if (authorres.exists()) {
            left_Data.children[1].innerText = authorres.data().username;
        } else {
            right.style.fontSize = "1.75rem";
            right.style.textAlign = "right";
            right.innerHTML = "This kit is bugged.<br>Upgrade to DATAV2 to repair.";
            elem.setAttribute("disablecontextmenu", "true");
            left_Data.children[0].innerHTML += ` <i title="The author field is not vaild. This kit is not able to be uploaded online. (To resolve, create a new kit)" class="fa-solid fa-globe fa-xs" style="color: #8f0000;"></i>`;
        }

        document.getElementById("kits").append(elem);
    });
    document.body.addEventListener("mousedown", () => {
        document.getElementById("kit_contextmenu").removeAttribute("show");
    })
    const group = document.getElementById("kit_filter_group").children;
    for (let i = 0; i < group.length; i++) {
        const elem = group[i];
        elem.addEventListener("click", () => {
            for (let ii = 0; ii < group.length; ii++) {
                const elem = group[ii];
                elem.removeAttribute("selected");
            }
            elem.setAttribute("selected", "true");
            filterChange(elem.id);
        });
    }
    document.getElementById("loading").style.display = "none";
})