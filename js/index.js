firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        //logged in
        var uid = user.uid;
        console.log("Logged in: " + uid);
        document.getElementById("signin").innerHTML = "Profile";
        var data = await firebase.firestore().collection("users").doc(uid).get().then((res) => res.data().username);
        document.getElementById("login_name").innerText = data;
        document.getElementById("yourLoggedIn").showModal();
        document.getElementById("yourLoggedIn").addEventListener("close", (e) => {
            if (document.getElementById("yourLoggedIn").returnValue === "profile") {
                alert("Profile doesn't exists");
            }
            document.getElementById("yourLoggedIn").removeEventListener("close");
        });
    } else {

    }
})