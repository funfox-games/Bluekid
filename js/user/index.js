import { onAuthStateChanged, auth, getDoc, doc, db, FirebaseHelper, ONLINE_TEXT, OFFLINE_TEXT, collection, getDocs, query, where } from "../util/firebase.js";

import * as blue_data from "../../asset/blues.json" with { type: "json" };

var cachedBadges = null;

async function checkImage(url) {
    return new Promise((res, rej) => {
        var image = new Image();
        image.onload = function () {
            if (this.width > 0) {
                res(true);
            }
        }
        image.onerror = function () {
            res(false);
        }
        image.src = url;
    })
}

function updatePrivacy(userProfile, all) {
    switch (all.showBlues) {
        case "none":
            document.getElementById("blues").setAttribute("locked", "privacy");
            document.getElementById("blues").innerHTML = `
            <div class="container" style="background-color: #0000001f;font-size:18px;">
                <i class="fa-solid fa-shield-halved fa-xl"></i>
                This section is protected.
            </div>
            `;
            break;
        case "friends":
            if (!userProfile.data().friends.includes(auth.currentUser.uid)) {
                document.getElementById("blues").setAttribute("locked", "privacy");
                document.getElementById("blues").innerHTML = `
                <div class="container" style="background-color: #0000001f;font-size:18px;">
                    <i class="fa-solid fa-shield-halved fa-xl"></i>
                    This section is protected.
                </div>
                `;
                break;
            }

            break;
        default:
            break;
    }
    switch (all.showGameHistory) {
        case "none":
            document.getElementById("gameHistory").setAttribute("locked", "privacy");
            document.getElementById("gameHistory").innerHTML = `
            <div class="container" style="background-color: #0000001f;font-size:18px;">
                <i class="fa-solid fa-shield-halved fa-xl"></i>
                This section is protected.
            </div>
            `;
            break;
        case "friends":
            if (!userProfile.data().friends.includes(auth.currentUser.uid)) {
                document.getElementById("gameHistory").setAttribute("locked", "privacy");
                document.getElementById("gameHistory").innerHTML = `
                <div class="container" style="background-color: #0000001f;font-size:18px;">
                    <i class="fa-solid fa-shield-halved fa-xl"></i>
                    This section is protected.
                </div>
                `;
            }

            break;
        default:
            break;
    }
    switch (all.showKits) {
        case "none":
            document.getElementById("kits").setAttribute("locked", "privacy");
            document.getElementById("kits").innerHTML = `
            <div class="container" style="background-color: #0000001f;font-size:18px;">
                <i class="fa-solid fa-shield-halved fa-xl"></i>
                This section is protected.
            </div>
            `;
            break;
        case "friends":
            if (!userProfile.data().friends.includes(auth.currentUser.uid)) {
                document.getElementById("kits").setAttribute("locked", "privacy");
                document.getElementById("kits").innerHTML = `
                <div class="container" style="background-color: #0000001f;font-size:18px;">
                    <i class="fa-solid fa-shield-halved fa-xl"></i>
                    This section is protected.
                </div>
                `;
            }

            break;
        default:
            break;
    }
    switch (all.showStatus) {
        case "none":
            document.getElementById("status_container").setAttribute("locked", "privacy");
            document.getElementById("status_container").innerHTML = `
            <div class="container" style="background-color: #0000001f;font-size:18px;">
                <i class="fa-solid fa-shield-halved fa-xl"></i>
                This section is protected.
            </div>
            `;
            break;
        case "friends":
            if (!userProfile.data().friends.includes(auth.currentUser.uid)) {
                document.getElementById("status_container").setAttribute("locked", "privacy");
                document.getElementById("status_container").innerHTML = `
                <div class="container" style="background-color: #0000001f;font-size:18px;">
                    <i class="fa-solid fa-shield-halved fa-xl"></i>
                    This section is protected.
                </div>
                `;
            }

            break;
        default:
            break;
    }
    switch (all.showLastOnline) {
        case "none":
            if (all.showStatus == "none") {break;}
            document.getElementById("lastonline").parentElement.setAttribute("locked", "privacy");
            document.getElementById("lastonline").parentElement.innerHTML = `
            <div class="container" style="background-color: #0000001f;font-size:18px;">
                <i class="fa-solid fa-shield-halved fa-xl"></i>
                Last online is protected.
            </div>
            `;
            break;
        case "friends":
            if (!userProfile.data().friends.includes(auth.currentUser.uid)) {
                if (all.showStatus == "friends") { break; }
                document.getElementById("lastonline").parentElement.setAttribute("locked", "privacy");
                document.getElementById("lastonline").parentElement.innerHTML = `
                <div class="container" style="background-color: #0000001f;font-size:18px;">
                    <i class="fa-solid fa-shield-halved fa-xl"></i>
                    Last online is protected.
                </div>
                `;
            }

            break;
        default:
            break;
    }
}

