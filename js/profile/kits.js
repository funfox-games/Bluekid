import { onAuthStateChanged, auth, db, doc, getDoc, signOut, getDocs, deleteDoc, setDoc, updateDoc, collection, deleteObject, storageref, storage, listAll, KIT_COVER_LOCATION, query, limit, where, hasBluekidPlus } from "../util/firebase.js";

import { isUserVaild, UserReasons } from "../util/auth_helper.js";

let userData;

async function checkVaild(user, userData) {
    return new Promise(async (res, rej) => {

        const USER_CONFIRMATION_CHECK = isUserVaild(user, userData);
        if (USER_CONFIRMATION_CHECK.reason == UserReasons.OVERDUE) {
            location.href = "../auth/overdue.html";
            return;
        }
        if (USER_CONFIRMATION_CHECK.reason == UserReasons.BANNED) {
            const popup = document.createElement("dialog");
            popup.innerHTML = `
            <h1>You're banned.</h1>
            <p>Reason: ${USER_CONFIRMATION_CHECK.banReason}</p>
            <br>
            <b>You can resolve this by contacting the developer.</b>
            <button class="puffy_button danger" id="logout__ban">Logout</button>
        `;
            document.body.append(popup);
            popup.showModal();
            document.getElementById("logout__ban").addEventListener("click", async () => {
                await signOut(auth);
                location.href = "../index.html";
            })
            return;
        }
        if (USER_CONFIRMATION_CHECK.reason == UserReasons.TEMPBANNED) {
            const popup = document.createElement("dialog");
            const date = USER_CONFIRMATION_CHECK.endsOn.seconds * 1000;
            var createdAt = (new Date(date).getTime());
            let difference = Math.floor((createdAt - Date.now()) / 86400000);
            let timeType = "days";
            console.log(difference);
            if (difference == 0) {
                difference = Math.floor((createdAt - Date.now()) / 3600000);
                timeType = "hours";
                if (difference == 0) {
                    difference = Math.floor((createdAt - Date.now()) / 60000);
                    timeType = "minutes";
                }
            }
            popup.innerHTML = `
            <h1>You're banned.</h1>
            <p>Reason: ${USER_CONFIRMATION_CHECK.banReason}</p>
            <p>Ends in ${difference} ${timeType}.</p>
            <br>
            <b>You can resolve this sooner by contacting the developer.</b>
            <button class="puffy_button danger" id="logout__ban">Logout</button>
        `;

            document.body.append(popup);
            popup.showModal();
            document.getElementById("logout__ban").addEventListener("click", async () => {
                await signOut(auth);
                location.href = "../index.html";
            })
            return;
        }
        
        if (USER_CONFIRMATION_CHECK.reason == UserReasons.OTHER) {
            showNotification(3, "Something went wrong checking user info. Continuing as normal.");
        }
        res();
    });
}

let cachedkits;

