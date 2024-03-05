function hideVideoChapterPanel(sender) {
    $(sender).hide();
    var $videoChapterPanel = $(sender).closest('.videoChapterPanel');
    $videoChapterPanel.addClass('videoChapterMinimized');
    var $videoChapterHeader_collapsed = $videoChapterPanel.find('.videoChapterHeader_collapsed');
    var $videoChapterList = $videoChapterPanel.find('.videoChapterList');
    $videoChapterList.css('display', 'none');
    $videoChapterHeader_collapsed.show();
}// end of hideVideoChapterPanel
function showVideoChapterPanel(sender) {
    $(sender).hide();
    var $videoChapterPanel = $(sender).closest('.videoChapterPanel');
    $videoChapterPanel.removeClass('videoChapterMinimized');
    var $videoChapterHeader_expanded = $videoChapterPanel.find('.videoChapterHeader_expanded');
    var $videoChapterList = $videoChapterPanel.find('.videoChapterList');
    $videoChapterList.show();
    $videoChapterHeader_expanded.show();
}// end of hideVideoChapterPanel
function closeOverlayAndPlayAsset(overlayClientId, avContainerId) {
    $('#' + overlayClientId).hide();
    jwplayer(avContainerId).play(true);
}
var startFromSpecificTimeHasBeenTriggered = false;
var startFromSpecificTimeUsedUp = false;
var oasisAvPlayerUtil = new function () {
    var lockFastForwardInstantiatedIdArr = [];
    var lockBackwardInstantiatedIdArr = [];
    var doLockFastForward = false;
    var doLockBackward = false;
    var isFirstTimeComplete = true;
    var previousSessionEngagementTime = 0;
    var engagementTimeTrackingStartTimestamp = null;
    var trackedEncryptedUserLearningActivityID = null;
    var trackedEncryptedAssetID = null;
    var trackedPlayerObj = null;
    var lastReportedEngagementTime = 0;
    var reportingTimer = null;

    this.initEngagementTimeTracking = function (encryptedUserLearningActivityID, encryptedAssetID, jwPlayerObj) {
        trackedEncryptedUserLearningActivityID = encryptedUserLearningActivityID;
        trackedEncryptedAssetID = encryptedAssetID;
        trackedPlayerObj = jwPlayerObj;
        // hidden field - engagement time
        var engagementTimeFieldVal;
        var $engagementTimeHiddenField = $('.spanHiddenField_LearningActivityAssetViewHistoryEngagementTime input:hidden');
        if ($engagementTimeHiddenField !== undefined) {
            engagementTimeFieldVal = $engagementTimeHiddenField.val();
        }
        var engagementTime = 0;
        if (engagementTimeFieldVal != null && engagementTimeFieldVal != '' && engagementTimeFieldVal > 0) {
            engagementTime = parseFloat(engagementTimeFieldVal);
        }
        previousSessionEngagementTime = engagementTime;
        lastReportedEngagementTime = engagementTime; //Make it the same so we dont report the engagement time on initializing
    }
    this.beginTrackEngagementTime = function () {
        if (engagementTimeTrackingStartTimestamp == null) {
            engagementTimeTrackingStartTimestamp = Date.now();
        }
    }
       this.endTrackEngagementTime = function () {
        if (engagementTimeTrackingStartTimestamp != null) {
            var _timeElapsedSincePlayInMs = Date.now() - engagementTimeTrackingStartTimestamp;
            previousSessionEngagementTime += _timeElapsedSincePlayInMs / 1000;
            engagementTimeTrackingStartTimestamp = null;
            // hidden field - engagement time
            var $engagementTimeHiddenField = $('.spanHiddenField_LearningActivityAssetViewHistoryEngagementTime input:hidden');
            if ($engagementTimeHiddenField !== undefined) {
                $engagementTimeHiddenField.val(previousSessionEngagementTime);
            }
        }
    }
    this.getCurrentEngagementTime = function () {
        var rtnValue = previousSessionEngagementTime;
        if (engagementTimeTrackingStartTimestamp != null) {
            var _timeElapsedSincePlayInMs = Date.now() - engagementTimeTrackingStartTimestamp;
            rtnValue += _timeElapsedSincePlayInMs / 1000;
        }
        rtnValue = Math.ceil(rtnValue);
        return rtnValue;
    }

    this.beginProgressAutoReporting = function (frequencyInSeconds) {
        console.log('beginProgressAutoReporting called with frequency ' + frequencyInSeconds + ' s');
        if (reportingTimer == null) {
            reportingTimer = setInterval(oasisAvPlayerUtil.reportProgress, frequencyInSeconds * 1000);
        }
    }

    this.endProgressAutoReporting = function () {
        console.log('endProgressAutoReporting called');
        if (reportingTimer != null) {
            clearTimeout(reportingTimer);
            reportingTimer = null;
        }
    }

    this.reportProgress = function (unlockFastForward) {
        console.log('reportProgress called.');
        if (trackedEncryptedUserLearningActivityID != null && trackedEncryptedAssetID != null && trackedPlayerObj != null) {
            var currentEngagementTime = oasisAvPlayerUtil.getCurrentEngagementTime();
            var currentVideoPositionInSeconds = trackedPlayerObj.getPosition();
            var currentVideoDurationInSeconds = trackedPlayerObj.getDuration();
            var currentVideoRemainingInSeconds = currentVideoDurationInSeconds - currentVideoPositionInSeconds;
            console.log('Player position: ' + currentVideoPositionInSeconds + ' s.' + ' Remaining: ' + currentVideoRemainingInSeconds + ' s.');
            console.log('Last reported engagement time: ' + lastReportedEngagementTime + ' s, current engagement time: ' + currentEngagementTime + ' s');
            if (currentEngagementTime <= lastReportedEngagementTime) {//We only need to check engagement time (instead of elapsed time here as engagement time always increments)
                return; //If the new engagement time is not larger than the previous engagement time, no need to report
            }
            lastReportedEngagementTime = currentEngagementTime;
            var newElapsedTimeInSeconds = Math.ceil(trackedPlayerObj.getPosition());
            var postData = new Object();
            postData.EncryptedUserLearningActivityID = trackedEncryptedUserLearningActivityID;
            postData.EncryptedLearningActivityAssetID = trackedEncryptedAssetID;
            postData.TimeElapsedInSeconds = newElapsedTimeInSeconds;
            postData.EngagementTimeInSeconds = currentEngagementTime;
            //update hidden field - engagement time
            var $engagementTimeHiddenField = $('.spanHiddenField_LearningActivityAssetViewHistoryEngagementTime input:hidden');
            if ($engagementTimeHiddenField === undefined) {
                return;
            }
            $engagementTimeHiddenField.val(postData.EngagementTimeInSeconds);
            //update hidden field - elapsed time
            var $elapsedTimeHiddenField = $('.spanHiddenField_LearningActivityAssetViewHistoryElapsedTime input:hidden');
            if ($elapsedTimeHiddenField === undefined) {
                return;
            }
            $elapsedTimeHiddenField.val(postData.TimeElapsedInSeconds);
            $.ajax({
                type: 'POST',
                url: '/Webservices/ActivityService.asmx/UpdateAssetHistoryProgress',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify(postData),
                success: function (data) {
                    var response = data.d;
                    if (response.IsSuccessful) {
                        console.log('New elapsed time recorded: ' + newElapsedTimeInSeconds + ' s');
                        if (isFirstTimeComplete && typeof oasisAvPlayerUtil.onFirstTimeComplete === "function") {
                            oasisAvPlayerUtil.onFirstTimeComplete();
                        }
                        if (unlockFastForward) {
                            oasisAvPlayerUtil.unlockFastForward();
                        }

                    } else {
                        console.log('New elapsed time NOT recorded: ' + newElapsedTimeInSeconds + ' s');
                        return false;
                    }

                    isFirstTimeComplete = false;
                }
            });
        }
    }

    this.lockSeeking = function (playerContainerID,
        lockForwardMessage,
        lockBackwardMessage,
        disableSeekForward,
        disableSeekBackward,
        disableLockMessage,
        initialMaxPlayPosition) {
        if (disableSeekForward) {
            doLockFastForward = true;
            if (lockFastForwardInstantiatedIdArr.indexOf(playerContainerID) == -1) {
                //This method has never been triggered for the player container, trigger them and add to list
                lockFastForwardInstantiatedIdArr.push(playerContainerID);
            } else {
                //We found the container id means this method has been triggered on fast forward, so we return to stop the rest of method from executing
                return;
            }
        }
        if (disableSeekBackward) {
            doLockBackward = true;
            if (lockBackwardInstantiatedIdArr.indexOf(playerContainerID) == -1) {
                //This method has never been triggered for the player container, trigger them and add to list
                lockBackwardInstantiatedIdArr.push(playerContainerID);
            } else {
                //We found the container id means this method has been triggered on back forward, so we return to stop the rest of method from executing
                return;
            }
        }
        //Add the handler to lock the fast/back forward
        if (isNaN(initialMaxPlayPosition)) {
            initialMaxPlayPosition = 0;
        }
        var maxPlayPosition = initialMaxPlayPosition;
        var minPlayPosition = 0.0;
        var seeking = false;
        jwplayer(playerContainerID).on('time', function (event) {
            if (!seeking) {
                maxPlayPosition = Math.max(event.position, maxPlayPosition);
                minPlayPosition = Math.max(event.position, minPlayPosition);
            }
        }); // end of on 'time'
        jwplayer(playerContainerID).on('seek', function (event) {
            console.log('user seeks the player: Offset (in second) ' + event.offset);
            console.log('doLockFastForward: ' + doLockFastForward);
            console.log('doLockBackward: ' + doLockBackward);
            if (event.offset > maxPlayPosition) {
                // fast forward
                if (!seeking && doLockFastForward && !startFromSpecificTimeHasBeenTriggered) {
                    seeking = true;
                    if (lockForwardMessage == '') {
                        lockForwardMessage = 'Fast-forwarding is disabled';
                    }
                    if (disableLockMessage !== undefined && !disableLockMessage) {
                        displayErrorNotyNotification(lockForwardMessage, 1000);
                    }
                    setTimeout(function () {
                        jwplayer().seek(maxPlayPosition);
                    }, 50);
                } else {
                    // this happens when the timer triggers the onSeek event
                    seeking = false;
                }
                startFromSpecificTimeHasBeenTriggered = false;
            } else if (event.offset < minPlayPosition) {
                // backward
                if (!seeking && doLockBackward) {
                    seeking = true;
                    if (lockBackwardMessage == '') {
                        lockBackwardMessage = 'Backward play is disabled';
                    }
                    if (disableLockMessage !== undefined && !disableLockMessage) {
                        displayErrorNotyNotification(lockBackwardMessage, 1000);
                    }
                    setTimeout(function () {
                        jwplayer().seek(minPlayPosition);
                    }, 50);
                } else {
                    // this happens when the timer triggers the onSeek event
                    seeking = false;
                }
            } else {
                // this happens when the timer triggers the onSeek event
                seeking = false;
            }
        });
    } // end of lockSeeking
    this.enableInteraction = function (playerContainerID,
        SecretCodeCenterDisplayDurationInSeconds,
        SecretCodeTopLeftDisplayDurationInSeconds,
        NullableEncryptedUserLearningActivityID,
        InteractiveLearningActivityAssetViewerUrl) {
        console.log('enableInteraction is hit.');
        var $mainWrapper = $('#' + playerContainerID).closest('.learningActivityAsset_audioVideoViewWrapper');
        jwplayer(playerContainerID).on('time', function (event) {
            var $pnlVideoInteraction_SecretCodeWrapper = $mainWrapper.find('.videoInteraction_secretCodeWrapper');
            $pnlVideoInteraction_SecretCodeWrapper.hide();
            var $videoInteractionHiddenField = $mainWrapper.find('.spanHiddenField_VideoInteractions input:hidden');
            if ($videoInteractionHiddenField === undefined) {
                return;
            }
            var videoInteractionValue = $videoInteractionHiddenField.val();
            if (videoInteractionValue.length == 0) {
                return
            }
            var videoInteractions = JSON.parse(videoInteractionValue);
            if (videoInteractions.length > 0) {
                var i;
                for (i = 0; i < videoInteractions.length; i++) {
                    var lowerBoundTime = videoInteractions[i].TimeStamp_SecondsFromVideoStart;
                    var lowerBoundTimeForCenteredPosition = videoInteractions[i].TimeStamp_SecondsFromVideoStart;
                    var lowerBoundTimeForTopLeftPosition = videoInteractions[i].TimeStamp_SecondsFromVideoStart + SecretCodeCenterDisplayDurationInSeconds + 1;
                    var currentPosition = Math.floor(event.position);
                    if (videoInteractions[i].InteractionType == "1") {
                        //DISPLAY SECRET CODE from TimeStamp_SecondsFromVideoStart to TimeStamp_SecondsFromVideoStart +3s and additional +5s for the top left.
                        var upperBoundTimeForCenteredPosition = lowerBoundTimeForCenteredPosition + SecretCodeCenterDisplayDurationInSeconds;
                        var upperBoundTimeForTopLeftPosition = lowerBoundTimeForTopLeftPosition + SecretCodeTopLeftDisplayDurationInSeconds;
                        var $videoInteraction_secretCodeInstruction = $pnlVideoInteraction_SecretCodeWrapper.find('.videoInteraction_secretCodeInstruction');
                        var $videoInteraction_secretCode = $pnlVideoInteraction_SecretCodeWrapper.find('.videoInteraction_secretCode');

                        if ((lowerBoundTimeForCenteredPosition <= currentPosition) && (currentPosition <= upperBoundTimeForCenteredPosition)) {
                            $videoInteraction_secretCodeInstruction.html('<span>' + videoInteractions[i].InteractionName + '</span>');
                            $videoInteraction_secretCode.html('<span>' + videoInteractions[i].SecretCode + '</span>');
                            console.log('show secret code in center');
                            $pnlVideoInteraction_SecretCodeWrapper.addClass('centeredPosition');
                            $pnlVideoInteraction_SecretCodeWrapper.show();
                        } else if ((lowerBoundTimeForTopLeftPosition <= currentPosition) && (currentPosition <= upperBoundTimeForTopLeftPosition)) {
                            $videoInteraction_secretCodeInstruction.html('<span>' + videoInteractions[i].InteractionName + '</span>');
                            $videoInteraction_secretCode.html('<span>' + videoInteractions[i].SecretCode + '</span>');
                            console.log('show secret code in top left');
                            $pnlVideoInteraction_SecretCodeWrapper.removeClass('centeredPosition');
                            $pnlVideoInteraction_SecretCodeWrapper.show();
                        }
                    } else if (videoInteractions[i].InteractionType == "2") {
                        //VERIFY SECRET CODE
                        if (lowerBoundTime == currentPosition) {
                            var $hfUserVideoInteractions = $mainWrapper.find('.spanHiddenField_UserVideoInteractions input:hidden');
                            if ($hfUserVideoInteractions === undefined || $hfUserVideoInteractions.length === 0) {
                                return;
                            }
                            var isPassed = false;
                            if ($hfUserVideoInteractions.val() !== '') {
                                var userVideoInteractions = [];
                                userVideoInteractions = JSON.parse($hfUserVideoInteractions.val());
                                var matchIndex = userVideoInteractions.findIndex(function (item) {
                                    return item.VideoInteractionID === videoInteractions[i].VideoInteractionID
                                });
                                isPassed = (matchIndex !== -1);
                            }
                            if (!isPassed) {
                                if (jwplayer(playerContainerID).version.includes('8.')) {
                                    jwplayer(playerContainerID).pause();
                                } else {
                                    jwplayer(playerContainerID).play(false);
                                }
                                var $pnlVideoInteraction_VerifySecretCode = $mainWrapper.find('.videoInteraction_verifySecretCode');
                                var $btnVerifySecretCode = $pnlVideoInteraction_VerifySecretCode.find('input[type=submit].verifySecretCodeButton');
                                $btnVerifySecretCode.attr('onclick', 'videoInteraction_verifySecretCodeProcess(this,"' + playerContainerID + '",' + videoInteractions[i].VideoInteractionID + ',"' + NullableEncryptedUserLearningActivityID + '"); return false;');
                                var $btnCancelVerifySecretCode = $pnlVideoInteraction_VerifySecretCode.find('input[type=submit].cancelVerifySecretCodeButton');
                                $btnCancelVerifySecretCode.attr('onclick', 'videoInteraction_cancelVerifySecretCodeProcess(this,"' + playerContainerID + '"); return false;');

                                $pnlVideoInteraction_VerifySecretCode.find('#videoInteraction_VerifySecretCodeModalLabel').html(videoInteractions[i].InteractionName);
                                $pnlVideoInteraction_VerifySecretCode.modal({
                                    backdrop: 'static',
                                    keyboard: false
                                });
                                $pnlVideoInteraction_VerifySecretCode.modal('show');
                            } else {
                                console.log('User already verified the code.');
                            }

                        }
                    } else if (videoInteractions[i].InteractionType == "3") {
                        // QUIZ
                        if (lowerBoundTime == currentPosition) {
                            // check if user already passed/taken this quiz or not
                            var $hfUserVideoInteractions = $mainWrapper.find('.spanHiddenField_UserVideoInteractions input:hidden');
                            if ($hfUserVideoInteractions === undefined || $hfUserVideoInteractions.length === 0) {
                                return;
                            }
                            var isPassed = false;
                            if ($hfUserVideoInteractions.val() !== '') {
                                var userVideoInteractions = [];
                                userVideoInteractions = JSON.parse($hfUserVideoInteractions.val());
                                var matchIndex = userVideoInteractions.findIndex(function (item) {
                                    return item.VideoInteractionID === videoInteractions[i].VideoInteractionID
                                });
                                isPassed = (matchIndex !== -1);
                            }
                            if (!isPassed) {
                                if (jwplayer(playerContainerID).version.includes('8.')) {
                                    jwplayer(playerContainerID).pause();
                                } else {
                                    jwplayer(playerContainerID).play(false);
                                }
                                //we need to replace few keywords
                                InteractiveLearningActivityAssetViewerUrl = InteractiveLearningActivityAssetViewerUrl.replace('[VideoInteractionId]', videoInteractions[i].VideoInteractionID);
                                // in case we are at full screen.
                                var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;
                                console.log('document is full screen? ' + isFullscreen);                              
                                  if (isFullscreen) {
                                    document.exitFullscreen();
                                }                                
                                openModalPopUp(InteractiveLearningActivityAssetViewerUrl, 'Interactive content', 1200);
                            }
                        }
                    }
                }
            }
        }); // end of on 'time'
    }// end of enableInteraction
    this.unlockFastForward = function () {
        //We cant remove events from the jwplayer, so we just set the flag to no longer lock the fast forward
        console.log('doLockFastForward set to false');
        doLockFastForward = false;
    }
    this.unlockBackward = function () {
        //We cant remove events from the jwplayer, so we just set the flag to no longer lock the backward
        console.log('doLockBackward set to false');
        doLockBackward = false;
    }
    this.startFromPosition = function (startFromPositionInSeconds, assetDurationInSeconds, stopWhenReachedEnd, jwPlayerObj, overlayClientId) {
        if (startFromSpecificTimeUsedUp) {
            console.log('startFromPosition called twice. Will not proceed. Data: Start from: ' + startFromPositionInSeconds + 's, duration: ' + assetDurationInSeconds + ' s');
            return;
        }
        console.log('startFromPosition called. Start from: ' + startFromPositionInSeconds + 's, duration: ' + assetDurationInSeconds + ' s');
        startFromSpecificTimeHasBeenTriggered = true;
        startFromSpecificTimeUsedUp = true;
        jwPlayerObj.play(true);

        if (overlayClientId.length > 0) {
            $('#' + overlayClientId).hide();
        }
        if (parseFloat(startFromPositionInSeconds) < parseFloat(assetDurationInSeconds)) {
            jwPlayerObj.seek(startFromPositionInSeconds); // here we use jwplayer().seek(time) function to play from [startFromPositionInSeconds] s
        } else {
            // startFromPositionInSeconds exceeds assetDurationInSeconds. seek to the end.
            jwPlayerObj.seek(assetDurationInSeconds);
            if (stopWhenReachedEnd) {
                jwPlayerObj.stop();
            }
        }
        console.log('starts at: ' + startFromPositionInSeconds + ' seconds.');
    }
    this.unmutePlayer = function (jwPlayerObj, panelClientId) {
        jwPlayerObj.setMute(false);
        console.log('sound unmuted.');
        $('#' + panelClientId).hide();
    }
    this.displayUnmutePanel = function (jwPlayerObj, panelClientId) {
        console.log('displayUnmutePanel called with panel ID: ' + panelClientId);
        if (jwPlayerObj.getMute()) {
            $('#' + panelClientId).show();
        } else {
            $('#' + panelClientId).hide();
        }
    }
    this.playerReachedCompletion = function (jwPlayerObj, playerPanelClientId, targetPanelClientIdToOpen, replacePlayerPanel) {
        if (targetPanelClientIdToOpen !== undefined && targetPanelClientIdToOpen.length > 0) {
            if (replacePlayerPanel) {
                $('#' + playerPanelClientId).hide();
            }
            $('#' + targetPanelClientIdToOpen).show();
        } else {
            // do nothing
        }
        jwPlayerObj.stop();
    }
}; // end of variable oasisAvPlayerUtil


