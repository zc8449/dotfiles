// dactyl.assert(!("LOADED_EDIT_JS" in userContext), (new Error).fileName + " has already been loaded!");
// userContext.LOADED_EDIT_JS = true;
"use strict";
XML.ignoreWhitespace = XML.prettyPrinting = false;
var INFO =
<plugin name="edit" version="0.1.2"
        href="https://github.com/grassofhust/dotfiles/blob/master/.pentadactyl/plugins/edit.js"
        summary="Open file or directory quickly."
        xmlns={NS}>
	<info lang="zh-CN" summary="快速打开文件或者目录！"/>
	<info lang="en-US" summary="Open file or directory quickly!"/>
    <author email="frederick.zou@gmail.com">Yang Zou</author>
    <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
    <project name="Pentadactyl" min-version="1.0"/>
    <p lang="en-US">
		Open file or folder quickly, has auto completion support.
    </p>
    <p lang="zh-CN">
		快速打开文件或者目录，提供自动补全支持！
    </p>
    <item>
        <tags>:edit :ei</tags>
        <spec>:edi[t]! [path]</spec>
        <description>
            <p>Open file or folder with associated program. When
			[!] is provided, open file or folder in new tab. When [path]
			is empty, open pentadactyl rc file. edit.js can also open jar
			package in browser or archiver.
        </p>
        </description>
    </item>
</plugin>;

function getRCFile() {
	// stolen from content/dactyl.js
	let init = services.environment.get(config.idName + "_INIT");
	let rcFile = io.getRCFile("~");

	try {
		if (dactyl.commandLineOptions.rcFile) {
			let filename = dactyl.commandLineOptions.rcFile;
			if (!/^(NONE|NORC)$/.test(filename))
				return io.File(filename).path;
		} else {
			if (init)
				; // do nth
			else {
				if (rcFile)
					return rcFile.path;
			}

			if (options["exrc"] && !dactyl.commandLineOptions.rcFile) {
				let localRCFile = io.getRCFile(io.cwd);
				if (localRCFile && !localRCFile.equals(rcFile))
					return localRCFile.path;
			}
		}
	} finally {
		; // do nth
	}
	return false;
}

const VALID_CONSTANTS_FILES = [
	"RC", "PrefF"
];

const VALID_CONSTANTS_DIRS = [
	"UChrm", "ProfD", "CurProcD",
	"DefProfRt", "Desk", "RUNTIMEPATH"
];

function isAbsolutePath(path) {
	let absolute_pattern = /^(~\/|\/|~[^\/]+\/)/;
	if (util.OS.isWindows)
		absolute_pattern = /^[a-zA-Z]:[\/\\]|~/;
	return absolute_pattern.test(path);
}

