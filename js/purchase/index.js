import { auth, onAuthStateChanged } from "../util/firebase.js";

onAuthStateChanged(auth, (user) => {
    if (!user) {
        location.href = "../../auth/login.html";
        return;
    }
    document.getElementById("plusupgrade").addEventListener("click", () => {
        document.getElementById("plusPrompt").showModal();
    });
    document.getElementById("plusSubscriptionType").addEventListener("change", () => {
        const value = document.getElementById("plusSubscriptionType").value;
        document.getElementById("plusproceed").href = "./plus.html?type=" + value;
    })
});
