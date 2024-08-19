// Host screen (before game start)

import { auth, onAuthStateChanged, realtime, realtimeGet, realtimeUpdate, ref } from "../../js/util/firebase.js";
import { setupGame, removeGame, listenForEvent, init, sendEventToClients, Bluekid, gameId } from "../js/util.js"

function decompileGamemodeInfo() {
    const data = sessionStorage.getItem("gamemode_info");
    if (data == null) {
        return null;
    }
    const json = JSON.parse(data);

    const info = JSON.parse(json.gamemodeInfo);
    const settings = JSON.parse(json.gamemodeSettings);

    return {info, settings}
}

const getRandomInteger = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min)) + min
}

function generateCode() {
    const number1 = getRandomInteger(0, 9);
    const number2 = getRandomInteger(0, 9);
    const number3 = getRandomInteger(0, 9);
    const number4 = getRandomInteger(0, 9);
    const number5 = getRandomInteger(0, 9);
    const number6 = getRandomInteger(0, 9);

    const finalString = number1.toString() + number2.toString() + number3.toString() + number4.toString() + number5.toString() + number6.toString();
    const finalNumber = parseInt(finalString);

    return finalNumber;
}

async function kick(plrdata) {
    const reference = ref(realtime, "games/" + gameId)
    let _data = await realtimeGet(reference);
    _data = _data.val().players;
    const dataidx = _data.indexOf(plrdata)
    _data.splice(dataidx);
    await realtimeUpdate(reference, {
        players: _data
    });
    document.getElementById(plrdata.uid).remove();
    sendEventToClients(Bluekid.GetUIDPlayers(), "bluekid__updatePlayers", {
        players: _data
    });
}

/**
 * what the
 * @param {{uid, username, hasAccount}} data 
 */
function addPlayer(data) {
    const clone = document.getElementById("playerex").cloneNode(true);
    clone.id = data.uid;
    clone.addEventListener("mouseenter", () => {
        clone.children[0].setAttribute("show", "");
    });
    clone.addEventListener("mouseleave", () => {
        clone.children[0].removeAttribute("show");
    });
    clone.children[0].children[0].addEventListener("click", async () => {
        // kicky wicky
        kick(data);
    });
    clone.children[0].children[1].href = location.origin + "/profile/user/index.html?id=" + data.uid;
    clone.children[2].innerText = data.username;
    if (!data.hasAccount) {
        clone.children[0].children[1].remove();
    }

    document.getElementById("players").append(clone);
}

document.getElementById("closeup_close").addEventListener("click", () => {
    document.getElementById("closeup_bg").removeAttribute("show");
});
document.getElementById("gameidcard").addEventListener("click", () => {
    document.getElementById("closeup_bg").setAttribute("show", "");
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("you're not logged in. what");
        return;
    }
    

    document.getElementById("interaction").showModal();
    document.getElementById("clickme").addEventListener("click", async () => {
        document.getElementById("interaction").close();

        document.getElementById("preparing").showModal();
        let decompiled = decompileGamemodeInfo();
        const code = generateCode();
        console.log("Game code: " + code);

        const map = new Map(decompiled.settings);
        const settings = {};
        map.forEach((val, key) => {
            settings[key] = val;
        });
        await setupGame(auth.currentUser, {
            code,
            settings,
            gamemode: decompiled.info.id
        });
        document.getElementById("preparing_detail").innerHTML = "Updating UI";
        document.getElementById("gameidcard").innerHTML = code;
        document.getElementById("closeup_code").innerHTML = code;
        
        init();
        listenForEvent("bluekid__playerjoin", async (dbdata, data) => {
            const players = await Bluekid.GetUIDPlayers();
            let allPlayers = await realtimeGet(ref(realtime, "games/" + gameId));
            allPlayers = allPlayers.val().players;
            addPlayer({
                uid: dbdata.sender,
                username: data.username,
                hasAccount: data.hasAccount
            })
            sendEventToClients(players, "bluekid__updatePlayers", {
                players: allPlayers
            });
        });
        listenForEvent("bluekid__playerleave", async (dbdata, data) => {
            const game = ref(realtime, "games/" + gameId)
            let allPlayers = await realtimeGet(game);
            allPlayers = allPlayers.val().players;
            allPlayers.splice(data.id-1);

            await realtimeUpdate(game, {
                players: allPlayers
            });
            document.getElementById(dbdata.sender).remove();

            sendEventToClients(players, "bluekid__updatePlayers", {
                players: allPlayers
            });
        })

        document.getElementById("preparing").close();
    });

    window.addEventListener("beforeunload", async (event) => {
        removeGame();
    });

    
    // var reference = ref(realtime, "games/" + code);
    // onDisconnect(reference, (snap) => {
    //     removeGame();
    // });
});
