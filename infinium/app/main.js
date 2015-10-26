/*
	--------------------------
	Imports
	--------------------------
*/

var ipc = require("ipc");

// Launch a new browser with optional params
function newBrowser (params) {
	new require("./browser")();

	if (params._[0]) {
		ipc.once("loaded", function (evt, arg) {
			evt.sender.send("loadPage", params._[0]);
		});
	}
}

// Expose newBrowser function to start.js
exports.boot = newBrowser;
exports.reboot = newBrowser;

// Listen for newBrowser from browser windows
ipc.on("newBrowser", newBrowser);
