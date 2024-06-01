import { onAuthStateChanged, auth, db, doc, getDoc, updateDoc } from "../util/firebase.js";

const kitid_url = new URL(location.href).searchParams.get("id");
// const kitowner_url = new URL(location.href).searchParams.get("owner");

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
        clone.children[1].children[0].innerText = question;
        clone.children[1].children[1].children[0].innerText = answer1;
        clone.children[1].children[1].children[1].innerText = answer2;
        clone.children[1].children[1].children[2].innerText = answer3;
        clone.children[1].children[1].children[3].innerText = answer4;
        if (correct.includes("1")) {
            clone.children[1].children[1].children[0].innerHTML = `<i class="fa-solid fa-square-check"></i> ${answer1}`;
        }
        if (correct.includes("2")) {
            clone.children[1].children[1].children[1].innerHTML = `<i class="fa-solid fa-square-check"></i> ${answer2}`;
        }
        if (correct.includes("3")) {
            clone.children[1].children[1].children[2].innerHTML = `<i class="fa-solid fa-square-check"></i> ${answer3}`;
        }
        if (correct.includes("4")) {
            clone.children[1].children[1].children[3].innerHTML = `<i class="fa-solid fa-square-check"></i> ${answer4}`;
        }
        if (qdata.image == "" || qdata.image == undefined) {
            clone.children[0].style.display = "none";
        } else {
            clone.children[0].children[0].src = qdata.image;
        }
        document.getElementById("allQuestions").append(clone);
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../../auth/login.html";
        return;
    }
    var kitref = doc(db, "kits", kitid_url);
    var kit_ = await getDoc(kitref);
    if (!kit_.exists()) {
        document.getElementById("nonexistant").showModal();
        return;
    }
    var kit = await getDoc(doc(db, "users", kit_.data().ownerUid, "kits", kit_.data().kitId));
    var kitdata = kit.data();
    if (kitdata.visibility == "private") {
        document.getElementById("notOwned").showModal();
        document.getElementById("visibility").innerHTML = kitdata.visibility;
        return;
    }
    if (kitdata.visibility == "friends"){
        const theirdata = await getDoc(doc(db, "users", kitowner_url)).then((res) => { return res.data() });
        
        if (!theirdata.friends.includes(user.uid) && user.uid != kitowner_url) {
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
        document.getElementById("questionamount").innerHTML = kitdata.questions.length;
    }
    const localdata = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (localdata.data().favoriteKits != undefined) {
        if (localdata.data().favoriteKits.includes(kitid_url)) {
            document.getElementById("favoritekit").innerHTML = `<i class="fa-solid fa-star"></i> Favorited kit`;
        }
    }

    let isFavorite = false;

    if (localdata.data().favoriteKits != undefined) {
        if (localdata.data().favoriteKits.includes(kitid_url)) {
            isFavorite = true;
        }
    }
    document.getElementById("favoritekit").addEventListener("click", async () => {
        document.getElementById("favoritekit").innerHTML = "Working...";
        document.getElementById("favoritekit").setAttribute("disabled", "");
        if (isFavorite) {
            /**
             * @type {Array}
             */
            const favoriteKits = localdata.data().favoriteKits || [];
            if (favoriteKits != []) {
                favoriteKits.splice(favoriteKits.indexOf(kitid_url), 1);
            }
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                favoriteKits
            });
            document.getElementById("favoritekit").innerHTML = `<i class="fa-regular fa-star"></i> Favorite kit`;
            document.getElementById("favoritekit").removeAttribute("disabled");
            isFavorite = false;
        } else {
            /**
             * @type {Array}
             */
            const favoriteKits = localdata.data().favoriteKits || [];
            favoriteKits.push(kitid_url);
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                favoriteKits
            });
            document.getElementById("favoritekit").innerHTML = `<i class="fa-solid fa-star"></i> Favorited kit`;
            document.getElementById("favoritekit").removeAttribute("disabled");
            isFavorite = true;
        }
    });

});