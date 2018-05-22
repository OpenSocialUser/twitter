var isOwner = null;
var isOnSave = false;

function toJSON(obj) {
	return gadgets.json.stringify(obj);
}

function toObject(str) {
    return gadgets.json.parse(str);
}

function isEditPageShown() {
    return (document.getElementById("saveButton") != null);
}

function isJamGroupOverviewPage() {
  return document.referrer.indexOf("/overview_page/") > -1;
}

function isJamHomeViewPage() {
  return (document.referrer.indexOf("/home") > -1) && (document.referrer.indexOf("/edit") < 0);
}

function renderEditButton() {
    if (isJamGroupOverviewPage() || isJamHomeViewPage()) { return; }
    if (!isOwner || isEditPageShown() || document.getElementById("editButtonIcon") != null) { return; }

    var footer = document.getElementById("footer");
    var button = document.createElement("div");
    button.setAttribute("id", "editButtonIcon");
    button.setAttribute("title", "Settings");
    button.setAttribute("onclick", "renderEditPage()");
    footer.appendChild(button);
}

function checkIfOwner(callback) {
    if (isOwner != null) {
    	callback();
    	return;
    }

    var userId = null;
    var ownerId = null;
    osapi.people.getOwner().execute(function(data) {
        ownerId = data.id;
        osapi.people.getViewer().execute(function(data) {
            userId = data.id;
            if (ownerId != null && userId != null) {
                isOwner = (ownerId === userId);
                callback();
            }
        });
    });
}

var twitterTypes = {
    user:       "profile",
    oldUser:    "user_timeline",
    widget:     "widget_timeline",
    list:       "list",
    collection: "collection",
    like:       "likes",
    moment:     "moment",
    tweet:      "tweet",
    video:      "video"
};

function getMessageEmpty(attribute) {
	return "Please provide " + (attribute || "data.");
}

var errorMessages = {
    emptyUser:       getMessageEmpty("Twitter username."),
    // emptyWidget:     getMessageEmpty("Widget ID."),
    emptySlug:       getMessageEmpty("List ID."),
    emptyCollection: getMessageEmpty("Collection ID."),
    emptyMoment:     getMessageEmpty("Moment ID."),
    emptyTweet:      getMessageEmpty("Tweet ID."),
    invalidUser:     "Timeline should start with @ and contain only digits, letters, underscores.",
    invalidId:       "Only digits are allowed.",
    notExist:        "Twitter entity was not found. Please check the data.",
    inaccessible:    "Twitter entity does not exest or the author has protected their tweets.",
    general:         "Changes cannot be saved.\nPlease reload the page and try again."
};

function getState() {
    var state = wave.getState();
    var twitterType = state.get("type");
    // May be it's old Widget data (before SJR-63). Let's check old version of property. 
    if (twitterType == null || twitterType === "") {
    	twitterType = state.get("timeline_type");
    }
	// Fallback to default Widget type if it's not defined.
    if (twitterType == null || twitterType === "") {
        twitterType = twitterTypes.user;
    }

	switch (twitterType) {
		case twitterTypes.oldUser:
			return { type: twitterTypes.user, screenName: state.get("timeline") };
		case twitterTypes.user:
		case twitterTypes.like:
			return { type: twitterType, screenName: state.get("screenName") };
		case twitterTypes.list:
			return {
				type: twitterType,
				ownerScreenName: state.get("ownerScreenName"),
				slug: state.get("slug")
			};
		case twitterTypes.widget:
			return { type: twitterType, widgetId: state.get("timeline") };
		case twitterTypes.collection:
		case twitterTypes.moment:
		case twitterTypes.tweet:
		case twitterTypes.video:
			return { type: twitterType, id: state.get("id") };
	}
}

function adjustSize(size) {
    if (size != null) {
        gadgets.window.adjustHeight(size);
    } else {
        gadgets.window.adjustHeight();
    }
}

function getTwitterUsername(username) {
    if (username.substring(0,1) === "@") {
        return username.substring(1);
    } else {return username;}
}

