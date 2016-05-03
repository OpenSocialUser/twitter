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
        console.log(userId);
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

function renderEditPage() {
    var state = wave.getState();
    var timeline = state.get('timeline');

    var html = "";
    var htmlHeader = "";
    var htmlFooter = "";

    html += "<p style='font-size: 14px;'>Choose Twitter timeline from list:</p>";
    if (timeline != null && timeline != "") {
        html += "<select id='timeline_select'>";
        if (timeline == "test") {
            html += "<option value='test' selected>Test</option>";
            html += "<option value='hybris'>Hybris</option>";
        } else if (timeline == "hybris") {
            html += "<option value='test'>Test</option>";
            html += "<option value='hybris' selected>Hybris</option>";
        }
        html += "</select>";
    } else {
        html += "<select id='timeline_select'>";
        html += "<option value='test' selected>Test</option>";
        html += "<option value='hybris'>Hybris</option>";
        html += "</select>";
    }

    html += "</br>";

    html += "<button id='saveButton' onclick='saveTimeline()''>Save</button>";
    html += "<button id='cancelButton' onclick='renderTwitter()''>Cancel</button>";

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
}

function saveTimeline() {
    var state = wave.getState();
    var timeline = document.getElementById('timeline_select').value;

    state.submitDelta({'timeline' : timeline});

    renderTwitter();
}

function insertTimeline(timeline) {
    var testTimeline = "<a class='twitter-timeline' href='https://twitter.com/OpenSocialUser' data-widget-id='717304595446439936'>Твиты от @OpenSocialUser</a>";
    var hybrisTimeline = "<a class='twitter-timeline'  href='https://twitter.com/saphybris' data-widget-id='702191997369643009'>Tweets by @saphybris</a>";

    var state = wave.getState();
    var timeline = state.get('timeline');

    var html = "";
    var htmlFooter = "";

    if (timeline == "test") {
        html += testTimeline;
    } else if (timeline == "hybris") {
        html += hybrisTimeline;
    }

    if (isOwner) {
        htmlFooter += "<button id='editButton' onclick='renderEditPage()''>Edit</button>";
    }

    document.getElementById('body').innerHTML = html;
    document.getElementById('footer').innerHTML = htmlFooter;

    twttr.widgets.load(
        document.getElementById('body')
    );
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
    var divs = document.getElementsByTagName("div");
    for (var i = divs.length; i;) {
        var div = divs[--i];
        if (div.id.indexOf("twitter-widget") > -1) {
            twitterWidgetHeight = div.offsetHeight + 20;
        }
    }

    var iframeHeight = 0;
    if (twitterWidgetHeight == 0) {
        iframeHeight = 300;
    } else {
        iframeHeight = twitterWidgetHeight;
    }

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