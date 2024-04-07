function isElementInViewport(elem) {
    var $elem = $(elem);

    // Get the scroll position of the page.
    var scrollElem = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html');
    var viewportTop = $(scrollElem).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    // Get the position of the element on the page.
    var elemTop = Math.round($elem.offset().top);
    var elemBottom = elemTop + $elem.height();

    return ((elemTop < viewportBottom) && (elemBottom > viewportTop));
}
window.addEventListener("scroll", () => {
    for (let i = 0; i < document.getElementsByClassName("onscroll").length; i++) {
        const element = document.getElementsByClassName("onscroll")[i];
        if (isElementInViewport(element)) {
            element.classList.add("animate__animated");
        } else {
            element.classList.remove("animate__animated");
        }
    }
})