import { auth, collection, db, doc, finishLoading, getDoc, getDocs, hasBluekidPlus, HOSTING_VERSION, insertLoadingScreen, onAuthStateChanged } from "../util/firebase.js";
class BubbleSwitch {
    static toOne() {
        document.getElementsByClassName("progress")[0].children[0].setAttribute("done", "");
        document.getElementsByClassName("progress")[0].children[1].setAttribute("progressed", "");
    }
    static toTwo() {
        document.getElementsByClassName("progress")[0].children[1].removeAttribute("progressed");
        document.getElementsByClassName("progress")[0].children[1].setAttribute("done", "");
        document.getElementsByClassName("progress")[0].children[2].setAttribute("done", "");
        document.getElementsByClassName("progress")[0].children[3].setAttribute("progressed", "");
    }
    static toThree() {
        document.getElementsByClassName("progress")[0].children[3].removeAttribute("progressed");
        document.getElementsByClassName("progress")[0].children[3].setAttribute("done", "");
        document.getElementsByClassName("progress")[0].children[4].setAttribute("done", "");
    }
    static reset() {
        document.getElementsByClassName("progress")[0].children[0].removeAttribute("progressed");
        document.getElementsByClassName("progress")[0].children[0].removeAttribute("done");
        document.getElementsByClassName("progress")[0].children[1].removeAttribute("progressed");
        document.getElementsByClassName("progress")[0].children[1].removeAttribute("done");
        document.getElementsByClassName("progress")[0].children[2].removeAttribute("progressed");
        document.getElementsByClassName("progress")[0].children[2].removeAttribute("done");
        document.getElementsByClassName("progress")[0].children[3].removeAttribute("progressed");
        document.getElementsByClassName("progress")[0].children[3].removeAttribute("done");
        document.getElementsByClassName("progress")[0].children[4].removeAttribute("progressed");
        document.getElementsByClassName("progress")[0].children[4].removeAttribute("done");
    }
}

let currentStep = 1;

function setupViewListener() {
    for (let i = 0; i < document.getElementById("allkits").children.length; i++) {
        const elem = document.getElementById("allkits").children[i];
        elem.children[1].children[0].children[0].setAttribute("originalHTML", elem.children[1].children[0].children[0].innerHTML);
        if (elem.children[1].children[0].children[0].innerHTML.length >= 13) {
            elem.children[1].children[0].children[0].innerHTML = elem.children[1].children[0].children[0].innerHTML.substring(0, 12) + "...";
        }
    }
    document.getElementById("kitviewswitcher").children[0].addEventListener("click", () => {
        document.getElementById("kitviewswitcher").children[0].setAttribute("selected", "");
        document.getElementById("kitviewswitcher").children[1].removeAttribute("selected");
        document.getElementById("allkits").removeAttribute("list");
        document.getElementById("allkits").setAttribute("grid", "");
        for (let i = 0; i < document.getElementById("allkits").children.length; i++) {
            const elem = document.getElementById("allkits").children[i];
            elem.children[1].children[0].children[0].setAttribute("originalHTML", elem.children[1].children[0].children[0].innerHTML);
            if (elem.children[1].children[0].children[0].innerHTML.length >= 13) {
                elem.children[1].children[0].children[0].innerHTML = elem.children[1].children[0].children[0].innerHTML.substring(0, 12) + "...";
            }
        }
    });
    document.getElementById("kitviewswitcher").children[1].addEventListener("click", () => {
        document.getElementById("kitviewswitcher").children[1].setAttribute("selected", "");
        document.getElementById("kitviewswitcher").children[0].removeAttribute("selected");
        document.getElementById("allkits").removeAttribute("grid");
        document.getElementById("allkits").setAttribute("list", "");
        for (let i = 0; i < document.getElementById("allkits").children.length; i++) {
            const elem = document.getElementById("allkits").children[i];
            if (!elem.children[1].children[0].children[0].hasAttribute("originalHTML")) {
                continue
            }
            elem.children[1].children[0].children[0].innerHTML = elem.children[1].children[0].children[0].getAttribute("originalHTML");
            elem.children[1].children[0].children[0].removeAttribute("originalHTML");
        }
    });
}

