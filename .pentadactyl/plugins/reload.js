// reload.js -- js
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Wed 28 Mar 2012 12:25:52 AM CST
// @Last Change: Sun 09 Sep 2012 06:51:50 PM CST
// @Revision:    121
// @Description:
// @Usage:
// @TODO:
// @CHANGES:

if (window.timertimer)
    window.clearInterval(window.timertimer);

let baseURI = function(location) {
    let host = location.host;
    let pathname = location.pathname;
    let protocol = location.protocol;
    let base = protocol + '//' + host + pathname;
    return util.newURI(base);
};

let exec = function() {
    let doc = window.gBrowser.mCurrentBrowser.contentDocument;
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
            let src = item[attr] || false;
            if (!src && collection == 'styleSheets') { // @import statement
                // @FIXME: (NS_ERROR_MALFORMED_URI) [nsIIOService.newURI]
                let checkCssRules = check('cssRules', 'href');
                return checkCssRules(item, timestamp);
            }
            if (!src || src.length == 0)
                return false;
            let location = window.gBrowser.mCurrentBrowser.contentDocument.location;
            let _baseURI = baseURI(location);
            let uri = util.newURI(src, null, _baseURI);
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

window.timertimer = window.setInterval(exec, 500);

function onUnload() {
    window.clearInterval(window.timertimer);
}

// 添加右键菜单，有指定动作
// inotify
// 检测 svg images
// symbolic links???
// 检测非正常页面，比如下载页面，扩展管理页面
// vim: set et ts=4 sw=4:
