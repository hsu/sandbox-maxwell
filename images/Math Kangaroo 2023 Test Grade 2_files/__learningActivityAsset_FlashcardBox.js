function showFrontSideFlashcard(flipButton) {
    var $cardItem = $(flipButton).closest('.learningActivityAssetFlashCardWrapperClass');

    //var $flashCardFrontItem = $cardItem.find('.flashCardFront');
    //$flashCardFrontItem[0].style.display = '';

    //var $flashCardBackItem = $cardItem.find('.flashCardBack');
    //$flashCardBackItem[0].style.display = 'none';

    $cardItem.removeClass("flipped");

} // end of showFrontSideFlashcard
function maximizeFlashcard(flipButton) {
    console.log('[maximizeFlashcard] called');
    var $cardItem = $(flipButton).closest('.learningActivityAssetFlashCardWrapperClass');
    $cardItem.find('.flashCard_imageDocumentView').removeClass('height200');//remove limitation on image view height we used to proportionally display the image on regular size.
    $cardItem.height($(window).height() * 0.8);// give 20% extra space for fancybox height needed.
    $cardItem.find('.flashCardCaption').addClass('maximizedFlashCardCaption');
    var cardItemId = $cardItem.attr('id');
    var $maximizeFlashcardIcons = $cardItem.find('.maximizeFlashcardClass');
    $maximizeFlashcardIcons.hide(); // hide the max.icon (we don't need it in big screen)
    $.fancybox.open('#' + cardItemId, {
        'width': '100%',
        'maxWidth': '1050',
        'autoHeight': true,
        'autoSize': false,
        'afterClose': function () {
            //bring back the card to original position as fancybox.close hides the card by default.
            $('#' + cardItemId).show();
            $('#' + cardItemId).find('.flashCard_imageDocumentView').addClass('height200'); //bring back image height so it's not chopped off due to card's general size.
            $('#' + cardItemId).find('.flashCardCaption').removeClass('maximizedFlashCardCaption');
            $maximizeFlashcardIcons.show();
            $cardItem.height(291);//bring back original height according to .learningActivityAssetFlashCardWrapperClass
            console.log('[maximizeFlashcard] maximized flashcard closed');
        }
    });
} // end of maximizeFlashcard
function maximizeFlashcard_Gallery(flipButton) {
    console.log('[maximizeFlashcard_Gallery] called');
    var clickIndex = 0;//default index is 0
    var $cardItems = $('.learningActivityAssetFlashCardWrapperClass')
    $cardItems.find('.flashCard_imageDocumentView').removeClass('height200');//remove limitation on image view height we used to proportionally display the image on regular size.
    var $cardItem = $(flipButton).closest('.learningActivityAssetFlashCardWrapperClass');
    $cardItem.find('.flashCardCaption').addClass('maximizedFlashCardCaption');
    //Create gallery object with its own customization (including zoom helper when the object is image)
    var groupName = $cardItem.data("fancyboxGroup");
    var galleryList = [];
    if (groupName) {
        //Have group, filter to the group
        //var $groupElements = $cardItems.filter("[data-fancybox-group='" + groupName + "']");
        clickIndex = $cardItems.index($cardItem);//get the button index within the group to determine gallery start
        $cardItems.each(function (index) {
            var elementId = $(this).attr('id');
            $(this).css('height', '100%'); // this is to make sure the height is consistent
            $(this).find('.maximizeFlashcardClass').hide();
            var galleryItem = {
                title: '',
                href: '#' + elementId,
                type: 'inline'
            };
            galleryList.push(galleryItem);
        });
    } // end of groupname if
    //Open the fancybox with gallery list object
    $.fancybox.open(galleryList, {
        index: clickIndex,
        arrows: true,
        width: '100%',
        maxWidth: '1050',
        autoSize: false,
        loop: false,
        afterClose: function () {
            $cardItems.find('.flashCard_imageDocumentView').addClass('height200');//bring back image height so it's not chopped off due to card's general size.
            $('.learningActivityAssetFlashCardWrapperClass').show(); // bring back the card to original position as fancybox.close hides the card by default.
            $('.learningActivityAssetFlashCardWrapperClass').height(291); // bring back original height according to .learningActivityAssetFlashCardWrapperClass
            $('.maximizeFlashcardClass').show(); // make sure we display the maximize icon
            $cardItems.find('.flashCardCaption').removeClass('maximizedFlashCardCaption');
            console.log('[maximizeFlashcard_Gallery] maximized flashcard closed');
              } // end of afterClose
    });
} // end of maximizeFlashcard_Gallery
function showBackSideFlashcard(flipButton) {
    var $cardItem = $(flipButton).closest('.learningActivityAssetFlashCardWrapperClass');

    //var $flashCardFrontItem = $cardItem.find('.flashCardFront');
    //$flashCardFrontItem[0].style.display = 'none';

    //var $flashCardBackItem = $cardItem.find('.flashCardBack');
    //$flashCardBackItem[0].style.display = '';

    $cardItem.addClass("flipped");

    updateViewRecord($cardItem);
    $cardItem.addClass("assetViewed");

    var $completedFlashCardCounterSpan = $($cardItem.closest('.activityAssetListPanel').find("#completedflashCardCounter"));
    var $totalFlashCardCounterSpan = $($cardItem.closest('.activityAssetListPanel').find("#totalFlashCardCounter"));
    if ($completedFlashCardCounterSpan !== null && $totalFlashCardCounterSpan !== null &&
        $completedFlashCardCounterSpan.length === 1 && $totalFlashCardCounterSpan.length === 1) {
        var prevCompletedFlashCardCounterVal = parseInt($completedFlashCardCounterSpan.text(), 10);
        var newCompletedFlashCardCount = $($cardItem.closest('.activityAssetListPanel').find(".learningActivityAssetFlashCardWrapperClass.assetViewed")).length;
        $completedFlashCardCounterSpan.text(newCompletedFlashCardCount);

        if (prevCompletedFlashCardCounterVal !== newCompletedFlashCardCount && newCompletedFlashCardCount === $totalFlashCardCounterSpan.text()) {
            //When the completed count is incremented and all asset has been completed, reload the page after a short delay (for ajax completion) to enable any new notifications
            window.setTimeout(function () {
                window.location.replace(window.location.href);
            }, 1000);
        }

    }
}
function updateViewRecord(flashCardItem) {
    var learningActivityAssetID = $($(flashCardItem).parent().find('.learningActivityAssetIDClass input:hidden')).val();
    var nullableUserLearningActivityID = $($(flashCardItem).parent().find('.userLearningActivityIDClass input:hidden')).val();

    // getting the data we need to pass in
    if (nullableUserLearningActivityID !== null && nullableUserLearningActivityID !== "") {
        var postData = new Object();
        postData.AssetQuery = learningActivityAssetID;
        postData.UserActivityQuery = nullableUserLearningActivityID;
        $.ajax({
            type: "POST",
            url: '/Webservices/ActivityService.asmx/MarkActivityAssetAsViewed',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(postData),
            success: function (response) {
                console.log('MarkActivityAssetAsViewed returned successfully.');
            },
            failure: function (response) {
                var responseObject = esponse.d;
                displayErrorNotyNotification(responseObject.SystemMessage, 5000);
            }
        }); // end of ajax call
    } // end of userActivityID check

} // end of updateViewRecord
function flashCardOpenDocument(sender,
    documentFlipButtonClassName,
    textFlipButtonClassName,
    topContainerClassName,
    scopeContainerClassName,
    documentPanelClassName,
    textPanelClassName) {
    var $topContainer = $(sender).closest('.' + topContainerClassName);
    var $scopeContainer = $topContainer.find('.' + scopeContainerClassName);
    var $documentPanel = $scopeContainer.find('.' + documentPanelClassName);
    var $textPanel = $scopeContainer.find('.' + textPanelClassName);
    // show document, hide text
    $documentPanel.show(100);
    $textPanel.hide(100);
    // style document flip button to "active", while the other "disabled"
    $documentFlipButton = $topContainer.find('.' + documentFlipButtonClassName);
    $textFlipButton = $topContainer.find('.' + textFlipButtonClassName);
    $documentFlipButton.addClass('scrollToIcon_active');
    $textFlipButton.removeClass('scrollToIcon_active');

} // end of flashCardOpenDocument
function flashCardOpenText(sender,
    documentFlipButtonClassName,
    textFlipButtonClassName,
    topContainerClassName,
    scopeContainerClassName,
    documentPanelClassName,
    textPanelClassName) {
    var $topContainer = $(sender).closest('.' + topContainerClassName);
    var $scopeContainer = $topContainer.find('.' + scopeContainerClassName);
    var $documentPanel = $scopeContainer.find('.' + documentPanelClassName);
    var $textPanel = $scopeContainer.find('.' + textPanelClassName);
    // show text, hide document
    $documentPanel.hide(100);
    $textPanel.show(100);
    // style text flip button to "active", while the other "disabled"
    $documentFlipButton = $topContainer.find('.' + documentFlipButtonClassName);
    $textFlipButton = $topContainer.find('.' + textFlipButtonClassName);
    $documentFlipButton.removeClass('scrollToIcon_active');
    $textFlipButton.addClass('scrollToIcon_active');
} // end of flashCardOpenText
$(document).ready(function () {
    //uses zoom and buttons helpers
    //the tpl on buttons helper is used to override buttons appearance. 
    //here we remove toggle button which is shown by default
    $("a.image_group").fancybox({
        'type': 'image',    //declaring image is necessary
        'padding': 5,
        arrows: false,
        helpers: {
            zoom: {
                maxZoom: 5
            },
            buttons: {
                position: 'top',
                skipSingle: true,
                tpl: '<div id="fancybox-buttons"><ul style="width:132px"><li><a class="btnPrev" title="Previous" href="javascript:;"></a></li><li><a class="btnPlay" title="Start slideshow" href="javascript:;"></a></li><li><a class="btnNext" title="Next" href="javascript:;"></a></li><li><a class="btnClose" title="Close" href="javascript:jQuery.fancybox.close();"></a></li></ul></div>'
            }
        } // end of helper
    }); // end of image group fancybox
}); // end of document ready