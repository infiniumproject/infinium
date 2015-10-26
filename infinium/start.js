var app = require("app"),
	monogamous = require("monogamous");

var main = require("./app/main");

booter = monogamous({ sock: "infinium"});

booter.on("boot", main.boot);
booter.on("reboot", main.reboot);
booter.on("error", function (err) { console.log(err); });

app.on("ready", function() {
	booter.boot()
})

app.on("window-all-closed", function () {
	if (process.platform != "darwin") {
		app.quit();
	}
});
