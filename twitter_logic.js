var isOwner = null;
var linkCheck = null;
var isOnSave = false;

function toJSON(obj) {
	return gadgets.json.stringify(obj);
}

function toObject(str) {
    return gadgets.json.parse(str);
}

function checkIfOwner() {
    if (isOwner != null) return;

    var userId = null;
    var ownerId = null;
    osapi.people.getOwner().execute(function(data) {
        ownerId = data.id;
        osapi.people.getViewer().execute(function(data) {
            userId = data.id;
            if (ownerId != null && userId != null) {
                isOwner = (ownerId == userId);
            }
        });
    });
}

var timeline_types = {
    user:   'user_timeline',
    widget: 'widget_timeline'
}

var error_types = {
    input:   'timeline',
    general: 'general'
}

var error_messages = {
    empty_user:     'Please provide User Timeline.',
    empty_widget:   'Please provide Widget ID.',
    invalid_user:   'Timeline should start with @ and contain only digits, letters, underscores.',
    invalid_widget: 'Only digits are allowed.',
    not_exist:      'The input is not existing timeline.',
    inaccessible:   'The input is not existing timeline or the author has protected their tweets.',
    general:        'Changes cannot be saved.\nPlease reload the page and try again.'
}

function getState() {
    var state = wave.getState();
    var timelineType = state.get('timeline_type');

    if (timelineType == null || timelineType == '') {
        timelineType = timeline_types.user;
    }

    return {
        timeline: state.get('timeline'),
        timelineType: timelineType
    };
}

function adjustSize(size) {
    if (size != null) {
        gadgets.window.adjustHeight(size);
    } else {
        gadgets.window.adjustHeight();
    }
}

function getTimelineName(timeline) {
    if (timeline.substring(0,1) == '@') {
        return timeline.substring(1);
    } else return timeline;
}

function validateInput() {
    var timelineType = document.getElementById('timeline_type').value;
    var el = document.getElementsByClassName('twitter-input');
    if (el == null && el.length < 1) return false;

    var input = el[0];
    var passed = false;
    var msg = '';
    if (input.value == '' || input.value == null) {
        msg = error_messages.empty_user;
        if (timelineType == timeline_types.widget) msg = error_messages.empty_widget;
    } else if (input.value == '@') {
        msg = error_messages.not_exist;
    } else if (input.id == 'timeline') {
        var r = /^@[a-z0-9_]+$/i;
        passed = r.test(input.value);
        msg = error_messages.invalid_user;
    } else if (input.id == 'widget_id') {
        var r = /^\d+$/;
        passed = r.test(input.value);
        msg = error_messages.invalid_widget;
    }

    handleUiErrors(error_types.input, msg, passed);
    return passed;
}

function handleUiErrors(type, message, clean) {
    if (type == null) type = error_types.general;
    if (clean == null) clean = true;

    var input = document.getElementsByClassName('twitter-input')[0];
    var timelineSpan = document.getElementById('timeline_error');
    var generalSpan = document.getElementById('general_error');

    if (clean) {
        input.style.borderStyle='';
        input.style.borderColor = '';
        timelineSpan.innerText = '';
        generalSpan.innerText = '';
    } else if (type == error_types.general) {
        generalSpan.innerText = message;
    } else {
        input.style.borderStyle='solid';
        input.style.borderColor = 'red';
        timelineSpan.innerText = message;
    }
}

function receiveTimeline(timelineType, timeline) {
    var target = {};
    if (timelineType == timeline_types.widget) {
        target = {sourceType: 'widget', widgetId: timeline};
    } else {
        target = {sourceType: 'profile', screenName: getTimelineName(timeline)};
    }
    hidden_el = document.getElementById('hidden_div');
    return twttr.widgets.createTimeline(target, hidden_el);
}

function renderEditButton() {
    if (!isOwner || document.getElementById('editButtonIcon') != null) return;

    var footer = document.getElementById('footer');
    var button = document.createElement('div');
    button.setAttribute('id', 'editButtonIcon');
    button.setAttribute('onclick', 'renderEditPage()');
    footer.appendChild(button);
}

function handleSaveButton(saving) {
    if (saving == null) saving = true;

    var btn = document.getElementById('saveButton');
    if (btn == null) return;

    if (saving) {
        btn.textContent = 'Saving...'
        btn.disabled = true;
    } else {
        btn.textContent = 'Save'
        btn.disabled = false;
    }
}

function cancelEdit() {
    var state = getState();
    if (state.timeline != null && state.timeline != "") insertTimeline();
}

function saveTimeline() {
    if (!validateInput()) return;

    handleSaveButton();

    var timeline = '';
    var timelineType = document.getElementById('timeline_type').value;
    if (timelineType == timeline_types.widget) {
        timeline = document.getElementById('widget_id').value;
    } else {
        timeline = document.getElementById('timeline').value;
    }

    osapi.people.getOwner().execute(function(data) {
        if (data.id == null) {
            handleSaveButton(false);
            handleUiErrors(error_types.general, error_messages.general, false);
        } else {
            receiveTimeline(timelineType, timeline).then(function(f) {
                document.getElementById('hidden_div').innerHTML = '';

                var message = error_messages.not_exist;
                if (timelineType == timeline_types.user) message = error_messages.inaccessible;
                handleUiErrors(error_types.input, message, f != null);

                if (f == null) {
                    handleSaveButton(false);
                    return;
                }

                isOnSave = true;

                var state = wave.getState();
                state.submitDelta({
                    'timeline': timeline,
                    'timeline_type': timelineType
                });
            });
        }
    });
}