function getEmptyInputErrorMessage(field) {
	switch (field) {
		case twitterTypes.user:
		case twitterTypes.like:
		case twitterTypes.list:
			return errorMessages.emptyUser;
		case "slug":
			return errorMessages.emptySlug;
		// case twitterTypes.widget:
		// 	return errorMessages.emptyWidget;
		case twitterTypes.collection:
			return errorMessages.emptyCollection;
		case twitterTypes.moment:
			return errorMessages.emptyMoment;
		case twitterTypes.tweet:
		case twitterTypes.video:
			return errorMessages.emptyTweet;
	}
}

function handleInputError(input, message, passed) {
    var errorSpanId = input.getAttribute("id") + "_error";
    var errorSpan = document.getElementById(errorSpanId);
    if (passed) {
	    input.style.borderStyle = "";
	    input.style.borderColor = "";
	    errorSpan.innerText = "";
    } else {
        input.style.borderStyle = "solid";
        input.style.borderColor = "red";
        errorSpan.innerText = message;
    }
}

function handleGeneralError(message, passed) {
	var generalSpan = document.getElementById("general_error");
	if (passed) {
		generalSpan.innerText = "";
	} else {
		generalSpan.innerText = message;
	}
}

function validateInputs() {
	var inputs = document.getElementsByClassName("twitter-input");
	var message = "";
	var isValid = true;
	for(var i=0;i<inputs.length;i++) {
		var passed = false;
		if (inputs[i].value === "" || inputs[i].value == null) {
			message = getEmptyInputErrorMessage(inputs[i].getAttribute("id"));
	    } else if (inputs[i].value === "@") {
	        message = errorMessages.notExist;
	    } else {
	    	var regexp = null;
	    	var fieldType = inputs[i].getAttribute("id");
	    	switch (fieldType) {
	    		case twitterTypes.user:
				case twitterTypes.like:
				case twitterTypes.list:
	    			regexp = /^@[a-z0-9_]+$/i;
	    			passed = regexp.test(inputs[i].value);
	    			message = errorMessages.invalidUser;
	    			break;
	    		case "slug":
	    			passed = true;
	    			break;
	    		default:
	    			regexp = /^\d+$/;
	    			passed = regexp.test(inputs[i].value);
	    			message = errorMessages.invalidId;
	    	}
	    }
	    handleInputError(inputs[i], message, passed);
	    if (!passed) { isValid = false; }
	}
	return isValid;
}

function receiveTimeline(options, element) {
	var params = {};
	switch(options.type) {
		case twitterTypes.user:
		case twitterTypes.like:
			params.screenName = getTwitterUsername(options.screenName);
			break;
		case twitterTypes.list:
			params.ownerScreenName = getTwitterUsername(options.ownerScreenName);
			params.slug = options.slug;
			break;
		case twitterTypes.widget:
			params.widgetId = getTwitterUsername(options.widgetId);
			break;
		case twitterTypes.collection:
			params.id = getTwitterUsername(options.id);
	}
	var target = Object.assign({ sourceType: options.type }, params);
    return twttr.widgets.createTimeline(target, element);
}

function receiveTweet(type, id, element) {
	switch(type) {
		case twitterTypes.moment:
			return twttr.widgets.createMoment(id, element);
		case twitterTypes.tweet:
			return twttr.widgets.createTweet(id, element);
		case twitterTypes.video:
			return twttr.widgets.createVideo(id, element);
	}
}

function handleSaveButton(saving) {
    if (saving == null) {saving = true;}

    var btn = document.getElementById("saveButton");
    if (btn == null) {return;}

    if (saving) {
        btn.textContent = "Saving...";
        btn.disabled = true;
    } else {
        btn.textContent = "Save";
        btn.disabled = false;
    }
}

function receiveTwitterCallback(f, delta) {
    document.getElementById("hidden_div").innerHTML = "";

    var message = errorMessages.notExist;
    if (delta.type === twitterTypes.user ||
    	delta.type === twitterTypes.list ||
    	delta.type === twitterTypes.like) { message = errorMessages.inaccessible; }
    handleGeneralError(message, f != null);

    if (f == null) {
        handleSaveButton(false);
        return;
    }

    isOnSave = true;

    var state = wave.getState();
    state.submitDelta(delta);
}

