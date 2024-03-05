function closeWindowAndUpdateLearningActivityAssetComment(learningActivityAssetID, controlUniqueIDToUpdate, greenifyCommentIcon) {
    $.fancybox.close();
    setTimeout("updateLearningActivityAssetComment(" + learningActivityAssetID + ",'" + controlUniqueIDToUpdate + "'," + greenifyCommentIcon + ");", 300);
} // end of closeWindowAndUpdateLearningActivityAssetComment
function updateLearningActivityAssetComment(learningActivityAssetID, controlUniqueIDToUpdate, greenifyCommentIcon) {
    var postData = new Object();
    postData.LearningActivityAssetID = learningActivityAssetID;
    $.ajax({
        type: "POST",
        url: "/Webservices/ActivityService.asmx/GetLearningActivityAssetCommentCount",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        success: function (data) {
            if ($('#' + controlUniqueIDToUpdate).length > 0) {
                $('#' + controlUniqueIDToUpdate).text(data.d.ReturnValue);
                if (greenifyCommentIcon) {
                    var $commentIcon = $('#' + controlUniqueIDToUpdate).parent().find('.comment.outline.icon');
                    $commentIcon.removeAttr('class');
                    $commentIcon.attr('class', 'green comment outline icon');
                }
            }
        }
    });
}
function toggleLearningActivityAssetBookmark(isBookmarked, encryptedUserLearningActivityID, encryptedLearningActivityAssetID) {
    if (encryptedUserLearningActivityID.length === 0) {
        return;
    }
    var postData = new Object();
    postData.EncryptedLearningActivityAssetID = encryptedLearningActivityAssetID;
    postData.EncryptedUserLearningActivityID = encryptedUserLearningActivityID;
    postData.IsBookmarked = isBookmarked;
    $.ajax({
        type: "POST",
        url: '/Webservices/ActivityService.asmx/UpdateLearningActivityAssetViewHistoryBookmark',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        success: function (response) {
            var responseObject = response.d;
            if (responseObject.IsSuccessful) {
                displaySuccessNotyNotification(responseObject.SystemMessage, 1000);
            } else {
                displayErrorNotyNotification(responseObject.SystemMessage, 3500);
            }
        },
        failure: function (response) {
            var responseObject = response.d;
            displayErrorNotyNotification(responseObject.SystemMessage, 5000);
        }
    }); // end of ajax call
}

// for toggling between tile and list view
function switchLearningActivityAssetListDisplayModeFromRepeater(sender) {
    // 1. first find the parent that contains our display mode panel
    // 2. hide old display mode panel and show the selected mode panel
    var $sender = $(sender);
    var $senderSpanWrapper = $($sender.closest('.spanWrapper'));
    var $learningActivityAssetListDiv = $senderSpanWrapper.closest('.learningActivityAssetListDivClass');
    //clearing the IsSelected flag
    var $displayModeControls = $sender.closest('.toggleLearningActivityAssetListDisplayModeClass').find('.spanWrapper');
    $displayModeControls.each(function () {
        var isSelectedHiddenValueEachControl = $(this).find('.hfIsSelectedLearningActivityAssetListDisplayModeClass input:hidden');
        isSelectedHiddenValueEachControl.val('False');
    }); // each display mode
    // update this mode's IsSelected flag
    var isSelectedHiddenField = $senderSpanWrapper.find(".hfIsSelectedLearningActivityAssetListDisplayModeClass input:hidden");
    isSelectedHiddenField.val('True');
    var selectedvalue = $senderSpanWrapper.find(".hfLearningActivityAssetListDisplayModeClass input:hidden").val();
    var $oneRowPanels = $learningActivityAssetListDiv.find('.publicCatalogLearningActivityAssetCardOneRow');
    var $tilePanels = $learningActivityAssetListDiv.find('.publicCatalogLearningActivityAssetCardTile');
    // session update
    var postData = new Object();
    postData.NewLearningActivityAssetListDisplayMode = selectedvalue;
    $.ajax({
        type: "POST",
        url: '/Webservices/ActivityService.asmx/SetLearningActivityAssetListDisplayMode',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        success: function (data) {
            var rtnMessage = data.d;
            if (rtnMessage.IsSuccessful) {
                // do nothing else
                console.log('updated assetlist view display mode to ' + selectedvalue);
            } else {
                displayErrorNotyNotification(rtnMessage.SystemMessage, 3500);
                return;
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            displayErrorNotyNotification('Unable to reach server, please reload this page', 2500);
            return;
        }
    });
    // UI update
    // The buttons: make not active first
    $learningActivityAssetListDiv.find('.spanWrapper a').each(function () {
        $(this).removeClass('active');
    });
    $sender.addClass('active');// make this button active
    if (selectedvalue === '1') {
        // list view.
        //.css('display','block !important') does not work. because .css does not understand !important.
        //.hide() or .show() not working because we need to have !important.
        $oneRowPanels.each(function () {
            this.style.setProperty('display', 'block', 'important');
        });
        $tilePanels.each(function () {
            this.style.setProperty('display', 'none', 'important');
        });      
    } else {
        $oneRowPanels.each(function () {
            this.style.setProperty('display', 'none', 'important');
        });
        $tilePanels.each(function () {
            this.style.setProperty('display', 'block', 'important');
        });      
    }
}// end of switchLearningActivityCatalogDisplayMode function