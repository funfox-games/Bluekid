
function disableDebugger(removeCssAndJs) {
    document.getElementById("debugger").remove();
    document.getElementById("debugger_opener").remove();

    if (removeCssAndJs) {
        document.getElementById("icons_debugger").remove();
        document.getElementById("css_debugger").remove();
    }
}

function consoleCodeRun(code) {
    return eval(code);
}

function addCss(fileName) {

    var head = document.head;
    var link = document.createElement("link");
    let fontAwesome = document.createElement("script");
  
    fontAwesome.src = "https://kit.fontawesome.com/44f1506527.js";
    fontAwesome.crossOrigin = "anonymous";
    fontAwesome.id = "icons_debugger";

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = fileName;
    link.id = "css_debugger"
  
    head.appendChild(link);
    head.appendChild(fontAwesome);
}

function clearDebugger() {
    console.logs = [];
    let yes = document.getElementById("console").children;
    for (let i = 0; i < yes.length; i++) {
        const e = yes[i];
        if (e.id == "console_ex") continue;
        e.remove();
    }
}

function debugger_init(side) {
    addCss("debugger_files/debugger.css");

    let opener = document.createElement("div");
    opener.innerHTML = `<i class="fa-solid fa-caret-up"></i>`;
    opener.id = "debugger_opener";
    let developerConsole = document.createElement("div");
    developerConsole.id = "debugger";
    developerConsole.innerHTML = `
        <h2>Console</h2>
        <div id="commandDiv">
            <input id="command" placeholder="Enter JS..."></input>
            <div id="sendCom">
                Run
            </div>
            <div id="clear">
                Clear
            </div>
        </div>
        <div id="console">
            <div class="consoleLog" id="console_ex">
                <p>ex<p>
            </div>
        </div>
    `;

    opener.addEventListener("click", () => {
        opener.toggleAttribute("open");
        if (opener.hasAttribute("open")) {
            opener.children[0].className = "fa-solid fa-caret-down";
        } else {
            opener.children[0].className = "fa-solid fa-caret-up";
        }
        developerConsole.toggleAttribute("open");
    });

    document.body.appendChild(developerConsole);
    document.body.appendChild(opener);

    document.getElementById("sendCom").addEventListener("click", () => {
        LoggingJS.tryFunction(() => {
            consoleCodeRun(document.getElementById("command").value);
        })
        document.getElementById("sendCom").value = "";
    });
    document.getElementById("clear").addEventListener("click", () => {
        clearDebugger();
    });
}

function load() {
    debugger_init();
}

document.body.onload = load;