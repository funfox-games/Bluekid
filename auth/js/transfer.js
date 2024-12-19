import { auth, db, onAuthStateChanged, doc, getDoc, updateDoc, getDocs, collection, deleteDoc, addDoc, setDoc } from "../../js/util/firebase.js"

import { getRedirectUrl } from "../../js/util/redirectUrl.js";

async function start() {
    const progress = (x) => {
        document.getElementById("progression").innerHTML = x;
    };
    document.getElementById("close").setAttribute("disabled", "true");
    document.getElementById("convert_btn").setAttribute("disabled", "true");
    document.getElementById("transfer__info").style.display = "none";
    document.getElementById("transfer__progression").style.display = "block";

    const user = doc(db, "users", auth.currentUser.uid);
    let updateduserdata = await getDoc(user).then((res) => res.data());
    let updatedblues = await getDocs(collection(db, "users", auth.currentUser.uid, "blues"));
    let updatedkits = await getDocs(collection(db, "users", auth.currentUser.uid, "kits"));

    const testing = false;

    const round = (num, places) => {
        num = parseFloat(num);
        places = (places ? parseInt(places, 10) : 0)
        if (places > 0) {
            let length = places;
            places = "1";
            for (let i = 0; i < length; i++) {
                places += "0";
                places = parseInt(places, 10);
            }
        } else {
            places = 1;
        }
        return Math.round((num + Number.EPSILON) * (1 * places)) / (1 * places)
    };

    /**
     * The process of V2 transfer:
     * 
     * Removal:
     * - Remove unnessecary properites: email, rank, accounttype
     * - Remove unnessecary properities in blues: chance, rarity
     * - Remove unnessecray properites in kits: QLength
     * 
     * Addition: (if not existant)
     * - communitySettings
     * - favoriteKits
     * - friends
     * - requests
     * - sentRequests
     * - version
     * - tokens [just in case]
     * Addition kits:
     * - cover
     * - canclone
     * 
     * Modification: [Kits]
     * - Rename kit document id to a random id
     * - questions need to be converted to an array
     * - author field needs to be a uid
     */

    // profile changes
    progress("Removing unnecessary profile properties...");
    delete updateduserdata["email"];
    delete updateduserdata["accounttype"];
    delete updateduserdata["rank"];
    if (testing) {
        setTimeout(() => res(), 500);
    } else {
        console.log(updateduserdata);
        await setDoc(user, updateduserdata);
    }
    progress("Fixing blues...");

    console.log(updatedblues);
    for (let i = 0; i < updatedblues.docs.length; i++) {
        const doc = updatedblues.docs[i];
        let percent = round(((i + 1) / updatedblues.size) * 100, 2);
        let val = doc.data();
        const id = doc.id;
        progress("Fixing blues... (" + percent +"%)");

        if (val.chance) {
            delete val.chance;
        }
        if (val.rarity) {
            delete val.rarity;
        }
        if (!val.pack && document.getElementById("deleteBuggedBlues").checked) {
            val = null;
        }

        
        if (testing) {
            await new Promise((res, rej) => {
                setTimeout(() => res(), 100);
            })
        } else {
            if (val != null) {
                await updateDoc(doc.ref, val);
            } else {
                await deleteDoc(doc.ref);
            }
        }
    }

    progress("Fixing kits...");
    for (let i = 0; i < updatedkits.docs.length; i++) {
        const doc = updatedkits.docs[i];
        let percent = round(((i + 1) / updatedkits.size) * 100, 2);
        let val = doc.data();
        const id = doc.id;
        progress("Fixing kits... (" + percent +"%)");

        if (val.QLength) {
            delete val.QLength;
        }

        val.author = auth.currentUser.uid;

        if (!val.canclone) {
            val.canclone = false;
        }
        if (!val.cover) {
            val.cover = `https://bluekid.netlify.app/asset/templates/kit_temp.png`;
        }
        if (!val.visibility) {
            val.visibility = "private";
        }

        const questions = val.questions;
        if (questions.constructor != Array) {
            const arrayQuestions = Object.entries(questions);
            let finalQuestions = [];
            for (let i = 0; i < arrayQuestions.length; i++) {
                let final = arrayQuestions[i][1];
                final["a1"] = final["1"];
                final["a2"] = final["2"];
                final["a3"] = final["3"];
                final["a4"] = final["4"];
                delete final["1"];
                delete final["2"];
                delete final["3"];
                delete final["4"];

                finalQuestions.push(final);
            }

            val.questions = finalQuestions;
        }

        if (testing) {
            await new Promise((res, rej) => {
                setTimeout(() => res(), 150);
            })
        } else {
            await addDoc(collection(db, "users", auth.currentUser.uid, "kits"), val);
            await deleteDoc(doc.ref);
        }
    }

    progress("Finishing up...");
    /* Addition: (if not existant)
     * - communitySettings
     * - favoriteKits
     * - friends
     * - requests
     * - sentRequests
     * - version
     * - tokens [just in case]
     */
    if (!updateduserdata["communitySettings"]) {
        updateduserdata["communitySettings"] = {
            allowFriendRequests: true,
            privacy: {
                hideTokens: false,
                showBlues: "friends",
                showGameHistory: "friends",
                showKits: "all",
                showLastOnline: "all",
                showStatus: "all"
            }
        }
    }
    if (!updateduserdata["favoriteKits"]) {
        updateduserdata["favoriteKits"] = []
    }
    if (!updateduserdata["friends"]) {
        updateduserdata["friends"] = []
    }
    if (!updateduserdata["requests"]) {
        updateduserdata["requests"] = []
    }
    if (!updateduserdata["sentRequests"]) {
        updateduserdata["sentRequests"] = []
    }
    updateduserdata["version"] = 2
    if (!updateduserdata["tokens"]) {
        updateduserdata["tokens"] = 0
    }

    if (testing) {
        await new Promise((res, rej) => {
            setTimeout(() => res(), 350);
        })
    } else {
        await setDoc(user, updateduserdata);
    }
    
    document.getElementById("close").removeAttribute("disabled");
    document.getElementById("close").innerHTML = `<i class="fa-light fa-arrow-right-to-arc"></i> Profile`;
    document.getElementById("close").classList.add("primary");
    document.getElementById("close").classList.remove("secondary");
    document.getElementById("close").addEventListener("click", () => {
        location.href = "../profile/index.html";
    });
    document.getElementById("donotrefresh").remove();
    document.getElementById("progression").remove();
    document.getElementById("convert_btn").remove();
    document.getElementById("transferinprogress").innerHTML = `<i class="fa-light fa-check"></i> Transfer completed!`;
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        document.getElementById("login_a").href = "login.html?redirect=" + getRedirectUrl();
        document.getElementById("transfer").style.display = "none";
        document.getElementById("login").style.display = "unset";
        return;
    }
    const userData = doc(db, "users", user.uid);
    const data = await getDoc(userData).then((res) => res.data());
    if (data.version != undefined && data.version == 2) {
        document.getElementById("already").style.display = "unset";
        document.getElementById("transfer").style.display = "none";
    }
    document.getElementById("convert_btn").addEventListener("click", start);
});

document.getElementById("upgrade").addEventListener("click", () => {
    document.getElementById("transfere").showModal();
});