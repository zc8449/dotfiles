// reload.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Wed 28 Mar 2012 12:25:52 AM CST
// @Last Change: Wed 28 Mar 2012 10:59:02 PM CST
// @Revision:    120
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

if (window.timertimer)
    clearInterval(window.timertimer);

let exec = function() {
    let doc = gBrowser.mCurrentBrowser.contentDocument;
    let loc = doc.location;
    let protocol = loc.protocol;
    let lastModified = doc.lastModified;
    let timestamp = new Date(lastModified).getTime();

    if (checkLocation(loc, timestamp) ||
        checkScripts(doc, timestamp) ||
        checkStyleSheets(doc, timestamp))
        loc.reload();
};

let isNewer = function(path, timestamp) {
        let file = io.File(path);
        // lastModifiedTimeOfLink lastModifiedTime
        if (file.exists() && file.isFile() &&
            (timestamp < file.lastModifiedTime))
            return true;
        return false;
};

// checkLocation
let checkLocation = function(location, timestamp) {
    if (location.protocol !== 'file:')
        return false;
    let filename = location.pathname;
    return isNewer(filename, timestamp);
};

// check
let check = function(collection, attr) {
    return function(doc, timestamp) {
        return Array.some(doc[collection], function(script) {
            let src = script[attr];
            if (src.length == 0)
                return false;
            let uri = util.newURI(src);
            if (uri.scheme === 'file') {
                if (typeof script.lastModifiedTime === 'undefined') {
                    let file = io.File(uri.filePath);
                    script.lastModifiedTime = file.lastModifiedTime;
                    return false;
                }
                return isNewer(uri.filePath, script.lastModifiedTime);
            }
            return false;
        });
    };
};

let checkScripts = check('scripts', 'src');
let checkStyleSheets = check('styleSheets', 'href');

window.timertimer = setInterval(exec, 500);

function onUnload() {
    clearInterval(window.timertimer);
}

// 添加右键菜单，有指定动作
// inotify
// vim: set et ts=4 sw=4:
// 检测 svg images scripts stylesheets
// 检测非正常页面，比如下载页面，扩展管理页面
