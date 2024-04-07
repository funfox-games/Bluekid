firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        //logged in
        var uid = user.uid;
        console.log("Logged in: " + uid);
        var username = await firebase.firestore().collection("users").doc(uid).get().then((res) => res.data().username);
        showNotification(1, "Logged in as " + username);
        document.getElementById("notloggedin").style.display = "none";
    } else {
        console.log("Not logged in")
    }
})