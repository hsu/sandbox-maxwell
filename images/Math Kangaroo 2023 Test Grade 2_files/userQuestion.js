var examTakingRemainingTime;
var countDownTimerInterval;
var examIsTimedOutNotificationIsDisplayed = false;
var originalDocumentTitle = document.title;
function runCountdownTimedExamTimer(startingCutOffRemainingTime,
    divRemainingTimeLabelClientID,
    timerRemainingTimeHiddenFieldClientID,
    examIsTimedOutNotificationWordingClientID,
    submitButtonLocalization,
    processingWordLocalization,
    isExamSectionTimer,
    spareTimeInSecondsBeforeSubmitting) {
    examIsTimedOutNotificationIsDisplayed = false;
    if (startingCutOffRemainingTime !== null) {
        examTakingRemainingTime = startingCutOffRemainingTime;
    }
    // must clear because of ajax. otherwise the interval will doubles every ajax call.
    if (countDownTimerInterval !== null) {
        window.clearInterval(countDownTimerInterval);
    }
    countDownTimerInterval = setInterval(function () {
        CountdownTimedExamTimer(divRemainingTimeLabelClientID,
            timerRemainingTimeHiddenFieldClientID,
            examIsTimedOutNotificationWordingClientID,
            submitButtonLocalization,
            processingWordLocalization,
            isExamSectionTimer,
            spareTimeInSecondsBeforeSubmitting);
    }, 1000);
} // end of runCountdownTimedExamTimer
function CountdownTimedExamTimer(divRemainingTimeLabelClientID,
    timerRemainingTimeHiddenFieldClientID,
    examIsTimedOutNotificationWordingClientID,
    submitButtonLocalization,
    processingWordLocalization,
    isExamSectionTimer,
    spareTimeInSecondsBeforeSubmitting) {
    var $equipmentCheckIsCompletedHiddenField = $('#spanEquipmentCheckIsCompleted input:hidden');
    if ($equipmentCheckIsCompletedHiddenField.length === 0 || $equipmentCheckIsCompletedHiddenField.val() === 'true') {
        var hour = Math.floor(examTakingRemainingTime / 3600);
        var minute = Math.floor(examTakingRemainingTime / 60) - (hour * 60);
        var second = Math.floor(examTakingRemainingTime) - (hour * 60 * 60) - (minute * 60);

        hour = hour < 10 ? "0" + hour : hour;
        minute = minute < 10 ? "0" + minute : minute;
        second = second < 10 ? "0" + second : second;
        var examTakingRemainingTimeLabel = hour + ":" + minute + ":" + second;
        var examTakingRemainingTimeDisplay = "Time Remaining: " + examTakingRemainingTimeLabel;
        if (examTakingRemainingTime > -1) {
            document.title = examTakingRemainingTimeLabel + ' ' + originalDocumentTitle;
        }       
        examTakingRemainingTime = examTakingRemainingTime - 1;
        var $divRemainingTimeLabelClientID = $(divRemainingTimeLabelClientID);
        if ($divRemainingTimeLabelClientID !== null) {
            $divRemainingTimeLabelClientID.html(examTakingRemainingTimeDisplay);
        }
        document.getElementById(timerRemainingTimeHiddenFieldClientID).value = examTakingRemainingTime;
        console.log('remaining time: ' + examTakingRemainingTimeDisplay);

        // when remaining time reaches below ZERO, we need to block user from continuing the job.      
        if (examTakingRemainingTime < 0) {
            $divRemainingTimeLabelClientID.hide();
            if (!examIsTimedOutNotificationIsDisplayed) {
                var $examIsTimedOutNotificationWording = $(examIsTimedOutNotificationWordingClientID);
                var submitWord = 'Submit';
                if (submitButtonLocalization !== undefined && submitButtonLocalization.length > 0) {
                    submitWord = submitButtonLocalization;
                }
                var processingWord = 'processing ...';
                if (processingWordLocalization !== undefined && processingWordLocalization.length > 0) {
                    processingWord = processingWordLocalization;
                }
                if (isExamSectionTimer) {
                    sectionTimeIsUpNotification($examIsTimedOutNotificationWording.val(), submitWord, '', '', processingWord, spareTimeInSecondsBeforeSubmitting);
                } else {
                    timeIsUpNotification($examIsTimedOutNotificationWording.val(), submitWord, '', '', processingWord, spareTimeInSecondsBeforeSubmitting);
                }
                examIsTimedOutNotificationIsDisplayed = true;// prevent the notification to show up multiple times.
            }
            // examTakingTimeIsUp();//display notification first
        }
    }
} // end of CountdownTimedExamTimer()
function timeIsUpNotification(message,
    confirmButtonTitle,
    postbackEventTarget,
    postbackEventArgument,
    loadingTextDuringProcess,
    spareTimeInSecondsBeforeSubmittingExam) {
    // aug 10, 2022. run this to give user xx seconds before we auto-submit
    // this function only exists in __countDownTimer.ascx!
    if (typeof runGenericCountdownTimer === "function") {
        runGenericCountdownTimer(spareTimeInSecondsBeforeSubmittingExam);
    }
    var n = noty({
        text: message,
        layout: 'center',
        theme: 'oasisTheme',
        type: 'warning',
        modal: true,
        timeout: false, // milli-seconds if not false
        template: '<div class="noty_message" ><span class="noty_text" style="font-size:16px;font-weight:400;"></span><div class="noty_close"></div></div>',
        buttons: [
            {
                addClass: 'button', text: confirmButtonTitle, onClick: function ($noty) {
                    $noty.close();
                    if (loadingTextDuringProcess.length > 0 && loadingTextDuringProcess !== '') {
                        displayBlockUI(loadingTextDuringProcess);
                    }
                    confirmUserLeavingThePage = false;// from securedQuestion page.
                    examTakingTimeIsUp();
                } // end of button's onClick
            },
        ],
        animation: {
            open: { height: 'toggle' },
            close: { height: 'toggle' },
            easing: 'swing',
            speed: 100 // opening & closing animation speed
        }
    });
} // end of timeIsUpNotification

