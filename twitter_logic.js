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
    var widgetId = state.get('widget_id');

    var html = '';
    var msg = '';
    if (timeline_type == 'search') {
        html += "<p class='label'>Enter widget ID:</p>";
        if (widgetId != null && widgetId != '') {
            html += "<input id='widget_id' class='twitter-input' type='text' value='" + widgetId + "'/>";
        } else {
            html += "<input id='widget_id' class='twitter-input' type='text'/>";
        }
        msg = 'Invalid. Only digits are allowed.';
    } else {
        html += "<p class='label'>Enter User Timeline:</p>";
        placeholder = '@timeline'
        if (timeline != null && timeline != '') {
            html += "<input id='timeline' class='twitter-input' type='text' value='"+timeline+"' placeholder='"+placeholder+"'/>";
        } else {
            html += "<input id='timeline' class='twitter-input' type='text' placeholder='"+placeholder+"'/>";
        }
        msg = 'Invalid. Enter timeline with @';
    }
    html += "<span id='error_txt' style='display: none;'>"+msg+"</span>"

    document.getElementById('timeline_input_container').innerHTML = html;
}

function renderEditPage(withError = false) {
    var state = wave.getState();
    var timeline = state.get('timeline');
    var timeline_type = state.get('timeline_type');

    var html = "";
    var htmlHeader = "";
    var htmlFooter = "";

    if (withError) {
        html += "<p style='color: #ff0000;'>Provided input is not valid timeline!</p>"
    }
    html += "<p class='label'>Select timeline type:</p>";
    html += "<select id='timeline_type'>";
    html += "<option value='user_timeline'>User Timeline</option>";
    html += "<option value='search' selected>Widget ID Timeline</option>";
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

    if (timeline_type == null && timeline_type == '') {
        timeline_type = 'user_timeline';
    }

    document.getElementById('timeline_type').value = timeline_type;
    renderTimelineInput(timeline_type);

    document.getElementById('timeline_type').onchange = function(){ renderTimelineInput(this.value); }
}

function validateInput() {
    var el = document.getElementsByClassName('twitter-input');
    if (el == null && el.length < 1) return false;

    var input = el[0];
    var passed = false;
    if (input.id == 'timeline') {
        var r = /^@[a-z,0-9,_]{1,15}$/i;
        passed = r.test(input.value);
    } else if (input.id == 'widget_id') {
        var r = /^\d+$/;
        passed = r.test(input.value);
    }

    if (!passed) {
        input.style.borderStyle='solid';
        input.style.borderColor = 'red';
        document.getElementById('error_txt').style.display = 'block';
    } else {
        input.style.borderStyle='';
        input.style.borderColor = '';
        document.getElementById('error_txt').style.display = 'none';
    }
    return passed;
}

// function handleNoTweets() {
//     var el = document.getElementsByClassName('twitter-timeline-error');
//     if (el != null && el.length > 0) {
//         var a = el[0];
//         var id = a.dataset.widgetId;
//         var url = a.href;
//         if (id != null) {
//             a.text = 'There is no timeline by widget ID "'+id+'". Please check widget settings.';
//         } else if (url != null) {
//             a.removeAttribute('href');
//             var t = url.split('/').pop();
//             a.text = 'There is no timeline "'+t+'". Please check widget settings.';
//         }
//     }
// }

function saveTimeline() {
    if (!validateInput()) return;

    var state = wave.getState();
    var timeline_type = document.getElementById('timeline_type').value;

    if (timeline_type == 'search') {
        var widgetId = document.getElementById('widget_id').value;
        state.submitDelta({'widget_id' : widgetId});
        state.submitDelta({'timeline' : ''});
    } else {
        var timeline = document.getElementById('timeline').value;
        state.submitDelta({'timeline' : timeline});
        state.submitDelta({'widget_id' : ''});
    }

    state.submitDelta({'timeline_type' : timeline_type});
    renderTwitter();
}

function insertTimeline() {
    var state = wave.getState();
    var timeline = state.get('timeline');
    var timelineType = state.get('timeline_type');
    var widgetId = state.get('widget_id');

    // var html = "";
    var htmlFooter = '';

    // if (timelineType == 'search') {
    //     html += "<a class='twitter-timeline' data-widget-id='"+widgetId+"'>Tweets by widgetId "+widgetId+"</a>";
    // } else {
    //     html += "<a class='twitter-timeline' href='https://twitter.com/"+timeline+"'>Tweets by "+timeline+"</a>";
    // }

    if (isOwner) {
        htmlFooter += "<div id='editButtonIcon' onclick='renderEditPage()''></div>";
    }

    var body = document.getElementById('body');
    body.innerHTML = '';
    document.getElementById('footer').innerHTML = htmlFooter;

    var target = {};
    var options = {};
    if (timelineType == 'search') {
        target = {sourceType: 'widget', widgetId: widgetId};
        options = {width: '100%'};
    } else {
        target = {sourceType: 'profile', screenName: timeline.substring(1)};
    }
    var frame = {};
    twttr.widgets.createTimeline(target, body, options).then(function(f) {
        twttr.ready(function (twttr) {
            if (f == null) {
                renderEditPage(true);
            } else {
                if (timelineType == 'search') {
                    adjustSize();
                } else {
                    adjustSize(500);
                }
            }
        });
    });

    // twttr.widgets.load(
    //     document.getElementById('body')
    // );

    // if (linkCheck == null) {
    //     linkCheck = setInterval(function() {
    //         fixTwitterLinks();
    //     }, 2000);
    // }
}

function adjustSize(size) {
    if (size != null) {
        gadgets.window.adjustHeight(size);
    } else {
        gadgets.window.adjustHeight();
    }
}

// function fixTwitterLinks() {
//     var footers = document.getElementsByClassName('timeline-Footer');
//     for (i = 0; i < footers.length; i++) {
//         var links = footers[i].getElementsByTagName('a');
//         for (j = 0; j < links.length; j++) {
//             links[j].target = "_blank";
//         }
//     }
// }

function renderTwitter() {
    if (!wave.getState()) return;

    var state = wave.getState();
    var timeline = state.get('timeline');
    var widgetId = state.get('widget_id');

    checkIfOwner();

    if ((timeline != null && timeline != "") || (widgetId != null && widgetId != "")) {
        insertTimeline();
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

    // var twitterWidgetHeight = 0;
    // var frames = document.getElementsByTagName("iframe");
    // for (var i = frames.length; i;) {
    //     var frame = frames[--i];
    //     if (frame.id.indexOf("twitter-widget") > -1) {
    //         twitterWidgetHeight = frame.offsetHeight + 20;
    //     }
    // }

    // var iframeHeight = 0;
    // if (twitterWidgetHeight == 0) {
    //     iframeHeight = 520;
    // } else {
    //     iframeHeight = twitterWidgetHeight;
    // }

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