function wait(sec) {
    return new Promise((res) => {
        setTimeout(() => res(), sec * 1000);
    });
}
function isKitFavorite(udata, kitid) {
    let favorites = udata.favoriteKits;
    if (favorites == undefined || favorites == null) {
        favorites = [];
    }

    return favorites.includes(kitid);
}
async function loadFavorites(udata) {
    return new Promise(async (res, rej) => {
        if (udata.favoriteKits == null || udata.favoriteKits == undefined || udata.favoriteKits.length == 0) {
            showNotification(2, "You have no favorite kits.");
            res();
        }
        for (let i = 0; i < udata.favoriteKits.length; i++) {
            const id = udata.favoriteKits[i];
            if (document.getElementById(id) != null) { continue; }
            let data = await getDoc(doc(db, "kits", id));
            if (!data.exists()) {
                data = await getDoc(doc(db, "users", auth.currentUser.uid, "kits", id));
            }
            data = data.data();
            
            if (data.ownerUid != null && data.ownerUid != undefined) {
                data = await getDoc(doc(db, "users", data.ownerUid, "kits", data.kitId));
                data = data.data();
            }
            if (data == null) {
                continue;
            }
            const elem = document.getElementById("example").cloneNode(true);
            elem.id = id;
            elem.setAttribute("public_kit", true);
            elem.setAttribute("kit_favorite", true);
            const left = elem.children[0];

            console.log(data);
            if (data.cover != undefined) {
                left.children[0].children[0].src = data.cover;
            }
            const left_Data = left.children[1];
            left_Data.children[0].innerText = data.displayname;
            left_Data.children[1].innerText = data.author;
            console.log(data);
            var authordoc = doc(db, "users", data.author);
            var authorres = await getDoc(authordoc);

            left_Data.children[2].innerHTML = `<i id="private_indicator" class="fa-solid fa-lock"></i> Unshared`;
            switch (data.visibility) {
                case "private":
                    break;
                case "friends":
                    left_Data.children[2].innerHTML = `<i class="fa-solid fa-user-group"></i> Friends only`;
                    break;
                case "public":
                    left_Data.children[2].innerHTML = `<i class="fa-solid fa-globe"></i> Public`;
                    break;
                default:
                    break;
            }

            const right = elem.children[1];
            right.children[0].addEventListener("click", () => {
                sessionStorage.setItem("hostkit", id);
                sessionStorage.setItem("ownsKit", false);
                location.href = "../game/host.html"
            });
            right.children[1].addEventListener("click", () => {
                location.href = "./kit/edit.html?id=" + id;
            });
            right.children[2].addEventListener("click", async () => {
                right.children[2].innerHTML = `<i class="fa-solid fa-gear fa-spin"></i> Working...`;
                right.children[2].setAttribute("disabled", "");
                const docref = doc(db, "kits", id);
                await setDoc(docref, {
                    kitId: id,
                    ownerUid: auth.currentUser.uid
                });
                document.getElementById("publishedKit").showModal();
                document.getElementById("share_kit").removeEventListener("click", document.getElementById("share_kit").fn);
                document.getElementById("share_kit").addEventListener("click", document.getElementById("share_kit").fn = () => {
                    navigator.clipboard.writeText("https://bluekid.netlify.app/profile/kit/view?id=" + id);
                    showNotification(4, "Copied to clipboard!");
                })

                right.children[2].remove();
            })
            const dotdot = right.children[3];
            dotdot.addEventListener("mouseup", () => {
                document.getElementById("kit_contextmenu").toggleAttribute("show");
                const rect = dotdot.getBoundingClientRect();
                const contextrect = document.getElementById("kit_contextmenu").getBoundingClientRect();
                console.log(rect, contextrect);
                document.getElementById("kit_contextmenu").style.left = rect.left - 155 - 25 + "px";
                document.getElementById("kit_contextmenu").style.top = rect.top + "px";
                addContextMenuFunctionality(udata, id, data);
            });

            const publicDocData = await getDoc(doc(db, "kits", id));
            if (data.visibility == "private") {
                right.children[2].remove();
            } else {
                if (publicDocData.exists()) {
                    right.children[2].remove();
                }
            }

            elem.addEventListener("contextmenu", (e) => {
                if (elem.hasAttribute("disablecontextmenu")) { return; }
                document.getElementById("kit_contextmenu").style.left = e.pageX + "px";
                document.getElementById("kit_contextmenu").style.top = e.pageY + "px";
                document.getElementById("kit_contextmenu").toggleAttribute("show", true);
                addContextMenuFunctionality(udata, id, data);

                e.preventDefault();
            })

            if (authorres.exists()) {
                left_Data.children[1].innerText = authorres.data().username;
            } else {
                right.style.fontSize = "1.75rem";
                right.style.textAlign = "right";
                right.innerHTML = "This kit is bugged.<br>Upgrade to DATAV2 to repair.";
                elem.setAttribute("disablecontextmenu", "true");
                left_Data.children[0].innerHTML += ` <i title="The author field is not vaild. This kit is not able to be uploaded online. (To resolve, create a new kit)" class="fa-solid fa-globe fa-xs" style="color: #8f0000;"></i>`;
            }

            if (data.author != auth.currentUser.uid) {
                right.children[1].remove();
            }


            document.getElementById("kits").append(elem);
        }
        res();
    });
    
}
async function filterChange(isFav, udata) {
    const children = document.getElementById("kits").children;
    // console.log(cachedkits);
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id == "example" || child.getAttribute("public_kit") != null) { child.style.display = "none"; continue; }
        
        child.style.display = "flex";
    }

    if (!isFav) {return;}

    document.getElementById("loadingfavs").style.display = "flex";
    await loadFavorites(udata);
    document.getElementById("loadingfavs").style.display = "none";
    const children1 = document.getElementById("kits").children;

    for (let i = 0; i < children1.length; i++) {
        const child = children1[i];
        child.style.display = "none";
        if (child.getAttribute("kit_favorite") != null) { child.style.display = "flex"; }
    }
}
function addContextMenuFunctionality(udata, kitid, kitdata) {
    
    const contextmenu = document.getElementById("kit_contextmenu");
    const iconbtns = contextmenu.children[0];

    const favorite = iconbtns.children[0];
    const share = iconbtns.children[1];
    const _delete = iconbtns.children[2];

    if (udata.favoriteKits.includes(kitid)) {
        favorite.innerHTML = `<i class="fa-solid fa-star"></i>`;
    } else {
        favorite.innerHTML = `<i class="fa-regular fa-star"></i>`;
    }

    //Icon buttons
    favorite.removeEventListener("mousedown", favorite.fn);
    share.removeEventListener("mousedown", share.fn);
    _delete.removeEventListener("mousedown", _delete.fn);
    favorite.addEventListener("mousedown", favorite.fn = async () => {
        const isFavorite = udata.favoriteKits.includes(kitid);
        if (isFavorite) {
            /**
             * @type {Array}
             */
            const favoriteKits = udata.favoriteKits;
            favoriteKits.splice(favoriteKits.indexOf(kitid), 1);
            showNotification(1, "Working...");
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                favoriteKits
            });
        } else {
            /**
             * @type {Array}
             */
            const favoriteKits = udata.favoriteKits;
            favoriteKits.push(kitid);
            showNotification(1,"Working...");
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                favoriteKits
            });
            
        }
        location.reload();
    })
    share.addEventListener("mousedown", share.fn = () => {
        navigator.clipboard.writeText("https://bluekid.netlify.app/profile/kit/view?id=" + kitid);
        showNotification(4, "Copied to clipboard!");
    })
    _delete.addEventListener("mousedown", _delete.fn = async () => {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "kits", kitid));
        await deleteDoc(doc(db, "kits", kitid));
        const coverRef = storageref(storage, KIT_COVER_LOCATION + "/" + kitid);
        const allKitCovers = await listAll(storageref(storage, KIT_COVER_LOCATION));
        let hasCover = false;
        console.log(KIT_COVER_LOCATION + kitid);
        allKitCovers.items.forEach((itemRef) => { 
            if (itemRef.name == kitid) {
                hasCover = true;
                console.log("found");
            }
        });

        if (hasCover) {
            console.log("hasCover");
            await deleteObject(coverRef);
        }
        showNotification(4, "Delete success!");
        document.getElementById(kitid).remove();
    });
    //Full buttons
    const editbtn = contextmenu.children[1];
    const exportBtn = contextmenu.children[2];
    const cloneBtn = contextmenu.children[3];
    editbtn.removeEventListener("mousedown", editbtn.fn);
    exportBtn.removeEventListener("mousedown", exportBtn.fn);
    cloneBtn.removeEventListener("mousedown", cloneBtn.fn);
    editbtn.addEventListener("mousedown", editbtn.fn = () => {
        location.href = "./kit/edit.html?id=" + kitid;
    })
    exportBtn.addEventListener("mousedown", exportBtn.fn = () => {
        showNotification(3, "no (" + kitid + ")");
    })
    cloneBtn.addEventListener("mousedown", cloneBtn.fn = async () => {
        showNotification(3, "waht?? (" + kitid + ")");
    });

    exportBtn.style.display = "unset";
    editbtn.style.display = "unset";

    share.style.display = "flex";
    _delete.style.display = "flex";

    if (document.getElementById(kitid).getAttribute("public_kit") != null) {
        exportBtn.style.display = "none";
        editbtn.style.display = "none";

        _delete.style.display = "none";
    }
}

