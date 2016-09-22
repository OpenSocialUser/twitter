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
        html += "<option value='SAPSocial'>@SAPSocial</option>";
        html += "<option value='saphcp'>@saphcp</option>";
        html += "<option value='BillRMcDermott'>@BillRMcDermott</option>";
        html += "<option value='SAP'>@SAP</option>";
        html += "<option value='SAPAriba'>@SAPAriba</option>";
        html += "<option value='SuccessFactors'>@SuccessFactors</option>";
        html += "<option value='SAPDigitalSvcs'>@SAPDigitalSvcs </option>";
        html += "<option value='SAPPartnerEdge'>@SAPPartnerEdge</option>";
        html += "<option value='SAPInMemory'>@SAPInMemory</option>";
        html += "<option value='SAPAnalytics'>@SAPAnalytics</option>";
        html += "<option value='SAPCommNet'>@SAPCommNet</option>";
        html += "<option value='sapnews'>@sapnews</option>";
        html += "<option value='SAPTechEd'>@SAPTechEd</option>";
        html += "<option value='SAPMentors'>@SAPMentors</option>";
        html += "<option value='SAPMillMining'>@SAPMillMining</option>";
        html += "<option value='SAP_IoT'>@SAP_IoT</option>";
        html += "<option value='SAPMENA'>@SAPMENA</option>";
        html += "<option value='SAPforBanking'>@SAPforBanking</option>";
        html += "<option value='SAP_Retail'>@SAP_Retail</option>";
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
    var saphybris = "<a class='twitter-timeline' href='https://twitter.com/saphybris'>Tweets by @saphybris</a>";
    var SAPPHIRENOW = "<a class='twitter-timeline' href='https://twitter.com/SAPPHIRENOW'>Tweets by @SAPPHIRENOW</a>";
    var SAPSocial = "<a class='twitter-timeline' href='https://twitter.com/SAPSocial'>Tweets by @SAPSocial</a>";
    var saphcp = "<a class='twitter-timeline' href='https://twitter.com/saphcp'>Tweets by @saphcp</a>";
    var BillRMcDermott = "<a class='twitter-timeline' href='https://twitter.com/BillRMcDermott'>Tweets by @BillRMcDermott</a>";
    var SAP = "<a class='twitter-timeline' href='https://twitter.com/SAP'>Tweets by @SAP</a>";
    var SAPAriba = "<a class='twitter-timeline' href='https://twitter.com/SAPAriba'>Tweets by @SAPAriba</a>";
    var SuccessFactors = "<a class='twitter-timeline' href='https://twitter.com/SuccessFactors'>Tweets by @SuccessFactors</a>";
    var SAPDigitalSvcs = "<a class='twitter-timeline' href='https://twitter.com/SAPDigitalSvcs'>Tweets by @SAPDigitalSvcs</a>";
    var SAPPartnerEdge = "<a class='twitter-timeline' href='https://twitter.com/SAPPartnerEdge'>Tweets by @SAPPartnerEdge</a>";
    var SAPInMemory = "<a class='twitter-timeline' href='https://twitter.com/SAPInMemory'>Tweets by @SAPInMemory</a>";
    var SAPAnalytics = "<a class='twitter-timeline' href='https://twitter.com/SAPAnalytics'>Tweets by @SAPAnalytics</a>";
    var SAPCommNet = "<a class='twitter-timeline' href='https://twitter.com/SAPCommNet'>Tweets by @SAPCommNet</a>";
    var sapnews = "<a class='twitter-timeline' href='https://twitter.com/sapnews'>Tweets by @sapnews</a>";
    var SAPTechEd = "<a class='twitter-timeline' href='https://twitter.com/SAPTechEd'>Tweets by @SAPTechEd</a>";
    var SAPMentors = "<a class='twitter-timeline' href='https://twitter.com/SAPMentors'>Tweets by @SAPMentors</a>";
    var SAPMillMining = "<a class='twitter-timeline' href='https://twitter.com/SAPMillMining'>Tweets by @SAPMillMining</a>";
    var SAP_IoT = "<a class='twitter-timeline' href='https://twitter.com/SAP_IoT'>Tweets by @SAP_IoT</a>";
    var SAPMENA = "<a class='twitter-timeline' href='https://twitter.com/SAPMENA'>Tweets by @SAPMENA</a>";
    var SAPforBanking = "<a class='twitter-timeline' href='https://twitter.com/SAPforBanking'>Tweets by @SAPforBanking</a>";
    var SAP_Retail = "<a class='twitter-timeline' href='https://twitter.com/SAP_Retail'>Tweets by @SAP_Retail</a>";

    var state = wave.getState();
    var timeline = state.get('timeline');

    var html = "";
    var htmlFooter = "";

    if (timeline == "saphybris") {
        html += saphybris;
    } else if (timeline == "SAPPHIRENOW") {
        html += SAPPHIRENOW;
    } else if (timeline == "SAPSocial") {
        html += SAPSocial;
    } else if (timeline == "saphcp") {
        html += saphcp;
    } else if (timeline == "BillRMcDermott") {
        html += BillRMcDermott;
    } else if (timeline == "SAP") {
        html += SAP;
    } else if (timeline == "SAPAriba") {
        html += SAPAriba;
    } else if (timeline == "SuccessFactors") {
        html += SuccessFactors;
    } else if (timeline == "SAPDigitalSvcs") {
        html += SAPDigitalSvcs;
    } else if (timeline == "SAPPartnerEdge") {
        html += SAPPartnerEdge;
    } else if (timeline == "SAPInMemory") {
        html += SAPInMemory;
    } else if (timeline == "SAPAnalytics") {
        html += SAPAnalytics;
    } else if (timeline == "SAPCommNet") {
        html += SAPCommNet;
    } else if (timeline == "sapnews") {
        html += sapnews;
    } else if (timeline == "SAPTechEd") {
        html += SAPTechEd;
    } else if (timeline == "SAPMentors") {
        html += SAPMentors;
    } else if (timeline == "SAPMillMining") {
        html += SAPMillMining;
    } else if (timeline == "SAP_IoT") {
        html += SAP_IoT;
    } else if (timeline == "SAPMENA") {
        html += SAPMENA;
    } else if (timeline == "SAPforBanking") {
        html += SAPforBanking;
    } else if (timeline == "SAP_Retail") {
        html += SAP_Retail;
    }

    if (isOwner) {
        htmlFooter += "<button id='editButton' onclick='renderEditPage()''>Edit</button>";
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

        wave.setParticipantCallback(renderTwitter);
    }
}

gadgets.util.registerOnLoadHandler(init);