function saveTwitter() {
    if (!validateInputs()) {return;}

    handleSaveButton();

    var twitterType = document.getElementById("twitter_type").value;
    var delta = { type: twitterType };
    var identifier = document.getElementById(twitterType).value;
    
	switch(twitterType) {
		case twitterTypes.user:
		case twitterTypes.like:
			delta.screenName = identifier;
			break;
		case twitterTypes.list:
			delta.ownerScreenName = identifier;
			var slug = document.getElementById("slug").value;
			delta.slug = slug;
			break;
		// case twitterTypes.widget:
		// 	delta.widgetId = identifier;
		// 	break;
		default:
			delta.id = identifier;
	}

    osapi.people.getOwner().execute(function(data) {
        if (data.id == null) {
            handleSaveButton(false);
            handleGeneralError(errorMessages.general, false);
        } else {
        	var hiddenElement = document.getElementById("hidden_div");
        	switch(twitterType) {
        		case twitterTypes.moment:
        		case twitterTypes.tweet:
        		case twitterTypes.video:
        			receiveTweet(twitterType, delta.id, hiddenElement).then(function(f) {
        				receiveTwitterCallback(f, delta);
        			});
        			break;
        		default:
		        	receiveTimeline(delta, hiddenElement).then(function(f) {
		                receiveTwitterCallback(f, delta);
		            });
        	}
        }
    });
}

function renderTwitterInput(options) {
    var html = "";
    var value = "";
    var twitterType = options.type;
    
    switch(twitterType) {
    	case twitterTypes.list:
    		var slug = "value='" + (options.slug || "") + "'";
    		if (options.slug != null && options.slug !== "") {slug = "value='"+options.slug+"'";}
	        html += "<p class='label'>Enter List Name:</p>";
	        html += "<input id='slug' class='twitter-input' type='text' "+slug+" />";
	        html += "<span id='slug_error' class='error-txt'></span>";
	        value = "value='" + (options.ownerScreenName || "") + "'";
	        html += "<p class='label'>Enter Twitter Username:</p>";
	        html += "<input id='"+twitterType+"' class='twitter-input' type='text' placeholder='e.g. @twitter' "+value+" />";
    		break;
    	case twitterTypes.collection:
    		value = "value='" + (options.id || "") + "'";
	        html += "<p class='label'>Enter Collection ID:</p>";
	        html += "<input id='"+twitterType+"' class='twitter-input' type='text' "+value+" />";
    		break;
    	case twitterTypes.moment:
    		value = "value='" + (options.id || "") + "'";
	        html += "<p class='label'>Enter Moment ID:</p>";
	        html += "<input id='"+twitterType+"' class='twitter-input' type='text' "+value+" />";
    		break;
    	case twitterTypes.tweet:
    	case twitterTypes.video:
    		value = "value='" + (options.id || "") + "'";
	        html += "<p class='label'>Enter Tweet ID:</p>";
	        html += "<input id='"+twitterType+"' class='twitter-input' type='text' "+value+" />";
	        break;
    	// case twitterTypes.widget:
    	// 	value = "value='" + (options.widgetId || "") + "'";
	    //     html += "<p class='label'>Enter widget ID:</p>";
	    //     html += "<input id='"+twitterType+"' class='twitter-input' type='text' "+value+" />";
    	// 	break;
    	default:
    		value = "value='" + (options.screenName || "") + "'";
	        html += "<p class='label'>Enter Twitter Username:</p>";
	        html += "<input id='"+twitterType+"' class='twitter-input' type='text' placeholder='e.g. @twitter' "+value+" />";
    }
    html += "<span id='" + twitterType + "_error' class='error-txt'></span>";
    document.getElementById("timeline_input_container").innerHTML = html;
}

