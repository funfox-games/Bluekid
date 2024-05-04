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

import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
const db = getFirestore(app);

const kitid_url = new URL(location.href).searchParams.get("id");
const kitowner_url = new URL(location.href).searchParams.get("owner");

function refreshQuestions(questions) {
    const children = document.getElementById("allQuestions").children;
    for (let i = 0; i < children.length; i++) {
        if (children[i].id == "ex") { continue; }
        children[i].remove();
    }

    for (let i = 0; i < questions.length; i++) {
        const qdata = questions[i];
        console.log(qdata);
        const answer1 = qdata.a1;
        const answer2 = qdata.a2;
        const answer3 = qdata.a3;
        const answer4 = qdata.a4;
        const question = qdata.question;
        const correct = qdata.correctA;

        const clone = document.getElementById("ex").cloneNode(true);
        clone.id = "";
        clone.children[0].innerText = question;
        clone.children[1].children[0].innerText = answer1;
        clone.children[1].children[1].innerText = answer2;
        clone.children[1].children[2].innerText = answer3;
        clone.children[1].children[3].innerText = answer4;
        if (correct.includes("1")) {
            clone.children[1].children[0].innerHTML = `<i class="fa-solid fa-square-check"></i> ${answer1}`;
        }
        if (correct.includes("2")) {
            clone.children[1].children[1].innerHTML = `<i class="fa-solid fa-square-check"></i> ${answer2}`;
        }
        if (correct.includes("3")) {
            clone.children[1].children[2].innerHTML = `<i class="fa-solid fa-square-check"></i> ${answer3}`;
        }
        if (correct.includes("4")) {
            clone.children[1].children[3].innerHTML = `<i class="fa-solid fa-square-check"></i> ${answer4}`;
        }

        document.getElementById("allQuestions").append(clone);
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../../auth/login.html";
        return;
    }
    console.log(kitowner_url, kitid_url)
    var kitref = doc(db, "users", kitowner_url, "kits", kitid_url);
    var kit = await getDoc(kitref);
    if (!kit.exists()) {
        document.getElementById("notOwned").showModal();
        return;
    }
    var kitdata = kit.data();
    if (kitdata.visibility == "private") {
        document.getElementById("notOwned").showModal();
        document.getElementById("visibility").innerHTML = kitdata.visibility;
        return;
    }
    if (kitdata.visibility == "friends"){
        const theirdata = await getDoc(kitowner_url).then((res) => { return res.data() });
        
        if (!theirdata.friends.includes(user.uid)) {
            document.getElementById("visibility").innerHTML = kitdata.visibility;
            document.getElementById("notOwned").showModal();
            return;
        }
    }
    document.getElementById("kitname").innerText = kitdata.displayname;
    document.getElementById("desc").innerText = kitdata.description;
    document.getElementById("coverimg").src = kitdata.cover;
    if (kitdata.questions != undefined) {
        refreshQuestions(kitdata.questions);

    }
});