console.stdlog = console.log.bind(console);
console.logs = [];
console.log = function(){
    console.logs.push(Array.from(arguments));
    console.stdlog.apply(console, arguments);
    let clone = document.getElementById("console_ex").cloneNode(true);
    clone.id = "";
    clone.children[0].innerHTML = arguments[0];
    document.getElementById("console").appendChild(clone);
}
console.error = function(){
    console.logs.push(Array.from(arguments));
    console.stdlog.apply(console, arguments);
    let clone = document.getElementById("console_ex").cloneNode(true);
    clone.id = "";
    clone.children[0].innerHTML = arguments[0];
    clone.children[0].style.color = "#ff6969";
    document.getElementById("console").appendChild(clone);
}
console.warn = function(){
    console.logs.push(Array.from(arguments));
    console.stdlog.apply(console, arguments);
    let clone = document.getElementById("console_ex").cloneNode(true);
    clone.id = "";
    clone.children[0].innerHTML = arguments[0];
    clone.children[0].style.color = "#faff69";
    document.getElementById("console").appendChild(clone);
}
class LoggingJS {
    static tryFunction(func_) {
        try {
            func_();
        } catch (error) {
            console.error(error);
        }
    }
}