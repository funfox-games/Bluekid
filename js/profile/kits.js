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

import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

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
        showNotification(3, "still need to work on it (" + kitid + ")");
    })
    _delete.addEventListener("mousedown", _delete.fn = async () => {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "kits", kitid));
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
        if (authorres.exists()) {
            left_Data.children[1].innerText = authorres.data().username;
        } else {
            left_Data.children[0].innerHTML += ` <i title="The author field is not vaild. This kit is not able to be uploaded online. (To resolve, create a new kit)" class="fa-solid fa-globe fa-xs" style="color: #8f0000;"></i>`;
        }
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
        right.children[2].addEventListener("mouseup", () => {
            document.getElementById("kit_contextmenu").toggleAttribute("show");
            const rect = right.children[2].getBoundingClientRect();
            const contextrect = document.getElementById("kit_contextmenu").getBoundingClientRect();
            console.log(rect, contextrect);
            document.getElementById("kit_contextmenu").style.left = rect.left - 155 - 25 + "px";
            document.getElementById("kit_contextmenu").style.top = rect.top + "px";
            addContextMenuFunctionality(id, data);
        });

        elem.addEventListener("contextmenu", (e) => {
            document.getElementById("kit_contextmenu").style.left = e.pageX + "px";
            document.getElementById("kit_contextmenu").style.top = e.pageY + "px";
            document.getElementById("kit_contextmenu").toggleAttribute("show", true);
            addContextMenuFunctionality(id, data);

            e.preventDefault();
        })

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