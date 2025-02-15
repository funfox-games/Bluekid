import { onAuthStateChanged, auth, db, doc, getDoc, deleteDoc, setDoc, updateDoc, KIT_COVER_LOCATION, storageref, storage, uploadBytes, getDownloadURL, deleteObject, listAll, addDoc, collection, hasBluekidPlus } from "../util/firebase.js";

import * as MediaUtil from "../util/user_media.js";

const kitid_url = new URL(location.href).searchParams.get("id");
let questions = [];

let hasSaved = true;
let uploadedFile = false;
let contentType = '';
let fileData = null;
let currentCover = "";

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
        clone.children[1].children[0].innerText = question;
        clone.children[1].children[1].children[0].innerText = answer1;
        clone.children[1].children[1].children[1].innerText = answer2;
        clone.children[1].children[1].children[2].innerText = answer3;
        clone.children[1].children[1].children[3].innerText = answer4;
        if (correct.includes("1")) {
            clone.children[1].children[1].children[0].innerHTML = `<i class="fa-light fa-square-check"></i> ${answer1}`;
        }
        if (correct.includes("2")) {
            clone.children[1].children[1].children[1].innerHTML = `<i class="fa-light fa-square-check"></i> ${answer2}`;
        }
        if (correct.includes("3")) {
            clone.children[1].children[1].children[2].innerHTML = `<i class="fa-light fa-square-check"></i> ${answer3}`;
        }
        if (correct.includes("4")) {
            clone.children[1].children[1].children[3].innerHTML = `<i class="fa-light fa-square-check"></i> ${answer4}`;
        }
        if (qdata.image == "" || qdata.image == undefined) {
            clone.children[0].style.display = "none";
        } else {
            clone.children[0].children[0].src = qdata.image;
        }
        clone.children[1].children[2].addEventListener("click", () => {
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
        let cover = document.getElementById("coverimg").src;

        const kitdata = doc(db, "users", auth.currentUser.uid, "kits", kitid_url);



        if (uploadedFile && cover != currentCover) {
            document.getElementById("savekit").innerHTML = `<i class="fa-light fa-hourglass fa-spin"></i> Uploading cover...`;
            const result = await uploadBytes(storageref(storage, KIT_COVER_LOCATION + "/" + kitid_url), fileData, { contentType }).catch((err) => {
                showNotification(3, "Failed to upload cover.");
                return false;
            });
            if (result == false) {
                return;
            }
            const downloadURL = await getDownloadURL(result.ref);
            cover = downloadURL;
            document.getElementById("coverimg").src = cover;
        }

        await updateDoc(kitdata, {
            displayname: title,
            description: desc,
            cover,
            questions,
            visibility: document.getElementById("kit_visibility").value
        }).catch((res) => rej(res));
        currentCover = cover;

        if (document.getElementById("kit_visibility").value != "private") {
            document.getElementById("savekit").innerHTML = `<i class="fa-light fa-hourglass fa-spin"></i> Uploading...`;
            const docref = doc(db, "kits", kitid_url);
            await setDoc(docref, {
                kitId: kitid_url,
                ownerUid: auth.currentUser.uid,
                preview: {
                    icon: cover,
                    title,
                    description: desc,
                    visibility: document.getElementById("kit_visibility").value
                }
            });
        } else {
            document.getElementById("savekit").innerHTML = `<i class="fa-light fa-hourglass fa-spin"></i> Checking...`;
            const docref = doc(db, "kits", kitid_url);
            const ref = await getDoc(docref);
            if (ref.exists()) {
                document.getElementById("savekit").innerHTML = `<i class="fa-light fa-hourglass fa-spin"></i> Removing...`;
                await deleteDoc(docref);
            }
        }

        res();
    });
}
async function checkImage(url) {
    return new Promise((res, rej) => {
        var image = new Image();
        image.onload = function () {
            if (this.width > 0) {
                res();
            }
        }
        image.onerror = function () {
            rej();
        }
        image.src = url;
    })
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
    currentCover = kitdata.cover;
    if (kitdata.questions != undefined) {
        questions = kitdata.questions;
    }
    refreshQuestions();

    document.getElementById("kit_visibility").value = kitdata.visibility;

    document.getElementById("questionamount").innerHTML = questions.length;
    
    document.getElementById("changecoverfile").addEventListener('click', () => {
        document.getElementById("uploadfiledialog").showModal();
    });
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
        const img = document.getElementById("qimg").src;

        if (MediaUtil.isLimited(question, MediaUtil.MAX_KIT_QUESTION)) {
            document.getElementById("problem").parentElement.style.display = "unset";
            document.getElementById("problem").innerHTML = `Question text needs to be shorter than ${MediaUtil.MAX_KIT_QUESTION} characters. (Currently ${question.length})`;
            return;
        }
        if (MediaUtil.isLimited(q1, MediaUtil.MAX_CHAR_NAME)) {
            document.getElementById("problem").parentElement.style.display = "unset";
            document.getElementById("problem").innerHTML = `Question 1 needs to be shorter than ${MediaUtil.MAX_CHAR_NAME} characters. (Currently ${q1.length})`;
            return;
        }
        if (MediaUtil.isLimited(q2, MediaUtil.MAX_CHAR_NAME)) {
            document.getElementById("problem").parentElement.style.display = "unset";
            document.getElementById("problem").innerHTML = `Question 2 needs to be shorter than ${MediaUtil.MAX_CHAR_NAME} characters. (Currently ${q2.length})`;
            return;
        }
        if (MediaUtil.isLimited(q3, MediaUtil.MAX_CHAR_NAME)) {
            document.getElementById("problem").parentElement.style.display = "unset";
            document.getElementById("problem").innerHTML = `Question 3 needs to be shorter than ${MediaUtil.MAX_CHAR_NAME} characters. (Currently ${q3.length})`;
            return;
        }
        if (MediaUtil.isLimited(q4, MediaUtil.MAX_CHAR_NAME)) {
            document.getElementById("problem").parentElement.style.display = "unset";
            document.getElementById("problem").innerHTML = `Question 4 needs to be shorter than ${MediaUtil.MAX_CHAR_NAME} characters. (Currently ${q4.length})`;
            return;
        }

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

        console.log(img);
        questions.push({
            a1: q1,
            a2: q2,
            a3: q3,
            a4: q4,
            correctA: correct,
            question,
            image: img == location.href ? "" : img
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

        document.getElementById("qimg").src = "";

        document.getElementById("createquestionpopup").showModal();
    });
    document.getElementById("savekit").addEventListener("click", async () => {
        const title = document.getElementById("kitname").value;
        const desc = document.getElementById("desc").value;
        if (MediaUtil.isLimited(title, MediaUtil.MAX_CHAR_NAME)) {
            showNotification(3, "Title must be shorter then " + MediaUtil.MAX_CHAR_NAME + " characters. (Currently " + title.length + " characters)");
            return;
        }
        if (MediaUtil.isLimited(desc, MediaUtil.MAX_CHAR_DESCRIPTION)) {
            showNotification(3, "Desc must be shorter then " + MediaUtil.MAX_CHAR_DESCRIPTION + " characters. (Currently " + desc.length + " characters)");
            return;
        }
        if (title.length < 3) {
            showNotification(3, "Title must be longer.");
            return;
        }

        document.getElementById("savekit").innerHTML = "Waiting...";
        document.getElementById("savekit").setAttribute("disabled", "true");

        await saveKit();

        document.getElementById("savekit").innerHTML = `<i class="fa-light fa-floppy-disk"></i> Save kit`;
        document.getElementById("savekit").removeAttribute("disabled");
    });
    document.getElementById("changecoverurl").addEventListener("click", () => {
        document.getElementById("uploadurldialog").showModal();
    })
    document.getElementById("uploadurlquestion").addEventListener("click", () => {
        document.getElementById("uploadurldialog__question").showModal();
    })
    document.getElementById("uploadurlclose__question").addEventListener("click", () => {
        document.getElementById("uploadurldialog__question").close();
    })
    document.getElementById("uploadurluse").addEventListener("click", async () => {
        document.getElementById("uploadurluse").innerHTML = `<i class="fa-light fa-hourglass fa-spin"></i> Working...`;
        document.getElementById("uploadurlnovaild").style.display = "none";
        var cont = true;
        await checkImage(document.getElementById("uploadurlurl").value).catch(() => {
            document.getElementById("uploadurlnovaild").style.display = "unset";
            document.getElementById("uploadurluse").innerHTML = `<i class="fa-light fa-file-image"></i> Use`;
            cont = false;
        });
        if (!cont) { return; }
        console.log(document.getElementById("uploadurlurl").value);

        document.getElementById("coverimg").src = document.getElementById("uploadurlurl").value;
        document.getElementById("uploadurlurl").value = "";
        document.getElementById("uploadurluse").innerHTML = `<i class="fa-light fa-file-image"></i> Use`;
        document.getElementById("uploadurldialog").close();
    });
    document.getElementById("uploadFileUse").addEventListener("click", async () => {
        const imageInput = document.getElementById("fileupload");
        const file = imageInput.files[0];

        if (file.type == "image/gif" && !(await hasBluekidPlus())) {
            document.getElementById("gif").showModal();
            document.getElementById("uploadfiledialog").close();
            return;
        }

        if (file.size > 5e+6 && !(await hasBluekidPlus())) {
            document.getElementById("toobig").showModal();
            document.getElementById("uploadfiledialog").close();
            return;
        }

    
        const objectURL = window.URL.createObjectURL(file);
        // console.log(file, objectURL);
        uploadedFile = true;
        contentType = file.type;
        fileData = file;
        document.getElementById("coverimg").src = objectURL;
        document.getElementById("uploadfiledialog").close();
    });
    document.getElementById("uploadurluse__question").addEventListener("click", async () => {
        document.getElementById("uploadurluse__question").innerHTML = `<i class="fa-light fa-hourglass fa-spin"></i> Working...`;
        document.getElementById("uploadurlnovaild__question").style.display = "none";
        var cont = true;
        await checkImage(document.getElementById("uploadurlurl__question").value).catch(() => {
            document.getElementById("uploadurlnovaild__question").style.display = "unset";
            document.getElementById("uploadurlus__questione").innerHTML = `<i class="fa-light fa-file-image"></i> Use`;
            cont = false;
        });
        if (!cont) { return; }
        console.log(document.getElementById("uploadurlurl__question").value);

        document.getElementById("qimg").src = document.getElementById("uploadurlurl__question").value;
        document.getElementById("uploadurlurl__question").value = "";
        document.getElementById("uploadurluse__question").innerHTML = `<i class="fa-light fa-file-image"></i> Use`;
        document.getElementById("uploadurldialog__question").close();
    })
    document.getElementById("covercontainer").addEventListener("mouseenter", () => {
        document.getElementById("cover__overlay").setAttribute("show", "");
    });
    document.getElementById("covercontainer").addEventListener("mouseleave", () => {
        document.getElementById("cover__overlay").removeAttribute("show");
    });
    document.getElementById("share_kit").addEventListener("click", () => {
        navigator.clipboard.writeText("https://bluekid.netlify.app/profile/kit/view?id=" + kitid_url);
        showNotification(4, "Copied share url to clipboard!");
    });
    document.getElementById("delete_kit").addEventListener("click", async () => {
        document.getElementById("delete_kit").innerHTML = "Working...";
        document.getElementById("delete_kit").setAttribute("disabled", "");
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "kits", kitid_url));
        await deleteDoc(doc(db, "kits", kitid_url));
        const coverRef = storageref(storage, KIT_COVER_LOCATION + "/" + kitid_url);
        const allKitCovers = await listAll(storageref(storage, KIT_COVER_LOCATION));
        let hasCover = false;
        console.log(KIT_COVER_LOCATION + kitid_url);
        allKitCovers.items.forEach((itemRef) => {
            if (itemRef.name == kitid_url) {
                hasCover = true;
                console.log("found");
            }
        });

        if (hasCover) {
            console.log("hasCover");
            await deleteObject(coverRef);
        }
        location.href = "../kits.html";
    });
    const publicDocData = await getDoc(doc(db, "kits", kitid_url));
    if (kitdata.visibility == "private") {
        document.getElementById("publish_kit").remove();
    } else {
        if (publicDocData.exists()) {
            document.getElementById("publish_kit").remove();
        }
    }
});
window.addEventListener("beforeunload", function (e) {
    if (hasSaved) {return;}
    var confirmationMessage = 'It looks like you have been editing something. '
        + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});