function videoInteraction_verifySecretCodeProcess(sender, avContainerId, videoInteractionId, nullableEncryptedUserLearningActivityId) {
    var $mainWrapper = $(sender).closest('.learningActivityAsset_audioVideoViewWrapper');
    var $textbox = $mainWrapper.find('.videoInteraction_verifySecretCode input[type=text]');
    var textboxValue = $textbox.val();
    var postData = new Object();
    postData.VideoInteractionID = videoInteractionId;
    postData.UserSecretCode = textboxValue;
    postData.NullableEncryptedUserLearningActivityID = nullableEncryptedUserLearningActivityId;
    $.ajax({
        type: "POST",
        url: '/Webservices/ActivityService.asmx/VerifyVideoInteractionSecretCode',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        success: function (response) {
            var responseObject = response.d;
            if (responseObject.IsSuccessful) {
                $textbox.val('');
                jwplayer(avContainerId).play(true);
                updateUserVideoInteractionList($mainWrapper, videoInteractionId, nullableEncryptedUserLearningActivityId);
                var $pnlVideoInteraction_VerifySecretCode = $mainWrapper.find('.videoInteraction_verifySecretCode');
                $pnlVideoInteraction_VerifySecretCode.modal('hide');
                return false;
            } else {
                displayErrorNotyNotification(responseObject.SystemMessage, 2500);
                return false;
            }
        },
        failure: function (response) {
            var responseObject = esponse.d;
            displayErrorNotyNotification(responseObject.SystemMessage, 3500);
        }
    }); // end of ajax call
};
function updateUserVideoInteractionList(mainWrapperJquery, videoInteractionId, nullableEncryptedUserLearningActivityId) {
    //few props are not here, but since this only live in the client, not to worry as we don't need those for filtering.
    var newUserVideoInteraction = {
        UserLearningActivityID: nullableEncryptedUserLearningActivityId,
        VideoInteractionID: videoInteractionId,
        IsPassed: true
    }
    var $hfUserVideoInteractions = mainWrapperJquery.find('.spanHiddenField_UserVideoInteractions input:hidden');
    if ($hfUserVideoInteractions !== undefined) {
        var userVideoInteractionsJSONToUpdate = [];
        if ($hfUserVideoInteractions.val() !== '') {
            userVideoInteractionsJSONToUpdate = JSON.parse($hfUserVideoInteractions.val());
        }
        userVideoInteractionsJSONToUpdate.push(newUserVideoInteraction);
        var stringifiedUserVideoInteractions = JSON.stringify(userVideoInteractionsJSONToUpdate);
        $hfUserVideoInteractions.val(stringifiedUserVideoInteractions);
    }
} // end of updateUserVideoInteractionList()
function videoInteraction_cancelVerifySecretCodeProcess(sender, avContainerId) {
    var $mainWrapper = $(sender).closest('.learningActivityAsset_audioVideoViewWrapper');
    var $textbox = $mainWrapper.find('.videoInteraction_verifySecretCode input[type=text]');
    $textbox.val('');
    var currentPosition = jwplayer(avContainerId).getPosition();
    currentPosition = Math.floor(currentPosition) - 10;
    var $pnlVideoInteraction_VerifySecretCode = $mainWrapper.find('.videoInteraction_verifySecretCode');
    $pnlVideoInteraction_VerifySecretCode.modal('hide');
    jwplayer(avContainerId).seek(currentPosition);
    return false;
};

function videoInteraction_close(avContainerId) {
    if ($.fancybox !== undefined) {
        $.fancybox.close();
    }
    var currentPosition = jwplayer(avContainerId).getPosition();
    currentPosition = Math.floor(currentPosition) - 10;
    if (currentPosition < 0) { currentPosition = 0;}
    jwplayer(avContainerId).seek(currentPosition);
}

function videoInteraction_quizPassedProcess(avContainerId, videoInteractionId, nullableEncryptedUserLearningActivityId) {
    if ($.fancybox !== undefined) {
        $.fancybox.close();
    }  
    var $mainWrapper = $('#' + avContainerId).closest('.learningActivityAsset_audioVideoViewWrapper');
    updateUserVideoInteractionList($mainWrapper, videoInteractionId, nullableEncryptedUserLearningActivityId);
    jwplayer(avContainerId).play(true);
    return false;
}   