function renderTimelineInput(timelineType, timeline) {
    var html = '';
    var value = '';
    if (timeline != null && timeline != '') value = "value='"+timeline+"'";

    if (timelineType == timeline_types.widget) {
        html += "<p class='label'>Enter widget ID:</p>";
        html += "<input id='widget_id' class='twitter-input' type='text' "+value+" />";
    } else {
        html += "<p class='label'>Enter User Timeline:</p>";
        html += "<input id='timeline' class='twitter-input' type='text' placeholder='e.g. @twitter' "+value+" />";
    }
    html += "<span id='timeline_error' class='error-txt'></span>"

    document.getElementById('timeline_input_container').innerHTML = html;
}

function isEditPageShown() {
    return (document.getElementById('saveButton') != null);
}

function renderEditPage() {
    if (isEditPageShown()) return;

    var state = getState();

    var html = "";
    var htmlHeader = "";
    var htmlFooter = "";

    html += "<p class='label'>Select timeline type:</p>";
    html += "<select id='timeline_type'>";
    html += "<option value='user_timeline'>User Timeline</option>";
    html += "<option value='widget_timeline' selected>Widget Timeline</option>";
    html += "</select>"

    html += "<div id='timeline_input_container'></div>"

    html += "<span id='general_error' class='error-txt' style='margin-top: 10px;'></span>"

    html += "<button id='saveButton' onclick='saveTimeline()'>Save</button>";
    html += "<button id='cancelButton' onclick='cancelEdit()'>Cancel</button>";

    html += "<p>";
    html += "Please report issues to IT direct component ";
    html += "<a target='_blank' href='https://itdirect.wdf.sap.corp/sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?saprole=ZITSERVREQU&crm-object-type=AIC_OB_INCIDENT&crm-object-action=D&PROCESS_TYPE=ZINE&CAT_ID=IMAS_JAM'>'IMAS_Jam'</a>";
    html += ", provide your feedback on ";
    html += "<a target='_blank' href='https://jam4.sapjam.com/groups/about_page/3B960zLBubCXJjPjDT59T5'>SAP Jam Support Center</a>";
    html += ".";
    html += "</p>";
    html += "<div id='hidden_div' style='display: none;'></div>"

    htmlHeader += "<h3>Settings:</h3>";
    htmlHeader += "<div class='help'><a href='https://jam4.sapjam.com/wiki/show/qojyAjMfMCnCplFPeS2KUM' target='_blank' title='Help'><div id='help_icon'></div></a></div>";


    document.getElementById('body').innerHTML = html;
    document.getElementById('footer').innerHTML = htmlFooter;
    document.getElementById('header').innerHTML = htmlHeader;

    document.getElementById('timeline_type').value = state.timelineType;
    renderTimelineInput(state.timelineType, state.timeline);

    document.getElementById('timeline_type').onchange = function() {
        if (this.value == state.timelineType) {
            renderTimelineInput(this.value, state.timeline);
        } else {
            renderTimelineInput(this.value);
        }
    }
}

function isTimelineShown() {
    var frames = document.getElementsByTagName('iframe');
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].id != null && frames[i].id.indexOf('twitter-widget') > -1) return true;
    }
    return false;
}

function insertTimeline() {
    if (isTimelineShown()) {
        renderEditButton();
        return;
    }

    var body = document.getElementById('body');
    var footer = document.getElementById('footer');
    var header = document.getElementById('header');

    body.innerHTML = '';
    footer.innerHTML = '';
    header.innerHTML = '';

    var target = {};
    var options = {};
    var state = getState();
    var is_widget_timeline = (state.timelineType == timeline_types.widget);
    if (is_widget_timeline) {
        target = {sourceType: 'widget', widgetId: state.timeline};
        options = {width: '100%'};
    } else {
        target = {sourceType: 'profile', screenName: getTimelineName(state.timeline)};
    }

    twttr.widgets.createTimeline(target, body, options).then(function(f) {
        twttr.ready(function (twttr) {
            if (is_widget_timeline) {
                adjustSize();
            } else {
                adjustSize(500);
            }
            renderEditButton();
        });
    });
}

function renderTwitter() {
    if (!wave.getState()) return;
    checkIfOwner();
    if (!isOnSave && isEditPageShown()) return;

    isOnSave = false;

    var state = getState();
    if (state.timeline != null && state.timeline != "") {
        insertTimeline();
    } else {
        if (isOwner) renderEditPage();
    }
}

function init() {
    if (wave && wave.isInWaveContainer()) {
        wave.setStateCallback(renderTwitter);
    }
}

gadgets.util.registerOnLoadHandler(init);