async function loadBadges(uid) {
    if (cachedBadges == null) {
        var badges_ref = doc(db, "users", uid);
        var badges = await getDoc(badges_ref).then((res) => {
            if (!res.exists()) {
                return null;
            }
            return res.data().badges;
        });
        if (badges == null || badges == undefined) { return; }
        cachedBadges = badges;
    }
    // const children = document.getElementById("badges").children;
    // for (let i = 0; i < children.length; i++) {
    //     const child = children[i];
    //     if (child.id == "badgeex" || child.id == "showAllBadges") {continue;}
    //     child.remove();
    // }

    for (let i = 0; i < cachedBadges.length; i++) {
        const badgeName = cachedBadges[i];
        const clone = document.getElementById("badgeex").cloneNode(true);
        clone.id = "";
        clone.title = badgeName;
        const friendlyName = badgeName.replace(" ", "");
        clone.children[0].src = `../../asset/badges/${friendlyName}.png`;

        document.getElementById("badges").appendChild(clone);
    }
}

async function loadBlues(uid) {
    var badges_ref = collection(db, "users", uid, "blues");
    var docs = await getDocs(badges_ref);
    docs.forEach((doc) => {
        var data = doc.data();
        const id = doc.id;
        const bluedata = blue_data.default.blues[id];

        const clone = document.getElementById("blue_ex").cloneNode(true);
        clone.id = "";

        let imagePath;
        if (bluedata == null) {
            imagePath = "blue_broken.png";
            clone.title = `${id}: Bugged`;
        } else {
            imagePath = bluedata.imgPath;
            clone.title = `${id}: ${bluedata.rarity} (${data.amount} Owned)`;
        }
        clone.children[0].src = "../../asset/char/" + imagePath;
        
        document.getElementById("blues").append(clone);
    });
}

async function loadKits(uid) {
    var allKits = collection(db, "users", uid, "kits");
    const q = query(allKits, where("visibility", "==", "public"));
    
    const all = await getDocs(q);
    all.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();

        const clone = document.getElementById("kitex").cloneNode(true);
        clone.id = id;
        const left = clone.children[0];
        const right = clone.children[1];

        left.children[0].children[0].src = data.cover;
        left.children[1].children[0].innerText = data.displayname;
        left.children[1].children[1].innerHTML = `<i class="fa-solid fa-globe"></i> Public`;

        right.children[0].href = location.origin + "/profile/kit/view.html?id=" + id;

        document.getElementById("kits").append(clone);
    });
}

async function showFriendedKits(uid) {
    var allKits = collection(db, "users", uid, "kits");
    const q = query(allKits, where("visibility", "!=", "private"));
    
    const all = await getDocs(q);
    all.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();

        const clone = document.getElementById("kitex").cloneNode(true);
        clone.id = id;
        const left = clone.children[0];
        const right = clone.children[1];

        left.children[0].children[0].src = data.cover;
        left.children[1].children[0].innerText = data.displayname;
        left.children[1].children[1].innerHTML = `<i class="fa-solid fa-globe"></i> Public`;

        right.children[0].href = location.origin + "/profile/kit/view.html?id=" + id;

        document.getElementById("kits").append(clone);
    });
}

