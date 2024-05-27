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

import { getFirestore, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

let currentImg = "../../asset/templates/kit_temp.png";
let userData;

import * as MediaUtil from "../util/user_media.js";

async function checkImage(url) {
    return new Promise((res, rej) => {
        var image = new Image();
        image.onload = function () {
            if (this.width > 0) {
                res();
            }
        }
        image.onerror = function () {
            rej();
        }
        image.src = url;
    })
}

async function createKit(title, description, visiblity, canclone) {
    const data = {
        "displayname": title,
        "description": description,
        "creationdate": new Date(),
        "author": auth.currentUser.uid,
        "visibility": visiblity,
        "canclone": canclone,
        "cover": currentImg
    }
    console.log(data);

    // Add document with random id
    const doc__ = await addDoc(collection(db, "users", auth.currentUser.uid, "kits"), data);

    console.log("Yippe! Kit created: " + doc__.id);
    location.href = "../kits.html";
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../../auth/login.html";
        return;
    }
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    userData = await getDoc(doc_).then((res) => {
        if (!res.exists()) {
            return "UNKNOWN";
        }
        return res.data();
    });
    console.log(new Date());
    document.getElementById("uploadurluse").addEventListener("click", async () => {
        document.getElementById("uploadurluse").innerHTML = `<i class="fa-solid fa-hourglass fa-spin"></i> Working...`;
        document.getElementById("uploadurlnovaild").style.display = "none";
        var cont = true;
        await checkImage(document.getElementById("uploadurlurl").value).catch(() => {
            document.getElementById("uploadurlnovaild").style.display = "unset";
            document.getElementById("uploadurluse").innerHTML = `<i class="fa-solid fa-file-image"></i> Use`;
            cont = false;
        });
        if (!cont) {return;}
        currentImg = document.getElementById("uploadurlurl").value;
        console.log(document.getElementById("uploadurlurl").value);

        document.getElementById("coverimg").src = currentImg;
        document.getElementById("uploadurlurl").value = "";
        document.getElementById("uploadurluse").innerHTML = `<i class="fa-solid fa-file-image"></i> Use`;
    })
    document.getElementById("uploadurl").addEventListener("click", () => {
        document.getElementById("uploadurldialog").showModal();
    });
    document.getElementById("uploadurlclose").addEventListener("click", () => {
        document.getElementById("uploadurldialog").close();
    })
    document.getElementById("createkit").addEventListener("click", () => {
        document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-hourglass fa-spin"></i> Loading...`;
        const title = document.getElementById("kittitle").value;
        const desc = document.getElementById("kitdesc").value;
        const visiblity = document.getElementById("kit_visibility").value;
        const canclone = document.getElementById("canclone").checked;

        if (MediaUtil.isLimited(title, MediaUtil.MAX_CHAR_NAME)) {
            document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-square-plus"></i> Create`;
            showNotification(3, "Title must be shorter then " + MediaUtil.MAX_CHAR_NAME + " characters. (Currently " + title.length + " characters)");
            return;
        }
        if (MediaUtil.isLimited(desc, MediaUtil.MAX_CHAR_DESCRIPTION)) {
            document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-square-plus"></i> Create`;
            showNotification(3, "Desc must be shorter then " + MediaUtil.MAX_CHAR_DESCRIPTION + " characters. (Currently " + desc.length + " characters)");
            return;
        }
        if (title.length < 3) {
            document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-square-plus"></i> Create`;
            showNotification(3, "Title must be longer.");
            return;
        }
        

        createKit(title, desc, visiblity, canclone);
    })
});