let selectedKit = "";
let selectedKitName = "";
async function loadAndShowKits(onKitSelected) {
    return new Promise(async (res, rej) => {
        insertLoadingScreen("loadKits", document.getElementById("content").parentElement);
        const _data = await getDocs(collection(db, "users", auth.currentUser.uid, "kits"));
        if (_data.empty == true) {
            document.getElementById("loadingKits").innerHTML = `<i class="fa-light fa-circle-xmark"></i> No kits found.`;
            res();
            return;
        }
        document.getElementById("loadingKits").style.display = "none";
        let numCompleted = 0;
        _data.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            const clone = document.getElementById("kitex").cloneNode(true);
            clone.id = id;
            clone.children[0].children[0].src = data.cover
            clone.children[1].children[0].children[0].innerText = data.displayname;
            clone.children[1].children[0].children[1].innerText = data.description;
            clone.children[1].children[1].children[0].addEventListener("click", () => {
                selectedKit = id;
                selectedKitName = data.displayname;
                const all = document.getElementById("allkits").children;
                for (let i = 0; i < all.length; i++) {
                    const elem = all[i];
                    elem.children[1].removeAttribute("selected");
                    elem.children[1].children[1].children[0].removeAttribute("disabled");
                }
                clone.children[1].setAttribute("selected", "");
                clone.children[1].children[1].children[0].setAttribute("disabled", "");
                onKitSelected();
            });
            document.getElementById("allkits").appendChild(clone);
            numCompleted++;
            if (numCompleted == _data.size) {
                finishLoading("loadKits");
            }
        });
        res();
    });
}

async function initSwitchAnim(docid, nextdocid) {
    async function wait(sec) {
        return new Promise(async (res, rej) => {
            setTimeout(() => res(), sec * 1000);
        });
    }
    document.getElementById("nexterror").setAttribute("hide", "");
    document.getElementById("next").setAttribute("disabled", "");
    const doc1 = document.getElementById(docid);
    const doc2 = document.getElementById(nextdocid);
    doc1.setAttribute("leave", "");
    await wait(1.05);
    doc1.removeAttribute("leave");
    doc1.setAttribute("not_active", "");
    doc2.removeAttribute("not_active");
    doc2.setAttribute("enter", "");
    await wait(1);
    doc2.removeAttribute("enter");
}

const __allGamemodes = await fetch("../../asset/gamemodes.json");
const allGamemodes = await __allGamemodes.json();
async function loadGamemodes() {
    const bkp = await hasBluekidPlus();

    const data = await getDoc(doc(db, "users", auth.currentUser.uid));

    for (let i = 0; i < allGamemodes.gamemodes.length; i++) {
        const gamemode = allGamemodes.gamemodes[i];
        // console.log(gamemode);
        const display = gamemode.display;
        const desc = gamemode.description;
        const cover = gamemode.cover;
        const consideredNewUntil = gamemode.consideredNewUntil;
        const id = gamemode.id;
        const settings = gamemode.settings;
        const tags = gamemode.tags;
        const limitedAccess = gamemode.limitedAccess == null ? false : gamemode.limitedAccess;
        const bkponly = gamemode.bluekidPlusOnly == null ? false : gamemode.bluekidPlusOnly;

        const clone = document.getElementById("gamemodeex").cloneNode(true);
        clone.id = id;
        clone.children[0].children[0].src = cover;

        clone.children[1].children[0].children[0].children[0].innerText = display;
        const until = new Date(consideredNewUntil).getTime();
        const now = new Date().getTime();
        if (until > now) {
            const div = document.createElement("div");
            div.innerHTML = "NEW"
            div.className = "new";
            clone.children[1].children[0].children[0].children[0].appendChild(div);
        }
        if (limitedAccess == false) {
            clone.children[1].children[0].children[0].children[1].setAttribute("hide", "");
            if (bkponly == true) {
                clone.children[1].children[0].children[0].children[1].removeAttribute("hide");
                clone.children[1].children[0].children[0].children[1].innerHTML = "This kit is for Bluekid+ users only.";
            }
        }

        for (let ii = 0; ii < tags.length; ii++) {
            const tag = tags[ii];

            const div = document.createElement("div");
            div.innerHTML = tag;
            clone.children[1].children[0].children[1].append(div);
        }

        clone.children[1].children[1].children[0].addEventListener("click", () => {
            kitDetails(i, gamemode, data.data());
        });
        document.getElementById("allgamemodes").appendChild(clone);
    }
}