function sectionTimeIsUpNotification(message, confirmButtonTitle,
    postbackEventTarget,
    postbackEventArgument,
    loadingTextDuringProcess,
    spareTimeInSecondsBeforeSubmittingSection) {
    // aug 10, 2022. run this to give user xx seconds before we auto-submit
    // this function only exists in __countDownTimer.ascx!
    if (typeof runGenericCountdownTimer === "function") {
        runGenericCountdownTimer(spareTimeInSecondsBeforeSubmittingSection);
    }
    var n = noty({
        text: message,
        layout: 'center',
        theme: 'oasisTheme',
        type: 'warning',
        modal: true,
        timeout: false, // milli-seconds if not false
        template: '<div class="noty_message" ><span class="noty_text" style="font-size:16px;font-weight:400;"></span><div class="noty_close"></div></div>',
        buttons: [
            {
                addClass: 'button', text: confirmButtonTitle, onClick: function ($noty) {
                    $noty.close();
                    if (loadingTextDuringProcess.length > 0 && loadingTextDuringProcess !== '') {
                        displayBlockUI(loadingTextDuringProcess);
                    }
                    confirmUserLeavingThePage = false;// from securedQuestion page.
                    examSectionTakingTimeIsUp();
                } // end of button's onClick
            },
        ],
        animation: {
            open: { height: 'toggle' },
            close: { height: 'toggle' },
            easing: 'swing',
            speed: 100 // opening & closing animation speed
        }
    });
} // end of sectionTimeIsUpNotification
function examTakingTimeIsUp() {
    updateCurrentUserQuestionElapsedTime('examTakingTimeIsUp'); // we may record more than the timer duration if user just waits there without clicking anything.
    __doPostBack('__page', 'JavascriptExamTakingTimeIsUp');//we do this so that we can record the last user answer that user hasn't submitted yet.
}// end of examTakingTimeIsUp
function examSectionTakingTimeIsUp() {
    updateCurrentUserQuestionElapsedTime('examSectionTakingTimeIsUp'); // we may record more than the timer duration if user just waits there without clicking anything.
    __doPostBack('__page', 'JavascriptExamSectionTakingTimeIsUp');//we do this so that we can record the last user answer that user hasn't submitted yet.
}// end of examSectionTakingTimeIsUp
function updateAndCloseStrikeThroughOptionWindow() {
    $.fancybox.close();
    setTimeout("UpdateOptionsFromStrikeThrough();", 300);
}
function UpdateOptionsFromStrikeThrough_Execute(SpecificPanelClientIDToReload) {
    if (SpecificPanelClientIDToReload !== undefined && SpecificPanelClientIDToReload.length > 0) {
        __doPostBack(SpecificPanelClientIDToReload, 'JavascriptUpdateOptionsFromStrikeThrough');
    } else {
        __doPostBack('__page', 'JavascriptUpdateOptionsFromStrikeThrough');
    }
}
function leavingTheExamNotification(
    message,
    confirmButtonTitle,
    cancelButtonTitle,
    destinationUrl,
    loadingTextDuringProcess) {
    var n = noty({
        text: message,
        layout: 'center',
        theme: 'oasisTheme',
        type: 'warning',
        modal: true,
        timeout: false, // milli-seconds if not false
        template: '<div class="noty_message" ><span class="noty_text" style="font-size:16px;font-weight:400;"></span><div class="noty_close"></div></div>',
        buttons: [
            {
                addClass: 'button cancel', text: cancelButtonTitle, onClick: function ($noty) {
                    $noty.close();
                } // end of button's onClick
            },
            {
                addClass: 'button', text: confirmButtonTitle, onClick: function ($noty) {
                    $noty.close();
                    if (loadingTextDuringProcess.length > 0 && loadingTextDuringProcess !== '') {
                        displayBlockUI(loadingTextDuringProcess);
                    }
                    confirmUserLeavingThePage = false;// from securedQuestion page to prevent browser-alert kicks in during unload.
                    updateCurrentUserQuestionElapsedTime('leavingTheExamNotification');
                    window.location.href = destinationUrl;
                } // end of button's onClick
            }
        ],
        animation: {
            open: { height: 'toggle' },
            close: { height: 'toggle' },
            easing: 'swing',
            speed: 100 // opening & closing animation speed
        }
    });
} // end of leavingTheExamNotification
function updateCurrentUserQuestionElapsedTime(triggeringSource) {
    var currentElapsedTime = $('#timerElapsed').val();
    var currentTotalElapsedTime = $('#totalSecondsSpentTimerElapsed').val();
    var currentUserQuestionID = $('#spanCurrentUserQuestionIDSpan input:hidden').val();
    var postData = new Object();
    postData.TargetUserQuestionID = currentUserQuestionID;
    postData.UpdatedElapsedTime = currentElapsedTime;
    postData.UpdatedTotalElapsedTime = currentTotalElapsedTime;
    postData.TriggeringSource = triggeringSource;
    if (typeof navigator.sendBeacon === 'function') {
        //Support beacon api, use it (note we cannot use application/json with beacon api for chrome, so we will send it as text/plain and have server parse it)
        console.log('Supports beacon api. Calls UpdateCurrentUserQuestionElapsedTime and Will send data as blob.');
        var _blobData = new Blob([JSON.stringify(postData)], { type: 'text/plain;charset=UTF-8' });
        navigator.sendBeacon('/Webservices/QuestionServices.asmx/UpdateCurrentUserQuestionElapsedTime', _blobData);
    } else {
        //Did not support beacon api, use synchronous ajax
        console.log('Does not support beacon api. Calls UpdateCurrentUserQuestionElapsedTime and Will send data using regular ajax.');
        $.ajax({
            type: 'POST',
            url: '/Webservices/QuestionServices.asmx/UpdateCurrentUserQuestionElapsedTime',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: false,
            data: JSON.stringify(postData),
            success: function (data) {
                var rtnMessage = data.d;
                if (rtnMessage.IsSuccessful) {
                    console.log('Updated current user question elapsed time');
                }
                else {
                    displayErrorNotyNotification(rtnMessage.SystemMessage, 2500);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                displayErrorNotyNotification('Unable to reach server, please reload this page to see saved data', 2500);
            }
        });
    } // end of beacon check
}// end of updateCurrentUserQuestionElapsedTime
function toggleHasOptedToDisplayAnswerKey() {
    var currentUserExamMapID = $('#spanCurrentUserExamMapIDSpan input:hidden').val();
    var postData = new Object();
    postData.EncryptedUserExamMapID = currentUserExamMapID;
    $.ajax({
        type: 'POST',
        url: '/Webservices/QuestionServices.asmx/ToggleHasOptedToDisplayAnswerKey',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: false,
        data: JSON.stringify(postData),
        success: function (data) {
            var rtnMessage = data.d;
            if (rtnMessage.IsSuccessful) {
                console.log('Toggled HasOptedToDisplayAnswerKey');
                var $correctAnswerNotChosenPanels = $('.correctAnswerNotChosen');
                if ($correctAnswerNotChosenPanels.hasClass('hideCorrectAnswerNotChosen')) {
                    $correctAnswerNotChosenPanels.removeClass('hideCorrectAnswerNotChosen');
                } else {
                    $correctAnswerNotChosenPanels.addClass('hideCorrectAnswerNotChosen');
                }
                var $wrongAnswerPanels = $('.wrongAnswer');
                if ($wrongAnswerPanels.hasClass('hideWrongAnswer')) {
                    $wrongAnswerPanels.removeClass('hideWrongAnswer');
                } else {
                    $wrongAnswerPanels.addClass('hideWrongAnswer');
                }
                var $correctAnswerPanels = $('.correctAnswer');
                if ($correctAnswerPanels.hasClass('hideCorrectAnswer')) {
                    $correctAnswerPanels.removeClass('hideCorrectAnswer');
                } else {
                    $correctAnswerPanels.addClass('hideCorrectAnswer');
                }
                // Normative stat graph: the bar and the percentage text.
                var $normativeDataAnwerOptionWrappers = $('.normativeDataAnwerOptionWrapper');
                if ($normativeDataAnwerOptionWrappers.hasClass('hideNormativeDataAnswerOption')) {
                    $normativeDataAnwerOptionWrappers.removeClass('hideNormativeDataAnswerOption');
                } else {
                    $normativeDataAnwerOptionWrappers.addClass('hideNormativeDataAnswerOption');
                }
                var $tdNormativeDataAnswerOptionPercentageClass = $('.tdNormativeDataAnswerOptionPercentageClass');
                if ($tdNormativeDataAnswerOptionPercentageClass.hasClass('hideNormativeDataAnswerOption')) {
                    $tdNormativeDataAnswerOptionPercentageClass.removeClass('hideNormativeDataAnswerOption');
                } else {
                    $tdNormativeDataAnswerOptionPercentageClass.addClass('hideNormativeDataAnswerOption');
                }
            }
            else {
                displayErrorNotyNotification(rtnMessage.SystemMessage, 2500);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            displayErrorNotyNotification('Unable to reach server, please reload this page to see saved data', 2500);
        }
    });
}

// for highlighter
function toggleQuestionHighlighterBackground(toggleControlClientId,
    primaryStyleClassName,
    alternativeStyleClassName) {
    var $clientControl = $("#" + toggleControlClientId);
    if ($clientControl.hasClass(primaryStyleClassName)) {
        $clientControl.removeClass(primaryStyleClassName);
        $clientControl.addClass(alternativeStyleClassName);
    } else {
        $clientControl.removeClass(alternativeStyleClassName);
        $clientControl.addClass(primaryStyleClassName);
    }
}
function initializeAnnotation(textAreaClientId,
    userQuestionId,
    existingAnnotationStorageClientId) {
    // make the text container hover a different pointer/cursor
    $('#' + textAreaClientId).addClass('factor360HighlightCursor');
    var existingAnnotations = '';
    if (existingAnnotationStorageClientId.length > 0) {
        var $hfAnnotationStorage = $('#' + existingAnnotationStorageClientId);
        if ($hfAnnotationStorage.val() !== undefined) {
            existingAnnotations = $hfAnnotationStorage.val();
        }
    }
    (function () {
        var recogitoAnnotationForQuestion = Recogito.init({
            allowEmpty: true,
            content: document.getElementById(textAreaClientId),
            widgets: [],
            disableEditor: true, // headless mode (no pop up)//https://recogito.github.io/guides/headless-mode/
            formatter: function (annotator) {

            }
        });

        // load existing annotations
        if (existingAnnotations.length > 0) {
            recogitoAnnotationForQuestion.setAnnotations(JSON.parse(existingAnnotations));
        }
        // Add an event handler  
        recogitoAnnotationForQuestion.on('createAnnotation', function (annotation) {
            // Delete all annotations that stands between this new annotation.
            var existingAnnotations = recogitoAnnotationForQuestion.getAnnotations();
            if (existingAnnotations !== null && existingAnnotations.length > 0) {
                var newAnnotationStart = annotation.target.selector[1].start;
                var newAnnotationEnd = annotation.target.selector[1].end;
                existingAnnotations.forEach(function (currentValue, index, arr) {
                    if (currentValue.id === annotation.id) {
                        return;
                    }
                    var currentAnnotationStart = currentValue.target.selector[1].start;
                    var currentAnnotationEnd = currentValue.target.selector[1].end;
                    var deleteCurrentAnnotation = false;
                    if (newAnnotationStart <= currentAnnotationStart && currentAnnotationEnd <= newAnnotationEnd) {
                        // the new one wraps the old
                        deleteCurrentAnnotation = true;
                    } else if (currentAnnotationStart <= newAnnotationStart && newAnnotationEnd <= currentAnnotationEnd) {
                        // the new one is inside the old
                        deleteCurrentAnnotation = true
                    } else {
                    }
                    if (deleteCurrentAnnotation) {
                        recogitoAnnotationForQuestion.removeAnnotation(currentValue);
                        removeAnnotationCallBack(currentValue, userQuestionId);
                    }
                    console.log(currentValue, index, arr);
                });
            }
            var postData = new Object();
            postData.UserQuestionID = userQuestionId;
            postData.AnnotationID = annotation.id;
            postData.TextQuote = annotation.target.selector[0].exact;
            postData.TextPosition_Start = annotation.target.selector[1].start;
            postData.TextPosition_End = annotation.target.selector[1].end;
            $.ajax({
                type: "POST",
                url: '/Webservices/ExamServices.asmx/SaveAnnotation',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(postData),
                success: function (response) {
                    var responseObject = response.d;
                    if (responseObject.IsSuccessful) {
                        //  displaySuccessNotyNotification('highlighted', 1500);
                        if (responseObject.ReturnValue !== null && responseObject.ReturnValue.length > 0) {
                            // this is pop up url to add UserLibrary.
                            openNoScrollModalPopUp(responseObject.ReturnValue, '', 400);
                        }
                    } else {
                        displayErrorNotyNotification(responseObject.SystemMessage, 3500);
                    }
                },
                failure: function (response) {
                    var responseObject = response.d;
                    displayErrorNotyNotification(responseObject.SystemMessage, 5000);
                }
            }); // end of ajax
            //alert('createAnnotation called.')
        });
        recogitoAnnotationForQuestion.on('selectAnnotation', function (annotation, element) {
            // when you click on highlighted texts
            console.log('selectAnnotation called');
            recogitoAnnotationForQuestion.removeAnnotation(annotation); // client-side
            removeAnnotationCallBack(annotation, userQuestionId); // server-side
        });
        recogitoAnnotationForQuestion.on('deleteAnnotation', function (annotation) {
            console.log('deleteAnnotation called');
            removeAnnotationCallBack(annotation, userQuestionId);
        });
    })();
} // end of initializeAnnotation
function removeAnnotationCallBack(annotationObject, userQuestionId) {
    console.log('removeAnnotationCallBack called');
    var postData = new Object();
    postData.UserQuestionID = userQuestionId;
    postData.AnnotationID = annotationObject.id;
    $.ajax({
        type: "POST",
        url: '/Webservices/ExamServices.asmx/DeleteAnnotation',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        success: function (response) {
            var responseObject = response.d;
            if (responseObject.IsSuccessful) {
                // displaySuccessNotyNotification('deleted', 1500);
            } else {
                displayErrorNotyNotification(responseObject.SystemMessage, 3500);
            }
        },
        failure: function (response) {
            var responseObject = response.d;
            displayErrorNotyNotification(responseObject.SystemMessage, 5000);
        }
    }); // end of ajax
}
// end of highlighter
var elapsed = 0;
var elapsedTotalSecondsSpent = 0;
function CounterTimer() {
    // if this equipment check is done (for secured question), then we can start clocking
    var $equipmentCheckIsCompletedHiddenField = $('#spanEquipmentCheckIsCompleted input:hidden');
    if ($equipmentCheckIsCompletedHiddenField.length == 0 || $equipmentCheckIsCompletedHiddenField.val() === 'true') {
        var elapsed_hour = Math.floor(elapsed / 3600);
        var elapsed_minute = Math.floor(elapsed / 60) - (elapsed_hour * 60);
        var elapsed_second = Math.floor(elapsed) - (elapsed_hour * 60 * 60) - (elapsed_minute * 60);

        elapsed_hour = elapsed_hour < 10 ? "0" + elapsed_hour : elapsed_hour;
        elapsed_minute = elapsed_minute < 10 ? "0" + elapsed_minute : elapsed_minute;
        elapsed_second = elapsed_second < 10 ? "0" + elapsed_second : elapsed_second;

        var elapsedDisplay = "Time Spent: " +  elapsed_hour + ":" + elapsed_minute + ":" + elapsed_second;
        console.log(elapsedDisplay);
        var $timerLabel = $('#timerlabel'); // this is label 
        if ($timerLabel !== null) {
            $timerLabel.html(elapsedDisplay);
        }
        elapsed += 1;
        document.getElementById("timerElapsed").value = elapsed;// timerElapsed is hidden field.

        var hour = Math.floor(elapsedTotalSecondsSpent / 3600);
        var minute = Math.floor(elapsedTotalSecondsSpent / 60) - (hour * 60);
        var second = Math.floor(elapsedTotalSecondsSpent) - (hour * 60 * 60) - (minute * 60);

        hour = hour < 10 ? "0" + hour : hour;
        minute = minute < 10 ? "0" + minute : minute;
        second = second < 10 ? "0" + second : second;

        var elapsedTotalSecondsSpentDisplayForLog = "TotalSecondsSpent:" + hour + ":" + minute + ":" + second;
        console.log(elapsedTotalSecondsSpentDisplayForLog);
        elapsedTotalSecondsSpent += 1;
        document.getElementById("totalSecondsSpentTimerElapsed").value = elapsedTotalSecondsSpent;// is hidden field. This is with TotalSecondsSpent offset.
    }

} // end of CounterTimer()      
var counterTimerInterval;
function RunCounterTimer(StartingElapseValue, startingTotalSecondsSpentValue) {
    if (StartingElapseValue != null) {
        elapsed = StartingElapseValue;
    }
    if (startingTotalSecondsSpentValue != null) {
        elapsedTotalSecondsSpent = startingTotalSecondsSpentValue;
    }
    // must clear because of ajax. otherwise the interval will doubles every ajax call.
    if (counterTimerInterval !== null) {
        window.clearInterval(counterTimerInterval);
    }
    counterTimerInterval = setInterval(CounterTimer, 1000);
} // end of RunCounterTimer