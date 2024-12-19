import { onAuthStateChanged, auth, db, doc, getDoc, FirebaseHelper, ref, realtime, realtimeGet, HOSTING_VERSION, signInAnonymously, hasBluekidPlus } from "./util/firebase.js";

// const url = new URL(window.location.href);
function showJoinError(msg) {
    showNotification(2, msg);
}

let isLoggedInFully = null;
onAuthStateChanged(auth, async (user) => {
    document.getElementById("hostingversion").innerHTML = HOSTING_VERSION;

    const searchParams = new URLSearchParams(location.search);
    const error = searchParams.get("error");
    if (error != null) {
        switch (error) {
            case "game_not_exist":
                showJoinError("Joinned game didn't exist.");
                break;
            case "game_deleted":
                showJoinError("Owner left.");
                break;
            case "kicked":
                showJoinError("Kicked.");
                break;
            case "inactive":
                showJoinError("Inactive for 5 minutes.");
                break;
        }
        window.history.pushState(null, '', window.location.pathname);
    }

    let userdata = null;
    if (user != null) {
        isLoggedInFully = !user.isAnonymous;
        if (isLoggedInFully) {
            //logged in
            var uid = user.uid;
            console.log("Logged in: " + uid);
            userdata = await FirebaseHelper.getUserData(uid);
            showNotification(1, "Logged in as " + userdata.username);
            document.getElementById("notloggedin").style.display = "none";
        } else {
            console.log("Anonymous")
            document.getElementById("notloggedin").innerHTML = `<i class="fa-light fa-warning"></i> You aren't logged in.`;
            signInAnonymously(auth);
        }
    } else {
        console.log("Not logged in")
        document.getElementById("notloggedin").innerHTML = `<i class="fa-light fa-warning"></i> You aren't logged in.`;
        signInAnonymously(auth);
    }

    if (await hasBluekidPlus()) {
        const span = document.createElement("span");
        span.innerHTML = " Plus";
        span.className = "plusColor";
        document.getElementById("title").appendChild(span);
    }

    const original = document.getElementById("join").innerHTML;
    document.getElementById("join").addEventListener('click', async () => {
        function resetbtn(){
            document.getElementById("join").removeAttribute("disabled");
            document.getElementById("join").innerHTML = original;
        }
        document.getElementById("join").setAttribute("disabled", "");
        document.getElementById("join").innerHTML = "Loading...";
        let gid = document.getElementById("gid").value;
        gid = parseInt(gid);
        if (gid == null || gid.toString() == "NaN") {
            showJoinError("Game ID but be a number.");
            resetbtn();
            return;
        }

        const gameRef = ref(realtime, "games/" + gid);
        const data = await realtimeGet(gameRef);
        console.log(data);
        if (!data.exists()) {
            showJoinError("Game doesn't exist.");
            resetbtn();
            return;
        }

        if (!isLoggedInFully) {
            // document.getElementById("notLoggedIn").showModal();
        } else {
            // sessionStorage.setItem("joinningGame", JSON.stringify({
            //     gameId: gid,
            //     username: userdata.username
            // }));
            // location.href = "./game/client.html";
        }
        location.href = `./hosting/client.html?id=${gid}`
    });
})
