import { auth, db, doc, getDoc, onAuthStateChanged } from "../util/firebase.js";
import * as allgamemodes from "../../asset/gamemodes.json" with {type: "json"}
import { clickGamemode, refreshSettings, currentGamemode, gamemodeSelectedSettings, settingObjects } from "./gamemodehandler.js";

const gamemodes = allgamemodes.default.gamemodes;
let data;

function saveSettings() {
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
}

async function runSelectSequence(type) {
    document.getElementById(type).style.display = "flex";
    document.getElementById(type).style.opacity = "0";
    document.getElementById(type).style.top = "70%";
    setTimeout(() => {
        document.getElementById("options").style.transitionDuration = "1s";
        document.getElementById("options").style.transitionTimingFunction = "cubic-bezier(0.445, 0.05, 0.55, 0.95)";
        document.getElementById(type).style.transitionDuration = "1s";
        document.getElementById(type).style.transitionTimingFunction = "cubic-bezier(0.445, 0.05, 0.55, 0.95)";
        document.getElementById("options").style.top = "70%";
        document.getElementById("options").style.opacity = "0";
        document.getElementById(type).style.top = "50%";
        document.getElementById(type).style.opacity = "1";

        setTimeout(() => {
            document.getElementById("options").style.display = "none";
        }, 1000)
    }, 10)
    
}

function loadStudy() {
    document.getElementById("studymodes").innerHTML = "";
    gamemodes.solo.forEach((val, idx) => {
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
        clone.addEventListener("click", async () => {
            clickGamemode(gamemodes.solo[idx], data);

            refreshSettings();
            saveSettings();
        });

        document.getElementById("studymodes").append(clone);
    });
}
function loadGame() {
    document.getElementById("gamemodes").innerHTML = "";
    gamemodes.competitive.forEach((val, idx) => {
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
        clone.addEventListener("click", async () => {
            clickGamemode(gamemodes.competitive[idx], data);

            refreshSettings();
            saveSettings();
        });

        document.getElementById("gamemodes").append(clone);
    });
}

function runStudy() {
    loadStudy();
}

function runGame() {
    loadGame();
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }
    const _data = await getDoc(doc(db, "users", auth.currentUser.uid));
    data = _data.data();
    for (let i = 0; i < document.getElementsByClassName("gamemodeType").length; i++) {
        const elem = document.getElementsByClassName("gamemodeType")[i];
        elem.addEventListener("click", () => {
            runSelectSequence(elem.classList[1]);
            if (elem.classList[1] == "study") {
                runStudy();
            } else {
                runGame();
            }
        })
    }
    for (let i = 0; i < document.getElementsByClassName("goback").length; i++) {
        const elem = document.getElementsByClassName("goback")[i];
        elem.addEventListener("click", () => {
            document.getElementById("options").style.transitionDuration = "0";
            document.getElementById(elem.classList[2]).style.transitionDuration = "0";
            document.getElementById("options").style.display = "flex";
            document.getElementById("options").style.opacity = "0";
            document.getElementById("options").style.top = "70%";
            setTimeout(() => {
                document.getElementById("options").style.transitionDuration = "1s";
                document.getElementById(elem.classList[2]).style.transitionDuration = "1s";
                document.getElementById("options").style.top = "50%";
                document.getElementById("options").style.opacity = "1";
                document.getElementById(elem.classList[2]).style.top = "70%";
                document.getElementById(elem.classList[2]).style.opacity = "0";

                setTimeout(() => {
                    document.getElementById(elem.classList[2]).style.display = "none";
                }, 1000)
            }, 10)
        })
    }

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
        saveSettings();
        document.getElementById("gamemode_settings").close();
    });
    document.getElementById("host").addEventListener("click", () => {
        document.getElementById("gamemode_host_prepare").showModal();

        const parsedGamemodeInfo = JSON.stringify(currentGamemode);
        if (currentGamemode.limitedAccess) {
            if (!data.limitedAccess) {
                return;
            }
        }

        console.log(gamemodeSelectedSettings[currentGamemode.id]);
        const parsedGamemodeSettings = JSON.stringify(Array.from(gamemodeSelectedSettings[currentGamemode.id].entries()));
        sessionStorage.setItem("gamemode_info", JSON.stringify({
            gamemodeInfo: parsedGamemodeInfo,
            gamemodeSettings: parsedGamemodeSettings
        }));

        if (currentGamemode.isSoloOnly) {
            console.log({
                gamemodeInfo: parsedGamemodeInfo,
                gamemodeSettings: parsedGamemodeSettings
            });
            location.href = "./" + currentGamemode.id + "/index.html";
            return;
        }

        setTimeout(() => {
            location.href = "./bigscreen.html";
        }, 750);

        // JSON.parse(gamemodeInfo)
        // new Map(JSON.parse(gamemodeSettings))
    });
})