/*
	--------------------------
	Imports
	--------------------------
*/

var ipc = require("ipc");

/*
	--------------------------
	Global variables
	--------------------------
*/

global.Infinium = {
	homepage: "http://duckduckgo.com/"
};

function start () {
	// instatiate the browser objects (tabs, bookmarks, history, downloads etc)
	Infinium.tabs = new Tabs();

	// create the browser controller (Which will create it's subcontrollers for tabstrip and others)
	var browser = new BrowserController();
	Infinium.browser_controller = browser;
	window.browser = browser;

	// init and render
	browser.init();

	// Tell host process that browser is done loading
	ipc.send("loaded");
}

/* bootstrap / initialization */
$(function (){
	var Themes = require("./themes");
	var themes = new Themes();
	global.themes = themes;

	// after the themes are loaded do the rest of the initialization.
	global.themes.cb = start;

	themes.loadTheme(global.theme.name);
});
