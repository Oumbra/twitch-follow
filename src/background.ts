import { log } from "./app/app.utils";

chrome.runtime.onInstalled.addListener((arg) => {
    log(`installed !`, arg);

    // chrome.webNavigation.onCompleted.addListener((details) => {
    //     console.log(details);
    //     chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
    //         chrome.pageAction.show(id);
    //     });
    // });
    // chrome.pageAction.onClicked.addListener(tab => {
    //     log(`onClicked !`, tab);
    //     chrome.pageAction.show(tab.id);
    // });

    // chrome.browserAction.onClicked.addListener(tab => {
    //     log(`onClicked !`, tab);
    //     chrome.pageAction.show(tab.id);
    // });
});

chrome.runtime.onStartup.addListener(() => {
    log(`startup !`);
});
