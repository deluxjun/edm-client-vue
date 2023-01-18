var docEditor;

var innerAlert = function (message) {
    if (console && console.log)
        console.log(message);
};

var onReady = function () {
    innerAlert("Document editor ready");
};

var onDocumentStateChange = function (event) {
    var title = document.title.replace(/\*$/g, "");
    document.title = title + (event.data ? "*" : "");
};

var onRequestEditRights = function () {
    location.href = location.href.replace(RegExp("mode=view\&?", "i"), "");
};

var onRequestHistory = function (event) {
    var historyObj = null;

    docEditor.refreshHistory(
        {
            currentVersion: "<%- file.version %>",
            history: historyObj
        });
};

var onRequestHistoryData = function (data) {
    var version = data.data;
    var historyData =  null;

    docEditor.setHistoryData(historyData[version-1]);
};

var onRequestHistoryClose = function (event){
    document.location.reload();
};

var onError = function (event) {
    if (event)
        innerAlert(event.data);
};

var onOutdatedVersion = function (event) {
    location.reload(true);
};

export function connectEditor(docinfo) {
    console.log(docinfo.document.fileType)
    docEditor = new DocsAPI.DocEditor("iframeEditor", {"width": "100%",
    "height": "100%",
    "type": "desktop",
    "documentType": docinfo.documentType,
    "token": "",
    "document": docinfo.document,
    "editorConfig":{
        "callbackUrl":docinfo.embedded.saveUrl,
        "embedded":{
            "saveUrl":docinfo.embedded.saveUrl
        },
        "customization": {
            "forcesave": true,
        },
        "lang": "ko-KR",
    },
    
    });

    fixSize();
};

var fixSize = function () {
    var wrapEl = document.getElementsByClassName("form");
    if (wrapEl.length) {
        wrapEl[0].style.height = screen.availHeight + "px";
        window.scrollTo(0, -1);
        wrapEl[0].style.height = window.innerHeight + "px";
    }
};

// if (window.addEventListener) {
//     window.addEventListener("load", connectEditor);
//     window.addEventListener("resize", fixSize);
// } else if (window.attachEvent) {
//     window.attachEvent("onload", connectEditor);
//     window.attachEvent("onresize", fixSize);
// }

export default connectEditor