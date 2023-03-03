const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"]
const url = new URLSearchParams(window.location.search);
const id = url.get("id")
let client;
let client_ref;

function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function createName() {
    const prefix = randomFromArray([
        "COOL",
        "SUPER",
        "HIP",
        "SMUG",
        "COOL",
        "SILKY",
        "GOOD",
        "SAFE",
        "DEAR",
        "DAMP",
        "WARM",
        "RICH",
        "LONG",
        "DARK",
        "SOFT",
        "BUFF",
        "DOPE",
      ]);
      const animal = randomFromArray([
        "BEAR",
        "DOG",
        "CAT",
        "FOX",
        "LAMB",
        "LION",
        "BOAR",
        "GOAT",
        "VOLE",
        "SEAL",
        "PUMA",
        "MULE",
        "BULL",
        "BIRD",
        "BUG",
      ]);
      return `${prefix} ${animal}`;
}

function initWait(player, playerref) {
    firebase.database().ref("game/"+ id +"/players").on("value", (data) => {
        if (data.val() === null){ // CHECKS IF PLAYER GOT KICKED
            logout();
        }
    });

    const allPlayersRef = firebase.database().ref("game/"+ id +"/players")
    const gameRef = firebase.database().ref("game/"+id);

    // var hostref = allPlayersRef.child("host")
    // allPlayersRef.on("child_added", (snapshot) => {
    //     hostref.once("value", function(hostSnapshot) {
    //         if (!hostSnapshot.exists()) {
    //             hostref.set(snapshot.val());
    //         }
    //     })
    // });

    // allPlayersRef.on("value", (snapshot) => {
    //     // fires when change comes
    // });
    // allPlayersRef.on("child_added", (snapshot) => {
    //     // called when node is added (if join late game and 5 people are already in, it will call this 5 times)

    //     const addedPlayer = snapshot.val();
    // })

    var hostref = allPlayersRef.child("host")
    allPlayersRef.on("child_added", (snapshot) => {
        hostref.once("value", function(hostSnapshot) {
            if (!hostSnapshot.exists()) { // IF HOST
                hostref.set(snapshot.val());
                let btn = document.createElement("button");
                btn.innerHTML = "Cancel Game";
                btn.type = "button";
                document.body.appendChild(btn);
                btn.onclick = function() {
                    if (confirm("Are you sure?")) {
                        //firebase.auth().signOut();
                        gameRef.remove();
                    }
                }

                let div = document.createElement("div")
                div.style.width = "95%";
                div.style.height = "500px";
                div.style.background = "grey";
                div.style.padding = "5px";
                div.style.borderRadius = "5px";
                div.style.marginTop = "5px";
                div.style.border = "2px solid black";
                div.style.fontWeight = "600";
                div.style.boxShadow = "7px 7px 5px black";
                div.innerHTML = "Current players: ";

                allPlayersRef.on("child_added",  (snapshot) => {
                    console.log(snapshot.child("id").val() +", "+ player.uid);

                    if (snapshot.child("id").val() == player.uid) {
                        console.log("equal")
                    } else {
                        div.innerHTML += snapshot.val().name + ", ";
                    }
                });
                // allPlayersRef.on("child_removed",  (snapshot) => {
                //     div.innerHTML -= snapshot.val().name + ", ";
                // });

                hostref.onDisconnect().remove();
                gameRef.onDisconnect().remove();

                document.getElementById("name").innerHTML = "Hello, " + snapshot.child("name").val() + "!";
                document.getElementById("status").innerHTML = "You are the host. Game ID: <span style='font-weight: bold;'>" + id + "</span>";

                document.body.appendChild(div);
            }
        })
    });

    // if (host == true) {
    //     console.log("HOST")
    //     let btn = document.createElement("button");
    //     btn.innerHTML = "Cancel Game";
    //     btn.type = "button";
    //     document.body.appendChild(btn);
    //     btn.onclick = function() {
    //         if (confirm("Are you sure?")) {
    //             firebase.auth().signOut();
    //             gameRef.remove();
    //         }
    //     }
    // }
}

function logout() {
    if (client) {
        firebase.auth().signOut();
        client_ref.remove()
        window.location.href  = "./index.html";
    }
}

function copyInvite() {
    let urlparsm = new URLSearchParams(window.location.search);
    urlparsm.delete("name")
    console.log(window.location.origin + window.location.pathname + "?" + urlparsm.toString());

    const invite = window.location.origin + window.location.pathname + "?" + urlparsm.toString()

    navigator.clipboard.writeText(invite);
}

(function() {

    let playerid;
    let playerref;

    if (localStorage.getItem("isLoggedIn") === "false") {
        firebase.auth().signInAnonymously().catch((error) => {
            var errorCode = error.code;
            var errorMsg = error.message;
            // what ever I want //
    
            //////////////////////
            console.log(errorCode, errorMsg);
        })   
    }

    firebase.auth().onAuthStateChanged((user) => {
        if (user){
            if(url.has("id")) {
                client = user;

                // logged in
                //localStorage.setItem("isLoggedIn", true)
                console.log("logged in")
                playerid = user.uid;
                playerref = firebase.database().ref("game/"+ id +"/players/"+playerid);
                document.getElementById("status").style.opacity = "1";

                client_ref = playerref;

                let name = "";
                if (localStorage.getItem("isLoggedIn") === "false") {
                    name = createName();
                } else if (localStorage.getItem("isLoggedIn") === "true") {
                    if (url.has("name")) {
                        if (url.get("name") !== "") {
                            name = url.get("name");
                        } else {
                            name = createName();
                        }
                    } else {
                        name = createName(); 
                    }
                    console.log("logged in")
                }
                playerref.set({
                    id: playerid,
                    name,
                    color: randomFromArray(playerColors)
                })

                const game = firebase.database().ref("game/" + id);
                game.update({
                    gameState: "Lobby"
                });
                
                // let host = false
                // const allPlayersRef = firebase.database().ref("game/"+ id +"/players")
                // var hostref = allPlayersRef.child("host")
                // allPlayersRef.on("child_added", (snapshot) => {
                //     hostref.once("value", function(hostSnapshot) {
                //         if (!hostSnapshot.exists()) {
                //             hostref.set(snapshot.val());
                //             host = true
                //             console.log("host: " + host)
                //         }
                //     })
                // });

                playerref.onDisconnect().remove();

                initWait(user, playerref);
                document.getElementById("name").innerHTML = "Hello, " + name + "!";
            } else {
                // no game
                console.log("no game :(");
            }
        } else {
            //logged out
            console.log("logged out");
        }
    })

})();