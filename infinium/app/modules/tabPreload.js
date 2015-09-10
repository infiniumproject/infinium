var ipc = require("ipc");

window.alert = function (message) {
	ipc.sendToHost("alert", message);
}