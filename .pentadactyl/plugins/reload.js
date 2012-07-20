// reload.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Wed 28 Mar 2012 12:25:52 AM CST
// @Last Change: Fri 20 Jul 2012 11:09:03 PM CST
// @Revision:    121
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

if (window.timertimer)
    clearInterval(window.timertimer);

let exec = function() {
    let doc = gBrowser.mCurrentBrowser.contentDocument;
    let loc = doc.location;
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
        if (file.exists() &&
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
        return Array.some(doc[collection], function(item) {
            let src = item[attr];
            if (src.length == 0)
                return false;
            let uri = util.newURI(src);
            if (uri.scheme === 'file') {
                if (typeof item.lastModifiedTime === 'undefined') {
                    let file = io.File(uri.filePath);
                    if (file.exists())
                        item.lastModifiedTime = file.lastModifiedTime;
                    return false;
                }
                return isNewer(uri.filePath, item.lastModifiedTime);
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
// 检测 svg images scripts stylesheets
// symbolic links???
// 检测非正常页面，比如下载页面，扩展管理页面
// vim: set et ts=4 sw=4:
