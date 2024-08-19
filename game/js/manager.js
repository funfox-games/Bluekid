// File used to store all gamemodes and their data
export class Gamemode {
    constructor(gid, gamemode) {
        this.id = gid;
        this.gamemodeInfo = gamemode;
    }
}

export const gamemodes = [
    new Gamemode("funfox.example", {
        htmlHost: "example/host.html",
        htmlClient: "example/client.html",
        databaseData: {
            item1: 420,
            item3: true,
            item4: "im in pain"
        }
    })
];

export function getGamemodeDataById(id) {
    let res = null;
    for (let i = 0; i < gamemodes.length; i++) {
        const gamemode = gamemodes[i];
        if (gamemode.id === id) {
            res = gamemode.gamemodeInfo;
        }
    }
    return res;
}

