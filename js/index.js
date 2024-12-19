import { onAuthStateChanged, auth, db, doc, getDoc, signOut, forceOffline } from "./util/firebase.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        //logged in
        var uid = user.uid;
        console.log("Logged in: " + uid);
        document.getElementById("signin").innerHTML = "Profile";
        document.getElementById("signin").href = "profile/index.html";
        var doc_ = doc(db, "users", uid);
        var data = await getDoc(doc_).then((res) => {
            if (!res.exists()) {
                return "UNKNOWN";
            }
            return res.data().username;
        });
        document.getElementById("login_name").innerText = data;
        document.getElementById("yourLoggedIn").showModal();
        document.getElementById("yourLoggedIn").addEventListener("close", async (e) => {
            if (document.getElementById("yourLoggedIn").returnValue === "signout"){
                await forceOffline();
                await signOut(auth);
                // location.reload();
            }
            document.getElementById("yourLoggedIn").removeEventListener("close", (e));
        });
    } else {

    }
})

showNotification(1, "Bluekid is under development mode. Tomarrow may be a little different ;D");