window.onload = function () {
    function loadBlockCount() {
        chrome.runtime.sendMessage(chrome.runtime.id, { command: "list" }, (response) => {
            let divet = document.querySelector("#twitnum")
            divet.innerHTML = response.banListJson["list"].length;
            document.querySelector("#ver").innerHTML = chrome.runtime.getManifest().version
        });
    }

    loadBlockCount();

    document.querySelector("#reload").addEventListener('click', () => {
        chrome.runtime.sendMessage(chrome.runtime.id, { command: "reload" }, loadBlockCount);
    });
}