function changeKitVisibility(type) {
    document.getElementById("publicKits").style.display = "none";
    document.getElementById("normalKits").style.display = "none";
    document.getElementById("publicKitsBtn").removeAttribute("disabled");
    document.getElementById("normalKitsBtn").removeAttribute("disabled");
    document.getElementById(type + "Btn").setAttribute("disabled", true);
    document.getElementById(type).style.display = "block";

}

async function addKitElementsBasedOnArray(kits) {
    document.getElementById("allpublickits").innerHTML = "";
    for (let i = 0; i < kits.length; i++) {
        if (document.getElementById("publicKitsLoading")) document.getElementById("publicKitsLoading").innerHTML = `<p style="font-size: 1.75rem;"><i class="fa-solid fa-gear fa-spin fa-sm"></i> Loading... (${i + 1}/${kits.length})</p>`;
        const kit = kits[i];
        const clone = document.getElementById("publicexample").cloneNode(true);
        clone.id = kit.kitId;

        const left = clone.children[0];
        const right = clone.children[1];

        const userdata = await getDoc(doc(db, "users", kit.ownerUid));

        // Left
        left.getElementsByClassName("publickitimage")[0].src = kit.preview.icon;
        left.getElementsByClassName("kittitle")[0].innerText = kit.preview.title;
        left.getElementsByClassName("kitcreator")[0].innerHTML = `<i class="fa-solid fa-users" aria-hidden="true"></i> Created by <a style="color:black;" href="./user/index.html?id=${kit.ownerUid}">${userdata.data().username}</a>`;

        right.getElementsByClassName("playkit")[0].addEventListener("click", () => {
            sessionStorage.setItem("hostkit", kit.kitId);
            sessionStorage.setItem("ownsKit", false);
            location.href = "../game/host.html";
        });
        right.getElementsByClassName("viewkit")[0].href = "./kit/view.html?id=" + kit.kitId;

        let favoriteKits = userData.favoriteKits || [];
        const favBtn = right.getElementsByClassName("favoritekit")[0];
        let isFavorite = favoriteKits.includes(kit.kitId);
        if (isFavorite) {
            favBtn.innerHTML = `<i class="fa-solid fa-star"></i> Favorited`;
        }
        right.getElementsByClassName("favoritekit")[0].addEventListener("click", async () => {
            favBtn.innerHTML = "Working...";
            favBtn.setAttribute("disabled", "");
            if (isFavorite) {
                favoriteKits.splice(favoriteKits.indexOf(kit.kitId), 1);
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    favoriteKits
                });
                favBtn.innerHTML = `<i class="fa-regular fa-star"></i> Favorite`;
                favBtn.removeAttribute("disabled");
                isFavorite = false;
            } else {
                favoriteKits.push(kit.kitId);
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    favoriteKits
                });
                favBtn.innerHTML = `<i class="fa-solid fa-star"></i> Favorited`;
                favBtn.removeAttribute("disabled");
                isFavorite = true;
            }
        });

        document.getElementById("allpublickits").append(clone);
    }
}

