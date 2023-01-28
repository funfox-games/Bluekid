if (localStorage.getItem("isLoggedIn") === null) {
    localStorage.setItem("isLoggedIn", false);
}

if (localStorage.getItem("isLoggedIn") === "true") {
    const signUpNowButton = document.getElementById("SignUpNow");
    signUpNowButton.disabled = true;
    signUpNowButton.parentElement.href = "#";
}