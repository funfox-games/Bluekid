async function loadDoc(e){var t=e.id.replace("sectBtn__",""),t=await(await fetch(`../docs/_docs/${t}.html`)).text();e.setAttribute("active",""),document.getElementById("content").innerHTML=t}for(let t=0;t<document.getElementsByClassName("sectBtn").length;t++){let e=document.getElementsByClassName("sectBtn")[t];e.addEventListener("click",()=>{loadDoc(e);for(let e=0;e<document.getElementsByClassName("sectBtn").length;e++)document.getElementsByClassName("sectBtn")[e].removeAttribute("active","")})}