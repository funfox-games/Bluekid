import { auth, onAuthStateChanged, reauthenticateWithCredential, signOut, EmailAuthProvider,         httpsCallable, functions, collection, doc, db, updateDoc, reauthenticateWithPopup, GoogleAuthProvider } from "../util/firebase.js";
const urlParams = new URLSearchParams(window.location.search);
const confetti = new JSConfetti();

if (!urlParams.has("bmacemail")) {
    alert("PromptError: BMAC Email and uid not provided. [bkp/pmpt_error]");
    location.href = "../../index.html";
}
const bmac = httpsCallable(functions, "bmacVerification");
const bmacSubDetails = await bmac(urlParams.get("bmacemail")).catch((err) => {
    alert("smth went wrong, check the console");
    document.body.innerHTML = "";
    console.log(err);
});
console.log(bmacSubDetails.data);
if (bmacSubDetails.data.active == false) {
    document.body.innerHTML = "";
    alert("Subscription not active...");
    location.href = "../../index.html";
}

// if (auth.currentUser != null) {
//     await signOut();
// }

async function success() {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
        subscriptionDetails: {
            payerEmail: urlParams.get("bmacemail"),
            confirmationDate: new Date(),
            subscriptionId: bmacSubDetails.data.subscriptionId
        } 
    }).catch((err) => {
        alert("there was a problem saving subscription details... check the console...");
        console.log("PROBLEM SAVING SUBSCRIPTION DETAILS: ", err);
    });
    const sendWelcome = httpsCallable(functions, "sendWelcomeToBKPEmail");
    await sendWelcome(auth.currentUser.uid);
    confetti.addConfetti();
    document.getElementById("working").close();
    document.getElementById("congrats").showModal();
    
}

document.getElementById("google").addEventListener("click", async () => {
    var provider = new GoogleAuthProvider();
    auth.useDeviceLanguage();
    const res = await reauthenticateWithPopup(auth.currentUser, provider).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The credential that was used.
        const credential = OAuthProvider.credentialFromError(error);

        alert(errorCode + " : " + errorMessage);
        return false;
    });
    if (res == false) {return;}
    document.getElementById("working").showModal();
    success();
})

document.getElementById("reauth").addEventListener("click", async () => {
    document.getElementById("reauth").setAttribute("disabled", true);
    document.getElementById("reauth").innerHTML = "Waiting...";
    const cred = EmailAuthProvider.credential(
        auth.currentUser.email,
        document.getElementById("password").value
    );
    const res = await reauthenticateWithCredential(auth.currentUser, cred).catch((err) => {
        if (err.code == "auth/wrong-password" || err.code == "auth/missing-password") {
            alert("Wrong password.");
            return false;
        }
        alert("Something went wrong, check the console.");
        console.log(err);
        return false;
    });
    if (res == false) {return;}
    success();
})
