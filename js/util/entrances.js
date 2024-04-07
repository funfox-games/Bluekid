function isElementInViewport(ele) {
    const { top, bottom } = ele.getBoundingClientRect();
    const vHeight = (window.innerHeight || document.documentElement.clientHeight);

    return (
        (top > 0 || bottom > 0) &&
        top < vHeight
    );
}
function updateScroll() {
    console.log("scroll");
    for (let i = 0; i < document.getElementsByClassName("scroll").length; i++) {
        const element = document.getElementsByClassName("scroll")[i];
        if (isElementInViewport(element)) {
            element.classList.add("animate__animated", "animate__backInUp");
        }
    }
    for (let i = 0; i < document.getElementsByClassName("bounce").length; i++) {
        const element = document.getElementsByClassName("bounce")[i];
        if (isElementInViewport(element)) {
            element.classList.add("animate__animated", "animate__bounceIn");
        }
    }
    for (let i = 0; i < document.getElementsByClassName("fade").length; i++) {
        const element = document.getElementsByClassName("fade")[i];
        if (isElementInViewport(element)) {
            element.classList.add("animate__animated", "animate__fadeInUp");
        }
    }
}
window.addEventListener("scroll", updateScroll);
document.documentElement.style.setProperty('--animate-duration', '1s');