await chrome.runtime.sendMessage(chrome.runtime.id, { command: "list" }, (response) => startup(response))

async function startup(response) {
    let divet = document.querySelector("#twitnum")
    divet.innerHTML = response.banListJson["list"].length;
    document.querySelector("#ver").innerHTML = chrome.runtime.getManifest().version
}