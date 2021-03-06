/*
	--------------------------
	Imports
	--------------------------
*/

var _ = require("lodash"),
	ipc = require("ipc");

// Launch a new browser with optional args
var lastBrowser;

function openUrls (arr, browser) {
	_.each(arr, function (arg) {
		if (arg.match(/^\S+:/)) {
			browser.send("loadPage", arg);
		}
	});
}

function newBrowser (args) {
	if (args && lastBrowser) {
		openUrls(args._, lastBrowser);
	} else {
		new require("./browser")();

		// TODO: Less dangerous
		ipc.once("loaded", function (evt) {
			lastBrowser = evt.sender;
			if (args && args._) openUrls(args._, evt.sender);
		});
	}
}

// Expose newBrowser function to start.js
exports.boot = newBrowser;
exports.reboot = newBrowser;

// Listen for newBrowser from browser windows
ipc.on("newBrowser", function () {
	newBrowser();
});
