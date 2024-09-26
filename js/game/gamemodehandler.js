export let currentGamemode;
export let gamemodeSelectedSettings = {};
export let settingObjects = [];

export function refreshSettings() {
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

export function clickGamemode(mode, userdata) {
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