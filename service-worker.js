let banListJson = { list: [] };
let reportList = [];

let startupPromise = null;

function startup() {
    startupPromise = fetch("https://buster-backend.jadeposting.workers.dev/users/")
        .then(res => res.json())
        .then(json => banListJson = json);
}

chrome.runtime.onStartup.addListener(startup)
chrome.runtime.onInstalled.addListener(startup)

async function handleMessage(request) {
    if (startupPromise) {
        await startupPromise;
    }

    if (request.command === "list") {
        return { banListJson, reportList };
    } else if (request.command === "report") {
        if (reportList.includes(request.user)) {
            return reportList;
        }

        reportList.push(request.user)
        fetch(`https://buster-backend.jadeposting.workers.dev/submit?user=${request.user}`);
        return reportList;
    } else if (request.command === "reload") {
        startup();
    }
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    handleMessage(request).then(sendResponse);
    return true;
});
