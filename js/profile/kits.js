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

import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);
function wait(sec) {
    return new Promise((res) => {
        setTimeout(() => res(), sec * 1000);
    });
}
function addContextMenuFunctionality(kitid, kitdata) {
    const contextmenu = document.getElementById("kit_contextmenu");
    const iconbtns = contextmenu.children[0];

    const favorite = iconbtns.children[0];
    const share = iconbtns.children[1];
    const _delete = iconbtns.children[2];
    favorite.removeEventListener("mousedown", favorite.fn);
    share.removeEventListener("mousedown", share.fn);
    _delete.removeEventListener("mousedown", _delete.fn);
    favorite.addEventListener("mousedown", favorite.fn = () => {
        showNotification(3, "ehhh (" + kitid + ")");
    })
    share.addEventListener("mousedown", share.fn = () => {
        showNotification(3, "still need to work on it (" + kitid + ")");
    })
    _delete.addEventListener("mousedown", _delete.fn =( ) => {
        showNotification(3, "it'll be here eventually(" + kitid + ")")
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
    kits.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        
        const elem = document.getElementById("example").cloneNode(true);
        elem.id = id;
        const left = elem.children[0];

        if (data.cover != undefined) {
            left.children[0].children[0].src = data.cover;
        }
        const left_Data = left.children[1];
        left_Data.children[0].innerText = data.displayname;
        left_Data.children[1].innerText = data.author;

        const right = elem.children[1];
        right.children[0].addEventListener("click", () => {
            showNotification(3, "Not ready for testing. Check back later.");
        });
        right.children[1].addEventListener("click", () => {
            showNotification(3, "waht");
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
    document.getElementById("loading").style.display = "none";
})