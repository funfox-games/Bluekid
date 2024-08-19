import { ref, realtimeSet, realtime, realtimeUpdate, realtimeGet, doc, db, getDoc, realtimeRemove, onAuthStateChanged, auth, onValue } from "../../js/util/firebase.js";

export let gameId = "";
let gameSetup = false;

export class Bluekid {
    static async GetPlayers() {
        return new Promise(async (res, rej) => {
            if (!gameSetup) {rej("Game not setup."); return;}

            const reference = ref(realtime, "games/" + gameId);
            let players = await realtimeGet(reference);
            players = players.val().players;
            if (players == null) {
                players = []
            }
            res(players);
        });
    }

    static async GetUIDPlayers() {
        return new Promise(async (res, rej) => {
            await this.GetPlayers();
            let newPlayersList = [];
            for (let i = 0; i < players.length; i++) {
                newPlayersList.push(players[i].uid);
            }
            res(newPlayersList);
        });
        
    }

    static async HasAccount(uid) {
        return new Promise(async (res, rej) => {
            if (!gameSetup) {rej("Game not setup."); return;}

            const reference = doc(db, "users", uid);
            const result = await getDoc(reference);
            res(result.exists());
        });
    }
}

/**
 * Sets up the game for use.
 * @param {*} user The user object wanting to setup the game.
 * @param {{code:number, gamemode:string, settings:{}}} gameData All the game data including the code, gamemode settings, etc.
 */
export async function setupGame(user, gameData) {
    return new Promise(async (res, rej) => {
        gameId = gameData.code;

        const reference = ref(realtime, "games/" + gameId)
        await realtimeSet(reference, {
            owner: user.uid,
            settings: gameData.settings,
            // Will not add, but just for my sake
            players: [],
            gamemode: gameData.gamemode,
            state: "menu",
            event: {
                id: "",
                data: {},
                effectedPlayers: [],
                rid: Math.round(Math.random() * 100000000)
            }
        });
        gameSetup = true;
        res();
    });
}

export async function removeGame() {
    const reference = ref(realtime, "games/" + gameId);
    console.log("what the sigma");
    gameSetup = false;
    gameId = "";
    await realtimeRemove(reference);
}

var allListeners = [];

export function init() {
    const eventref = ref(realtime, "games/" + gameId + "/owner__event");
    onValue(eventref, async (snap) => {
        if (snap.exists() == false) {return;}
        const snapdata = snap.val();
        const data = snapdata.data;
        let fulldata = await realtimeGet(ref(realtime, "games/" + gameId));
        fulldata = fulldata.val().owner__event

        for (let i = 0; i < allListeners.length; i++) {
            const listener = allListeners[i];
            if (listener.id === snapdata.id) {
                listener.callback(fulldata, data);
            }
        }
    })
}

/**
 * Sends an event to all players
 * @param {*} users The affected users' uids
 * @param {string} id The event id
 * @param {{}} data The event data
 */
export async function sendEventToClients(users, id, data) {
    return new Promise(async (res, rej) => {
        if (!gameSetup) {rej("Game not setup"); return;}
        const dbdata = {
            rid: Math.round(Math.random() * 100000000),
            id,
            effectedPlayers: users,
            sender: auth.currentUser.uid,
            data
        }

        const reference = ref(realtime, "games/" + gameId);
        await realtimeUpdate(reference, {
            event: dbdata
        });
        res();
    });
}

export function listenForEvent(id, callback) {
    allListeners.push({
        id,
        callback
    });
    console.log(`Now listening for ${id}. New list:`, allListeners);
}

export function removeListenerForEvent(id) {
    let idx = -1;
    for (let i = 0; i < allListeners.length; i++) {
        const listener = allListeners[i];
        if (listener.id === id) {
            idx = i;
        }
    }

    if (idx == -1) {
        console.log("Could not find listener for event: " + id);
        return false;
    }

    allListeners.splice(idx);

    return true;
}
