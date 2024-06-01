import { onAuthStateChanged, auth, getDoc, doc, db, FirebaseHelper, ONLINE_TEXT, OFFLINE_TEXT } from "../util/firebase.js";

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

    const communitySettings = userProfile.data().communitySettings;
    if (communitySettings != null) {
        const showBlues = communitySettings.privacy.showBlues || "friends";
        const showGameHistory = communitySettings.privacy.showGameHistory || "friends";
        const showKits = communitySettings.privacy.showKits || "all";
        const hideTokens = communitySettings.privacy.hideTokens || false;
        const showStatus = communitySettings.privacy.showStatus || "all";
        const showLastOnline = communitySettings.privacy.showLastOnline || "all";
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
    
    loadBadges(userProfileId);

    var localuid = user.uid;
    var localdoc_ = doc(db, "users", localuid);
    var localData = await getDoc(localdoc_).then((res) => {
        if (!res.exists()) {
            return "UNKNOWN";
        }
        return res.data();
    });

    if (localData.friends != undefined && localData.friends.includes(userProfileId)) {
        document.getElementById("addfriend").style.display = "none";
        document.getElementById("removefriend").style.display = "unset";
    }

    const userProfileData = userProfile.data();

    document.getElementById("username").innerText = userProfileData.username;
    document.getElementById("uid").innerHTML = userProfileId;

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

    const metadata = await FirebaseHelper.getUserMetadata(userProfileId);
    const isImageGood = await checkImage(metadata.photoURL);
    if (isImageGood) {
        document.getElementById("pfp").src = metadata.photoURL;
    }
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