$(document).ajaxComplete(function () {
    console.log('ajax complete called.');
    // re-assign
    catalogItemTooltipAssignment();
    initializeControls();
})

$(function () {
    initializeControls();
});// end of document ready

function pageLoad() {
    initializeControls();
}


function initializeControls() {
    // all tooltip will be placed on top of its object
    catalogItemTooltipAssignment();
    if ($('[data-toggle="tooltip"]').length > 0) {
        $('[data-toggle="tooltip"]').tooltip({
            trigger: 'hover'
        });
    }

    var $catalogItemTitleAndStatus = $('.catalogItemTitleAndStatus');
    $catalogItemTitleAndStatus.hover(
        function () {
            $(this).css('font-size', '1.1em');
           /* $(this).css('background-color', '#e8e8e8');*/
        }, function () {
            $(this).css('font-size', 'inherit');
           /* $(this).css('background-color', 'inherit');*/
        }
    );
    $catalogItemTitleAndStatus.on('click', function () {
        // we will use learningActivityTitleLinkButton
        if (!($(this).find('.learningActivityTitleLinkButton').hasClass('aspNetDisabled'))) {
            //to trigger a learning activity click, we must find the control that does that
            var $learningActivityTitleLinkButton = $(this).find('.learningActivityTitleLinkButton');
            location.href = $learningActivityTitleLinkButton.attr('href');
        }
    });// end of $LearningActivityCatalogItem_ListView_MainContainer CLICK event
}
function catalogItemTooltipAssignment() {
    var $learningActivityCatalogItemTooltip = $('.learningActivityCatalogItemTooltip');
    $learningActivityCatalogItemTooltip.each(function () {
        assignTooltip(this.id, this.title, 'top');
    });
}
// for toggling between tile and list view
function switchLearningActivityCatalogDisplayModeFromRepeater(sender) {
    // 1. first find the parent that contains our display mode panel
    // 2. only for Tile View: then assign class "[cssForStackableCards]" so that it stacks four boxes in a row (responsive)
    // 3. hide old display mode panel and show the selected mode panel
    var $sender = $(sender);
    var $senderDirectParent = $($sender.parent());
    var selectedvalue = $senderDirectParent.find("input:hidden").val();
    var $catalogListDiv = $sender.parents('.learningActivityCatalogListDivClass');
    var $pnllearningActivityCatalogListHeader = $catalogListDiv.find('.learningActivityCatalogListHeaderClass');
    // Data update
    var postData = new Object();
    postData.CatalogDisplayMode = selectedvalue;
    $.ajax({
        type: "POST",
        url: '/Webservices/ActivityService.asmx/UpdateUserCatalogViewPreference',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        success: function (data) {
            var rtnMessage = data.d;
            if (rtnMessage.IsSuccessful) {
                // do nothing else
                console.log('updated user\'s catalog view preference to ' + selectedvalue);
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
    $senderDirectParent.parent().find('a').each(function () {
        $(this).removeClass('active');
    });
    $sender.addClass('active');// make this button active
    // The list/boxes:
    // March 20, 2019. now we only allows few parts to be clickable/link
    var cssForStackableCards = "ui four doubling stackable cards"; // deprecated. try out to have fixed width (but responsive at few screen sizes)
    // clear the card class first
    $pnllearningActivityCatalogListHeader.removeClass(cssForStackableCards);
    if (selectedvalue === '1') {
        // list view. Do nothing for the $pnllearningActivityCatalogListHeader
        $pnllearningActivityCatalogListHeader.find(".factor360LearningActivityCatalogItem_ListView_MainContainer").show();
        $pnllearningActivityCatalogListHeader.find(".factor360LearningActivityCatalogItem_TileView_MainContainer").hide();

    } else {
        // tile view
        $pnllearningActivityCatalogListHeader.addClass(cssForStackableCards);
        $pnllearningActivityCatalogListHeader.find(".factor360LearningActivityCatalogItem_ListView_MainContainer").hide();
        $pnllearningActivityCatalogListHeader.find(".factor360LearningActivityCatalogItem_TileView_MainContainer").show();
    }

}// end of switchLearningActivityCatalogDisplayMode function

