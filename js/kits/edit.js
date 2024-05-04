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
let questions = [];

let hasSaved = true;

function refreshQuestions() {
    const children = document.getElementById("allQuestions").children;
    for (let i = 0; i < children.length; i++) {
        if (children[i].id == "ex") {continue;}
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
        clone.children[2].addEventListener("click", () => {
            questions.splice(i, 1);
            clone.remove();
        });

        document.getElementById("allQuestions").append(clone);
    }
}

async function saveKit() {
    return new Promise(async (res, rej) => {
        const title = document.getElementById("kitname").value;
        const desc = document.getElementById("desc").value;
        const cover = document.getElementById("coverimg").src;

        const kitdata = doc(db, "users", auth.currentUser.uid, "kits", kitid_url);
        await updateDoc(kitdata, {
            displayname: title,
            description: desc,
            cover,
            questions
        }).catch((res) => rej(res));

        res();
    });
}

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
    document.getElementById("coverimg").src = kitdata.cover;
    if (kitdata.questions != undefined) {
        questions = kitdata.questions;
    }
    refreshQuestions();
    
    document.getElementById("createquestion__btn").addEventListener("click", () => {
        const question = document.getElementById("questiontext").value;

        const q1A = document.getElementById("q1a").checked;
        const q1 = document.getElementById("q1").value;

        const q2A = document.getElementById("q2a").checked;
        const q2 = document.getElementById("q2").value;
        
        const q3A = document.getElementById("q3a").checked;
        const q3 = document.getElementById("q3").value;

        const q4A = document.getElementById("q4a").checked;
        const q4 = document.getElementById("q4").value;

        if (question == "") {
            document.getElementById("problem").parentElement.style.display = "unset";
            document.getElementById("problem").innerHTML = "Question text required.";
            return;
        }
        if (q1 == "") {
            document.getElementById("problem").parentElement.style.display = "unset";
            document.getElementById("problem").innerHTML = "Question 1 required.";
            return;
        }
        if (q2 == "") {
            document.getElementById("problem").parentElement.style.display = "unset";
            document.getElementById("problem").innerHTML = "Question 3 required.";
            return;
        }

        let isAnyChecked = false;
        if (q1A || q2A || q3A || q4A) {
            isAnyChecked = true;
        }
        if (!isAnyChecked) {
            document.getElementById("problem").parentElement.style.display = "unset";
            document.getElementById("problem").innerHTML = "Need at least one correct answer.";
            return;
        }

        document.getElementById("problem").parentElement.style.display = "none";
        document.getElementById("problem").innerHTML = "";

        let correct = [];
        if (q1A) {
            correct.push("1");
        }
        if (q2A) {
            correct.push("2");
        }
        if (q3A) {
            correct.push("3");
        }
        if (q4A) {
            correct.push("4");
        }

        questions.push({
            a1: q1,
            a2: q2,
            a3: q3,
            a4: q4,
            correctA: correct,
            question
        });
        hasSaved = false;
        document.getElementById("createquestionpopup").close();
        refreshQuestions();
    })
    document.getElementById("createquestion").addEventListener("click", () => {
        const question = document.getElementById("questiontext");

        const q1A = document.getElementById("q1a");
        const q1 = document.getElementById("q1");

        const q2A = document.getElementById("q2a");
        const q2 = document.getElementById("q2");
        
        const q3A = document.getElementById("q3a");
        const q3 = document.getElementById("q3");

        const q4A = document.getElementById("q4a");
        const q4 = document.getElementById("q4");

        question.value = "";

        q1.value = "";
        q1A.checked = false;
        q2.value = "";
        q2A.checked = false;
        q3.value = "";
        q3A.checked = false;
        q4.value = "";
        q4A.checked = false;

        document.getElementById("createquestionpopup").showModal();
    });
    document.getElementById("savekit").addEventListener("click", async () => {
        document.getElementById("savekit").innerHTML = "Waiting...";
        document.getElementById("savekit").setAttribute("disabled", "true");

        await saveKit();

        document.getElementById("savekit").innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save kit`;
        document.getElementById("savekit").removeAttribute("disabled");
    });
});
window.addEventListener("beforeunload", function (e) {
    if (hasSaved) {return;}
    var confirmationMessage = 'It looks like you have been editing something. '
        + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});