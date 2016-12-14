
/*
Arctoi message-functions
--------------------------
type-strings: success, warning, neutral, alert

*/

var arctoiMessages = [];

function surveyorMessage(sender, type, message) {
    arctoiMessage(sender, type, message);
};

function surveyorHelp(sender, message) {
    arctoiHelp(sender, message);
};

function surveyorLoading(mode) {
    arctoiLoading(mode);
};


function arctoiHelp(sender, message) {
    $('#infoModal').modal('show');
    $('#infoModal-title').html(sender);
    $('#infoModal-body').html(message);
};

function arctoiLoading(mode) {
    $('#loadingModal').modal(mode);
};

function arctoiMessage(sender, type, message) {
    var m = {
        'sender' : sender,
        'type' : type,
        'message' : message,
        'read' : false
    };
    arctoiMessages.push(m);

    var time = new Date().toLocaleString();
    var html = '<span class="arctoi-m-time">'+time+'</span> <span class="arctoi-m-'+type+'">'+sender+': '+message+'</span><br />';
    $("#arctoi-messages").prepend(html);
    console.log(sender+": *"+type+"* "+message);

    setArctoiMessageCounter();
};

function clearArctoiMessage() {
    $( "#arctoi-messages" ).empty();
    arctoiMessages = [];
    setArctoiMessageCounter();
};

function setArctoiMessageCounter() {
    var l = arctoiMessages.length;
    var alert = false;
    var warning = false;

    for (m in arctoiMessages) {
        if (arctoiMessages[m]['read'] === false) {
            if (arctoiMessages[m]['type'] === 'alert') {
                alert = true;
            }
            if (arctoiMessages[m]['type'] === 'warning') {
                warning = true;
            }
        }
    }

    if (alert) {
        $( "#arctoi-m-counter" ).addClass( "arctoi-m-alert" );
    } else {
        if (warning) {
            $( "#arctoi-m-counter" ).addClass( "arctoi-m-warning" );
        } else {
            $( "#arctoi-m-counter" ).removeClass();
        }
    }

    $("#arctoi-m-counter").html(l);
};

function ArctoiMessageModalOpen() {
    //arctoiMessage('message','neutral',"ArctoiMessageModalOpen");

    for (m in arctoiMessages) {
        arctoiMessages[m]['read'] = true;
    }
};

function ArctoiMessageModalClose() {
    //arctoiMessage('message','neutral',"ArctoiMessageModalClose");
    setArctoiMessageCounter();
};
