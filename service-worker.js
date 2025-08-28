let banListJson;
let reportList = [];

chrome.runtime.onInstalled.addListener(() => {
    startup()
})

async function startup() {
    let response = await fetch("https://buster-backend.jadeposting.workers.dev/users/");
    banListJson = await response.json();
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.command === "list") {
        sendResponse({ banListJson, reportList })
    } else if (request.command === "report") {
        if (reportCheck(request.user)) {
            sendResponse(reportList)
            return true;
        }

        reportList.push(request.user)
        fetch(`https://buster-backend.jadeposting.workers.dev/submit?user=${request.user}`);
        sendResponse(reportList)
    }

    return true;
})

function reportCheck(name) {
    let found = false;
    reportList.forEach((rep) => {
        if (name == rep) found = true;
    })
    return found;
}