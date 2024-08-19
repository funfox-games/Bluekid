var notificationActive = false;
var stack = [];
var curentMessage = "";

/**
* @param {number} type 1 is info, 2 is warning, 3 is error, 4 is success.
* @param {String} message Message to show.
* @param {Boolean} showCloseButton
*/
function showNotification(type, message) {
    const notif = document.getElementById("notification");
    if (notificationActive) {
        stack.push({type, message});
        notif.children[0].children[1].innerHTML = curentMessage + " (+" + stack.length + ")";
        return;
    }
    notificationActive = true
    const closebutton = document.getElementById("notification_close");
    const icon = document.getElementById("notification_icon");
    notif.setAttribute("show", "");
    if (type == 1) {
        notif.style.backgroundColor = "#75b8ff";
        icon.className = "fa-solid fa-xl fa-circle-info";
    } else if (type == 2) {
        notif.style.backgroundColor = "#ffd791";
        icon.className = "fa-solid fa-xl fa-triangle-exclamation";
    } else if (type == 3) {
        notif.style.backgroundColor = "#ff9191";
        icon.className = "fa-solid fa-xl fa-circle-exclamation";
    } else if (type == 4) {
        notif.style.backgroundColor = "#93ff91";
        icon.className = "fa-solid fa-xl fa-check";
    }
    notif.children[0].children[1].innerHTML = message;
    if (stack.length - 1 > 0) {
        notif.children[0].children[1].innerHTML = message + " (+" + (stack.length - 1) + ")";
    }
    curentMessage = message;
    const id = setTimeout(() => {
        notif.removeAttribute("show");
        notificationActive = false;
        setTimeout(() => {
            notificationfinished();

        }, 100)
    }, 5 * 1000);
    closebutton.addEventListener("click", () => {
        notif.removeAttribute("show");
        clearTimeout(id);
        notificationActive = false;
        setTimeout(() => {
            notificationfinished();

        }, 100)
    });
}

function notificationfinished() {
    if (stack.length == 0) {return;}

    const data = stack[0];
    showNotification(data.type, data.message);
    stack.splice(0, 1);
}
(function () {
    const notification = document.createElement("div");
    notification.id = "notification";
    notification.innerHTML = `
    <div style="display:flex;gap:5px;align-items:center;margin-right:10px;">
        <i id="notification_icon" class="icon"></i>
        <p>Text</p>
    </div>
    <i id="notification_close" class="notification_close fa-solid fa-lg fa-xmark"></i>`;
    document.body.prepend(notification);
})();
