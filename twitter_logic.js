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

function renderEditPage() {
    var state = wave.getState();
    var timeline = state.get('timeline');

    var html = "";
    var htmlHeader = "";
    var htmlFooter = "";

    html += "<p style='font-size: 14px;'>Choose Twitter timeline from list:</p>";
    //if (timeline != null && timeline != "") {
    //} else {
        html += "<select id='timeline_select'>";
        html += "<option value='saphybris'>@saphybris</option>";
        html += "<option value='SAPPHIRENOW'>@SAPPHIRENOW</option>";
        html += "<option value='hybris_software'>@hybris_software</option>";
        html += "<option value='SAPSocial'>@SAPSocial</option>";
        html += "<option value='saphcp'>@saphcp</option>";
        html += "<option value='BillRMcDermott'>@BillRMcDermott</option>";
        html += "<option value='SAP'>@SAP</option>";
        html += "</select>";
    //}

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
    var saphybris = "<a class='twitter-timeline' href='https://twitter.com/saphybris' data-widget-id='727823334650593281'>Tweets by @saphybris</a>";
    var SAPPHIRENOW = "<a class='twitter-timeline' href='https://twitter.com/SAPPHIRENOW' data-widget-id='737250519270498305'>Tweets by @SAPPHIRENOW</a>";
    var hybris_software = "<a class='twitter-timeline' href='https://twitter.com/hybris_software' data-widget-id='737250981742817280'>Tweets by @hybris_software</a>";
    var SAPSocial = "<a class='twitter-timeline' href='https://twitter.com/SAPSocial' data-widget-id='737251282608619520'>Tweets by @SAPSocial</a>";
    var saphcp = "<a class='twitter-timeline' href='https://twitter.com/saphcp' data-widget-id='737251552482693121'>Tweets by @saphcp</a>";
    var BillRMcDermott = "<a class='twitter-timeline' href='https://twitter.com/BillRMcDermott' data-widget-id='737251873682526208'>Tweets by @BillRMcDermott</a>";
    var SAP = "<a class='twitter-timeline' href='https://twitter.com/SAP' data-widget-id='737252109201092608'>Tweets by @SAP</a>";

    var state = wave.getState();
    var timeline = state.get('timeline');

    var html = "";
    var htmlFooter = "";

    if (timeline == "saphybris") {
        html += saphybris;
    } else if (timeline == "SAPPHIRENOW") {
        html += SAPPHIRENOW;
    } else if (timeline == "hybris_software") {
        html += hybris_software;
    } else if (timeline == "SAPSocial") {
        html += SAPSocial;
    } else if (timeline == "saphcp") {
        html += saphcp;
    } else if (timeline == "BillRMcDermott") {
        html += BillRMcDermott;
    } else if (timeline == "SAP") {
        html += SAP;
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

        wave.setParticipantCallback(renderTwitter);
    }
}

gadgets.util.registerOnLoadHandler(init);