import { onAuthStateChanged, auth, db, doc, getDoc } from "./util/firebase.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        //logged in
        var uid = user.uid;
        console.log("Logged in: " + uid);
        var doc_ = doc(db, "users", uid);
        var username = await getDoc(doc_).then((res) => res.data().username);
        showNotification(1, "Logged in as " + username);
        document.getElementById("notloggedin").style.display = "none";
    } else {
        console.log("Not logged in")
    }
})