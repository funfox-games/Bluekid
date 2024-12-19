import { adjectiveWords, animals, auth, collection, db, FirebaseHelper, functions, getDocs, httpsCallable, onAuthStateChanged, onValue, realtime, realtimeGet, realtimeRemove, ref } from "../util/firebase.js";

let pack_data = null;
const _data = await fetch("../../asset/blues.json");
pack_data = await _data.json();

const parms = new URLSearchParams(location.search);

async function loadBlues(blues) {
    console.log(pack_data);
    // for (let i = 0; i < blues.length; i++) {
    //     const blue = blues[i];
        
    // }
    blues.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        if (data.pack == "memes") {
            data.pack = "meme";
        }
        if (document.getElementById("section__" + data.pack) == null) {
            const created = document.createElement("optgroup");   
            if (data.pack == null) {
                return;
            }
            created.label = pack_data.packs[data.pack].display_name;
            created.id = "section__" + data.pack;
            document.getElementById("blues").appendChild(created);
        }
        const created2 = document.createElement("option");
        created2.value = id;
        created2.innerHTML = id;
        document.getElementById("section__" + data.pack).appendChild(created2);
    });
}

async function setupListeners(gameId) {
    const gameRef = ref(realtime, "games/" + gameId);
    const playerRef = ref(realtime, "games/" + gameId + "/players/" + auth.currentUser.uid);

    onValue(gameRef, (snap) => {
        if (!snap.exists()) {
            location.replace("../join.html?error=game_deleted");
            return;
        }
    });

    async function leave() {
        await realtimeRemove(playerRef);
    }

    window.addEventListener("beforeunload", async function (e) {
        if (gameId == null) {
            return;
        }
        leave();
    });
    let __listener;
    document.addEventListener("visibilitychange", () => {
        if (gameId == null) {return;}
        if (document.hidden) {
            // alert("LOST SIGHT");
            __listener = setTimeout(() => {
                leave();
                location.href = "../join.html?error=inactive";
            }, (5 * 60) * 1000);
        } else {
            clearTimeout(__listener);
            __listener = -1;
        }
    });
}

let hasAccount = false;
let accountData = null;

async function join(randomUsername) {
    if (document.getElementById("useUsername") != null && document.getElementById("useUsername").checked == false && document.getElementById("usernameinput").value == "") {
        alert("please enter a valid name.");
        return;
    }
    document.getElementById("beforeJoin").close();
    document.getElementById("joinning").showModal();
    let username = "Unnamed";
    if (document.getElementById("usernameinput") != null) {
        username = document.getElementById("usernameinput").value;
    }
    if (document.getElementById("useUsername") != null && document.getElementById("useUsername").checked == true) {
        username = accountData.username;
    }
    if (randomUsername) {
        username = document.getElementById("randomName").innerHTML;
    }

    const join = httpsCallable(functions, "hosting-joinGame");
    const res = await join({
        code: parms.get("id"),
        username
    });
    document.getElementById("joinning").close();
    if (res.data.success == false) {
        switch (res.data.error) {
            case 'game/invalid':
                alert("Game invalid. Must not exist");
                break;
            case "game/already_in":
                alert("You already exist bro");
                location.href = "../join.html";
                break;
            default:
                break;
        }
    }

    document.getElementById("topnavusername").innerText = username;
    setupListeners(parms.get("id"));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); 
}

onAuthStateChanged(auth, async (user) => {
    if (user == null) {
        alert("please join via join screen first.");
        location.replace("../join.html");
        return;
    }
    const _ref = ref(realtime, "games/" + parms.get("id"));
    const data = await realtimeGet(_ref);
    if (data.exists() == false) {
        location.replace("../join.html?error=game_not_exist");
        return;
    }
    if (data.val().settings.playerSettings) {
        if (data.val().settings.playerSettings.randomizedUsernames == true) {
            document.getElementById("normalUsername").remove();
            document.getElementById("randomUsername").removeAttribute("hide");
        }
    }

    document.getElementById("beforeJoin").showModal();

    let username = "";
    if (user.isAnonymous) {
        document.getElementById("blues").setAttribute("disabled", "");
        document.getElementById("useUsername").setAttribute("disabled", "");
    } else {
        document.getElementById("changeWithAccount").remove();

        const data = await getDocs(collection(db, "users", user.uid, "blues"));
        loadBlues(data);

        hasAccount = true;
        accountData = await FirebaseHelper.getUserData(user.uid);
    }
    
    document.getElementById("confirmJoin").addEventListener("click", () => {
        join(data.val().settings.playerSettings.randomizedUsernames);
    });
    if (document.getElementById("useUsername") != null) {
        document.getElementById("useUsername").addEventListener("change", () => {
            if (document.getElementById("useUsername").checked) {
                document.getElementById("usernameinput").setAttribute("disabled", "");
            } else {
                document.getElementById("usernameinput").removeAttribute("disabled");
            }
        })
    }
    
    document.getElementById("randomize").addEventListener("click", () => {
        const randomAdj = adjectiveWords[getRandomInt(0, adjectiveWords.length)];
        const randomAnimal = animals[getRandomInt(0, animals.length)];
        document.getElementById("randomName").innerHTML = randomAdj + randomAnimal;
    });
});

// TODO: MAKE POPUP FOR USERNAME CONFIRMATION