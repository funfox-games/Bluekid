import { FirebaseHelper, auth, onAuthStateChanged } from "../util/firebase.js";
import * as allgamemodes from "../../asset/gamemodes.json" with {type: "json"}

const gamemodes = allgamemodes.default.gamemodes;

let settingObjects = [];

let userdata;
let currentGamemode;

let gamemodeSelectedSettings = {};

function getAllTags() {
    const allTags = [];
    gamemodes.forEach((val, _) => {
        val.tags.forEach((value, _) => {
            if (allTags.includes(value)) {return;}
            allTags.push(value);
        });
    })
    return allTags;
}


function refreshSettings() {
    const settings = document.getElementById("settings");
    settings.innerHTML = "";

    console.log("refresh settings");


    Object.entries(currentGamemode.settings).forEach((value, _) => {
        const sectid = value[0];
        const values = value[1];
        const sectdisplay = values.display;
        const sect = document.getElementById("examplesection").cloneNode(true);
        sect.id = sectid;
        sect.children[0].innerHTML = sectdisplay;
        document.getElementById("settings").append(sect);

        settingObjects = [];

        Object.entries(values.settings).forEach((val, idx) => {
            const settingName = val[0];
            const value = val[1];
            const type = value.type;
            const defaultValue = value.defaultValue;
            const friendlyname = value.display;
            const extra = value.extraInfo;

            const pushData = {
                name: friendlyname,
                settingName
            }

            switch (type) {
                case "bool":
                    const clone = document.getElementById("checkboxex").cloneNode(true);
                    clone.id = "";
                    clone.setAttribute("for", settingName);
                    clone.children[0].id = settingName;
                    clone.children[0].checked = defaultValue;
                    clone.children[2].innerHTML = friendlyname;

                    if (extra != null) {
                        clone.children[2].innerHTML += ` <i class="fa-solid fa-circle-question" title="${extra}"></i>`;
                    }

                    sect.append(clone);
                    pushData["type"] = Boolean;
                    pushData["object"] = clone.children[0];
                    
                    if (gamemodeSelectedSettings[currentGamemode.id] != null) {
                        const value = gamemodeSelectedSettings[currentGamemode.id].get(settingName);
                        clone.children[0].checked = value;
                    }

                    break;
                case "number":
                    const number = document.getElementById("numberex").cloneNode(true);
                    number.placeholder = defaultValue;
                    number.value = defaultValue;
                    number.id = settingName;
                    number.style.fontSize = "16px";
                    const label = document.createElement("label");
                    label.setAttribute("for", settingName);
                    label.innerHTML = friendlyname;
                    label.style.marginRight = "5px";

                    if (extra != null) {
                        label.innerHTML += ` <i class="fa-solid fa-circle-question" title="${extra}"></i>`;
                    }

                    sect.append(label);
                    sect.append(number);
                    pushData["type"] = Number;
                    pushData["object"] = number;

                    if (gamemodeSelectedSettings[currentGamemode.id] != null) {
                        const value = gamemodeSelectedSettings[currentGamemode.id].get(settingName);
                        number.value = value;
                    }

                    break;
                default:
                    break;
            }
            settingObjects.push(pushData);
        });
    });
    
}

function clickGamemode(mode) {
    currentGamemode = mode;
    if (document.getElementById("host").getAttribute("disabled")) {
        document.getElementById("host").removeAttribute("disabled");
        
    }
    document.getElementById("testingOnly").style.display = "none";
    if (mode.limitedAccess) {
        if (!userdata.limitedAccess) {
            document.getElementById("host").setAttribute("disabled", "true");
            document.getElementById("testingOnly").style.display = "flex";
        }
    }
    document.getElementById("gamemode_start").showModal();
    document.getElementById("gamemodeName").innerHTML = mode.display;
    document.getElementById("gamemodeDesc").innerHTML = mode.description;
    document.getElementById("gamemodecover").src = mode.cover;
    document.getElementById("modaltags").innerHTML = "";
    mode.tags.forEach((value, _) => {
        const tagClone = document.getElementById("modaltagex").cloneNode(true);
        tagClone.id = "";
        tagClone.innerHTML = value;
        document.getElementById("modaltags").append(tagClone);
    });
}

