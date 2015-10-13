/*
	--------------------------
	Imports
	--------------------------
*/

var remote = require("remote");

var app = remote.require("app"),
	BrowserWindow = remote.require("browser-window");

/*
	--------------------------
	class: WindowController
	Manages window view objects (Main menu, minimize, maximize, close, etc)
	--------------------------
*/

function WindowController () {
	this.init();
}

WindowController.prototype.init = function () {
	this.render();

	$(".cmd.close").click(function () {
		window.close();
	});

	$(".cmd.minimize").click(function () {
		var win = BrowserWindow.getFocusedWindow();
		if (win) {
			win.minimize();
		}
	});

	$(".cmd.maximize").click(function () {
		var win = BrowserWindow.getFocusedWindow();
		if (!win) return;

		if (win.isMaximized()){
			win.unmaximize();
		} else {
			win.maximize();
		}
	});
}

WindowController.prototype.render = function () {
	$("#windowcontrols").append(global.theme.windowcontrols(this));
}
