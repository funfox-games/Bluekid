import { onAuthStateChanged, auth, db, doc, getDoc, FirebaseHelper, ref, realtime, realtimeGet, HOSTING_VERSION } from "./util/firebase.js";

const url = new URL(window.location.href);
const searchParams = url.searchParams;

function showJoinError(msg) {
    showNotification(2, msg);
}

onAuthStateChanged(auth, async (user) => {
    document.getElementById("hostingversion").innerHTML = HOSTING_VERSION;

    const error = searchParams.get("error");
    if (error) {
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
        }
        searchParams.delete("error");
    }

    let userdata = null;
    if (user) {
        //logged in
        var uid = user.uid;
        console.log("Logged in: " + uid);
        userdata = await FirebaseHelper.getUserData(uid);
        showNotification(1, "Logged in as " + userdata.username);
        document.getElementById("notloggedin").style.display = "none";
    } else {
        console.log("Not logged in")
        document.getElementById("notloggedin").innerHTML = `<i class="fa-solid fa-warning"></i> You aren't logged in.`;
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
        console.log(gid);
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

        if (!user) {
            document.getElementById("setUsername").showModal();
        } else {
            sessionStorage.setItem("joinningGame", JSON.stringify({
                gameId: gid,
                username: userdata.username
            }));
            location.href = "./game/client.html";
        }
    });

    document.getElementById("setusernamejoin").addEventListener('click', () => {
        sessionStorage.setItem("joinningGame", JSON.stringify({
            gameId: gid,
            username: document.getElementById("username").value
        }));
        location.href = "./game/client.html";
    })
})
