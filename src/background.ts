chrome.runtime.onInstalled.addListener((arg) => {
    chrome.storage.sync.set({ color: '#3aa757' });

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


function log(message: string, ...args: any) {
    const now = new Date();
    const format = `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`;
    console.log(`${format} | ${message}`, ...args);
}