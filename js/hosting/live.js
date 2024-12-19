import { auth, finishLoading, firefoxAgent, functions, HOSTING_VERSION, httpsCallable, insertLoadingScreen, onAuthStateChanged, onValue, realtime, realtimeRemove, ref, updateLoadingInfo } from "../util/firebase.js";

function generateSettingType(id, data) {
    const clone = document.getElementById(data.type).cloneNode(true);
    clone.id = id;
    clone.removeAttribute("example");
    clone.setAttribute("type", data.type);
    switch (data.type) {
        case "number":
            clone.children[0].innerHTML = data.display + " ";
            clone.children[1].value = data.defaultValue;
            clone.children[1].placeholder = data.defaultValue;
            if (data.icon != null) {
                clone.children[0].prepend(" ");
                const i = document.createElement("i");
                i.className = "fa-light fa-" + data.icon;
                clone.children[0].prepend(i);
            }
            if (data.extraInfo != null) {
                const i = document.createElement("i");
                i.className = "fa-light fa-circle-question";
                i.title = data.extraInfo;
                clone.children[0].appendChild(i);
            }
            clone.setAttribute("value", clone.children[1].value);
            clone.children[1].addEventListener("change", () => {
                clone.setAttribute("value", clone.children[1].value);
            })

            break;
        case "bool":
            clone.id = id + "__parent";
            clone.children[0].for = id;
            clone.children[0].children[0].id = id;
            clone.children[0].children[2].innerText = data.display + " ";
            if (data.extraInfo != null) {
                const i = document.createElement("i");
                i.className = "fa-light fa-circle-question";
                i.title = data.extraInfo;
                clone.children[0].children[2].appendChild(i);
            }
            clone.children[0].checked = data.defaultValue;
            clone.setAttribute("value", clone.children[0].checked);
            clone.children[0].addEventListener("change", () => {
                clone.setAttribute("value", clone.children[0].checked);
            })
        default:
            break;
    }

    return clone;
}

function convertDictToArray(dict) {
    var list = [];
    for (var key in dict) {
        if (dict.hasOwnProperty(key)) {
            list.push( [ key, dict[key] ] );
        }
    }
    return list;
}

function generateSettingSection(id, data) {
    const clone = document.getElementById("sectex").cloneNode(true);
    clone.id = id;
    clone.children[0].innerHTML = data.display;

    const list = convertDictToArray(data.settings);
    console.log(list);
    for (let i = 0; i < list.length; i++) {
        const id = list[i][0];
        const data = list[i][1];

        clone.children[1].append(generateSettingType(id, data));
    }

    document.getElementById("settings").append(clone);
}
let gameId = null;
let settings = {
    gamemodeSettings: {},
    privacySettings: {
        whoCanJoin: "friends",
        codeAlwaysVisible: true,
        requireAccount: false
    },
    playerSettings: {
        maxPlayers: 8,
        randomizedUsernames: false
    }
}

function updateSettings() {
    // GAMEMODE SETTINGS
    const sections = document.getElementsByClassName("settingsSection");
    for (let i = 0; i < sections.length; i++) {
        const element = sections[i];
        if (element.id == "sectex") {continue;}
        settings.gamemodeSettings[element.id] = {};
        const content = element.children[1].children;
        console.log(content)
        for (let ii = 0; ii < content.length; ii++) {
            const val = content[ii];
            settings.gamemodeSettings[element.id][val.id] = {type: val.getAttribute("type"), value: val.getAttribute("value")};
        }
    }

    // PRIVACY SETTINGS
    settings.privacySettings.whoCanJoin = document.getElementById("privacy").value;
    settings.privacySettings.requireAccount = document.getElementById("requireAccount").checked;
    settings.privacySettings.codeAlwaysVisible = document.getElementById("codeAlwaysVisible").checked;

    // PLAYER SETTINGS
    settings.playerSettings.maxPlayers = document.getElementById("maxPlayers").value;
    settings.playerSettings.randomizedUsernames = document.getElementById("randomizedUsernames").checked;
}

function random(min, max) {
    return Math.floor((Math.random())*(max-min+1))+min;
}

function wait(sec) {
    return new Promise(async (res, rej) => {
        setTimeout(() => res(), sec * 1000);
    });
}

function startGameListeners() {
    const _ref = ref(realtime, "games/" + gameId);
    const _playerRef = ref(realtime, "games/" + gameId + "/players");

    onValue(_playerRef, (snap) => {
        let data = snap.val();
        console.log(data);
        if (data == null) { document.getElementById("players").innerHTML = ''; return; }
        data = convertDictToArray(data);
        function refresh() { 
            document.getElementById("players").innerHTML = '';
            for (let i = 0; i < data.length; i++) {
                const element = data[i][1];
                const clone = document.getElementById("plrex").cloneNode(true);
                clone.id = element.username;
                clone.children[0].src = "../asset/char/" + element.icon;
                clone.children[1].children[0].innerText = element.username;
                if (element.badges != null) {
                    for (let ii = 0; ii < element.badges.length; ii++) {
                        const badge = element.badges[ii];
                        const img = document.createElement("img");
                        img.src = "../../asset/badges/" + badge.replace(" ", "") + ".png";
                        img.alt = "badge";
                        img.width = "24";
                        clone.children[1].children[1].appendChild(img);
                    }
                }
                console.log(element, clone);
                document.getElementById("players").append(clone);
            }
        }

        refresh();
    });
}