onAuthStateChanged(auth, async (user) => {
    const userProfileId = new URL(location).searchParams.get("id");
    const userProfile = await getDoc(doc(db, "users", userProfileId));

    if (userProfileId == user.uid) {
        document.getElementById("yourprofile").style.display = "block";
        document.getElementById("addfriend").style.display = "none";
    }
    if (!userProfile.exists()) {
        return;
    }

    document.getElementById("loading").showModal();

    const communitySettings = userProfile.data().communitySettings;
    let showBlues = "friends";
    let showGameHistory = "friends";
    let showKits = "all";
    let hideTokens = false;
    let showStatus = "all";
    let showLastOnline = "all";
    if (communitySettings != null) {
        showBlues = communitySettings.privacy.showBlues;
        showGameHistory = communitySettings.privacy.showGameHistory; 
        showKits = communitySettings.privacy.showKits; 
        hideTokens = communitySettings.privacy.hideTokens; 
        showStatus = communitySettings.privacy.showStatus; 
        showLastOnline = communitySettings.privacy.showLastOnline; 
        if (auth.currentUser.uid != userProfileId) {
            updatePrivacy(userProfile, {
                showBlues,
                showGameHistory,
                showKits,
                hideTokens,
                showStatus,
                showLastOnline
            });
        }
    }

    try {
        document.getElementById("loading_progress").innerHTML = "user data";
        var localuid = user.uid;
        var localdoc_ = doc(db, "users", localuid);
        var localData = await getDoc(localdoc_).then((res) => {
            if (!res.exists()) {
                return "UNKNOWN";
            }
            return res.data();
        });
        const isFriended = localData.friends != undefined && localData.friends.includes(userProfileId);

        // Load user stuffs

        document.getElementById("loading_progress").innerHTML = "badges";
        await loadBadges(userProfileId);
        document.getElementById("loading_progress").innerHTML = "blues";
        if (showBlues == "all") {
            await loadBlues(userProfileId);
        }
        if (showBlues == "friends" && isFriended) {
            await loadBlues(userProfileId);
        }
    
        document.getElementById("loading_progress").innerHTML = "kits";
        if (showKits == "all") {
            await loadKits(userProfileId);
        }
        if (showKits == "friends" && isFriended) {
            await showFriendedKits(userProfileId);
        }

        if (userProfile.data().friends != undefined) {
            document.getElementById("friendAmount").innerHTML = userProfile.data().friends.length;
        }
        document.getElementById("loading_progress").innerHTML = "metadata";
        const metadata = await FirebaseHelper.getUserMetadata(userProfileId);
        const creationDate = new Date(metadata.createdOn);
        var time = (Date.parse(creationDate) - new Date()); // milliseconds between now & user creation
        var diffDays = -Math.floor(time / 86400000); // days
        document.getElementById("joinned").innerHTML = diffDays;

        if (isFriended) {
            document.getElementById("addfriend").style.display = "none";
            document.getElementById("removefriend").style.display = "unset";
        }

        const userProfileData = userProfile.data();

        document.getElementById("username").innerText = userProfileData.username;
        document.getElementById("uid").innerHTML = userProfileId;

        // Load user data

        document.getElementById("loading_progress").innerHTML = "user status";
        const status = await FirebaseHelper.getUserStatus(userProfileId);
        if (document.getElementById("status")) document.getElementById("status").innerHTML = status.status;

        if (status.status == ONLINE_TEXT && document.getElementById("status_container").getAttribute("locked") == null) {
            document.getElementById("online").style.display = "unset";
            document.getElementById("status_container").classList.add("online");
            if (false) {
                // Check if in game

                document.getElementById("online").style.display = "none";
                document.getElementById("ingame").style.display = "unset";
                document.getElementById("status_container").classList.add("ingame");

            }
        } else if (status.status == OFFLINE_TEXT && document.getElementById("status_container").getAttribute("locked") == null) {
            document.getElementById("offline").style.display = "unset";
        }

        document.getElementById("loading_progress").innerHTML = "profile picture";
        const isImageGood = await checkImage(metadata.photoURL);
        if (isImageGood) {
            document.getElementById("pfp").src = metadata.photoURL;
        }
    } catch (error) {
        alert("Loading error: " + error);
        console.error("ERROR: ", error);
        alert("Please either refresh or post a new issue in the overview page.")
    }
    
    document.getElementById("loading").close();

    setInterval(() => {
        const time = -(Date.parse(status.lastOnline) - new Date()); // milliseconds between now & user creation
        const diffSeconds = Math.floor(time / 1000);
        const diffMin = Math.floor(time / 60000);
        const diffDays = Math.floor(time / 86400000); // days
        const diffHours = Math.floor(time / 3.6e+6);
        const diffWeeks = Math.floor(time / 6.048e+8);
        const diffMonth = Math.floor(time / 2.628e+9);
        if (diffMonth > 0) {
            document.getElementById("lastonline").innerHTML = `${diffMonth} month${diffMonth == 1 ? '' : 's'}`;
        } else if (diffWeeks > 0) {
            document.getElementById("lastonline").innerHTML = `${diffWeeks} week${diffWeeks == 1 ? '' : 's'}`;
        } else if (diffDays > 0) {
            document.getElementById("lastonline").innerHTML = `${diffDays} day${diffDays == 1 ? '' : 's'}`;
        } else if (diffHours > 0) {
            document.getElementById("lastonline").innerHTML = `${diffHours} hour${diffHours == 1 ? '' : 's'}`;
        } else if (diffMin > 0) {
            document.getElementById("lastonline").innerHTML = `${diffMin} minute${diffMin == 1 ? '' : 's'}`;
        } else if (diffSeconds > 0) {
            document.getElementById("lastonline").innerHTML = `${diffSeconds} second${diffSeconds == 1 ? '' : 's'}`;
        }
    }, 100);
    
    if (status.lastOnline == null) {
        document.getElementById("lastonline").parentElement.style.display = `none`;
    }

    document.getElementById("share").addEventListener("click", () => {
        navigator.clipboard.writeText(location.toString());
        showNotification(4, "Copied to clipboard!")
    });
});