// @HACK: dactyl.timeout
// :help modes

function should() {
    if (!config.OS.isUnix)
        return false;
    let tmpDir = services.directory.get('TmpD', Ci.nsIFile).path;
    let DISPLAY = services.environment.get('DISPLAY');
    let socketfile = tmpDir + '/fcitx-socket-' + DISPLAY;
    let file = io.File(socketfile);
    if (file.exists() && !file.isDirectory())
        return true;
    return false;
}

if (should()) {
    let path = plugins.fcitx.PATH;
    let py_path = path.slice(0, path.length - 2) + 'py';
    let status = 0;
    let timeout = 40;

    dactyl.registerObserver('modes.change', function() {
        let mode_name = modes.mainMode.name;
        switch (mode_name) {
            case 'COMMAND_LINE' :
            case 'FILE_INPUT' :
            case 'FIND' :
            case 'FIND_BACKWARD' :
            case 'FIND_FORWARD' :
            case 'HINTS' :
            case 'PROMPT' :
            case 'REPL' :
            case 'INPUT_MULTILINE' :
            case 'MENU' :
            case 'EX' :
            dactyl.timeout(function() {
                status = parseInt(io.system('python ' + py_path).output);
                if (status == 2)
                    io.system('python ' + py_path + ' c');
            }, timeout);
            break;

            case 'INSERT' :
            case 'AUTOCOMPLETE' :
            dactyl.timeout(function() {
                if (status == 2)
                    io.system('python ' + py_path + ' o');
            }, timeout);
            break;

            default :
            break;
        }
    });
}
