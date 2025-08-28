let aiUserFlair = document.createElement("span");
aiUserFlair.style = "font-size: 10pt; border-radius: 100px; margin: 2px; padding: 0px 10px 0 10px; background-color: #CC3333; color: white;";
aiUserFlair.innerHTML = "AI USER";

let reportButton = document.createElement("button");
reportButton.style = "cursor: pointer; font-weight: bold; font-family: TwitterChirp; margin: 10px 0px 5px 0px; padding: 5px 10px 5px 10px; border-radius: 2px; width: max-content; background-color: #CC3333; border: none;"
reportButton.innerHTML = "Report AI"
reportButton.className = "buster_ReportButton"
let reportedBool = false;

let aiUserProfileFlair = document.createElement("div");
aiUserProfileFlair.style = "font-family: TwitterChirp; border-radius: 2px; padding: 10px; margin-top: 3px; background-color: #331111; text-overflow: unset;"
aiUserProfileFlair.innerHTML = "<div style='font-weight: bold;'>AI User</div><br/><div>This Twitter Account has been flagged for using, generating or advertising images generated with Artificial Intelligence, and passing it off as original content.</div><span style='font-size:8pt; font-family: TwitterChirp; color:#AA4545'>Buster</span>";
aiUserProfileFlair.className = "buster_aiProfileFlair"

let blocklist;
let reportList;

window.onload = async function () {
    chrome.runtime.sendMessage({ command: "list" }, (response) => {
        blocklist = response.banListJson.list;
        reportList = response.reportList;
    })

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mut) => {
            const profileUsername = "[data-testid='UserName']"
            if (document.querySelector(profileUsername)) {
                if (listCheck(document.location.pathname.slice(1))) {
                    if (!document.querySelector(".buster_aiProfileFlair")) {
                        document.querySelector(profileUsername).append(aiUserProfileFlair);
                    }
                    if (document.querySelector(".buster_ReportButton")) {
                        reportButton.removeEventListener("click", reportProcedure, false)
                        document.querySelector(".buster_ReportButton").remove()
                    }
                } else {
                    if (document.querySelector(".buster_aiProfileFlair")) {
                        document.querySelector(".buster_aiProfileFlair").remove()
                    }

                    if (!document.querySelector(".buster_ReportButton")) {
                        document.querySelector(profileUsername).append(reportButton);
                        reportButton.removeEventListener("click", reportProcedure, false)
                        reportButton.addEventListener("click", reportProcedure, false)
                    } else {
                        if (reportCheck(document.location.pathname.slice(1))) {
                            if (reportButton.style.backgroundColor != "green") {
                                reportButton.style.backgroundColor = "green"
                                reportButton.innerHTML = "Sent for review"
                                reportButton.style.cursor = ""
                                reportButton.removeEventListener("click", reportProcedure, false)
                            }
                        } else {
                            if (reportButton.style.backgroundColor == "green") {
                                reportButton.style.backgroundColor = "#CC3333"
                                reportButton.innerHTML = "Report AI"
                                reportButton.style.cursor = "pointer"
                                reportButton.removeEventListener("click", reportProcedure, false)
                                reportButton.addEventListener("click", reportProcedure, false)
                            }
                        }
                    }
                }
            }

            // user appearing as a tweet
            if (mut.addedNodes.length != 0 && mut.addedNodes[0].nodeType == 1) {
                if (mut.addedNodes[0].getAttribute("data-testid") == "cellInnerDiv") {
                    if (mut.addedNodes[0].querySelector("[data-testid='User-Name']")) {
                        let uName = mut.addedNodes[0].querySelector("[data-testid='User-Name']").querySelectorAll("a")[1].querySelector("span")
                        if (listCheck(uName.innerHTML.slice(1))) {
                            uName.innerHTML = uName.innerHTML + aiUserFlair.outerHTML;
                            uName.closest("[data-testid='cellInnerDiv']").style.backgroundColor = "#221111"
                        }
                    }
                }
            }
        })
    })
    observer.observe(document.body, { childList: true, subtree: true });
}();

async function reportProcedure() {
    if (!reportCheck(document.location.pathname.slice(1))) {
        chrome.runtime.sendMessage(chrome.runtime.id, { command: "report", user: document.location.pathname.slice(1) }, (response) => {
            reportList = response;
            reportButton.innerHTML = "Sent for review"
            reportButton.style.backgroundColor = "green"
            reportButton.style.cursor = ""
            reportButton.removeEventListener("click", reportProcedure, false)
        })
    }
}

function listCheck(name) {
    let found = false;
    blocklist.forEach((banned) => {
        if (name == banned) found = true
    })
    return found;
}

function reportCheck(name) {
    let found = false;
    reportList.forEach((rep) => {
        if (name == rep) found = true;
    })
    return found;
}