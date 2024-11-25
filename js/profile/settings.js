import { onAuthStateChanged, auth, db, doc, getDoc, deleteDoc, updateDoc, sendPasswordResetEmail, deleteUser, updateEmail, httpsCallable, functions, hasBluekidPlus, Timestamp, EmailAuthProvider, reauthenticateWithCredential } from "../util/firebase.js";

import { isUserVaild, UserReasons } from "../util/auth_helper.js";

import * as MediaUtil from "../util/user_media.js";

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

async function saveProfileSettings(plrData) {
    return new Promise(async (res, rej) => {
        const showBlues = document.getElementById("showBlues").value;
        const showGameHistory = document.getElementById("showGameHistory").value;
        const showKits = document.getElementById("showKits").value;
        const hideTokens = document.getElementById("hideTokens").checked;
        const showStatus = document.getElementById("showStatus").value;
        const showLastOnline = document.getElementById("showLastOnline").value;
        const allowFriendRequests = document.getElementById("acceptFriendRequests").checked;

        const primaryColor = document.getElementById("primarycolor").value;
        const secondaryColor = document.getElementById("secondarycolor").value;

        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            communitySettings: {
                privacy: {
                    showBlues,
                    showGameHistory,
                    showKits,
                    hideTokens,
                    showStatus,
                    showLastOnline
                },
                allowFriendRequests
            },
            profileSettings: {
                primaryColor,
                secondaryColor
            }
        });
        
        res();
    });
    
}
let activeTab = "";
let tabSaved = false;
function switchTab(tabid) {
    if (document.getElementById(activeTab) && document.getElementById(activeTab).hasAttribute("needs_saved") && tabSaved == false && activeTab != tabid) {
        if (!confirm("This section has unsaved changes... Are you sure?")) { location.hash = "#sect." + activeTab; return; }
    }
    const content = document.getElementById("content").children;
    for (let i = 0; i < content.length; i++) {
        const elem = content[i];
        elem.removeAttribute("active");
    }
    if (document.getElementById(tabid) == null) {
        console.warn(`Tab not found... [${tabid}]`);
        return;
    }
    tabSaved = false;
    activeTab = tabid;
    document.getElementById(tabid).setAttribute("active", "");
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "../auth/login.html";
        return;
    }
    var uid = user.uid;
    var doc_ = doc(db, "users", uid);
    var data = await getDoc(doc_).then((res) => {
        return res.data();
    });
    await checkVaild(user, data);

    window.addEventListener("hashchange", (ev) => {
        switchTab(window.location.hash.replace("#sect.", ""));
    })
    switchTab(window.location.hash.replace("#sect.", ""));

    const showBlues = document.getElementById("showBlues");
    const showGameHistory = document.getElementById("showGameHistory");
    const showKits = document.getElementById("showKits");
    const hideTokens = document.getElementById("hideTokens");
    const showStatus = document.getElementById("showStatus");
    const showLastOnline = document.getElementById("showLastOnline");
    const allowFriendRequests = document.getElementById("acceptFriendRequests");

    const primaryColor = document.getElementById("primarycolor");
    const secondaryColor = document.getElementById("secondarycolor");

    const profilePrivacySettingExists = data.communitySettings != null && data.communitySettings.privacy != null;
    const profileCustomizationExists = data.profileSettings != null;

    if (profilePrivacySettingExists) {
        showBlues.value = data.communitySettings.privacy.showBlues;
        showGameHistory.value = data.communitySettings.privacy.showGameHistory;
        showKits.value = data.communitySettings.privacy.showKits;
        hideTokens.checked = data.communitySettings.privacy.hideTokens;
        showStatus.value = data.communitySettings.privacy.showStatus;
        showLastOnline.value = data.communitySettings.privacy.showLastOnline;
        allowFriendRequests.value = data.communitySettings.allowFriendRequests;
    }
    if (profileCustomizationExists) {
        primaryColor.value = data.profileSettings.primaryColor;
        secondaryColor.value = data.profileSettings.secondaryColor;
    }

    const updateClrPreview = () => {
        document.getElementById("clrpreview").style.backgroundImage = `linear-gradient(${primaryColor.value}, ${secondaryColor.value})`;
    };
    updateClrPreview();

    primaryColor.addEventListener("input", () => {
        updateClrPreview();
    });
    secondaryColor.addEventListener("input", () => {
        updateClrPreview();
    });

    const active = document.getElementsByClassName("activesubscription");
    for (let i = 0; i < active.length; i++) {
        const element = active[i];
        element.style.display = "none";
    }
    if (await hasBluekidPlus()) {
        const elems = document.getElementsByClassName("beforepurchase");
        for (let i = 0; i < elems.length; i++) {
            const element = elems[i];
            element.style.display = "none";
        }
        for (let i = 0; i < active.length; i++) {
            const element = active[i];
            element.style.display = "flex";
        }

        const _subdetails = httpsCallable(functions, "bmacDetails");
        const subdetails = (await _subdetails()).data;
        document.getElementById("payeremail").innerText = subdetails.bmac.payer_email;
        document.getElementById("subscriptionId").innerHTML = subdetails.bmac.transaction_id;
        document.getElementById("subtype").innerHTML = subdetails.bmac.subscription_duration_type;
        /**
         * @type {Date}
         */
        const expiration = new Date(subdetails.bmac.subscription_current_period_end);
        const diffInMs   = expiration - new Date()
        const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
        document.getElementById("renewalspan").innerHTML = diffInDays;

        document.getElementById("transactionToggle").addEventListener("click", () => {
            document.getElementById("subscriptionId").toggleAttribute("hide");
        })
        document.getElementById("emailToggle").addEventListener("click", () => {
            document.getElementById("payeremail").toggleAttribute("hide");
        });

        document.getElementById("unlink").addEventListener("click", () => {
            document.getElementById("unlinkmembership").showModal();
        })

        let canUpdateUnlinkBtn = true;
        document.getElementById("unlink_understand").addEventListener("change", () => {
            if (canUpdateUnlinkBtn == false) {return;}
            const value = document.getElementById("unlink_understand").checked;
            if (value) {
                document.getElementById("confirmunlink").removeAttribute("disabled");
            } else {
                document.getElementById("confirmunlink").setAttribute("disabled", "");
            }
        });
        document.getElementById("confirmunlink").addEventListener("click", async () => {
            const original = document.getElementById("confirmunlink").innerHTML;
            document.getElementById("confirmunlink").setAttribute("disabled", "");
            document.getElementById("confirmunlink").innerHTML = "Authenticating...";
            canUpdateUnlinkBtn = false;

            // Remove from firebase
            document.getElementById("confirmunlink").innerHTML = "Verifying...";
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                subscriptionDetails: null
            });

            // Tell success
            alert("Success!");
            location.hash = "#sect.accountinfo";
            location.reload();
        });

        const startDate = new Timestamp(subdetails.firebase.confirmationDate._seconds, subdetails.firebase.confirmationDate._nanoseconds).toDate();
        document.getElementById("membersince").title = startDate;
        document.getElementById("membersince").innerHTML = startDate.toLocaleDateString();
    }


    let useEmail = user.email;
    document.getElementById("confirmEmail").innerText = useEmail;
    if (document.getElementById("confirmMember") != null)
    {
        document.getElementById("confirmMember").addEventListener("click", () => {
            document.getElementById("membershipConfirmation").showModal();
        });
        document.getElementById("continueMembershipConfirmation").addEventListener("click", () => {
            document.getElementById("membershipConfirmation").close();
            document.getElementById("membershipConfirmation2").showModal();
        })
        document.getElementById("useDiffEmail").addEventListener("click", () => {
            document.getElementById("switchEmailCheck").showModal();
        });
        document.getElementById("switchEmailCheckBack").addEventListener("click", () => {
            document.getElementById("switchEmailCheck").close();
        })
        document.getElementById("switchEmailCheck").addEventListener("submit", (e) => {
            useEmail = document.getElementById("switchedEmail").value;
            document.getElementById("switchedEmail").value = "";
            document.getElementById("confirmEmail").innerText = useEmail;
        })
        document.getElementById("resetToAccountEmail").addEventListener("click", () => {
            useEmail = user.email;
            document.getElementById("confirmEmail").innerText = useEmail;
        });
        let originalHTML = document.getElementById("confirmMembership").innerHTML
        document.getElementById("confirmMembership").addEventListener("click", async () => {
            document.getElementById("confirmMembership").setAttribute("disabled", "");
            document.getElementById("confirmMembership").innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-xl"></i> Checking...`;

            const verify = httpsCallable(functions, "verifyBluekidPlus");

            const verified = await verify(useEmail).catch((error) => {
                // Getting the Error details.
                const code = error.code;
                const message = error.message;
                const details = error.details;
                console.error(code, message, details);
                showNotification(3, "Something went wrong, check the console.");
                return null;
            });

            document.getElementById("membershipConfirmation2").close();

            console.log(verified);
            if (verified != null) {
                if (verified.data.status == "bkp/not_active") {
                    showNotification(3, "Subscription is not active. Subscribe <a href=\"https://buymeacoffee.com/funfox/membership\">here</a>.");
                } else if (verified.data.status == "bkp/email_in_use") {
                    showNotification(3, "Email is already in use. Subscribe <a href=\"https://buymeacoffee.com/funfox/membership\">here</a>.");
                } else {
                    showNotification(4, `Confirmation sent to ${useEmail}, make sure to check your spam folder.`);
                }
            }
            

            document.getElementById("confirmMembership").removeAttribute("disabled");
            document.getElementById("confirmMembership").innerHTML = originalHTML;
        });
    }

    document.getElementById("openprofile").href = location.origin + `/profile/user/index.html?id=${uid}`;

    document.getElementById("userid").innerHTML = uid;
    document.getElementById("tokens").innerHTML = data.tokens;
    document.getElementById("username").innerHTML = data.username;

    document.getElementById("saveProfileSettings").addEventListener("click", async () => {
        document.getElementById("saveProfileSettings").innerHTML = `Saving...`;
        document.getElementById("saveProfileSettings").setAttribute("disabled", "");
        await saveProfileSettings(data);
        document.getElementById("saveProfileSettings").removeAttribute("disabled");
        document.getElementById("saveProfileSettings").innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save all profile settings`;
    })
    document.getElementById("changename").addEventListener("click", async () => {
        document.getElementById("changename").innerHTML = `<i class="fa-solid fa-hourglass"></i> Waiting...`;
        const newname = document.getElementById("newname").value;
        const confirm = document.getElementById("confirmnewname").value;
        if (newname != confirm) {
            document.getElementById("changename").innerHTML = `<i class="fa-solid fa-shuffle"></i> Change name`;
            showNotification(3, "New name and confirmation dont match.");
            return;
        }
        if (newname.length < 3) {
            document.getElementById("changename").innerHTML = `<i class="fa-solid fa-shuffle"></i> Change name`;
            showNotification(3, "Must be longer then 3 characters.");
            return;
        }
        if (MediaUtil.isLimited(newname, MediaUtil.MAX_CHAR_NAME)) {
            document.getElementById("changename").innerHTML = `<i class="fa-solid fa-shuffle"></i> Change name`;
            showNotification(3, "Name must be shorter then " + MediaUtil.MAX_CHAR_NAME + " characters. (Currently " + newname.length + " characters)");
            return;
        }
        var docref = doc(db, "users", uid);
        await updateDoc(docref, {
            username: newname
        });
        console.log("yippe!");
        showNotification(4, "New name applied! Refresh to show.");
        document.getElementById("changename").innerHTML = `<i class="fa-solid fa-shuffle"></i> Change name`;
    })
    document.getElementById("sendpasswordreset").addEventListener("click", async () => {
        document.getElementById("sendpasswordreset").innerHTML = `<i class="fa-solid fa-hourglass fa-spin"></i> Sending...`;
        await sendPasswordResetEmail(auth, user.email);
        showNotification(4, "Email sent! (Check your spam folder)");
        document.getElementById("sendpasswordreset").innerHTML = `<i class="fa-solid fa-envelope"></i> Send password reset email`;
    });
    document.getElementById("changemail").addEventListener("click", async () => {
        const newemail = document.getElementById("newemail").value;
        const confirmemail = document.getElementById("confirmemail").value;
        console.log(newemail, user.email);
        if (newemail != user.email) {
            showNotification(3, "Not original email.");
            return;
        }
        document.getElementById("changemail").innerHTML = `<i class="fa-solid fa-hourglass"></i> Waiting...`;
        document.getElementById("changemail").setAttribute("disabled", "");
        console.log(confirmemail);
        await updateEmail(user,  confirmemail).catch((err) => {
            // if (err.contains("auth/"))
            console.log(err);
            showNotification(3, "Something went wrong: " + err);
        });
        showNotification(4, "Success!");
    })
    document.getElementById("deleteaccount").addEventListener("click", () => {
        document.getElementById("deleteaccountdialog").showModal();
    });
    document.getElementById("confirmdelete").addEventListener("click", async () => {
        document.getElementById("confirmdelete").innerHTML = "Working...";
        document.getElementById("confirmdelete").setAttribute("disabled", "");

        const res = await deleteDoc(doc(db, "users", user.uid)).catch((err) => {
            console.error(err);
            return "WAAAAAA";
        });
        if (res == "WAAAAAA") { return; }

        const res2 = await deleteUser(user).catch((err) => {
            console.error(err);
            return "WAAAAAA";
        });
        if (res2 == "WAAAAAA") {return;}

        location.href = "../index.html";
    });

    const content = document.getElementById("content").children;
    for (let i = 0; i < content.length; i++) {
        const elem = content[i];
        if (!elem.hasAttribute("needs_saved")) {continue;}
        document.getElementById(elem.getAttribute("needs_saved")).addEventListener("click", () => {
            tabSaved = true;
        });
    }
});