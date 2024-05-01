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

import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

const kitid_url = new URL(location.href).searchParams.get("id");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../../auth/login.html";
        return;
    }
    var uid = user.uid;

    var kitref = doc(db, "users", uid, "kits", kitid_url);
    var kit = await getDoc(kitref);
    if (!kit.exists()) {
        location.href = "../kits.html";
        return;
    }
    var kitdata = kit.data();
    document.getElementById("kitname").value = kitdata.displayname;
    document.getElementById("desc").value = kitdata.description;
});