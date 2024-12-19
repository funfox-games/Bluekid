import { auth, onAuthStateChanged } from "../util/firebase.js";

onAuthStateChanged(auth, (user) => {
    if (!user) {
        location.href = "../../auth/login.html";
        return;
    }
    
});
