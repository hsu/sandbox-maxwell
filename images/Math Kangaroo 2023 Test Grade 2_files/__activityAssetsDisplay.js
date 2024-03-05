function openPDF(href) {
    $.fancybox({
        'type': 'iframe',
        'title': '',
        'href': href,
        'overlayShow': true,
        'scrolling': 'no',
        'height': '100%',
        'hideOnContentClick': false
    });
}
function closeModalAndUpdateLearningActivityAssetList() {
    $.fancybox.close();
    setTimeout(function () {
        __doPostBack('__page', 'JavascriptUpdateLearningActivityAsset');
    }, 300);
}
function closeModalAndUpdateLearningActivityAssetListForLearnerUpload() {
    $.fancybox.close();
    setTimeout(function () {
        __doPostBack('__page', 'JavascriptUpdateLearningActivityAssetFromLearnerUpdate');
    }, 300);
}

function rateLearningActivityAsset(sender, args) {
    if (!sender.get_readOnly()) {
        var targetRadRating = $('#' + sender.get_id());
        var encryptedLearningActivityAssetID = targetRadRating.attr('encryptedLearningActivityAssetID');//not sure how we get custom arguments.
        var encryptedUserLearningActivityID = targetRadRating.attr('encryptedUserLearningActivityID');//not sure how we get custom arguments.
        var newRate = sender.get_value();
        var postData = new Object();
        postData.EncryptedLearningActivityAssetID = encryptedLearningActivityAssetID;
        postData.RateValue = newRate;
        postData.EncryptedUserLearningActivityID = encryptedUserLearningActivityID;
        postData.ManuallyGetUserLearningActivityIfIDNotExist = false;
        $.ajax({
            type: 'POST',
            url: '/Webservices/ActivityService.asmx/RateLearningActivityAsset',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(postData),
            success: function (data) {
                var rtnMessage = data.d;
                if (rtnMessage.IsSuccessful) {
                    displaySuccessNotyNotification(rtnMessage.SystemMessage, 1500);
                    //update the average rating and make it readonly.
                    sender.set_readOnly(true);
                    sender.set_value(rtnMessage.ReturnValue);
                }
                else {
                    displayErrorNotyNotification(rtnMessage.SystemMessage, 2500);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                displayErrorNotyNotification('Unable to reach server, please reload this page to see saved data', 2500);
            }
        });// end of ajax.
    }

} //end of rateLearningActivityAsset


function recordUserViewOnLearningActivityAsset(encryptedLearningActivityAssetId, encryptedUserLearningActivityId) {
  
        var postData = new Object();
        postData.EncryptedLearningActivityAssetID = encryptedLearningActivityAssetId;
        postData.EncryptedUserLearningActivityID = encryptedUserLearningActivityId;
        $.ajax({
            type: 'POST',
            url: '/Webservices/ActivityService.asmx/RecordUserViewOnLearningActivityAsset',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(postData),
            success: function (data) {
                var rtnMessage = data.d;
                if (rtnMessage.IsSuccessful) {
                    console.log('recordUserViewOnLearningActivityAsset call is successful.');                  
                }
                else {
                    console.log('recordUserViewOnLearningActivityAsset call is failure.');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                displayErrorNotyNotification('Unable to reach server, please reload this page to see saved data', 2500);
            }
        });// end of ajax.
} //end of rateLearningActivityAsset