function disableDebugger(e){document.getElementById("debugger").remove(),document.getElementById("debugger_opener").remove(),e&&(document.getElementById("icons_debugger").remove(),document.getElementById("css_debugger").remove())}function consoleCodeRun(code){return eval(code)}function addCss(e){var d=document.head,n=document.createElement("link"),t=document.createElement("script");t.src="https://kit.fontawesome.com/44f1506527.js",t.crossOrigin="anonymous",t.id="icons_debugger",n.type="text/css",n.rel="stylesheet",n.href=e,n.id="css_debugger",d.appendChild(n),d.appendChild(t)}function clearDebugger(){console.logs=[];var d=document.getElementById("console").children;for(let e=0;e<d.length;e++){var n=d[e];"console_ex"!=n.id&&n.remove()}}function debugger_init(e){addCss("debugger_files/debugger.css");let d=document.createElement("div"),n=(d.innerHTML='<i class="fa-light fa-caret-up"></i>',d.id="debugger_opener",document.createElement("div"));n.id="debugger",n.innerHTML=`
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
    `,d.addEventListener("click",()=>{d.toggleAttribute("open"),d.hasAttribute("open")?d.children[0].className="fa-light fa-caret-down":d.children[0].className="fa-light fa-caret-up",n.toggleAttribute("open")}),document.body.appendChild(n),document.body.appendChild(d),document.getElementById("sendCom").addEventListener("click",()=>{LoggingJS.tryFunction(()=>{consoleCodeRun(document.getElementById("command").value)}),document.getElementById("sendCom").value=""}),document.getElementById("clear").addEventListener("click",()=>{clearDebugger()})}function load(){debugger_init()}document.body.onload=load;