function getFiles () {
	let _files = [];
	for (let [path, description] in Iterator(options["open-files"])) {
		let _item = {path: path, description: description};
		if (VALID_CONSTANTS_FILES.indexOf(path) >= 0) {
			switch (path) {
				case "RC" :
				_item.path = getRCFile();
				break;

				default :
				_item.path = services.directory.get(path, Ci.nsIFile).path;
				break;
			}
			_files.push(_item);
			continue;
		}
		if (!isAbsolutePath(path)) {
			let DIR = path.split(/\\|\//)[0];
			if (VALID_CONSTANTS_DIRS.indexOf(DIR) < 0) {
				window.alert("不存在的常量: " + DIR);
				continue;
			}

			switch (DIR) {
				case "RUNTIMEPATH":
				io.getRuntimeDirectories("").forEach(function(item) {
						_files.push({path: item.path + path.slice(DIR.length), description: "runtimepath-" + item.leafName});
				});
				continue;
				break;

				default:
				_item.path = services.directory.get(DIR, Ci.nsIFile).path + path.slice(DIR.length);
				break;
			}
		}
		_files.push(_item);
	}
	_files.push({path: "------------------------------------------------------------------------------------------------------------------------", description: "我是欢乐的分割线------------------------------------------------------------------------------------------------------------------------"});
	return _files;
}

function getDirs() {
	let _dirs = [];
	for (let [path, description] in Iterator(options["open-dirs"])) {
		if (path === "SCRIPTNAMES")
			continue;
		let _item = {path: path, description: description};
		if (!isAbsolutePath(path)) {
			let DIR = path.split(/\\|\//)[0] || path;
			if (VALID_CONSTANTS_DIRS.indexOf(DIR) < 0) {
				dactyl.echoerr("不存在的常量");
				continue;
			}

			switch (DIR) {
				case "RUNTIMEPATH":
				io.getRuntimeDirectories("").forEach(function(item) {
						_dirs.push({path: item.path + path.slice(DIR.length), description: "runtimepath-" + item.leafName});
				});
				continue;
				break;

				default:
				_item.path = services.directory.get(DIR, Ci.nsIFile).path + path.slice(DIR.length);
				break;
			}
		}
		_dirs.push(_item);
	}

	return _dirs;
}

const PATH_SEP = File.PATH_SEP;

let it = [];

function cpt(context, args) {
	let dirs = getDirs();
	let places = getFiles().concat(dirs);

	let arg = "";
	if (args.length == 1)
		arg = args[0];

	// :scriptnames
	if ("SCRIPTNAMES" in options["open-dirs"]) {
		context.fork("scriptnames", 0, this, function (context) {
				context.title= ["scriptnames", options["open-dirs"].SCRIPTNAMES];
				let completions = [];
				context.compare = null;
				io._scriptNames.forEach(function(filename) {
						completions.push({filename:filename, basename:(new File(filename)).leafName});
				});
				context.completions = completions;
				context.keys = {text: 'filename', description:'basename',path: 'filename'};
				context.filters = [];
				context.filters.push(function (item) {
						// FIXME: PATH_SEP
						return File.expandPath(item.item.filename).toLowerCase().indexOf(File.expandPath(arg).toLowerCase()) >= 0;
				});
		});
}

	let absolute_pattern = /^(~\/|\/|~[^\/]+\/)/;
	if (util.OS.isWindows)
		absolute_pattern = /^[a-zA-Z]:[\/\\]|~/;

	if (absolute_pattern.test(arg)) {
		let dir = {path:arg, description:"Absolute Path"};
		context.fork(dir.description, 0, this, function (context) {
				completion.file(context, false, dir.path);
				context.title[0] = arg.match(/^(?:.*[\/\\])?/)[0];
		});
	} else {
		dirs.forEach(function(dir, idx) {
			let aFile = new File(dir.path+PATH_SEP+arg);
			if (aFile.exists() && aFile.isDirectory() && (arg === "" || File.expandPath(arg[arg.length -1]) === File.expandPath(PATH_SEP))) {
				context.fork(dir.description, 0, this, function (context) {
						completion.file(context, false, aFile.path+PATH_SEP);
						context.title[0] = aFile.path+PATH_SEP;
						context.filter = "";
						context.offset = arg.length + context.offset;
				});
			} else {
				context.fork(dir.description, 0, this, function (context) {
						completion.file(context, false, aFile.path);
						context.title[0] = aFile.parent.path + PATH_SEP;
						context.filter = aFile.leafName;
						context.offset = arg.length - aFile.leafName.length+context.offset;
				});
			}
		});
	}

	context.title = ["Shortcuts", "Description"];
	context.keys = {
		text: "path",
		description: "description",
		path: function (item) item.path
	};
	context.filters = [];
	context.generate = function () places;
	context.compare = null;
	context.filters.push(function (item) {
		// FIXME: item.item, item.item.description
		return File.expandPath(item.item.path).toLowerCase().indexOf(File.expandPath(arg).toLowerCase()) >= 0 || item.item.description.toLowerCase().indexOf(arg.toLowerCase()) >= 0;
	});
	it = context.allItems;
}

group.commands.add(["edi[t]", "ei"],
	"Open common folders or files",
	function (args) {
		let create = false;
		let path = "";
		if (args.length == 0) {
			path = commonFiles[0]["path"];
		} else
			path = args[0];

		if (commandline.completionList._selIndex >= 0) {
			path = it.items[commandline.completionList._selIndex].path; // FIXME: dirty hack
			create = true;
		} else {
			if (typeof it.items === "undefined") // 未弹出自动补全窗口
				; // do nth
			else { // 没有选择自动补全
				create = true;
				if (it.items.length == 1) // 补全列表中只有一个可选项，默认使用。
					path = it.items[0].path;
				else if (it.items.length == 0)
					create = false;
				else // 多于1项，取第一项
					path = it.items[0].path;
			}
		}

		let absolute_pattern = /^(~\/|\/|~[^\/]+\/)/;
		if (util.OS.isWindows)
			absolute_pattern = /^[a-zA-Z]:[\/\\]|~/;

		if (absolute_pattern.test(args[0]))
			path = args[0];

		path = File.expandPath(path);

		var localFile = Components.classes["@mozilla.org/file/local;1"].
			createInstance(Components.interfaces.nsILocalFile);
		let jar_pattern = /\.jar|\.xpi$/;
		let isJar = jar_pattern.test(path);
		

		try {
			localFile.initWithPath(path);
		} catch (e if e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) { // relative path
			dactyl.echoerr(path + " doesn't exists!", commandline.FORCE_SINGLELINE);
			return false;
		} catch (e) {
			dactyl.echoerr(path + " doesn't exists!", commandline.FORCE_SINGLELINE);
			return false;
		}
		if (localFile.exists()) {
			if (args.bang) {
				if (!isJar)
					dactyl.open("file:///"+path, {background:false, where:dactyl.NEW_TAB});
				else
					dactyl.open("jar:file:///"+path+"!/", {background:false, where:dactyl.NEW_TAB});
			} else {
				if (options["open-editor"] && localFile.isFile()) {
					let suffies = options["open-suffix"];
					let base = path.split(PATH_SEP).pop();
					let opened = false;
					for (var i = suffies.length - 1; i >= 0; i--) {
						let pattern = new RegExp(suffies[i].replace(".", "\\.") + "$");
						if (pattern.test(base)) {
							if (util.OS.isWindows) {
								try {
									var file = Components.classes["@mozilla.org/file/local;1"]
										.createInstance(Components.interfaces.nsILocalFile);
									file.initWithPath(options["open-editor"]);

									var process = Components.classes["@mozilla.org/process/util;1"]
										.createInstance(Components.interfaces.nsIProcess);
									process.init(file);
									var args = [path];
									process.run(false, args, args.length);
								} catch (e if e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
									io.run(options["open-editor"], [path], false);
								} catch (e) {
									; // do nth
								}
							} else
								io.run(options["open-editor"], [path], false);
							opened = true;
							break;
						}
					}
					if (!opened)
						localFile.launch();
				} else
					localFile.launch();
			}
		} else {
			if (args.bang || !create)
				dactyl.echoerr(path + " doesn't exists!", commandline.FORCE_SINGLELINE);
			else {
				let prompt = "Do you want to create file or directory (" + path + ") y/n: ";
				commandline.input(prompt, function(accept) {
						accept = accept.trim();
						if (accept === "y") {
							try {
								localFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 438); // 438 digit
								if (options["open-editor"] && localFile.isFile()) {
									let suffies = options["open-suffix"];
									let base = path.split(PATH_SEP).pop();
									let opened = false;
									for (var i = suffies.length - 1; i >= 0; i--) {
										let pattern = new RegExp(suffies[i].replace(".", "\\.") + "$");
										if (pattern.test(base)) {
											if (util.OS.isWindows) {
												try {
													var file = Components.classes["@mozilla.org/file/local;1"]
														.createInstance(Components.interfaces.nsILocalFile);
													file.initWithPath(options["open-editor"]);

													var process = Components.classes["@mozilla.org/process/util;1"]
														.createInstance(Components.interfaces.nsIProcess);
													process.init(file);
													var args = [path];
													process.run(false, args, args.length);
												} catch (e if e.result === Cr.NS_ERROR_FILE_UNRECOGNIZED_PATH) {
													io.run(options["open-editor"], [path], false);
												} catch (e) {
													; // do nth
												}
											} else
												io.run(options["open-editor"], [path], false);

											opened = true;
											break;
										}
									}
									if (!opened)
										localFile.launch();
								} else
									localFile.launch();
							} catch (e if e.result == Cr.NS_ERROR_FILE_ALREADY_EXISTS ) {
								dactyl.echoerr(path + " already exists!", commandline.FORCE_SINGLELINE);
							} catch (e) {
								; //
							}
						}
					}
				);
			}
		}
	},
	{
		argCount: "?",
		bang: true,
		completer: function (context, args) cpt(context, args), // TODO: expandPath
		literal: 0
	}
);

options.add( // TODO: completer, validator
	["open-files", "opfs"],
	"Common File lists",
	"stringmap",
	"RC:RC FILE," +
	"PrefF:Preferences," +
	"ProfD/user.js:User Preferences," +
	"UChrm/userchrome.js:CSS for the UI chrome of the Mozilla application," +
	"UChrm/userContent.js:CSS for content inside windows," +
	"UChrm/userChrome.js:JS for the UI chrome of the Mozilla application," +
	"UChrm/userContent.js:JS for content inside windows",
	{

	}
);

options.add( // TODO: completer, validator
	["open-dirs", "opds"],
	"Common Directory lists",
	"stringmap",
	"UChrm:User Chrome Directory," +
	"ProfD:User Profile Directory," +
	"CurProcD:Installation (usually)," +
	"DefProfRt:User Directory," +
	"Desk:Desktop Directory," +
	"RUNTIMEPATH:runtimepath," +
	"SCRIPTNAMES:scriptnames", // virtual directory
	{

	}
);

function findEditor (string) {
    var str = string.trimLeft();
    var edge = false;
    var index = 0;
    while (!edge && index >= 0) {
        index = str.indexOf(" ", index+1);
        if (index >= 0) {
            if (str[index -1] !== "\\")
                edge = true;
        } else
            edge = true;
    }

    var editor = str;
    if (index >= 0)
        editor = str.substring(0,index);
    return editor;
}

let editors = [];
if (util.OS.isWindows) {
	editors = [
		["notepad.exe", "A simple text editor for Microsoft Windows."],
		["C:\\Program Files\\", "Program Dir"],
		["C:\\Program Files (x86)\\", "Program Dir (x86)"]
	];
} else {
	editors = [
		["emacs", "GNU Emacs"],
		["gvim", "Vi IMproved"],
		["gedit", "The official text editor of the GNOME desktop environment."],
		["kate", "Kate | Get an Edge in Editing"]
	];
}
let editor = findEditor(options["editor"]);
if (editor.length > 0) {
	let duplicated = false;
	editors.forEach(function(item, idx) {
		if (item[0] === editor) {
			editors[idx][1] = "External editor from pentadactyl 'editor' option.";
			duplicated = true;
		}
	})
	if (!duplicated)
		editors.push([editor, "External editor from pentadactyl 'editor' option."]);
}

options.add(
	["open-editor", "oped"],
	"Use Custom editor",
	"string",
	"",
	{
		validator: function() true,
		completer: function(context, args) {
			context.fork("oped", 0, this, function (context) {
					completion.file(context, false, args[0]);
			});
			// context.forkapply("oped", 0, completion, 'file', [false, args[0]]);

			context.title = ["editor", "description"];
			context.completions = editors;
		},
	}
);

options.add(
	["open-suffix", "opsu"],
	"File patterns opened by external editor.",
	"stringlist",
	"_pentadactylrc,.pentadactylrc,.penta,.vim,.css,.html,.js,.txt,.ini",
	{
	}
);

// * -a option, absolute path
// * ~/ expandPath
// * :scriptnames
// chrome list, chrome protocol
// 转换本地 jar/xpi 链接
// opfs opds
// 使用绝对路径时，无法用部分文件名打开 :ei /tmp/back.ht，自动补全显示且有结果的情况下。
// 考虑自动补全是否打开
// chrome://
// res://
// 'wildcase'
