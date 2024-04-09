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

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
const auth = getAuth();

import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        //logged in
        var uid = user.uid;
        console.log("Logged in: " + uid);
        document.getElementById("signin").innerHTML = "Profile";
        var doc_ = doc(db, "users", uid);
        var data = await getDoc(doc_).then((res) => res.data().username);
        document.getElementById("login_name").innerText = data;
        document.getElementById("yourLoggedIn").showModal();
        document.getElementById("yourLoggedIn").addEventListener("close", (e) => {
            if (document.getElementById("yourLoggedIn").returnValue === "profile") {
                alert("Profile doesn't exists");
            }
            if (document.getElementById("yourLoggedIn").returnValue === "signout"){
                signOut(auth);
            }
            document.getElementById("yourLoggedIn").removeEventListener("close", (e));
        });
    } else {

    }
})