/*
	--------------------------
	Imports
	--------------------------
*/

var app = require("app");  // Module to control application life.

/*
	--------------------------
	Global variables
	--------------------------
*/

// Import some stuff into the global namespace before doing anything else
global.Infinium = {
	Browser: require("./browser")
};

/*
	--------------------------
	Bootstrap
	This is the first code executed when the browser is launched.
	--------------------------
*/

// Quit when all windows are closed.
app.on("window-all-closed", function() {
	if (process.platform != "darwin") {
		app.quit();
	}
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on("ready", function() {
	// Create the original browser window.
	var browser = new Infinium.Browser();
});
