var isOwner = false;
var linkCheck = null;

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

function renderTimelineInput(timeline_type) {
    var state = wave.getState();
    var timeline = state.get('timeline');

    var html = '';
    if (timeline_type == 'search') {
        html += "<p style='font-size: 14px;'>Enter Hashtag Timeline:</p>";
        html += "<label style='margin-right: 3px;'>#</label>";
    } else {
        html += "<p style='font-size: 14px;'>Enter User Timeline:</p>";
        html += "<label style='margin-right: 3px;'>@</label>";
    }

    if (timeline != null && timeline != '') {
        html += "<input id='timeline' type='text' value='" + timeline + "'/>";
    } else {
        html += "<input id='timeline' type='text' value=''/>";
    }

    document.getElementById('timeline_input_container').innerHTML = html;
}

function renderEditPage() {
    var state = wave.getState();
    var timeline = state.get('timeline');
    var timeline_type = state.get('timeline_type');

    var html = "";
    var htmlHeader = "";
    var htmlFooter = "";

    html += "<p style='font-size: 14px;'>Select timeline type:</p>";
    html += "<select id='timeline_type'>";
    html += "<option value='user_timeline'>User Timeline</option>";
    html += "<option value='search' selected>Search</option>";
    html += "</select>"

    html += "<div id='timeline_input_container'></div>"

    html += "</br>";

    html += "<button id='saveButton' onclick='saveTimeline()'>Save</button>";
    html += "<button id='cancelButton' onclick='renderTwitter()'>Cancel</button>";

    html += "<p>";
    html += "Please report issues to IT direct component ";
    html += "<a target='_blank' href='https://itdirect.wdf.sap.corp/sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?saprole=ZITSERVREQU&crm-object-type=AIC_OB_INCIDENT&crm-object-action=D&PROCESS_TYPE=ZINE&CAT_ID=IMAS_JAM'>'IMAS_Jam'</a>";
    html += ", feedback to ";
    html += "<a target='_blank' href='https://jam4.sapjam.com/groups/about_page/3B960zLBubCXJjPjDT59T5'>SAP Jam Support Center</a>";
    html += ".";
    html += "</p>";

    document.getElementById('body').innerHTML = html;
    document.getElementById('footer').innerHTML = htmlFooter;
    document.getElementById('header').innerHTML = htmlHeader;

    document.getElementById('timeline_type').value = timeline_type;
    renderTimelineInput(timeline_type);

    document.getElementById('timeline_type').onchange = function() {
        renderTimelineInput(this.value);
    }
}

function saveTimeline() {
    var state = wave.getState();
    var timeline = document.getElementById('timeline').value;
    var timeline_type = document.getElementById('timeline_type').value;

    state.submitDelta({'timeline' : timeline});
    state.submitDelta({'timeline_type' : timeline_type});

    renderTwitter();
}

function insertTimeline(timeline) {
    var state = wave.getState();
    var timeline = state.get('timeline');
    var timeline_type = state.get('timeline_type');

    var html = "";
    var htmlFooter = "";

    if (timeline_type == 'search') {
        html += "<a class='twitter-timeline' href='https://twitter.com/hashtag/"+timeline+"'>Tweets by #"+timeline+"</a>";
    } else {
        html += "<a class='twitter-timeline' href='https://twitter.com/"+timeline+"'>Tweets by @"+timeline+"</a>";
    }

    if (isOwner) {
        htmlFooter += "<div id='editButtonIcon' onclick='renderEditPage()''></div>";
    }

    document.getElementById('body').innerHTML = html;
    document.getElementById('footer').innerHTML = htmlFooter;

    twttr.widgets.load(
        document.getElementById('body')
    );

    if (linkCheck == null) {
        linkCheck = setInterval(function() {
            fixTwitterLinks();
        }, 2000);
    }
}

function fixTwitterLinks() {
    var footers = document.getElementsByClassName('timeline-Footer');
    for (i = 0; i < footers.length; i++) {
        var links = footers[i].getElementsByTagName('a');
        for (j = 0; j < links.length; j++) {
            links[j].target = "_blank";
        }
    }
}

function renderTwitter() {
    if (!wave.getState()) {
        return;
    }
    var state = wave.getState();
    var timeline = state.get('timeline');

    checkIfOwner();

    if (timeline != null && timeline != "") {
        insertTimeline(timeline);
    } else {
        if (isOwner) {
           renderEditPage();
        } else {
            setTimeout(function(){
                if (isOwner) {
                   renderEditPage();
                }
            }, 2000);
        }
    }

    var twitterWidgetHeight = 0;
    var frames = document.getElementsByTagName("iframe");
    for (var i = frames.length; i;) {
        var frame = frames[--i];
        if (frame.id.indexOf("twitter-widget") > -1) {
            twitterWidgetHeight = frame.offsetHeight + 20;
        }
    }

    var iframeHeight = 0;
    if (twitterWidgetHeight == 0) {
        iframeHeight = 520;
    } else {
        iframeHeight = twitterWidgetHeight;
    }

    /*gadgets.window.adjustHeight(iframeHeight);
    setTimeout(function(){
        gadgets.window.adjustHeight();
    }, 1500);*/
}

function init() {
    if (wave && wave.isInWaveContainer()) {
        wave.setStateCallback(renderTwitter);
    }
}

gadgets.util.registerOnLoadHandler(init);
