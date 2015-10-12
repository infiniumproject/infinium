var remote = require("remote"),
	BrowserWindow = remote.require("browser-window");

// --------------------------
// class: BrowserController
// Manages the view for the window
// -------------------------
function AppMenuController () {
	this.init();
}

AppMenuController.prototype.init = function () {
	this.render();

	$(".app-menu-cover").click(this.hideClickHandler);
	$(".app-menu *").click(this.hideClickHandler);
}

AppMenuController.prototype.hideClickHandler = function () {
	browser.appMenu.hide();
}

AppMenuController.prototype.hide = function() {
	$(".app-menu").removeClass("show");
	$(".app-menu-cover").removeClass("show");
}

AppMenuController.prototype.onToggleBrowserDevtools = function () {
	var browserWindow = BrowserWindow.getFocusedWindow();
	if (browserWindow.isDevToolsOpened()) {
		BrowserWindow.getFocusedWindow().closeDevTools();
	} else {
		BrowserWindow.getFocusedWindow().openDevTools();
	}
}

AppMenuController.prototype.onToggleTabDevtools = function () {
	console.log("Toggling tab devtools");
	var activeTab = browser.tabStrip.tabs.active.webview;
	if (activeTab.isDevToolsOpened()) {
		activeTab.closeDevTools()
	} else {
		activeTab.openDevTools()
	}
}

AppMenuController.prototype.onCloseBrowser = function () {
	app.quit(); // temporary until we provide support for multiple windows
}

AppMenuController.prototype.onCloseAllTabs = function () {
	// browser.tabStrip.tabs.closeAll();
	console.log("ayy")
}

AppMenuController.prototype.addEvents = _.once(function () {
	$("#browser_devtools").click(this.onToggleBrowserDevtools);
	$("#tab_devtools").click(this.onToggleTabDevtools);
	$("#close_all_tabs").click(this.onCloseAllTabs);
	$("#close_browser").click(this.onCloseBrowser);
});

AppMenuController.prototype.show = function () {
	$(".app-menu").addClass("show");
	$(".app-menu-cover").addClass("show");

	this.addEvents();
}

AppMenuController.prototype.render = function () {
	$("#menu").html(global.theme.menu(this));
}
