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

import { getAuth, onAuthStateChanged, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
const auth = getAuth();

import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    var data = await getDoc(doc_).then((res) => {
        return res.data();
    });

    document.getElementById("userid").innerHTML = uid;
    document.getElementById("tokens").innerHTML = data.tokens;
    document.getElementById("username").innerHTML = data.username;

    document.getElementById("changename").addEventListener("click", async () => {
        document.getElementById("changename").innerHTML = `<i class="fa-solid fa-hourglass"></i> Waiting...`;
        const newname = document.getElementById("newname").value;
        const confirm = document.getElementById("confirmnewname").value;
        if (newname != confirm) {
            document.getElementById("changename").innerHTML = `<i class="fa-solid fa-shuffle"></i> Change name`;
            showNotification(3, "New name and confirmation dont match.");
            return;
        }
        if (newname.length < 3) {
            document.getElementById("changename").innerHTML = `<i class="fa-solid fa-shuffle"></i> Change name`;
            showNotification(3, "Must be longer then 3 characters.");
            return;
        }
        var docref = doc(db, "users", uid);
        await updateDoc(docref, {
            username: newname
        });
        console.log("yippe!");
        showNotification(4, "New name applied! Refresh to show.");
        document.getElementById("changename").innerHTML = `<i class="fa-solid fa-shuffle"></i> Change name`;
    })
    document.getElementById("sendpasswordreset").addEventListener("click", async () => {
        document.getElementById("sendpasswordreset").innerHTML = `<i class="fa-solid fa-hourglass fa-spin"></i> Sending...`;
        await sendPasswordResetEmail(auth, user.email);
        showNotification(4, "Email sent! (Check your spam folder)");
        document.getElementById("sendpasswordreset").innerHTML = `<i class="fa-solid fa-envelope"></i> Send password reset email`;
    })
});