var ipc = require("ipc");

window.alert = function (message) {
	ipc.sendToHost("alert", message);
}

ipc.on("page", function (html) {
	document.write(html);
});