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

var cachedBadges = null;

async function loadBadges(uid) {
    if (cachedBadges == null) {
        var badges_ref = doc(db, "users", uid);
        var badges = await getDoc(badges_ref).then((res) => {
            if (!res.exists()) {
                return null;
            }
            return res.data().badges;
        });
        if (badges == null || badges == undefined) { return; }
        cachedBadges = badges;
    }
    var w = window.innerWidth;
    let amountToShow = 5;
    console.log(w);
    if (w < 1450) {
        amountToShow = 4;
    }
    if (w < 1365) {
        amountToShow = 3;
    }
    if (w < 1125) {
        amountToShow = 2;
    }
    if (w < 1000) {
        amountToShow = 1;
    }
    if (w < 900) {
        amountToShow = 0;
    }
    // const children = document.getElementById("badges").children;
    // for (let i = 0; i < children.length; i++) {
    //     const child = children[i];
    //     if (child.id == "badgeex" || child.id == "showAllBadges") {continue;}
    //     child.remove();
    // }

    var isOwner = false;
    for (let i = 0; i < cachedBadges.length; i++) {
        const badgeName = cachedBadges[i];
        const clone = document.getElementById("badgeex").cloneNode(true);
        clone.id = "";
        const friendlyName = badgeName.replace(" ", "");
        clone.children[0].src = `../asset/badges/${friendlyName}.png`;
        clone.children[1].innerHTML = badgeName;
        if (friendlyName == "OfficialCreator") {
            isOwner = true;
        }

        if (i >= amountToShow) {
            document.getElementById("showAllBadges").style.display = "unset";
            document.getElementById("badges2").appendChild(clone.cloneNode(true));
            continue;
        }

        document.getElementById("badges").appendChild(clone);
        document.getElementById("badges2").appendChild(clone.cloneNode(true));
    }
    if (!isOwner) {
        document.getElementById("dev").remove();
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    var userData = await getDoc(doc_).then((res) => {
        if (!res.exists()) {
            return "UNKNOWN";
        }
        return res.data();
    });
    document.getElementById("username").innerText = userData.username;

    loadBadges(uid);

    var time = (Date.parse(userData.creation) - new Date()); // milliseconds between now & user creation
    var diffDays = -Math.floor(time / 86400000); // days
    
    document.getElementById("creationDate").innerHTML = `Been a user for ${diffDays} days.`;
    document.getElementById("fullCreation").innerHTML = `Created on ${userData.creation}`;

    document.getElementById("tokens").innerHTML = `${parseInt(userData.tokens).toLocaleString()} Tokens`;

    if (userData.version == undefined) {
        document.getElementById("upgradeData").showModal();
    }

    console.log(user);
    if (user.emailVerified == true) {
        document.getElementById("notemailverified").remove();
    } else{
        if (diffDays > 30 && !user.email.includes("@libertyunion.org")) {
            location.href = "../auth/overdue.html";
        }
    }
    
    
    if (user.photoURL != undefined && user.photoURL != null) {
        document.getElementById("pfp").src = user.photoURL;
    }

    document.getElementById("logout").addEventListener("click", async () => {
        await signOut(auth);
        location.href = "../index.html";
    })

    if (document.getElementById("dev")) {
        document.getElementById("dev").addEventListener("click", () => {
            document.getElementById("developer").showModal();
        });

        document.getElementById("usecurrent").addEventListener("click", () => {
            document.getElementById("searchuid").value = auth.currentUser.uid;
        })

        document.getElementById("searchuser").addEventListener("click", async () => {
            document.getElementById("searchuser").innerHTML = `<i class="fa-solid fa-gear fa-spin"></i> Searching...`;
            document.getElementById("searchuser").setAttribute("disabled", "");
            const uid = document.getElementById("searchuid").value;

            document.getElementById("userdata").innerHTML = "";

            const doc__ = doc(db, "users", uid);
            const data = await getDoc(doc__);
            

            if (!data.exists()) {
                document.getElementById("searchuser").innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Search`;
                document.getElementById("searchuser").removeAttribute("disabled");
                document.getElementById("searchuid").value = "Error.";
                return;
            }
            console.log(data);
            document.getElementById("userdata").innerHTML = "DATA FOR " + data.data().username + ":<br>"
            const entries = Object.entries(data.data());
            entries.forEach((val, _) => {
                const id = val[0];
                const data = val[1];
                document.getElementById("userdata").innerHTML += `- ${id}: ${data}<br>`;
            });
            // document.getElementById("userdata").innerHTML += `- ${id}: ${data}<br>`;

            document.getElementById("searchuser").innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Search`;
            document.getElementById("searchuser").removeAttribute("disabled");
        })
    }

    document.getElementById("sendsuggestion").addEventListener("click", async () => {
        const suggestion = document.getElementById("suggestion").value;
        document.getElementById("sendsuggestion").setAttribute("disabled", "true");
        document.getElementById("sendsuggestion").innerHTML = "Working...";

        console.log(suggestion);

        const url = "https://discord.com/api/webhooks/1235048946330632293/DNu3A4R9c1CAqYsYQ6MSXO_sHznV7QdiSt7shOk9Gg7jHgUzDVHBlsLsbCPItJLvpp6G";
        const msg = {
            "content": suggestion + "\n-------\nEmail: " + user.email + "\nUID: " + user.uid + "\n<@784823225737019402>",
            "username": userData.username + " | BluekidProfileRequest"
        }
        await fetch(url, {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify(msg)
        });


        document.getElementById("sendsuggestion").innerHTML = "Thanks!";
    });
})