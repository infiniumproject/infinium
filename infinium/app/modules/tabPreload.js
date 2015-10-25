/*
	--------------------------
	Imports
	--------------------------
*/

var ipc = require("ipc"),
	remote = require("remote");

var Menu = remote.require("menu"),
	MenuItem = remote.require("menu-item");

/*
	--------------------------
	Custom tab actions
	--------------------------
*/

// Context menu
var menu = new Menu();
menu.append(new MenuItem({
	label: "Inspect Element",
	click: function () {
		ipc.sendToHost("inspectElement", menu.clickEvent.clientX, menu.clickEvent.clientY);
	}
}));

window.addEventListener("contextmenu", function (e) {
	e.preventDefault();
	menu.clickEvent = e;
	menu.popup(remote.getCurrentWindow());
}, false);

// Custom alert function
window.alert = function (message) {
	ipc.sendToHost("alert", message);
}
