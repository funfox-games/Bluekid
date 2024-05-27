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

import { getAuth, onAuthStateChanged, sendPasswordResetEmail, deleteUser, updateEmail } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
const auth = getAuth();

import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

import { isUserVaild, UserReasons } from "../util/auth_helper.js";

import * as MediaUtil from "../util/user_media.js";

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
    await checkVaild(user, data);

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
        if (MediaUtil.isLimited(newname, MediaUtil.MAX_CHAR_NAME)) {
            document.getElementById("changename").innerHTML = `<i class="fa-solid fa-shuffle"></i> Change name`;
            showNotification(3, "Name must be shorter then " + MediaUtil.MAX_CHAR_NAME + " characters. (Currently " + newname.length + " characters)");
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
    });
    document.getElementById("changemail").addEventListener("click", async () => {
        const newemail = document.getElementById("newemail").value;
        const confirmemail = document.getElementById("confirmemail").value;
        console.log(newemail, user.email);
        if (newemail != user.email) {
            showNotification(3, "Not original email.");
            return;
        }
        document.getElementById("changemail").innerHTML = `<i class="fa-solid fa-hourglass"></i> Waiting...`;
        document.getElementById("changemail").setAttribute("disabled", "");
        console.log(confirmemail);
        await updateEmail(user,  confirmemail).catch((err) => {
            // if (err.contains("auth/"))
            console.log(err);
            showNotification(3, "Something went wrong: " + err);
        });
        showNotification(4, "Success!");
    })
    document.getElementById("deleteaccount").addEventListener("click", () => {
        document.getElementById("deleteaccountdialog").showModal();
    });
    document.getElementById("confirmdelete").addEventListener("click", async () => {
        document.getElementById("confirmdelete").innerHTML = "Working...";
        document.getElementById("confirmdelete").setAttribute("disabled", "");

        const res = await deleteDoc(doc(db, "users", user.uid)).catch((err) => {
            console.error(err);
            return "WAAAAAA";
        });
        if (res == "WAAAAAA") { return; }

        const res2 = await deleteUser(user).catch((err) => {
            console.error(err);
            return "WAAAAAA";
        });
        if (res2 == "WAAAAAA") {return;}

        location.href = "../index.html";
    });
});