let selectedGamemodeIdx = -1;

function progress() {
    switch (currentStep) {
        case 1:
            BubbleSwitch.toOne();
            initSwitchAnim("one", "two");
            break;
        case 2:
            BubbleSwitch.toTwo();
            initSwitchAnim("two", "three");
            document.getElementById("gamemodereview").innerHTML = allGamemodes.gamemodes[selectedGamemodeIdx].display;
            document.getElementById("kitreview").innerHTML = selectedKitName;
            document.getElementById("proceedToHosting").href = `./live.html?type=private&kit=${selectedKit}&gamemode=${selectedGamemodeIdx}`;
            break;
        case 3:
            BubbleSwitch.toThree();
            break;
        default:
            break;
    }
    currentStep += 1;
}

const useOriginalHTML = document.getElementById("usegamemode").innerHTML;
let listener = null;
async function kitDetails(gid, gamemode, userdata) {
    document.getElementById("usegamemode").removeEventListener("click", listener);
    document.getElementById("usegamemode").innerHTML = useOriginalHTML;
    const display = gamemode.display;
    const desc = gamemode.description;
    const cover = gamemode.cover;
    const consideredNewUntil = gamemode.consideredNewUntil;
    const id = gamemode.id;
    const settings = gamemode.settings;
    const tags = gamemode.tags;
    const limitedAccess = gamemode.limitedAccess == null ? false : gamemode.limitedAccess;
    const bkponly = gamemode.bluekidPlusOnly == null ? false : gamemode.bluekidPlusOnly;
    const releasedDate = gamemode.releaseDate;
    const ideaBy = gamemode.ideaCreator;
    const idealPlaytime = gamemode.idealPlaytime;

    document.getElementById("gamemode_thumbnail").src = cover;
    document.getElementById("gamemodedisplay").innerText = display;
    document.getElementById("gamemodedesc").innerText = desc;

    document.getElementById("gamemodeReleaseDate").innerHTML = new Date(releasedDate).toLocaleDateString();
    document.getElementById("gamemodeIdeaCreator").innerHTML = ideaBy;
    document.getElementById("gamemodePlaytime").innerHTML = `${idealPlaytime} minutes.`;

    let btnwork = true;
    if (limitedAccess) {
        document.getElementById("usegamemode").innerHTML = useOriginalHTML + " [Test only]";
        if (!userdata.limitedAccess) {
            document.getElementById("usegamemode").setAttribute("disabled", "");
            btnwork = false;
        }
    } else if (bkponly) {
        document.getElementById("usegamemode").className = "puffy_button subscription_btn";
        if (!(await hasBluekidPlus())) {
            document.getElementById("usegamemode").setAttribute("disabled", "");
            btnwork = false;
        }
    }

    listener = () => {
        if (!btnwork) {return;}
        selectedGamemodeIdx = gid;
        document.getElementById("gamemodedetails").close();
        progress();
    };
    document.getElementById("usegamemode").addEventListener("click", listener);

    document.getElementById("gamemodedetails").showModal();
}

onAuthStateChanged(auth, async (user) => {
    if(!user) {
        alert("Not logged in.");
        location.href = "../auth/login.html";
    }
    // document.getElementById("kitdetails").showModal();
    document.getElementById("hostingver").innerHTML = HOSTING_VERSION;
    document.getElementById("nexterror").removeAttribute("hide");
    document.getElementById("nexterror").innerHTML = "Select a kit to continue.";
    await loadAndShowKits(() => {
        document.getElementById("nexterror").setAttribute("hide", "");
        document.getElementById("next").removeAttribute("disabled");
    });
    setupViewListener();
    loadGamemodes();

    document.getElementById("next").addEventListener("click", () => {
        progress();
        
    });
})
