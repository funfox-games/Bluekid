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

import { getAuth, onAuthStateChanged, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (!user) {
        location.href = "/login.html";
        return;
    }
    // if (user.emailVerified) {
    //     location.href = "../profile/index.html";
    //     return;
    // }
    document.getElementById("emailaddress").innerText = user.email;

    document.getElementById("logout").addEventListener("click", async () => {
        await signOut(auth);
        location.href = "../index.html";
    });
    document.getElementById("delete").addEventListener("click", async () => {
        // TODO: Delete user data and account
        alert("no");
    });
    document.getElementById("send").addEventListener("click", async () => {
        document.getElementById("send").innerHTML = "Working...";
        document.getElementById("send").setAttribute("disabled", "");
        await sendEmailVerification(auth.currentUser);
        showNotification(4, "Check your email! (Make sure to check spam.)");
        document.getElementById("send").innerHTML = `<i class="fa-light fa-envelope-circle-check"></i> Send verification`;
        document.getElementById("send").removeAttribute("disabled");
    });

});