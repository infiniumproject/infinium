/*
	--------------------------
	Imports
	--------------------------
*/

var _ = require("lodash"),
	urll = require("url"),
	http = require("http"),
	https = require("https"),
	events = require("events")

var userAgents = require("./modules/useragents");

/*
	--------------------------
	class: TabView
	The backing model/controller for an individual tab. Manages the WebView and is used as state for the controller
	--------------------------
*/

function TabView (p) {
	this.parent = p;
	this.tabstrip_el = null;

	this.has_favicon = false;

	this.webview = null;
	this.id = _.uniqueId("webframe_");
}

// see: https://github.com/atom/atom-shell/blob/master/docs/api/web-view-tag.md
TabView.prototype.initView = function () {
	// create the frame holder
	this.frameHolder = document.createElement("div");
	this.frameHolder.id = this.id + "_frame";
	this.frameHolder.classList.add("webframe");

	// Create the webview and set options
	this.webview = new WebView();
	$(this.webview).attr("plugins", "on");
	$(this.webview).attr("preload", "./modules/tabPreload.js");

	// Pick a random popular user agent (for anonomity)
	var userAgent = userAgents[_.random(0, userAgents.length)];
	$(this.webview).attr("useragent", userAgent);

	// Custom browser events
	this.webview.addEventListener("ipc-message", function (e) {
		switch (e.channel) {
		case "alert":
			console.log(this.url_parts.host + " says \"" + e.args[0] + "\"");
			alert(this.url_parts.host + " says \"" + e.args[0] + "\"");
			break;
		}
	}.bind(this));

	// Add the webview to document
	this.frameHolder.appendChild(this.webview);
	$("#webframes").append(this.frameHolder);

	// Set some initial tab properties
	this.active = true;
	this.favicon = null;
	this.ssl = null;
	this.loadState = "loading";

	// Event handlers
	this.webview.addEventListener("close", this.close.bind(this));

	this.webview.addEventListener("crashed", function () {
		this.loadState = "crashed";
	}.bind(this));

	this.webview.addEventListener("destroyed", function () {
		this.loadState = "crashed"; // I think...
		console.log("The \"destroyed\" thing happened");
	}.bind(this));

	this.webview.addEventListener("did-fail-load", function () {
		console.log("The \"fail-load\" thing happened");
	}.bind(this));

	this.webview.addEventListener("did-finish-load", function () {
		this.loadState = "done";
	}.bind(this));

	this.webview.addEventListener("did-start-loading", function () {
		this.loadState = "loading";
		this.updateTitle();
		this.updateUrl();
	}.bind(this));

	this.webview.addEventListener("did-stop-loading", function () {
		this.loadState = "done";
		this.updateTitle();
		this.updateUrl();
	}.bind(this));

	this.webview.addEventListener("new-window", function (e) {
		// check for window-bombing here
		this.parent.addTab(e.url);
	}.bind(this));

	this.webview.addEventListener("page-title-set", function (e) {
		this.title = e.title;
		this.updateTitle();
	}.bind(this));

	this.webview.addEventListener("page-favicon-updated", function (e) {
		this.favicon_url = e.favicons[0];
		this.updateFavicon();
	}.bind(this));

	this.webview.addEventListener("did-get-response-details", function (e) {
		// Stuff for SSL indicator
		if (this.ssl == false) return;

		var ssl;
		if (urll.parse(e.newUrl).protocol == "https:") {
			ssl = true;
		} else {
			ssl = false;
		}

		if (this.ssl != ssl) {
			this.ssl = ssl;
			this.updateSsl();
		}
	}.bind(this));

	this.webview.addEventListener("did-get-redirect-request", function (e) {
		this.updateUrl();
	}.bind(this));
}

// Fetch and set favicon
TabView.prototype.updateFavicon = function () {
	this.old_favicon_url = this.favicon_url;
	var parsedUrl = urll.parse(this.favicon_url);

	var favicon_data = [];
	function respHandler (resp)  {
		resp.on("data", function (chunk) { favicon_data.push(chunk); });
		resp.on("end", function () {
			var buf = Buffer.concat(favicon_data);
			this.favicon_data = "data:image/x-icon;base64," + buf.toString("base64");
			this.has_favicon = true;

			this.parent.emit(Tabs.EVENT_TAB_FAVICON, this);
		}.bind(this));
	}

	if (parsedUrl.protocol == "https:") {
		https.get(parsedUrl, respHandler.bind(this));
	} else {
		http.get(parsedUrl, respHandler.bind(this));
	}
}

// Update tab title
TabView.prototype.updateTitle = function () {
	if (!this.title) {
		this.title = this.webview.getTitle();
	}

	this.parent.emit(Tabs.EVENT_TAB_TITLE, this);
}

// Update tab URL and parts
TabView.prototype.updateUrl = function () {
	this.url = this.webview.getUrl();
	this.url_parts = urll.parse(this.url);

	this.parent.emit(Tabs.EVENT_TAB_URL, this);
}

// Update tab SSL status
TabView.prototype.updateSsl = function () {
	this.parent.emit(Tabs.EVENT_TAB_SSL, this);
}

// Set URL of tab
TabView.prototype.setUrl = function (url) {
	if (!this.webview) {
		this.initView();
	}

	this.ssl = null;
	this.webview.src = url;
}

// Close tab
TabView.prototype.close = function () {
	var i = this.parent.tabs.indexOf(this);
	this.parent.tabs.splice(i, 1);
	this.parent.emit(Tabs.EVENT_TAB_CLOSED, this);

	this.frameHolder.removeChild(this.webview);
	delete this.webview;

	console.log("---closed tab---");
}

// Show tab
TabView.prototype.show = function () {
	this.parent.active = this;

	this.parent.emit(Tabs.EVENT_TAB_ACTIVE, this);

	$(".webframe").removeClass("visible");
	this.frameHolder.classList.add("visible");
}

/*
	--------------------------
	class: Tabs
	This class represents the backing model for a tabstrip, and manages tabs as they get created, deleted or swapped.
	The TabStripController will use this for getting information about tab state.
	--------------------------
*/

function Tabs () {
	// when the TabStripController is created, this object will hold a reference to it for callbacks
	this.controller = null;

	// array of created Tab objects
	this.tabs = [];
}

// this object will have events
Tabs.prototype.__proto__ = events.EventEmitter.prototype;

/*
	--------------------------
	Events
	--------------------------
*/

Tabs.EVENT_TAB_ADDED = "TabAdded";
Tabs.EVENT_TAB_CLOSED = "TabClosed";
Tabs.EVENT_TAB_TITLE = "TabTitle";
Tabs.EVENT_TAB_STATE = "TabState";
Tabs.EVENT_TAB_ACTIVE = "TabActive";
Tabs.EVENT_TAB_FAVICON = "TabFavicon";

/*
	--------------------------
	Class Methods
	--------------------------
*/

// Set controller
Tabs.prototype.setController = function (controller) {
	this.controller = controller;
}

// Add a tab and display it immediately
Tabs.prototype.addTab = function (url) {
	var tab = new TabView(this);
	tab.setUrl(url);

	this.tabs.push(tab);
	this.emit(Tabs.EVENT_TAB_ADDED, tab);
}

// Close all open tabs
Tabs.prototype.closeAll = function () {
	console.dir(this.tabs);
	_.times(this.tabs.length, function () {
		this.tabs[0].close();
	}.bind(this));
}
