const onLoad = () => {
    alert("LOAD");
    document.getElementById("topnav_blur").style.height = document.getElementById("topnav").clientHeight + " px";
}

document.body.onload = onLoad;