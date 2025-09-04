let aiUserFlair = document.createElement("span");
aiUserFlair.style = "font-size: 10pt; border-radius: 100px; margin: 2px; padding: 0px 10px 0 10px; background-color: #CC3333; color: white;";
aiUserFlair.innerHTML = "AI USER";

let reportButton = document.createElement("button");
reportButton.style = "cursor: pointer; font-weight: bold; font-family: TwitterChirp; padding: 5px 12px; margin-top: 5px; border-radius: 9999px; align-items: center; justify-content: center; border-color: #CC3333; background-color: rgba(0, 0, 0, 0); border-width: 1px;"
reportButton.innerHTML = "Report AI"
reportButton.className = "buster_ReportButton"

let aiUserProfileFlair = document.createElement("div");
aiUserProfileFlair.style = "font-family: TwitterChirp; border-radius: 2px; padding: 12px; margin: 5px; background-color: #331111; text-overflow: unset; line-height: 20px;"
aiUserProfileFlair.innerHTML = "<div style='font-weight: bold;'>AI User</div><br/><div>This Twitter Account has been flagged for using, generating or advertising images generated with Artificial Intelligence.</div><span style='font-size:8pt; font-family: TwitterChirp; color:#AA4545'><a href='https://discord.gg/BEhRjVvDMP' target='_blank'>Mistake? Let us know</a></span>"
aiUserProfileFlair.className = "buster_aiProfileFlair"

let blocklist = [];
let reportList = [];

window.onload = async function () {
    chrome.runtime.sendMessage({ command: "list" }, (response) => {
        blocklist = response.banListJson.list;
        reportList = response.reportList;
    })

    var self = false;
    if (self) return;

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mut) => {
            const reportButtonClass = ".buster_ReportButton"
            const profileFlairClass = ".buster_aiProfileFlair"

            // own profile
            if (document.querySelector("[data-testid='editProfileButton']")) {
                self = true;

                if (document.querySelector(reportButtonClass)) {
                    document.querySelector(reportButtonClass).remove()
                }

                if (document.querySelector(profileFlairClass)) {
                    document.querySelector(profileFlairClass).remove()
                }

                return;
            }

            // prefer the field where a user's join date, etc. are located
            var identifier = "[data-testid='UserProfileHeader_Items']"

            // user might be blocked, try for UserName
            if (!document.querySelector(identifier)) {
                identifier = "[data-testid='UserName']"
            }

            const urlUsername = document.location.pathname.toLowerCase().split("/")[1]
            if (document.querySelector(identifier)) {
                if (listCheck(urlUsername)) {
                    if (!document.querySelector(profileFlairClass)) {
                        document.querySelector(identifier).append(aiUserProfileFlair);
                    }

                    if (document.querySelector(reportButtonClass)) {
                        reportButton.removeEventListener("click", reportProcedure, false)
                        document.querySelector(reportButtonClass).remove()
                    }
                } else {
                    if (document.querySelector(profileFlairClass)) {
                        document.querySelector(profileFlairClass).remove()
                    }

                    if (!document.querySelector(reportButtonClass)) {
                        document.querySelector(identifier).append(reportButton);
                        reportButton.removeEventListener("click", reportProcedure, false)
                        reportButton.addEventListener("click", reportProcedure, false)
                    } else {
                        if (reportCheck(urlUsername)) {
                            if (reportButton.style.backgroundColor != "green") {
                                reportButton.style.backgroundColor = "green"
                                reportButton.style.borderWidth = "0px";
                                reportButton.innerHTML = "Sent for review"
                                reportButton.style.cursor = ""
                                reportButton.removeEventListener("click", reportProcedure, false)
                            }
                        } else {
                            if (reportButton.style.backgroundColor == "green") {
                                reportButton.style.backgroundColor = ""
                                reportButton.style.borderWidth = "1px";
                                reportButton.innerHTML = "Report AI"
                                reportButton.style.cursor = "pointer"
                                reportButton.removeEventListener("click", reportProcedure, false)
                                reportButton.addEventListener("click", reportProcedure, false)
                            }
                        }
                    }
                }
            }

            // user appearing as a tweet or follower/following
            if (mut.addedNodes.length != 0 && mut.addedNodes[0].nodeType == 1) {
                if (mut.addedNodes[0].getAttribute("data-testid") == "cellInnerDiv") {
                    const usernameSpan = mut.addedNodes[0].querySelector("[data-testid='User-Name'] a[tabindex='-1'] span, [data-testid='UserCell'] a[tabindex='-1'] span");
                    if (usernameSpan && listCheck(usernameSpan.innerHTML.slice(1))) {
                        usernameSpan.innerHTML = usernameSpan.innerHTML + aiUserFlair.outerHTML;
                        usernameSpan.closest("[data-testid='cellInnerDiv']").style.backgroundColor = "#221111"
                    }
                }
            }
        })
    })
    observer.observe(document.body, { childList: true, subtree: true });
}();

async function reportProcedure() {
    if (!reportCheck(document.location.pathname.split("/")[1])) {
        chrome.runtime.sendMessage(chrome.runtime.id, { command: "report", user: document.location.pathname.split("/")[1] }, (response) => {
            reportList = response;
            reportButton.innerHTML = "Sent for review"
            reportButton.style.backgroundColor = "green"
            reportButton.style.borderWidth = "0px";
            reportButton.style.cursor = ""
            reportButton.removeEventListener("click", reportProcedure, false)
        })
    }
}

function listCheck(name) {
    let found = false;
    blocklist.forEach((banned) => {
        if (name.toLowerCase() == banned.toLowerCase()) found = true
    })
    return found;
}

function reportCheck(name) {
    let found = false;
    reportList.forEach((reported) => {
        if (name.toLowerCase() == reported.toLowerCase()) found = true;
    })
    return found;
}