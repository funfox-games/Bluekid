import { ref, realtime, realtimeUpdate, realtimeGet, onAuthStateChanged, auth, onValue, getDoc, doc, db } from "../../js/util/firebase.js";

let gameId;

export class BluekidClient {
    static addPlayer(username) {
        return new Promise(async (res, rej) => {
            const user = auth.currentUser;
            const reference = ref(realtime, "games/" + gameId);

            const get = await realtimeGet(reference);
            const players = get.val().players || [];

            const hasAccount = await getDoc(doc(db, "users/" + user.uid));
            const id = players.push({uid: user.uid, username, hasAccount: hasAccount.exists()})
            await realtimeUpdate(reference, {
                players: players
            });
            sendEventToOwner("bluekid__playerjoin", {
                username,
                hasAccount: hasAccount.exists()
            });
            res(id);
        });
    }
    static setGameId(id) {
        gameId = id;
    }
}

var allListeners = [];

onAuthStateChanged(auth, async (user) => {
    if (!user) {return}

    const eventref = ref(realtime, "games/" + gameId + "/event");
    const gd = await realtimeGet(eventref);
    onValue(eventref, (snap) => {
        if (snap.exists() == false) {return;}
        const snapdata = snap.val();
        const data = snapdata.data;
        console.log("Recieved event from owner: " + data.id);

        for (let i = 0; i < allListeners.length; i++) {
            const listener = allListeners[i];
            if (listener.id === snapdata.id && snapdata.effectedPlayers.includes(user.uid)) {
                listener.callback(data);
            }
        }
    })
})

/**
 * Sends an event to host
 * @param {string} id The event id
 * @param {{}} data The event data
 */
export async function sendEventToOwner(id, data) {
    return new Promise(async (res, rej) => {
        const user = auth.currentUser;
        console.log(data);
        const dbdata = {
            rid: Math.round(Math.random() * 100000000),
            id,
            sender: user.uid,
            data
        }

        const reference = ref(realtime, "games/" + gameId);
        await realtimeUpdate(reference, {
            owner__event: dbdata
        });
        res();
    });
}

export function listenForEvent(id, callback) {
    allListeners.push({
        id,
        callback
    });
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
