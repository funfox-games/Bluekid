// Joinned client (before game start)

import { auth, onAuthStateChanged, onValue, realtime, realtimeGet, realtimeUpdate, ref } from "../../js/util/firebase.js"
import { BluekidClient, listenForEvent, sendEventToOwner } from "./clientUtil.js";

var gameId;

function gameExists(id){
    return new Promise(async (res, rej) => {
        const gameRef = ref(realtime, "games/" + id);
        const data = await realtimeGet(gameRef);
        res(data.exists())
    });
}

onAuthStateChanged(auth, async (user) => {
    const gamedata = JSON.parse(sessionStorage.getItem("joinningGame"));
    gameId = gamedata.gameId;
    BluekidClient.setGameId(gameId);
    const exists = await gameExists(gameId);
    if (!exists) {
        location.href = "../join.html?error=game_not_exist";
        return;
    }
    const gameRef = ref(realtime, "games/" + gameId);
    let gameDeleted = false;
    const clientid = await BluekidClient.addPlayer(gamedata.username);
    setTimeout(() => {
        onValue(gameRef, (snap) => {
            console.log(snap.exists());
            if (snap.exists() == false) {
                gameDeleted = true;
                location.href = "../join.html?error=game_deleted";
                return;
            }
            if (snap.val().players) {
                /**
                 * @type {Array}
                 */
                const plrs = snap.val().players;
                console.log(plrs, clientid - 1, plrs[clientid]);
                //debugger;
                if (plrs[clientid - 1] == null) {
                    location.href = "../join.html?error=kicked";
                    return;
                }
            } else {
                location.href = "../join.html?error=kicked";
                return;
            }
        });
    }, 500);
    
    //const dbdata = await realtimeGet(ref(realtime, "games/" + gamedata.gameId));

    window.addEventListener("beforeunload", async (event) => {
        if (gameDeleted) {
            return;
        }
        sendEventToOwner("bluekid__playerleave", {id: clientid});
    });
});