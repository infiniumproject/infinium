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
		var a = _.once(function (evt, arg) {
			evt.sender.send("loadPage", params._[0]);
		});

		ipc.on("loaded", a);
	}
}

exports.boot = newBrowser;
exports.reboot = newBrowser;

ipc.on("newBrowser", newBrowser);
