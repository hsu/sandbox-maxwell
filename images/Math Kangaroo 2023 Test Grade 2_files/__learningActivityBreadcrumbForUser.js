function clearModuleFilterOnSearchCentricLayout(encryptedLearningActivityID, redirectUrl) {
    var postData = new Object();
    postData.EncryptedLearningActivityID = encryptedLearningActivityID;
       $.ajax({
        type: "POST",
           url: '/Webservices/ActivityService.asmx/ClearModuleFilterOnSearchCentricLayout',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        success: function (data) {
            var rtnMessage = data.d;
            if (rtnMessage.IsSuccessful) {
                window.location.replace(redirectUrl);
            } else {
                displayErrorNotyNotification(rtnMessage.SystemMessage, 3500);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            displayErrorNotyNotification('Unable to reach server, please reload this page', 2500);
        }
    });
}