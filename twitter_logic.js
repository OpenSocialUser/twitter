var isOwner = false;

function toJSON(obj) { 
	return gadgets.json.stringify(obj); 
}

function toObject(str) {
    return gadgets.json.parse(str);
}

function checkIfOwner() {
    var userId = null;
    var ownerId = null;

    osapi.people.getViewer().execute(function(data) {
        userId = data.id;
        osapi.people.getOwner().execute(function(data) {
            ownerId = data.id;
            if (ownerId != null && userId != null && ownerId == userId) {
                isOwner = true;
            } else {
                isOwner = false;
            }
        });
    });
}

function renderTwitter() {
    if (!wave.getState()) {
        return;
    }
    var state = wave.getState();

    checkIfOwner();

    var iframeHeight = document.getElementById("twitter-widget-0").offsetHeight;

    gadgets.window.adjustHeight(iframeHeight);
    setTimeout(function(){
        gadgets.window.adjustHeight(iframeHeight);
    }, 1500);
}

function init() {
    if (wave && wave.isInWaveContainer()) {
        wave.setStateCallback(renderTwitter);

        wave.setParticipantCallback(renderTwitter);
    }
}

gadgets.util.registerOnLoadHandler(init);