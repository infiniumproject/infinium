/*
	--------------------------
	Imports
	--------------------------
*/

var _ = require("lodash"),
	ipc = require("ipc");

// Launch a new browser with optional launchArgs
var lastBrowser;

function openUrls (launchArgs, browser) {
	_.each(launchArgs._, function (arg) {
		if (arg.match(/^\S+:/)) {
			browser.send("loadPage", arg);
		}
	});
}

function newBrowser (launchArgs) {
	if (launchArgs && launchArgs._.length) {
		if (lastBrowser) {
			openUrls(launchArgs, lastBrowser);
		} else {
			new require("./browser")();

			// TODO: Less dangerous
			ipc.once("loaded", function (evt) {
				openUrls(launchArgs, evt.sender);
			});
		}
	}

	// TODO: Less dangerous
	ipc.once("loaded", function (evt) {
		lastBrowser = evt.sender;
	});
}

// Expose newBrowser function to start.js
exports.boot = newBrowser;
exports.reboot = newBrowser;

// Listen for newBrowser from browser windows
ipc.on("newBrowser", function () {
	newBrowser();
});