function loadAllGamemodes() {
    gamemodes.forEach((val, idx) => {
        const clone = document.getElementById("gamemodeex").cloneNode(true);
        clone.id = idx;

        const left = clone.children[0];
        left.children[0].innerHTML = val.display;
        if (val.limitedAccess) {
            left.children[0].innerHTML += ` <i class="fa-solid fa-lock"></i>`;
        }
        left.children[1].innerHTML = val.description;
        const tags = clone.children[1];
        val.tags.forEach((value, _) => {
            const tagClone = document.getElementById("tagex").cloneNode(true);
            tagClone.id = "";
            tagClone.innerHTML = value;
            tags.append(tagClone);
        });
        clone.setAttribute("tags", val.tags);
        clone.addEventListener("click", () => {
            clickGamemode(gamemodes[idx]);
        });

        document.getElementById("allgamemodes").append(clone);
    });
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
    }
    userdata = await FirebaseHelper.getUserData(user.uid);
    const tags = getAllTags();
    tags.forEach((val, idx) => {
        const option = document.createElement("option");
        option.id = idx;
        option.value = val;
        option.innerHTML = val;

        document.getElementById("filterTag").append(option);
    });
    // document.getElementById("friendsOnly").addEventListener("change", () => {
    //     const newvalue = document.getElementById("friendsOnly").checked;
    //     if (newvalue) {
    //         document.getElementById("friendsJoin").checked = true;
    //         document.getElementById("friendsJoin").setAttribute("disabled", "true");
    //     } else {
    //         document.getElementById("friendsJoin").removeAttribute("disabled");
    //     }
    // });
    document.getElementById("modesettings").addEventListener('click', () => {
        refreshSettings();
        document.getElementById("gamemode_settings").showModal();
    });
    document.getElementById("close").addEventListener("click", () => {
        document.getElementById("gamemode_start").close();
    });
    document.getElementById("testingclose").addEventListener("click", () => {
        document.getElementById("gamemode_start").close();
    })
    document.getElementById("apply").addEventListener("click", () => {
        let result = new Map();
        for (let i = 0; i < settingObjects.length; i++) {
            var settingObj = settingObjects[i];
            const type = settingObj.type;
            const object = settingObj.object;
            const settingName = settingObj.settingName;


            switch (type) {
                case Boolean:
                    const bool = object.checked;
                    result.set(settingName, bool);
                    break;
                case Number:
                    const num = object.value;
                    result.set(settingName, parseInt(num));
                    break;
            }
        }
        gamemodeSelectedSettings[currentGamemode.id] = result;
        document.getElementById("gamemode_settings").close();
    });
    document.getElementById("host").addEventListener("click", () => {
        document.getElementById("gamemode_host_prepare").showModal();

        const parsedGamemodeInfo = JSON.stringify(currentGamemode);
        if (currentGamemode.limitedAccess) {
            if (!userdata.limitedAccess) {
                return;
            }
        }

        console.log(gamemodeSelectedSettings[currentGamemode.id]);
        const parsedGamemodeSettings = JSON.stringify(Array.from(gamemodeSelectedSettings[currentGamemode.id].entries()));
        sessionStorage.setItem("gamemode_info", JSON.stringify({
            gamemodeInfo: parsedGamemodeInfo,
            gamemodeSettings: parsedGamemodeSettings
        }));

        setTimeout(() => {
            location.href = "./bigscreen.html";
        }, 750);

        // JSON.parse(gamemodeInfo)
        // new Map(JSON.parse(gamemodeSettings))
    });
    loadAllGamemodes();
})

