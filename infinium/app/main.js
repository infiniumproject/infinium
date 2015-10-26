/*
	--------------------------
	Imports
	--------------------------
*/

var _ = require("lodash"),
	ipc = require("ipc");

function newBrowser (params) {
	new require("./browser")();

	if (params._[0]) {
		ipc.once("loaded", function (evt, arg) {
			evt.sender.send("loadPage", params._[0]);
		});
	}
}

exports.boot = newBrowser;
exports.reboot = newBrowser;

ipc.on("newBrowser", newBrowser);
