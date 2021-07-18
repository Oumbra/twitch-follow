import { log } from "./app/app.utils";


chrome.runtime.onInstalled.addListener((arg) => {
    log(`installed !`, arg);
});

chrome.runtime.onUpdateAvailable.addListener(() => {
    log(`update available !`);
});

chrome.runtime.onRestartRequired.addListener(() => {
    log(`restart required !`);
});

chrome.runtime.onStartup.addListener(() => {
    log(`started !`);
});

chrome.runtime.onSuspend.addListener(() => {
    log(`suspend !`);
});

chrome.runtime.onConnect.addListener((port) => {
    log(`connected !`, port);
});

chrome.runtime.onConnectExternal.addListener((port) => {
    log(`connected external !`, port);
});

chrome.runtime.onMessage.addListener(() => {
    log(`connected !`);
});