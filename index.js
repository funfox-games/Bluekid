window.onload = (() => {
    firebase.firestore().collection("users").get().then((q) => {
        const docs = q.docs.map(doc => doc.data());

        document.getElementById("usercount").innerHTML = docs.length;
    });
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log(user.uid)
    }
});

document.cookie = "Set-Cookie: promo_shown=1; SameSite=None; Secure;"
if (localStorage.getItem("isLoggedIn") === null) {
    localStorage.setItem("isLoggedIn", false);
}

if (localStorage.getItem("isLoggedIn") === "true") {
    const signUpNowButton = document.getElementById("SignUpNow");
    signUpNowButton.disabled = true;
    signUpNowButton.parentElement.href = "#";
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

function reveal() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i=0; i<reveals.length; i++) {
        var windowheight = window.innerHeight;
        var revealtop = reveals[i].getBoundingClientRect().top;
        var revealpoint = 150;

        if (revealtop < windowheight - revealpoint) {
            reveals[i].classList.add("active");
        }
        //else {
        //     reveals[i].classList.remove("active");
        // }
    }
}

window.addEventListener('scroll', reveal);