var $currentPlaylistItem = null;
function playSlidePlaylistItem(playlistItem, checkForActivityCompletionRaised) {
    var $playlistCards = $(".playlistCard");
    var $item;
    if (playlistItem instanceof jQuery) {
        //its already jquery obj
        $item = playlistItem;
    } else {
        //Not jquery yet
        $item = $(playlistItem);
    }

    var slideType = $item.data("slideType");
    var isKnowledgeCheck = (slideType == 'knowledgeCheck' ? true : false);

    var slideURL = $item.data("slideUrl");
    var fancyboxHref = $item.data("fancybox-href");
    var audioUrl = $item.data("audioUrl");
    var itemIndex = $playlistCards.index($item);

    if (itemIndex > 0) {
        //For items that are not the first one, we will block the item
        var $prevItem = $($playlistCards[itemIndex - 1]);
        if (!$prevItem.hasClass("viewed")) {
            //Block the item as they have not viewed the previous item
            return;
        }
    }

    if ($currentPlaylistItem != null && ($currentPlaylistItem.data("slideType") == 'knowledgeCheck' || isKnowledgeCheck)) {
        //If it is a transition between a regular item and a knowledge check (or if the current item is knowledge check), we will do a postback to display the right content/panels
        $item.parent().find("input[type=\"submit\"], button[type=\"submit\"]").click();
    } else if (!isKnowledgeCheck) {
        //Otherwise, we display slide and audio url (if any) for the non knowledge check item

        //Destroy the old video player if any                
        var videoPlayer = jwplayer("slideVideoPlayer");
        if (videoPlayer != null && videoPlayer.remove != null) {
            videoPlayer.remove();
        }

        //Clear asset container
        var $assetContainer = $(".slideAssetContainer");
        $assetContainer.empty();

        //Populate slide image or video
        if (slideType == "video") {
            var slideVideoPlayerDiv1 = document.createElement("div");
            slideVideoPlayerDiv1.className = "slideVideoPlayerContainer1";
            var slideVideoPlayerDiv11 = document.createElement("div");
            slideVideoPlayerDiv11.className = "slideVideoPlayerContainer1-1";
            var slideVideoPlayerDiv111 = document.createElement("div");
            slideVideoPlayerDiv111.className = "slideVideoPlayerContainer1-1-1";

            var videoPlayerDiv = document.createElement("div");
            videoPlayerDiv.id = "slideVideoPlayer";
            var $slideVideoPlayerDiv1 = $(slideVideoPlayerDiv1);
            var $slideVideoPlayerDiv11 = $(slideVideoPlayerDiv11);
            var $slideVideoPlayerDiv111 = $(slideVideoPlayerDiv111);

            $slideVideoPlayerDiv111.append(videoPlayerDiv);// insert the video player first to our wrapper
            $slideVideoPlayerDiv11.append(slideVideoPlayerDiv111);// insert the video player first to our wrapper
            $slideVideoPlayerDiv1.append(slideVideoPlayerDiv11);// insert the video player first to our wrapper
            $assetContainer.append(slideVideoPlayerDiv1);// then insert the wrapper to the main container.
            var jwplayerOption = {
                file: slideURL,
                autostart: true,
                width: "100%",
                height: "100%"
            }
            if (slideURL.indexOf(".ashx") != -1) {
                //If the video is served from an ashx (our own server), it will be type mp4
                jwplayerOption.type = "mp4";
            }
            jwplayer("slideVideoPlayer").setup(jwplayerOption);
        } else {
            var slideImage = document.createElement("img");
            slideImage.src = slideURL;
            slideImage.width = "100%";
            if (fancyboxHref !== undefined && fancyboxHref.length > 0) {
                slideImage.setAttribute('data-fancybox-href', fancyboxHref);
                slideImage.setAttribute('data-fancybox-type', 'image');
                slideImage.setAttribute('class', 'slideImageClass');
                assignElementsToFancybox($(slideImage), 'inside', 'bottom', false, false);
            }
            $assetContainer.append(slideImage);
        }

        //Populate slide audio
        if ($("#audioPlayer").length > 0) {
            if (audioUrl != null && audioUrl != "") {
                $("#audioPlayer").show();
                jwplayer("audioPlayer").setup({ width: "100%", height: "40px", autostart: true, playlist: [{ file: audioUrl, type: "mp3" }] });
                jwplayer("audioPlayer").on('complete', handlePlaylistItemComplete);
            } else {
                jwplayer("audioPlayer").remove();
                $("#audioPlayer").hide();
            }
        }

        updateSlideViewHistory(playlistItem, checkForActivityCompletionRaised);
    }

    $currentPlaylistItem = $item;

    //Scroll the item
    if (itemIndex > 0) {
        $playlistCards[itemIndex - 1].scrollIntoView();
    } else {
        $item[0].scrollIntoView();
    }

    //Remove the playing class for all item
    $(".playlistCard.playing").removeClass("playing");

    //Add a playing class and viewed class to the one just clicked
    if (isKnowledgeCheck == "0") {
        //Only add viewed if its not a knowledge check
        $item.addClass("viewed");
    }
    $item.addClass("playing");

    //Remove the disabled class on the next one if any
    if ($item.hasClass("viewed") && itemIndex < $playlistCards.length - 1) {
        //Current item is not the last one, remove the next item disabled class
        $($playlistCards[itemIndex + 1]).removeClass("disabled");
    }
}

function handlePlaylistItemComplete() {
    var itemIndex = $(".playlistCard").index($currentPlaylistItem);

    playSlidePlaylistItem($(".playlistCard")[itemIndex + 1]);
}

function updateSlideViewHistory(playlistItem, checkForActivityCompletionRaised) {
    var $item;
    if (playlistItem instanceof jQuery) {
        //its already jquery obj
        $item = playlistItem;
    } else {
        //Not jquery yet
        $item = $(playlistItem);
    }

    var encryptedSlideID = $item.data("slideId");
    var encryptedUserLearningActivityID = $item.data("userLearningActivityId");//pay attention on the camel
    if (encryptedSlideID != null && encryptedSlideID != "" && encryptedUserLearningActivityID != null && encryptedUserLearningActivityID != "") {
        var postData = new Object();
        postData.encSlideID = encryptedSlideID;
        postData.userLearningActivityID = encryptedUserLearningActivityID;
        $.ajax({
            type: 'POST',
            url: '/WebServices/ActivityService.asmx/UpdateSlideViewedTime',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(postData),
            success: function (response) {
                var responseObject = response.d;
                if (responseObject.ReturnMessage.IsSuccessful) {
                    console.log('returned success');
                    if (responseObject.CheckForActivityCompletion && !checkForActivityCompletionRaised) {
                        __doPostBack('__page', 'LearningActivityAssetSlideCheckForActivityCompletionCallBack-' + encryptedSlideID);
                    }
                    return true;
                } else {
                    displayErrorNotyNotification(responseObject.ReturnMessage, 3000);
                    return false;
                }
            },
            failure: function (response) {
                hideBlockUI();
                var responseObject = esponse.d;
                displayErrorNotyNotification(responseObject.SystemMessage, 5000);
            }
        });
    }
}