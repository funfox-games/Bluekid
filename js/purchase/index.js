import{auth,onAuthStateChanged}from"../util/firebase.js";onAuthStateChanged(auth,t=>{t||(location.href="../../auth/login.html")});