async function search(q) {
    if (q.length == 0) {
        console.log("RAWRAWRAWRAWRWARA");
        await loadPublicKits();
        return;
    }

    document.getElementById("publicKitsLoading").style.display = "flex";
    const kitQuery = query(collection(db, "kits"), where("preview.title", "==", q), limit(10));
    const kitQueryRes = await getDocs(kitQuery);
    const kits = [];
    kitQueryRes.forEach((doc) => {
        if (doc.data().preview == null) { return; }
        if (doc.data().preview.visibility != "public") {return;}

        kits.push(doc.data());
    });

    await addKitElementsBasedOnArray(kits);
    document.getElementById("publicKitsLoading").style.display = "none";
}

// let hasLoadedKits = false;
async function loadPublicKits() {
    // if (hasLoadedKits) {return;}

    document.getElementById("publicKitsLoading").style.display = "flex";
    // hasLoadedKits = true;
    console.log("Loading public...");

    // const kitsres = await fetch("https://bluekidapi.netlify.app/.netlify/functions/api/kits");
    // const kits = await kitsres.json()
    // console.log(kits);

    if (document.getElementById("publicKitsLoading")) document.getElementById("publicKitsLoading").innerHTML = `<p style="font-size: 1.75rem;"><i class="fa-solid fa-gear fa-spin fa-sm"></i> Preforming query...</p>`;
    const kitQuery = query(collection(db, "kits"), limit(10));
    const kitQueryRes = await getDocs(kitQuery);
    const kits = [];
    kitQueryRes.forEach((doc) => {
        if (doc.data().preview == null) { return; }
        if (doc.data().preview.visibility != "public") {return;}

        kits.push(doc.data());
    });
    
    await addKitElementsBasedOnArray(kits);
    document.getElementById("publicKitsLoading").style.display = "none";
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    userData = await getDoc(doc_).then((res) => {
        if (!res.exists()) {
            return "UNKNOWN";
        }
        return res.data();
    });
    await checkVaild(user, userData);
    var allKits = await collection(db, "users", uid, "kits");
    var kits = await getDocs(allKits);
    if (kits.empty == true) {
        document.getElementById("loading").style.display = "none";
        return;
    }
    if (kits.size >= 15 && await hasBluekidPlus() == false) {
        document.getElementById("kitamount").innerHTML = kits.size;
        document.getElementById("closeToLimit").setAttribute("show", "");
    }
    document.getElementById("nokits").remove();
    cachedkits = kits;
    kits.forEach(async (document_) => {
        const data = document_.data();
        const id = document_.id;
        
        const elem = document.getElementById("example").cloneNode(true);
        elem.id = id;
        const left = elem.children[0];

        if (data.cover != undefined) {
            left.children[0].children[0].src = data.cover;
        }
        const left_Data = left.children[1];
        left_Data.children[0].innerText = data.displayname;
        left_Data.children[1].innerText = data.author;
        var authordoc = doc(db, "users", data.author);
        var authorres = await getDoc(authordoc);
        
        // if (data.author)
        
        if (isKitFavorite(userData, id)) {
            elem.setAttribute("kit_favorite", "true");
        }

        left_Data.children[2].innerHTML = `<i id="private_indicator" class="fa-solid fa-lock"></i> Unshared`;
        switch (data.visibility) {
            case "private":
                break;
            case "friends":
                left_Data.children[2].innerHTML = `<i class="fa-solid fa-user-group"></i> Friends only`;
                break;
            case "public":
                left_Data.children[2].innerHTML = `<i class="fa-solid fa-globe"></i> Public`;
                break;
            default:
                break;
        }

        const right = elem.children[1];
        right.children[0].addEventListener("click", () => {
            sessionStorage.setItem("hostkit", id);
            sessionStorage.setItem("ownsKit", true);
            
            location.href = "../game/host.html"
        });
        right.children[1].addEventListener("click", () => {
            location.href = "./kit/edit.html?id=" + id;
        });
        right.children[2].addEventListener("click", async () => {
            right.children[2].innerHTML = `<i class="fa-solid fa-gear fa-spin"></i> Working...`;
            right.children[2].setAttribute("disabled", "");
            const docref = doc(db, "kits", id);
            await setDoc(docref, {
                kitId: id,
                ownerUid: auth.currentUser.uid
            });
            document.getElementById("publishedKit").showModal();
            document.getElementById("share_kit").removeEventListener("click", document.getElementById("share_kit").fn);
            document.getElementById("share_kit").addEventListener("click", document.getElementById("share_kit").fn = () => {
                navigator.clipboard.writeText("https://bluekid.netlify.app/profile/kit/view?id=" + id);
                showNotification(4, "Copied to clipboard!");
            })

            right.children[2].remove();
        })
        const dotdot = right.children[3];
        dotdot.addEventListener("mouseup", () => {
            document.getElementById("kit_contextmenu").toggleAttribute("show");
            const rect = dotdot.getBoundingClientRect();
            const contextrect = document.getElementById("kit_contextmenu").getBoundingClientRect();
            console.log(rect, contextrect);
            document.getElementById("kit_contextmenu").style.left = rect.left - 155 - 25 + "px";
            document.getElementById("kit_contextmenu").style.top = rect.top + "px";
            addContextMenuFunctionality(userData, id, data);
        });

        const publicDocData = await getDoc(doc(db, "kits", id));
        if (data.visibility == "private") {
            right.children[2].remove();
        } else {
            if (publicDocData.exists()) {
                right.children[2].remove();
            }
        }

        elem.addEventListener("contextmenu", (e) => {
            if (elem.hasAttribute("disablecontextmenu")) {return;}
            document.getElementById("kit_contextmenu").style.left = e.pageX + "px";
            document.getElementById("kit_contextmenu").style.top = e.pageY + "px";
            document.getElementById("kit_contextmenu").toggleAttribute("show", true);
            addContextMenuFunctionality(userData, id, data);

            e.preventDefault();
        })

        if (authorres.exists()) {
            left_Data.children[1].innerText = authorres.data().username;
        } else {
            right.style.fontSize = "1.75rem";
            right.style.textAlign = "right";
            right.innerHTML = "This kit is bugged.<br>Upgrade to DATAV2 to repair.";
            elem.setAttribute("disablecontextmenu", "true");
            left_Data.children[0].innerHTML += ` <i title="The author field is not vaild. This kit is not able to be uploaded online. (To resolve, create a new kit)" class="fa-solid fa-globe fa-xs" style="color: #8f0000;"></i>`;
        }

        document.getElementById("kits").append(elem);
    });
    document.body.addEventListener("mousedown", () => {
        document.getElementById("kit_contextmenu").removeAttribute("show");
    });
    document.getElementById("favorites").addEventListener("change", () => {
        filterChange(document.getElementById("favorites").checked, userData);
    });
    document.getElementById("normalKitsBtn").addEventListener("click", () => {
        changeKitVisibility("normalKits");
    });
    document.getElementById("publicKitsBtn").addEventListener("click", () => {
        changeKitVisibility("publicKits");
        loadPublicKits();
    });
    document.getElementById("searchPublic").addEventListener("change", () => {
        console.log(document.getElementById("searchPublic").value);
        search(document.getElementById("searchPublic").value);
    });
    // const group = document.getElementById("kit_filter_group").children;
    // for (let i = 0; i < group.length; i++) {
    //     const elem = group[i];
    //     elem.addEventListener("click", () => {
    //         for (let ii = 0; ii < group.length; ii++) {
    //             const elem = group[ii];
    //             elem.removeAttribute("selected");
    //         }
    //         elem.setAttribute("selected", "true");
    //         filterChange(elem.id);
    //     });
    // }
    document.getElementById("loading").style.display = "none";
})