function renderEditPage() {
    if (isEditPageShown()) {return;}

    var html = "";
    var htmlHeader = "";
    var htmlFooter = "";

    html += "<p class='label'>Select Widget Type:</p>";
    html += "<select id='twitter_type'>";
    html += "<option value='profile' selected='selected'>User Timeline</option>";
    // html += "<option value='widget'>Widget Timeline</option>";
    html += "<option value='list'>List Timeline</option>";
    html += "<option value='collection'>Collection Timeline</option>";
    html += "<option value='likes'>Likes Timeline</option>";
    html += "<option value='moment'>Embedded Moment</option>";
    html += "<option value='tweet'>Embedded Tweet</option>";
    html += "<option value='video'>Embedded Video</option>";
    html += "</select>";

    html += "<div id='timeline_input_container'></div>";

    html += "<span id='general_error' class='error-txt' style='margin-top: 10px;'></span>";

    html += "<button id='saveButton' onclick='saveTwitter()'>Save</button>";
    html += "<button id='cancelButton' onclick='cancelEdit()'>Cancel</button>";

    html += "<p>";
    html += "Please report issues to IT direct component ";
    html += "<a target='_blank' href='https://itdirect.wdf.sap.corp/sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?saprole=ZITSERVREQU&crm-object-type=AIC_OB_INCIDENT&crm-object-action=D&PROCESS_TYPE=ZINE&CAT_ID=IMAS_JAM'>'IMAS_Jam'</a>";
    html += ", provide your feedback on ";
    html += "<a target='_blank' href='https://jam4.sapjam.com/groups/about_page/3B960zLBubCXJjPjDT59T5'>SAP Jam Support Center</a>";
    html += ".";
    html += "</p>";
    html += "<div id='hidden_div' style='display: none;'></div>";

    htmlHeader += "<h3>Settings:</h3>";
    htmlHeader += "<div class='help'><a href='https://jam4.sapjam.com/wiki/show/qojyAjMfMCnCplFPeS2KUM' target='_blank' title='Help'><div id='help_icon'></div></a></div>";

    document.getElementById("body").innerHTML = html;
    document.getElementById("footer").innerHTML = htmlFooter;
    document.getElementById("header").innerHTML = htmlHeader;

	var state = getState();
	var twitterType = state.type;
	// SJR-63 Widget Type is not supported by Twitter from 25-May-2018
    if (twitterType === twitterTypes.widget) { state = { type: twitterTypes.user }; }

    document.getElementById("twitter_type").value = state.type;
    renderTwitterInput(state);

    document.getElementById("twitter_type").onchange = function() {
    	renderTwitterInput({type: this.value});
    };
}

function isTimelineShown() {
	// Check UserTimeline, Moment, Collection, List, Likes
    var frames = document.getElementsByTagName("iframe");
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].id != null && frames[i].id.indexOf("twitter-widget") > -1) {return true;}
    }
    // Check EmbeddedTweet, EmbeddedVideo
    var twitterwidgets = document.getElementsByTagName("twitterwidget");
    for (var j = 0; j < twitterwidgets.length; j++) {
        if (twitterwidgets[j].id != null && twitterwidgets[j].id.indexOf("twitter-widget") > -1) {return true;}
    }
    return false;
}

function insertTimeline() {
    if (isTimelineShown()) {
        renderEditButton();
        return;
    }

    var body = document.getElementById("body");
    var footer = document.getElementById("footer");
    var header = document.getElementById("header");

    body.innerHTML = "";
    footer.innerHTML = "";
    header.innerHTML = "";

    var state = getState();
	switch(state.type) {
		case twitterTypes.moment:
		case twitterTypes.tweet:
		case twitterTypes.video:
			receiveTweet(state.type, state.id, body).then(function() {
				twttr.ready(function () { adjustSize(500); });
			});
			break;
		case twitterTypes.widget:
			var target = {sourceType: "widget", widgetId: state.widgetId};
			twttr.widgets.createTimeline(target, body, {width: "100%"}).then(function() {
		        twttr.ready(function () { adjustSize(); });
			});
			break;
		default:
        	receiveTimeline(state, body).then(function() {
                twttr.ready(function () { adjustSize(500); });
            });
	}
}

function readyToInsertTimeline() {
	var state = getState();
	for (var parameter in state) {
	  if (state[parameter] == null || state[parameter] === "") { return false; }
	}
	return true;
}

function cancelEdit() {
    if (readyToInsertTimeline()) { insertTimeline(); }
}

function renderTwitter() {
    if (!wave.getState()) { return; }
    if (!isOnSave && isEditPageShown()) { return; }
    isOnSave = false;

    if (readyToInsertTimeline()) { insertTimeline(); }
    
    checkIfOwner(function() {
    	if (isOwner && !(isJamGroupOverviewPage() || isJamHomeViewPage())) {
    		if (readyToInsertTimeline()) {
    			renderEditButton();
    		} else { renderEditPage(); }
    	}
    });
}

function init() {
    if (wave && wave.isInWaveContainer()) {
        wave.setStateCallback(renderTwitter);
    }
}

gadgets.util.registerOnLoadHandler(init);
