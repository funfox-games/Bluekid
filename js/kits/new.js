import { onAuthStateChanged, auth, db, doc, getDoc, collection, storageref, storage, uploadBytes, getDownloadURL, setDoc, KIT_COVER_LOCATION } from "../util/firebase.js";

let currentImg = "../../asset/templates/kit_temp.png";
let userData;

import * as MediaUtil from "../util/user_media.js";

let uploadedFile = false;
let contentType = '';
let fileData = null;

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

async function createKit(title, description, visiblity, canclone) {
    const data = {
        "displayname": title,
        "description": description,
        "creationdate": new Date(),
        "author": auth.currentUser.uid,
        "visibility": visiblity,
        "canclone": canclone,
        "cover": currentImg
    }
    console.log(data);

    const documention_ref = await doc(collection(db, "users", auth.currentUser.uid, "kits"));
    // Add document with random id
    console.log(documention_ref.id);

    if (uploadedFile) {
        document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-hourglass fa-spin"></i> Uploading cover...`;
        const result = await uploadBytes(storageref(storage, KIT_COVER_LOCATION + "/" + documention_ref.id), fileData, {contentType}).catch((err) => {
            showNotification(3, "Failed to upload cover.");
            return false;
        });
        if (result == false) {
            return;
        }
        const downloadURL = await getDownloadURL(result.ref);
        data.cover = downloadURL;
    }
    const doc__ = await setDoc(documention_ref, data);
    document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-hourglass fa-spin"></i> Waiting..`;
    location.href = "../kits.html";
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../../auth/login.html";
        return;
    }
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    userData = await getDoc(doc_).then((res) => {
        if (!res.exists()) {
            return "UNKNOWN";
        }
        return res.data();
    });
    console.log(new Date());
    document.getElementById("uploadurluse").addEventListener("click", async () => {
        document.getElementById("uploadurluse").innerHTML = `<i class="fa-solid fa-hourglass fa-spin"></i> Working...`;
        document.getElementById("uploadurlnovaild").style.display = "none";
        var cont = true;
        await checkImage(document.getElementById("uploadurlurl").value).catch(() => {
            document.getElementById("uploadurlnovaild").style.display = "unset";
            document.getElementById("uploadurluse").innerHTML = `<i class="fa-solid fa-file-image"></i> Use`;
            cont = false;
        });
        if (!cont) {return;}
        currentImg = document.getElementById("uploadurlurl").value;
        console.log(document.getElementById("uploadurlurl").value);
        uploadedFile = false;

        document.getElementById("coverimg").src = currentImg;
        document.getElementById("uploadurlurl").value = "";
        document.getElementById("uploadurluse").innerHTML = `<i class="fa-solid fa-file-image"></i> Use`;
    })
    document.getElementById("uploadurl").addEventListener("click", () => {
        document.getElementById("uploadurldialog").showModal();
    });
    document.getElementById("uploadfile").addEventListener("click", () => {
        document.getElementById("uploadfiledialog").showModal();
    });
    document.getElementById("uploadurlclose").addEventListener("click", () => {
        document.getElementById("uploadurldialog").close();
    })
    document.getElementById("uploadfileclose").addEventListener("click", () => {
        document.getElementById("uploadfiledialog").close();
    });
    document.getElementById("uploadFileUse").addEventListener("click", () => {
        const imageInput = document.getElementById("fileupload");
        const file = imageInput.files[0];

        const objectURL = window.URL.createObjectURL(file);
        // console.log(file, objectURL);
        uploadedFile = true;
        contentType = file.type;
        fileData = file;
        document.getElementById("coverimg").src = objectURL;
        document.getElementById("uploadfiledialog").close();
    });
    document.getElementById("createkit").addEventListener("click", () => {
        document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-hourglass fa-spin"></i> Creating...`;
        const title = document.getElementById("kittitle").value;
        const desc = document.getElementById("kitdesc").value;
        const visiblity = document.getElementById("kit_visibility").value;
        const canclone = document.getElementById("canclone").checked;

        if (MediaUtil.isLimited(title, MediaUtil.MAX_CHAR_NAME)) {
            document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-square-plus"></i> Create`;
            showNotification(3, "Title must be shorter then " + MediaUtil.MAX_CHAR_NAME + " characters. (Currently " + title.length + " characters)");
            return;
        }
        if (MediaUtil.isLimited(desc, MediaUtil.MAX_CHAR_DESCRIPTION)) {
            document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-square-plus"></i> Create`;
            showNotification(3, "Desc must be shorter then " + MediaUtil.MAX_CHAR_DESCRIPTION + " characters. (Currently " + desc.length + " characters)");
            return;
        }
        if (title.length < 3) {
            document.getElementById("createkit").innerHTML = `<i class="fa-solid fa-square-plus"></i> Create`;
            showNotification(3, "Title must be longer.");
            return;
        }

        createKit(title, desc, visiblity, canclone);
    })
});