const parms = new URLSearchParams(location.search);
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("get out.");
        location.href = "../auth/login.html";
        return;
    }
    
    

    setInterval(() => {
        if (document.getElementById("code1").hasAttribute("stoploading")) {return;}
        
        document.getElementById("code1").innerHTML += ".";
        if (document.getElementById("code1").innerHTML == "....") {
            document.getElementById("code1").innerHTML = ".";
        }
    }, 750)

    const hostOriginalHTML =  document.getElementById("startHosting").innerHTML;
    document.getElementById("startHosting").addEventListener("click", async () => {
        updateSettings();
        document.getElementById("startHosting").setAttribute("disabled", "");
        document.getElementById("startHosting").innerHTML = `<i class="fa-light fa-spinner fa-spin"></i> Preparing functions...`;
        const start = httpsCallable(functions, "hosting-startHosting");
        console.log("start");
        insertLoadingScreen("startHost");
        updateLoadingInfo("startHost", "[Action may take a while to warm up]");
        const data = await start({
            settings,
            gamemodeIdx: parms.get("gamemode"),
            initalGameData: null
        });
        console.log(data);
        finishLoading("startHost");
        if (data.data.success == false) {
            switch (data.data.error) {
                case "standard/maxplayerslimit":
                    document.getElementById("startHosting").removeAttribute("disabled");
                    document.getElementById("startHosting").innerHTML = hostOriginalHTML;
                    document.getElementById("maxPlayersLimit").setAttribute("show", "");
                    document.getElementById("maxPlayers").addEventListener("change", () => {
                        document.getElementById("maxPlayersLimit").removeAttribute("show");
                    }, { once: true })
                    break;
                default:
                    break;
            }
            return;
        }
        gameId = data.data.code;
        startGameListeners();
        if (settings.privacySettings.codeAlwaysVisible == true) {
            document.getElementById("toggleCodeVisibility").style.display = "none";
        }
        document.getElementById("maxplayers").innerHTML = settings.playerSettings.maxPlayers
        document.getElementById("startHosting").innerHTML = `Done`;
        console.log(data);
        document.getElementById("codeAnimation").setAttribute("enter", "");
        await wait(random(3, 5));
        document.getElementById("code1").setAttribute("stoploading", "");
        document.getElementById("code1").innerHTML = data.data.code;
        document.getElementById("code2").innerHTML = data.data.code;
        new QRCode("qrcode", {
            text: "https://bluekid.netlify.app/join?id=" + data.data.code,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        await wait(1);
        document.getElementById("codeAnimation").removeAttribute("enter", "");
        document.getElementById("codeAnimation").setAttribute("leave", "");
        document.getElementById("host_preperation").setAttribute("hide", "");
        await wait(1);
        document.getElementById("host_preperation").style.display = "none";
    });
    document.getElementById("limitFixIt").addEventListener("click", () => {
        document.getElementById("maxPlayers").value = "45";
        document.getElementById("maxPlayersLimit").removeAttribute("show");
    });
});

async function closeGameFromInactivity() {
    document.title = "Game closed | Bluekid";
    document.getElementById("gameClosed").showModal();
    await realtimeRemove(ref(realtime, "games/" + gameId));
    gameId = null;
}

document.body.onload = async () => {
    if (firefoxAgent) {
        document.getElementById("firefoxnotsupported").showModal();
        return;
    }
    document.getElementById("version").innerHTML = HOSTING_VERSION;
    window.addEventListener("beforeunload", async function (e) {
        console.log(gameId)
        if (gameId == null) {
            return;
        }
        // deleteGame(gameId);
        await realtimeRemove(ref(realtime, "games/" + gameId));
    });
    let __listener;
    document.addEventListener("visibilitychange", () => {
        if (gameId == null) {return;}
        if (document.hidden) {
            // alert("LOST SIGHT");
            document.title = `Code: ${gameId} | Bluekid`
            __listener = setTimeout(() => {
                closeGameFromInactivity();
            }, (5 * 60) * 1000);
        } else {
            document.title = "Host | Bluekid";
            clearTimeout(__listener);
            __listener = -1;
        }
    });
    document.getElementById("maxPlayers").addEventListener("change", () => {
        if (parseInt(document.getElementById("maxPlayers").value) > 200) {
            document.getElementById("maxPlayers").value = "200";
        }
    });

    const __allgamemodes = await fetch("../asset/gamemodes.json");
    const allgamemodes = await __allgamemodes.json();
    const gamemode = allgamemodes.gamemodes[parms.get("gamemode")];
    const settings = convertDictToArray(gamemode.settings);

    document.getElementById("gamemodename").innerHTML = gamemode.display;

    for (let i = 0; i < settings.length; i++) {
        const id = settings[i][0];
        const data = settings[i][1];
        
        generateSettingSection(id, data);
    }
}