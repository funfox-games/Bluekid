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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("profile").innerHTML = `<button style="width:100%;" class="puffy_button primary"><i class="fa-solid fa-address-card"></i> Profile</button>`;
        document.getElementById("profile").href = `profile/index.html`;
    }
});