/*
	--------------------------
	Imports
	--------------------------
*/

var ipc = require("ipc");

// Launch a new browser with optional launchArgs
function newBrowser (launchArgs) {
	new require("./browser")();

	if (!launchArgs) return;

	if (launchArgs._[0]) {
		// TODO: Less dangerous
		ipc.once("loaded", function (evt, arg) {
			evt.sender.send("loadPage", launchArgs._[0]);
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
