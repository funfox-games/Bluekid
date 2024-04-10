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

import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
const auth = getAuth();

document.getElementById("login").addEventListener("submit", async (e) => {
    //TODO: things
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmpassword = document.getElementById("confirmpassword").value;
    if (password != confirmpassword) {
        showNotification(3, "Passwords don't match.");
        return;
    }
    document.getElementById("loginbutton").setAttribute("disabled", "");
    document.getElementById("loginbutton").innerHTML = "Logging in...";
    const res = await createUserWithEmailAndPassword(auth, email, password).catch((err) => {
        const code = err.code;
        const msg = err.message;
        console.error("(" +code + ") SIGNUP ERROR: " + msg);
        /////////////////////////////////////////////////////////////////////////////////////////////////// TODO: Make error codes user friendly
        if (code == "auth/email-already-in-use") {
            showNotification(3, "Email in use. Go to the <a href='login.html'>login</a> page to reset password.");
        }
        else if (code == "auth/weak-password") {
            showNotification(3, "Weak password. Try a longer one.");
        } else {
            showNotification(3, "Something went wrong. Check the console for more details.");
        }
        document.getElementById("loginbutton").removeAttribute("disabled");
        document.getElementById("loginbutton").innerHTML = `<i class="fa-solid fa-door-open"></i> Log in`;
        return null;
    });
    if (res == null) {return;}
    showNotification(4, `Logged in successfully! <a href="../profile/index.html"><button class="puffy_button primary"><i class="fa-solid fa-user"></i> Profile</button></a>`);
});

document.getElementById("google").addEventListener("click", async () => {
    var provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    auth.useDeviceLanguage();
    var res = await signInWithPopup(auth, provider).catch((err) => {
        const code = err.code;
        const msg = err.message;
        var email = err.email;
        var credential = GoogleAuthProvider.credentialFromError(error);
        if (code == "auth/popup-closed-by-user") {
            showNotification(3, "Prompt canceled.");
        } else {
            showNotification(3, "Something went wrong.");
        }
        console.log(code, msg);
        return null;
    });
    if (res == null) {return;}
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(res);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    showNotification(4, `Signed up successfully! <a href="../profile/index.html"><button class="puffy_button primary"><i class="fa-solid fa-user"></i> Profile</button></a>`);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("loginbutton").setAttribute("disabled", "");
        document.getElementById("loginbutton").innerHTML = "Logged in";
        document.getElementById("google").innerHTML = `<img src="../asset/google.webp" alt="googleLogo" width="22"> Merge with Google`;
    }
});