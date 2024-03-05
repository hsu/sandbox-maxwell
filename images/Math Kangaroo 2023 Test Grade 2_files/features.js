function blockConfirm(text, mozEvent, oWidth, oHeight, callerObj, oTitle) {
    var ev = mozEvent ? mozEvent : window.event;
    ev.cancelBubble = true;
    ev.returnValue = false;
    if (ev.stopPropagation) ev.stopPropagation();
    if (ev.preventDefault) ev.preventDefault();
    callerObj = ev.srcElement ? ev.srcElement : ev.target;
    if (callerObj) {
        var callBackFn = function (arg) {
            if (arg) {
                callerObj["onclick"] = "";

                if (callerObj.tagName === "A") {
                    try {
                        eval(callerObj.href)
                    }
                    catch (e) { }
                }
                else if (callerObj.click) {
                    callerObj.click();
                }
            }
        };// end of callBackFn 
        radconfirm(text, callBackFn, oWidth, oHeight, callerObj, oTitle);
    }; // end of callerObj If condition
    return false;
} // end of blockConfirm function
function displayPromptPopupActionWithTypeIn(postbackEventTarget, promptMessage, preEnteredPhrase, phraseChallenge, incorrectPromptMessage) {
    var response = window.prompt(promptMessage, preEnteredPhrase);
    if (response != null && response.trim().toLowerCase() == phraseChallenge.trim().toLowerCase()) {
        console.log("Success " + response);
        __doPostBack(postbackEventTarget, '');
    } else {
        console.log("Failed " + response);
        window.alert(incorrectPromptMessage)
    }
}


function swallConfirmationPopup(Title, text, confirmButtonText, postbackEventTarget, postbackEventArgument) {

    //const swalWithCustomButtons = Swal.mixin({
    //    customClass: {
    //        confirmButton: 'button mediumButton buttonMargin5',
    //        cancelButton: 'button mediumButton buttonMargin5 cancel'
    //    },
    //    buttonsStyling: true
    //})

    swal.fire({
        title: Title,
        html: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmButtonText
    }).then((result) => {
        if (result.isConfirmed) {
            __doPostBack(postbackEventTarget, postbackEventArgument);
        }
        else {
            SweetAlert.close()
        }
    })
};

function swallInformationPopup(Title, text, confirmButtonText) {
    Swal.fire({
        title: Title,
        icon: 'info',
        html: text
    })
};

function swallSuccessPopUp(Title, text, ShowConfirmButton) {
    Swal.fire({
        title: Title,
        html: text,
        icon: 'success',
        showConfirmButton: ShowConfirmButton
    })
};

function displayConfirmationPopup(message,
    cancelButtonTitle,
    confirmButtonTitle,
    postbackEventTarget,
    postbackEventArgument,
    loadingTextDuringProcess,
    cancelButtonEventArgument,
    isModal) {

    var _isModal = true;
    if (isModal === false || isModal === true) {
        _isModal = isModal;
    }
    var n = noty({
        text: message,
        layout: 'center',
        theme: 'oasisTheme',
        type: 'warning',
        modal: _isModal,
        timeout: false, // milli-seconds if not false
        template: '<div class="noty_message" ><span class="noty_text" style="font-size:16px;font-weight:400;"></span><div class="noty_close"></div></div>',
        buttons: [
            {
                addClass: 'button cancel', text: cancelButtonTitle, onClick: function ($noty) {
                    $noty.close();
                    if (cancelButtonEventArgument !== undefined && cancelButtonEventArgument.length > 0) {
                        __doPostBack('__page', cancelButtonEventArgument);
                    }
                } // end of button's onClick
            },
            {
                addClass: 'button', text: confirmButtonTitle, onClick: function ($noty) {
                    $noty.close();
                    if (loadingTextDuringProcess.length > 0 && loadingTextDuringProcess !== '') {
                        displayBlockUI(loadingTextDuringProcess);
                    }
                    __doPostBack(postbackEventTarget, postbackEventArgument);
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
} // end of displayConfirmationPopup
function displaySuccessNotyNotification(message, hideDelay) {
    var n = noty({
        text: message,
        layout: 'center', //Scripts/js/noty/layouts/center.js must be present
        theme: 'oasisTheme',
        type: 'success',
        modal: false,
        timeout: hideDelay, // milli-seconds if not false
        template: '<div class="noty_message" ><span class="noty_text" style="font-size:18px;font-weight:400;"></span><div class="noty_close"></div></div>',
        animation: {
            open: { height: 'toggle' },
            close: { height: 'toggle' },
            easing: 'swing',
            speed: 100 // opening & closing animation speed
        }
    });
}
// End of display Successful NOTY notification
function displayErrorNotyNotification(message, hideDelay, showOnlyThis) {
    var n = noty({
        text: message,
        layout: 'center', //Scripts/noty/layouts/center.js must be present
        theme: 'oasisTheme',
        type: 'error',
        modal: false,
        killer: showOnlyThis,
        timeout: hideDelay, // milli-seconds if not false
        template: '<div class="noty_message" ><span class="noty_text" style="font-size:18px;font-weight:400;"></span><div class="noty_close"></div></div>',
        animation: {
            open: { height: 'toggle' },
            close: { height: 'toggle' },
            easing: 'swing',
            speed: 100 // opening & closing animation speed
        }

    });
}
// End of display Error NOTY notification
function displayBottomRightNotyNotification(message, hideDelay) {
    var n = noty({
        text: message,
        layout: 'bottomRight', //Scripts/noty/layouts/bottomRight.js must be present
        theme: 'oasisTheme',
        type: 'success',
        modal: false,
        timeout: hideDelay, // milli-seconds if not false
        template: '<div class="noty_message" ><span class="noty_text" style="font-size:18px;font-weight:400;"></span><div class="noty_close"></div></div>',
        animation: {
            open: { height: 'toggle' },
            close: { height: 'toggle' },
            easing: 'swing',
            speed: 100 // opening & closing animation speed
        }
    });
}

function displayTopRightSuccessNotyNotification(message, hideDelay) {
    var n = noty({
        text: message,
        layout: 'topRight', //Scripts/js/noty/layouts/center.js must be present
        theme: 'oasisTheme',
        type: 'success',
        modal: false,
        timeout: hideDelay, // milli-seconds if not false
        template: '<div class="noty_message" ><span class="noty_text" style="font-size:18px;font-weight:400;"></span><div class="noty_close"></div></div>',
        animation: {
            open: { height: 'toggle' },
            close: { height: 'toggle' },
            easing: 'swing',
            speed: 100 // opening & closing animation speed
        }
    });
}

function displayTopRightNotyNotification(messageType,
    message,
    hideDelay,
    redirectButtonTitle,
    redirectButtonCallback,
    hideButtonTitle,
    hideButtonCallback,
    dismissButtonTitle,
    dismissButtonCallback) {
    var buttons = [];
    if (dismissButtonTitle.length > 0) {
        var dismissButton =
        {
            addClass: 'button cancel',
            text: dismissButtonTitle,
            onClick: function ($noty) {
                $noty.close();
                if (typeof dismissButtonCallback === "function") {
                    dismissButtonCallback();
                }
            } // end of button's onClick
        };
        buttons.push(dismissButton);
    }
    if (hideButtonTitle.length > 0) {
        var hideButton =
        {
            addClass: 'button cancel',
            text: hideButtonTitle,
            onClick: function ($noty) {
                $noty.close();
                if (typeof hideButtonCallback === "function") {
                    hideButtonCallback();
                }
            } // end of button's onClick
        };
        buttons.push(hideButton);
    }
    if (redirectButtonTitle.length > 0) {
        var redirectButton =
        {
            addClass: 'button', text: redirectButtonTitle, onClick: function ($noty) {
                $noty.close();
                if (typeof redirectButtonCallback === "function") {
                    redirectButtonCallback();
                }
            } // end of button's onClick
        };
        buttons.push(redirectButton);
    }

    var n = noty({
        text: message,
        layout: 'topRight', //Scripts/js/noty/layouts/topRight.js must be present
        theme: 'oasisTheme',
        type: messageType,
        modal: false,
        timeout: hideDelay, // milli-seconds if not false
        template: '<div class="noty_message" ><span class="noty_text" style="font-size:18px;font-weight:400;"></span><div class="noty_close"></div></div>',
        animation: {
            open: { height: 'toggle' },
            close: { height: 'toggle' },
            easing: 'swing',
            speed: 200 // opening & closing animation speed
        },
        buttons: buttons,
        closeWith: ['click', 'button', 'hover', 'backdrop']
    });
}// end of displayTopRightInfoNotyNotification
function displayBlockUI(message) {
    $.blockUI({
        message: message,
        css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .7,
            color: '#fff'
        }
    }); // end of blockUI
}
// End of display Block UI

function hideBlockUI() {
    $.unblockUI();
} // End of hide Block UI
// Open VIDEO
function openVideoWindow(href, title) {
    $.fancybox({
        'type': 'iframe',
        'title': title,
        'href': href,
        'width': 750,
        'autoscale': true,
        'autosize': true,
        'scrolling': 'no',
        'auto-dimensions': true,
        'padding': 0,
        'modal': false
    });
} // end of Open VIDEO
function assignImageToFancybox(targetClass, titleType, titlePosition, useOriginalSize) {
    var _customFitToView = true;
    if (typeof useOriginalSize !== 'undefined' && useOriginalSize !== '') {
        _customFitToView = useOriginalSize;
    };
    $("." + targetClass).css('cursor', 'pointer');
    $("." + targetClass).fancybox({
        'title': $(this).prop('title'),
        'href': $(this).prop('href'),
        'type': 'image',    //declaring image is necessary
        'padding': 5,
        'fitToView': _customFitToView,
        arrows: false,
        maxWidth: '100%',//for handling big/tall images on original size
        width: '100%',//for handling big/tall images on original size
        height: 'auto',//for handling big/tall images on original size
        autoSize: false,//for handling big/tall images on original size
        helpers: {
            overlay: {
                locked: false // //for handling big/tall images on original size
            },
            title: {
                type: titleType,
                position: titlePosition
            },
            zoom: {
                maxZoom: 5
            },
            buttons: {
                position: 'bottom',
                skipSingle: true,
                tpl: '<div id="fancybox-buttons"><ul style="width:132px"><li><a class="btnPrev" title="Previous" href="javascript:;"></a></li><li><a class="btnPlay" title="Start slideshow" href="javascript:;"></a></li><li><a class="btnNext" title="Next" href="javascript:;"></a></li><li><a class="btnClose" title="Close" href="javascript:jQuery.fancybox.close();"></a></li></ul></div>'
            }
        },
        afterShow: function () {
            // making sure the buttons on top always 50 pixel ABOVE the wrapper
            var $fancyboxWrapper = $('.fancybox-wrap');
            var position = $fancyboxWrapper.position();
            // wait until buttons are available
            var buttons = setTimeout(function () {
                if ($("#fancybox-buttons.top").length > 0) {
                    $("#fancybox-buttons.top").css('top', position.top - 50);
                }
                if ($("#fancybox-buttons.bottom").length > 0) {
                    var bottomPosition = position.top + $fancyboxWrapper.height();
                    $("#fancybox-buttons.bottom").css('top', bottomPosition + 10);
                }
            }, 10); //setTimeout
        },
        afterLoad: function (current, previous) {
            console.log('fancybox-inner height:' + $("#fancybox-inner").height());
            // $("#fancy_outer").css({ 'width': '500px', 'height': '500px' });
        } // end of afterLoad
    }); // end of fancybox
}// end of assignToImageFancybox

function assignElementsToFancybox(targetElements, titleType, titlePosition, useOriginalSize, enableLoop) {
    var _customFitToView = true;
    if (typeof useOriginalSize !== 'undefined' && useOriginalSize !== '') {
        _customFitToView = useOriginalSize;
    }
    var $targetElements = $(targetElements);
    $targetElements.css('cursor', 'pointer');
    //Set the click handler of the element
    $targetElements.click(function () {
        var clickIndex = 0;//default index is 0
        var $this = $(this);
        //Create gallery object with its own customization (including zoom helper when the object is image)
        var groupName = $this.data("fancyboxGroup");
        var galleryList = [];
        if (groupName) {
            //Have group, filter to the group
            var $groupElements = $targetElements.filter("[data-fancybox-group='" + groupName + "']");
            clickIndex = $groupElements.index(this);//get the button index within the group to determine gallery start
            $groupElements.each(function (index) {
                var $groupEle = $(this);
                var galleryItem = {
                    title: $groupEle.data("fancyboxTitle"),
                    href: $groupEle.data("fancyboxHref"),
                    type: $groupEle.data("fancyboxType")
                };
                if (galleryItem.type === 'image') {
                    galleryItem.helpers = {
                        zoom: { maxZoom: 5 }
                    };
                }
                galleryList.push(galleryItem);
            });
        } else {
            //No Group, just use 1st element
            var galleryItem = {
                title: $this.data("fancyboxTitle"),
                href: $this.data("fancyboxHref"),
                type: $this.data("fancyboxType")
            };
            if (galleryItem.type === 'image') {
                galleryItem.helpers = {
                    zoom: { maxZoom: 5 }
                };
            }
            galleryList.push(galleryItem);
        }

        //Open the fancybox with gallery list object
        $.fancybox.open(galleryList, {
            index: clickIndex,
            padding: 5,
            fitToView: _customFitToView,
            arrows: false,
            maxWidth: '100%',//for handling big/tall images on original size
            width: '100%',//for handling big/tall images on original size
            height: 'auto',//for handling big/tall images on original size
            autoSize: false,//for handling big/tall images on original size
            loop: enableLoop,
            helpers: {
                overlay: {
                    locked: false // //for handling big/tall images on original size
                },
                title: {
                    type: titleType,
                    position: titlePosition
                },
                buttons: {
                    position: 'bottom',
                    skipSingle: true,
                    tpl: '<div id="fancybox-buttons"><ul style="width:132px"><li><a class="btnPrev" title="Previous" href="javascript:;"></a></li><li><a class="btnPlay" title="Start slideshow" href="javascript:;"></a></li><li><a class="btnNext" title="Next" href="javascript:;"></a></li><li><a class="btnClose" title="Close" href="javascript:jQuery.fancybox.close();"></a></li></ul></div>'
                }
            },
            beforeShow: function () {
                var $fancyboxWrapper = $('.fancybox-wrap');
                var position = $fancyboxWrapper.position();
                // wait until buttons are available
                // be CAREFUL not to overlap with zoom / close buttons.
                // test on multiple screen sizes.
                var buttons = setTimeout(function () {
                    if ($("#fancybox-buttons.top").length > 0) {
                        $fancyboxWrapper.css('margin-top', '35px'); // switch class to top.     
                        $("#fancybox-buttons.top").css('top', '8px');// give some space
                    }
                }, 10); //setTimeout
            }, // end of beforeShow
            afterShow: function () {
                var $fancyboxWrapper = $('.fancybox-wrap');
                var position = $fancyboxWrapper.position();
                // wait until buttons are available
                // be CAREFUL not to overlap with zoom / close buttons.
                // test on multiple screen sizes.
                var buttons = setTimeout(function () {
                    if ($("#fancybox-buttons.top").length > 0) {
                        $fancyboxWrapper.css('margin-top', '35px'); // switch class to top.
                        $("#fancybox-buttons.top").css('top', '8px');// give some space
                    }
                    if ($("#fancybox-buttons.bottom").length > 0) {
                        var bottomPosition = $fancyboxWrapper.height() + 10;
                        // var bottomPosition = position.top + $fancyboxWrapper.height() + 10;
                        var fancyboxInnerHeight = $('.fancybox-inner').height();
                        var windowHeight = $(window.top).height();
                        var spareHeight = windowHeight - fancyboxInnerHeight;
                        if ((bottomPosition > fancyboxInnerHeight) && (spareHeight < 100)) {
                            // if there is no more vertical space to put the navigation buttons, we will put the navigation on top.
                            // Placing on bottom won't make the navigation showed up.
                            $("#fancybox-buttons").switchClass('bottom', 'top'); // switch class to top.
                            $fancyboxWrapper.css('margin-top', '35px'); // switch class to top.
                        } else {
                            var topPopupPosition = position.top;
                            // $("#fancybox-buttons.bottom").css('top', topPopupPosition + $fancyboxWrapper.height()); // trouble when there is tall image among wide images.
                            $("#fancybox-buttons.bottom").css('bottom', '16px'); // fixed to 16px from bottom of screen
                        }
                    }
                }, 10); //setTimeout
            } // end of afterShow
        });

        return false;
    });
    // end of fancybox

}// end of assignToImageFancybox

// Rich Text box
function removeTinyMCE(targetSelector) {
    tinyMCE.remove(targetSelector); // tinmyMCE removal subroutine
    var $selectorTextBoxes = $(targetSelector);
    if ($selectorTextBoxes !== null) {
        // We need to return the original character that we escape(>, <, &, and "")
        $selectorTextBoxes.each(function () {
            var textValue = $(this).val();
            if (textValue !== null) {
                textValue = textValue.replace(/(&lt;)/g, '<').replace(/(&gt;)/g, '>').replace(/&amp;/g, '&').replace(/(&quot;)/g, '"');
                $(this).val(textValue);
            } // end of textValue null condition
        });
    } // end of $selectorTextBoxes null condition
} // end of removeTinyMCE
function switchToNormalText(textboxID) {
    removeTinyMCE('#' + textboxID);
}

function HTMLDecode(originalText) {
    return $('<div></div>').html(originalText).text();
}
function stripHTML(originalText) {
    return $("<div/>").html(originalText).text();
}

// function to open new window or redirect within the same window based on chkOpenInNewWindow status
function openQuestion(href, windowName, openInNewWindowClientID) {
    if (openInNewWindowClientID === '') {
        href = href.replace("BAREBONE_MODE", "1"); //so destination URL can act accordingly
        newWindow = window.open(href, windowName, 'directories=no,toolbar=no,location=no,scrollbars=yes,resizable=yes');
        newWindow.focus();
    } else {
        var openQuestionInNewWindow = $('#' + openInNewWindowClientID).is(':checked');
        if (openQuestionInNewWindow) {
            href = href.replace("BAREBONE_MODE", "1"); //so destination URL can act accordingly
            newWindow = window.open(href, windowName, 'directories=no,toolbar=no,location=no,scrollbars=yes,resizable=yes');
            newWindow.focus();
        } else {
            href = href.replace("BAREBONE_MODE", "0"); //so destination URL can act accordingly
            newWindow = window.open(href, '_self');
            newWindow.focus();
        }
    }
} // end of openQuestion function
function openPopup(href, title, width, afterClose) {
    $.fancybox({
        'type': 'iframe',
        'title': title,
        'href': href,
        'width': width,
        'autoscale': false,
        'autosize': false,
        'scrolling': 'no',
        'auto-dimensions': false,
        'padding': 0,
        'modal': false,
        'openSpeed': 5,
        'closeSpeed ': 5,
        'afterClose': afterClose
    });
} // end of openPopup

function makeCheckboxToggle(ClientID, OnText, OffText, OnStyle, OffStyle, Width, Height, disabledState) {
    $('#' + ClientID).bootstrapToggle({
        'on': OnText,
        'off': OffText,
        'onstyle': OnStyle,
        'offstyle': OffStyle,
        'width': Width,
        'height': Height
    });
    if (disabledState) {
        $('#' + ClientID).bootstrapToggle('disable');
    }
}// end of makeCheckboxToggle

function openAudioWindow(href, title) {
    $.fancybox({
        'type': 'iframe',
        'title': title,
        'href': href,
        'width': 600,
        'autoscale': true,
        'autosize': true,
        'scrolling': 'no',
        'auto-dimensions': true,
        'padding': 0,
        'modal': false
    });
}
function openModalPopUp(href, title, width, fitToView) {
    if (fitToView === undefined) {
        fitToView = true;
    }
    $.fancybox({
        'type': 'iframe',
        'title': title,
        'href': href,
        'width': width,
        'autoscale': true,
        'autosize': true,
        'scrolling': 'auto',
        'auto-dimensions': true,
        'padding': 10,
        'modal': true,
        'fitToView': fitToView
    });
} // end of openModalPopUp
function openModalPopUpWithCloseButton(href, title, width, closeButtonFunction) {
    $.fancybox({
        'type': 'iframe',
        'title': title,
        'href': href,
        'width': width,
        'autoscale': true,
        'autosize': true,
        'scrolling': 'auto',
        'auto-dimensions': true,
        'padding': 10,
        'modal': true,
        'showCloseButton': true,
        afterShow: function () {
            $('.fancybox-skin').append('<a title="Close" href="#" class="fancybox-item fancybox-close" onclick="' + closeButtonFunction + '"></a>');
        }
    }
    );
} // end of openModalPopUp
function openNoScrollModalPopUp(href, title, width) {
    //Scrolling will be COMPLETELY disabled even when window is small enough to trigger scrolling
    $.fancybox({
        'type': 'iframe',
        'title': title,
        'href': href,
        'width': width,
        'autoscale': true,
        'autosize': true,
        'scrolling': 'no',
        iframe: {
            scrolling: 'no'
        },
        helpers: {
            overlay: {
                css: { 'overflow': 'hidden' }
            }
        },
        'auto-dimensions': true,
        'padding': 10,
        'modal': true
    });
} // end of openNoScrollModalPopUp

function openPopupWithEventHandler(href, title, width, afterShow, afterClose) {
    $.fancybox({
        'type': 'iframe',
        'title': title,
        'href': href,
        'width': width,
        'autoscale': false,
        'autosize': false,
        'scrolling': 'no',
        'auto-dimensions': false,
        'padding': 0,
        'modal': false,
        'openSpeed': 5,
        'closeSpeed ': 5,
        'afterShow': afterShow,
        'afterClose': afterClose

    });
} // end of openPopup

function closePopUpAndRedirect(href) {
    $.fancybox.close();
    redirectToTargetUrl(href);
}

function redirectToTargetUrl(href, timeoutDelay) {
    if (timeoutDelay !== undefined) {
        window.setTimeout(function () {
            window.location.assign(href);
        }, timeoutDelay);
    } else {
        window.setTimeout(function () {
            window.location.assign(href);
        }, 300);
    }
}
function redirectToParentSelfPage() {
    window.setTimeout(function () {
        window.location.href = parent.location.href;
    }, 300);
}

function redirectToSelfPage() {
    window.setTimeout(function () {
        window.location.href = location.href;
    }, 300);
}

function openImage(href, title, titleType, titlePosition, afterCloseMethodName) {
    $.fancybox({
        'title': title,
        'href': href,
        'type': 'image',    //declaring image is necessary
        'padding': 5,
        arrows: false,
        'afterClose': afterCloseMethodName,
        helpers: {
            title: {
                type: titleType,
                position: titlePosition
            },
            zoom: {
                maxZoom: 5
            },
            buttons: {
                position: 'top',
                skipSingle: true,
                tpl: '<div id="fancybox-buttons"><ul style="width:132px"><li><a class="btnPrev" title="Previous" href="javascript:;"></a></li><li><a class="btnPlay" title="Start slideshow" href="javascript:;"></a></li><li><a class="btnNext" title="Next" href="javascript:;"></a></li><li><a class="btnClose" title="Close" href="javascript:jQuery.fancybox.close();"></a></li></ul></div>'
            }
        }
    });
} // end of openImage

function openAutoSizePopup(href, title, width) {
    $.fancybox({
        type: 'iframe',
        title: title,
        href: href,
        width: width,
        autoSize: false,
        autoHeight: true,
        fitToView: true,
        scrolling: 'auto',
        padding: 10,
        modal: false,
        helpers: {
            overlay: {
                closeClick: false
            }
        }
    });
}


function OnRadEditorClientLoad(editor, args) {
    // fixing auto detect anchor tag when user types <
    editor.executeBrowserCommand("AutoUrlDetect", false, false);
}// end of OnRadEditorClientLoad
var mo_timeoutForQuestionMouseOver;
function questionTitleMouseOver(href) {
    mo_timeoutForQuestionMouseOver = setTimeout(function () {
        displayQuestionPreview(href);
    }, 500);
}
function displayQuestionPreview(href) {
    $.fancybox({
        'type': 'iframe',
        'title': 'Question Preview',
        'href': href,
        'width': 900,
        'autoscale': false,
        'autosize': false,
        'scrolling': 'auto',
        'auto-dimensions': false,
        'padding': 10,
        'modal': false,
        'closeBtn': false,
        'openSpeed': 5,
        'closeSpeed ': 5
    });   // end of $.fancybox
} // end of displayQuestionPreview function
function questionTitleMouseOut() {
    clearTimeout(mo_timeoutForQuestionMouseOver);
    // $.fancybox.close(); //not used because of bubbling (open and close fancybox indefinitely when mouse over)
}
var mo_timeoutForQuestionStatistic;
function questionStatisticMouseOver(href) {
    mo_timeoutForQuestionStatistic = setTimeout(function () {
        displayQuestionStatistic(href);
    }, 500);
}

function displayQuestionStatistic(href) {
    $.fancybox({
        'type': 'iframe',
        'title': 'Item Analysis',
        'href': href,
        'width': 750,
        'autoscale': false,
        'autosize': false,
        'scrolling': 'auto',
        'auto-dimensions': false,
        'padding': 10,
        'modal': false,
        'closeBtn': false,
        'openSpeed': 5,
        'closeSpeed ': 5
    });   // end of $.fancybox
} // end of displayQuestionStatistic function

function questionStatisticMouseOut() {
    clearTimeout(mo_timeoutForQuestionStatistic);
    // $.fancybox.close(); //not used because of bubbling (open and close fancybox indefinitely when mouse over)
}
function assignTooltip(controlClientID, contentText, targetPlacement, wrapOnLineBreakOnly, container) {
    //nov 22, 2016. We do not assign tooltip if the client device supports touch event, because then the first click would be displaying tooltip, not the real click event
    // Dec 7, 2016. wrapOnLineBreakOnly true if the tooltip content is purposely wrapped in line breaks by code. e.g. the question box list on question.aspx.
    if (!isDeviceWithTouchEvent()) {
        var $targetControl = $('#' + controlClientID);
        if (contentText !== '') {
            // we need to add this text to title attribute
            $targetControl.removeProp('title');
            $targetControl.prop('title', contentText);
        } else {
            // use existing title attribute from the control
        }
        if (targetPlacement === null || targetPlacement === undefined || targetPlacement.length === 0) {
            targetPlacement = 'top';
        }
        var _template = '';
        if (wrapOnLineBreakOnly === null || wrapOnLineBreakOnly === true) {
            _template = '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner factor360_tooltip-inner wrapOnLineBreakOnly"></div></div>';
        } else {
            _template = '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner factor360_tooltip-inner"></div></div>';
        }
        $targetControl.tooltip({
            html: true,
            placement: targetPlacement,
            template: _template,
            container: container
        });
    }
}
// a modified function of .NET ValidatorEnable to control when to validate
function customValidatorEnable(validatorElement, enable, doValidation) {
    if (validatorElement !== null) {
        validatorElement.enabled = (enable !== false);
        if (doValidation) {
            ValidatorValidate(validatorElement);
            ValidatorUpdateIsValid();
        }
    }
}

// Circliful circle chart:https://github.com/pguso/jquery-plugin-circliful
//Option	Description	Type	Default
//foregroundColor	color of the foreground circle (no color add value 'none')	RGB or string	#3498DB
//backgroundColor	color of the background circle (no color add value 'none')	RGB or string	#eee
//fillColor	fill color of circle	RGB or string	none
//pointColor	fill color of point circle	RGB or string	none
//pointSize	Size of point circle	int	28.5
//foregroundBorderWidth	width of foreground circle border	int	15
//backgroundBorderWidth	width of background circle border	int	15
//fontColor	color of the percentage	RGB	#aaa
//percent	can be 1 to 100	integer	75
//animation	if the circle should be animated initialy	int	1
//animationStep	can be 1 to 100, how fast or slow the animation should be	int	5
//icon	font awesome icon, details bellow	string	none
//iconSize	font size of the icon	integer	30
//iconColor	color of the icon	RGB	#ccc
//iconPosition	position of the icon (top, bottom, left, right or middle)	string	top
//percentageTextSize	font size of the percentage text	integer	22
//textAdditionalCss	additonal css for the percentage text	string	''
//targetPercent	draws a circle around the main circle	integer	0
//targetTextSize	font size of the target percentage	integer	17
//targetColor	fill color of the target circle	RGB	#2980B9
//text	info text shown bellow the percentage in the circle	string	''
//textStyle	css inline style you wanna add to your info text	string	''
//textColor	font color of the info text	RGB	#666
//textBelow	aligns string of "text" property centered below the circle	boolean	false
//noPercentageSign	to hide the persentage sign	boolean	false
//replacePercentageByText	replace the percentage shown in the circle by text	string	null
//halfCircle	draw half circle see example bellow	boolean	false
//animateInView	animate circle on scroll into view	boolean	false
function generateCircliful(targetContainer,
    foregroundColorValue,
    backgroundColorValue,
    fillColorValue,
    pointColorValue,
    pointSizeValue,
    foregroundBorderWidthValue,
    backgroundBorderWidthValue,
    fontColorValue,
    percentValue,
    animationValue,
    animationStepValue,
    iconValue,
    iconSizeValue,
    iconColorValue,
    iconPositionValue,
    percentageTextSizeValue,
    textAdditionalCssValue,
    targetPercentValue,
    targetTextSizeValue,
    targetColorValue,
    textValue,
    textStyleValue,
    textColorValue,
    textBelowValue,
    noPercentageSignValue,
    replacePercentageByTextValue,
    halfCircleValue,
    animateInViewValue
) {
    // IMPORTANT: we have to convert string empty to null
    var replacePercentageByTextValueJS = null;
    if (replacePercentageByTextValue !== '') {
        replacePercentageByTextValueJS = replacePercentageByTextValue;
    }
    if (typeof $(targetContainer).circliful !== "function") {
        // safe to use the function
        return null;
    }
    $(function () {
        $(targetContainer).empty().removeData().circliful({
            foregroundColor: foregroundColorValue,
            backgroundColor: backgroundColorValue,
            fillColor: fillColorValue,
            pointColor: pointColorValue,
            pointSize: pointSizeValue,
            foregroundBorderWidth: foregroundBorderWidthValue,
            backgroundBorderWidth: backgroundBorderWidthValue,
            fontColor: fontColorValue,
            percent: percentValue,
            animation: animationValue,
            animationStep: animationStepValue,
            icon: iconValue,
            iconSize: iconSizeValue,
            iconColor: iconColorValue,
            iconPosition: iconPositionValue,
            percentageTextSize: percentageTextSizeValue,
            textAdditionalCss: textAdditionalCssValue,
            targetPercent: targetPercentValue,
            targetTextSize: targetTextSizeValue,
            targetColor: targetColorValue,
            text: textValue,
            textStyle: textStyleValue,
            textColor: textColorValue,
            textBelow: textBelowValue,
            noPercentageSign: noPercentageSignValue,
            replacePercentageByText: replacePercentageByTextValueJS,
            halfCircle: halfCircleValue,
            animateInView: animateInViewValue
        }, function () {
            console.log('circliful loaded with percent value: ' + percentValue);
        }); // end of circliful()
    });
}
// initialize answer option selection by the user
//tdAnswerOptionContentStaticID: It's the tdAnswerOptionContent client ID (td is NOT run on server)
//tdNormativeDataAnswerOptionPercentageStaticID: It's the tdNormativeDataAnswerOptionPercentage client ID (td is NOT run on server)
function questionAnswerOptionListInteractionHandler(answerOptionRadioButtonClassBaseNamingParam,
    answerOptionWrapperClassBaseNamingParam,
    userQuestionID,
    factor360AnswerOptionRadioButtonWrapperClassName,
    factor360AnswerOptionContentWrapperClassName,
    tdAnswerOptionContentClassName,
    tdNormativeDataAnswerOptionPercentageClassName,
    isMultipleSelect) {

    var answerOptionRadioButtonClassName = answerOptionRadioButtonClassBaseNamingParam + userQuestionID;
    var $answerOptionWrappers = $('.' + factor360AnswerOptionRadioButtonWrapperClassName);
    var radios = $('.' + answerOptionRadioButtonClassName + ' input[type="radio"]');
    if (radios !== null) {
        // Not sure why we have this click method when we alraedy have binding action (2)
        //radios.click(function () {
        //    if (!isMultipleSelect) {
        //        radios.removeAttr('checked'); // uncheck all first
        //        radios.prop('checked', false); // failsafe: uncheck all first
        //    }
        //    $(this).prop('checked', true);
        //}); // end of radio click function
        //assign parent div to a answerSelected class if the radio button is selected.
        // we need to get the selected value(s) before we uncheck them
        var currentSelectedSequences = [];
        for (var i = 0, len = radios.length; i < len; i++) {
            var $eachRadioButton = $(radios[i]);
            //we need to style the option wrapper div when an answer is selected
            var wrapperDiv = $eachRadioButton.parent().parent();
            // only apply answerSelected class if radio button is checked and there is no other class used other than answerOptionWrapperClassBaseNaming
            // because we may have wrongAnswer or correctAnswer class on the wrapperDiv
            if (($eachRadioButton.attr('checked') === 'checked') && (wrapperDiv.attr('class').endsWith(answerOptionWrapperClassBaseNamingParam))) {
                wrapperDiv.addClass('answerSelected');// targetted to the div wrapper
                var $answerOptionSequenceLabel = wrapperDiv.find('.answerOptionSequenceLabel');
                currentSelectedSequences.push($answerOptionSequenceLabel.text().replace(/\./g, ""));
            }
        }// end of for each radio button
        console.log('selected user answers: ' + currentSelectedSequences);
        // binding action (1)
        $('.' + factor360AnswerOptionRadioButtonWrapperClassName).on('mouseover', function () {
            var $radioButton = $($(this).find('input'));
            if ($radioButton.attr('disabled') === 'disabled') {
                // what we do here????
            }
        }); // end of factor360AnswerOptionRadioButtonWrapper on hover
        // binding action (2)
        $('.' + factor360AnswerOptionRadioButtonWrapperClassName).on('click', function () {
                        var newSelectedSequences = [];
            // uncheck all first for non-multiple select answer type.
            if (!isMultipleSelect) {
                radios.removeAttr('checked');
                radios.prop('checked', false);
            }
            var $thisRadioButton = $($(this).find('input'));
            // only do this if the radio button is not disabled (system prevents user to select)
            if ($thisRadioButton.attr('disabled') !== 'disabled') {
                if (isMultipleSelect) {
                    newSelectedSequences = currentSelectedSequences;
                    // You can choose more than one answer options per question.
                    // we just need to toggle
                    var targetCheckbox = $(this).find('input');
                    if (targetCheckbox.prop('checked')) {
                        $thisRadioButton.prop('checked', false);
                        $(this).removeClass('answerSelected');
                        var wrapperDiv = $thisRadioButton.parent().parent();
                        //remove from the selected value list
                        var $answerOptionSequenceLabel = wrapperDiv.find('.answerOptionSequenceLabel');
                        var index = newSelectedSequences.indexOf($answerOptionSequenceLabel.text());
                        if (index > -1) {
                            newSelectedSequences.splice(index, 1);
                        }
                    } else {
                        $thisRadioButton.prop('checked', true);
                        $(this).addClass('answerSelected');
                        var wrapperDiv = $thisRadioButton.parent().parent();
                        var $answerOptionSequenceLabel = wrapperDiv.find('.answerOptionSequenceLabel');
                        newSelectedSequences.push($answerOptionSequenceLabel.text().replace(/\./g, ""));
                    }
                } else {
                    // You can only choose one answer per question
                    // remove answerSelected class from ALL parent div wrapper
                    $answerOptionWrappers.removeClass('answerSelected');
                    // check the radio button and make the parent wrapper change its background
                    $thisRadioButton.prop('checked', 'true');
                    $(this).addClass('answerSelected');
                    var wrapperDiv = $thisRadioButton.parent().parent();
                    var $answerOptionSequenceLabel = wrapperDiv.find('.answerOptionSequenceLabel');
                    newSelectedSequences.push($answerOptionSequenceLabel.text().replace(/\./g, ""));
                }
                // we need to call parent function as well
                if (typeof enableLearningModeUnsavedChangeConfirmation === 'function') {
                    // we call function from parent
                    enableLearningModeUnsavedChangeConfirmation();
                }
                // Aug 8, 2018. we need to warn learner about answer change. Only answer change. Not applicable when learner has not answered.
                var selectedChanged = $(newSelectedSequences).not(currentSelectedSequences).get();
                if (selectedChanged.length > 0 && currentSelectedSequences.length > 0) {
                    // Dec 5, 2022. log the answer change.
                    var postData = new Object();
                    postData.UserQuestionID = userQuestionID;
                    postData.CurrentSelectedSequences = currentSelectedSequences.toString();
                    postData.NewSelectedSequences = selectedChanged.toString();
                    $.ajax({
                        type: 'POST',
                        url: '/Webservices/QuestionServices.asmx/AuditUserQuestionAnswerChanged',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        data: JSON.stringify(postData),
                        success: function (data) {
                            var rtnMessage = data.d;
                            if (rtnMessage.IsSuccessful) {
                               // do nothing
                            }
                            else {
                                displayErrorNotyNotification(rtnMessage.SystemMessage, 2500);
                               
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            displayErrorNotyNotification('Unable to reach server, please reload this page to see saved data', 2500);
                                                    }
                    });
                    if (typeof enableExaminationModeUnsavedChangeConfirmation === 'function') {
                        // we call function from _question_navigation
                        enableExaminationModeUnsavedChangeConfirmation(currentSelectedSequences, newSelectedSequences);
                    }
                } else {
                    if (typeof disableExaminationModeUnsavedChangeConfirmation === 'function') {
                        // we call function from parent
                        disableExaminationModeUnsavedChangeConfirmation();
                    }
                    //Nov 1, 2022. Maybe we forget to disable the learning mode?? https://app.asana.com/0/218888662811289/1203062189802843
                    if (typeof disableLearningModeUnsavedChangeConfirmation === 'function') {
                        // we call function from parent
                        disableLearningModeUnsavedChangeConfirmation();
                    }
                }
            } else {
                //alert('answer option is disabled');
            }
        });// end of factor360AnswerOptionRadioButtonWrapper on click

    } else {
        // ignore
        alert('radion button list is null');
    }// end of radios is not null check
    // hide normative % column if there is nothing to show. This gives answer option content a bit of wider space
    var answerOptionContentWrappers = $('.' + factor360AnswerOptionContentWrapperClassName);
    if (answerOptionContentWrappers.length > 0) {
        for (i = 0; i < answerOptionContentWrappers.length; i++) {
            var $divanswerOptionContentWrapper = $(answerOptionContentWrappers[i]);
            var $tdAnswerOptionContent = $($divanswerOptionContentWrapper.find('.' + tdAnswerOptionContentClassName));
            var $tdNormativeDataAnswerOptionPercentage = $($divanswerOptionContentWrapper.find('.' + tdNormativeDataAnswerOptionPercentageClassName));
            if ($tdNormativeDataAnswerOptionPercentage.html().trim() === '') {
                $tdAnswerOptionContent.css('width', '90%');
            } else {
                $tdAnswerOptionContent.css('width', '80%');
            }
        }
    }
} // end of function
// Detecting if client uses device that supports touch
function isDeviceWithTouchEvent() {
    try { document.createEvent("TouchEvent"); return true; }
    catch (e) { return false; }
}
// End of Detecting if client uses device that supports touch
// Forcing checkbox to postback. Usually used when checkbox is modified as bootstrap toggle
function doCheckboxPostback(sender) {
    var uniqueID = $(sender).find(":checkbox").prop('name');
    setTimeout(function () {
        __doPostBack(uniqueID, '');
    }, 100);
} // end of doCheckboxPostback


function matchPanelHeightForPanels(panelClassName) {
    //Possible be removed. we can use SemanticUI's cards to do this
    $('.' + panelClassName).matchHeight();// supposed to make all panels in one row have the same height
} // end of matchPanelHeightForPanels

function displayRateYoRating(targetElementClientID, targetRating, maxRating) {
    // http://rateyo.fundoocode.ninja/#
    $('#' + targetElementClientID).rateYo({
        rating: targetRating,
        numStars: maxRating,
        readOnly: true,
        starWidth: "18px"
    });
} // end of displayRateYoRating
function closePopupAndNavigateToUrl(urlToNavigate) {
    $.fancybox.close();

    setTimeout(function () {
        window.location.assign(urlToNavigate);
    }, 300);
}// end of closePopupAndNavigateToUrl
function toggleCourseAsFavorite(caller, encryptedLearningActivityID, encryptedUserID, favoriteCountControlClass) {
    var postData = new Object();
    postData.EncryptedLearningActivityID = encryptedLearningActivityID;
    postData.EncryptedUserID = encryptedUserID;
    $.ajax({
        type: "POST",
        url: '/Webservices/ActivityService.asmx/ToggleFavoriteLearningActivity',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        success: function (data) {
            var rtnMessage = data.d;
            if (rtnMessage.IsSuccessful) {
                // we need to toggle the styling. empty <-> red
                var $caller = $(caller);
                var $favoriteCountControl = $('.' + favoriteCountControlClass);
                if ($caller.hasClass("glyphicon glyphicon-heart")) {
                    $caller.removeClass("glyphicon glyphicon-heart");
                    $caller.removeClass("factor360LearningActivityCatalogItem_favorite favorited");
                    $caller.addClass("glyphicon glyphicon-heart-empty");
                    $caller.addClass("factor360LearningActivityCatalogItem_favorite notFavorited");
                    if ($favoriteCountControl !== undefined && $favoriteCountControl.length > 0) {
                        var previousCount = parseInt($favoriteCountControl.text());
                        $favoriteCountControl.text(previousCount - 1);
                    }
                } else {
                    $caller.removeClass("glyphicon glyphicon-heart-empty");
                    $caller.removeClass("factor360LearningActivityCatalogItem_favorite notFavorited");
                    $caller.addClass("glyphicon glyphicon-heart");
                    $caller.addClass("factor360LearningActivityCatalogItem_favorite favorited");
                    if ($favoriteCountControl !== undefined && $favoriteCountControl.length > 0) {
                        var previousCount = parseInt($favoriteCountControl.text());
                        $favoriteCountControl.text(previousCount + 1);
                    }
                }
                displaySuccessNotyNotification(rtnMessage.SystemMessage, 1500);
            } else {
                displayErrorNotyNotification(rtnMessage.SystemMessage, 3500);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            displayErrorNotyNotification('Unable to reach server, please reload this page', 2500);
        }
    });
}
function copyTextToClipboard(elementId) {
    /* Get the text field */
    var copyText = document.getElementById(elementId);
    /* Select the text field */
    copyText.select();
    /* Copy the text inside the text field */
    document.execCommand("copy");
    /* Alert the copied text */
    displaySuccessNotyNotification("Copied", 1500);
}// end of copyTextToClipboard


function copyLabelToClipboard(elementId) {
    /* Get the text field */
    var copyText = document.getElementById(elementId);
    console.log(copyText)
    /* Select the text field */
    var sampleTextarea = document.createElement("textarea");
    document.body.appendChild(sampleTextarea)
    sampleTextarea.value = copyText.innerText; //save main text in it    
    sampleTextarea.select(); //select textarea contenrs
    /* Copy the text inside the text field */
    document.execCommand("copy");
    document.body.removeChild(sampleTextarea);
    /* Alert the copied text */
    displaySuccessNotyNotification("Copied", 1500);
}// end of copyTextToClipboard

function changeTabTitle(newTitle) {
    document.title = newTitle;
}// end of changeTabTitle
function recordUserBrowserAsUserAudit(extraMessage, pageUrl) {
    var postData = new Object();
    postData.ExtraMessage = extraMessage;
    postData.PageUrl = pageUrl;
    $.ajax({
        type: "POST",
        url: '/Webservices/ClientServices.asmx/RecordUserBrowserAsUserAudit',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        success: function (data) {
            console.log('recordUserBrowserAsUserAudit SUCCESS');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('recordUserBrowserAsUserAudit ERROR');
        }
    });
}// end of recordUserBrowserAsUserAudit
function dismissSystemNotificationBubble(systemNotificationId) {
    var postData = new Object();
    postData.SystemNotificationID = systemNotificationId;
    $.ajax({
        type: 'POST',
        url: '/Webservices/ClientServices.asmx/DismissSystemNotificationBubble',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(postData),
        success: function (data) {
            // nothing is returned from dismissSystemNotificationBubble
        },
        error: function (jqXHR, textStatus, errorThrown) {
            displayErrorNotyNotification('Unable to reach server, please reload this page to see saved data', 2500);
        }
    });// end of ajax
}//dismissSystemNotificationBubble
function hideBubbleNotification(bubbleId) {
    var postData = new Object();
    postData.BubbleID = bubbleId;
    postData.Show = false;
    $.ajax({
        type: 'POST',
        url: '/Webservices/ClientServices.asmx/ToggleThisBubble',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(postData),
        success: function (data) {
            // nothing is returned from ToggleThisBubble
        },
        error: function (jqXHR, textStatus, errorThrown) {
            displayErrorNotyNotification('Unable to reach server, please reload this page to see saved data', 2500);
        }
    });// end of ajax
} // end of hideBubbleNotification
function hideAllBubbleNotifications() {
    var postData = new Object();
    $.ajax({
        type: 'POST',
        url: '/Webservices/ClientServices.asmx/HideAllBubbleNotifications',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(postData),
        success: function (data) {
            // nothing is returned. close all noty.
            $.noty.closeAll();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            displayErrorNotyNotification('Unable to reach server, please reload this page to see saved data', 2500);
        }
    });// end of ajax
} // end of hideAllBubbleNotifications
function formatElapsedTime(seconds) {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60
    return [hours, minutes, seconds % 60].map(format).join(':')
}// end of formatElapsedTime
function openNewTab(targetUrl) {
    window.open(targetUrl);
}
function toggleElementInFullscreen(elementId) {
    if (!document.fullscreenElement) {
        // make it full screen
        var elementToBeFullScreen = document.getElementById(elementId);
        if (elementToBeFullScreen.requestFullscreen) {
            elementToBeFullScreen.requestFullscreen();
        } else if (elementToBeFullScreen.webkitRequestFullscreen) { /* Safari */
            elementToBeFullScreen.webkitRequestFullscreen();
        } else if (elementToBeFullScreen.msRequestFullscreen) { /* IE11 */
            elementToBeFullScreen.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

function copyToClipboard(text) {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if the element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a
    // flash, so some of these are just precautions. However in
    // Internet Explorer the element is visible whilst the popup
    // box asking the user for permission for the web page to
    // copy to the clipboard.
    //

    // Place in the top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of the white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
        // Say something so user know it is in his clipboard
        displaySuccessNotyNotification('Copied to Clipboard', 1000);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}
function viewLinkAssetAndRecord(learningActivityAssetId,
    userLearningActivityId,
    url, reloadAfterSuccessfulAjaxCall) {
    window.open(url, '_blank');
    if (userLearningActivityId !== null && userLearningActivityId !== "") {
        var postData = new Object();
        postData.LearningActivityAssetID = learningActivityAssetId;
        postData.UserLearningActivityID = userLearningActivityId;
        $.ajax({
            type: 'POST',
            url: '/Webservices/ActivityService.asmx/ViewedLinkAssetCallback',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(postData),
            success: function (data) {
                console.log('ViewedLinkAssetCallback OK');
                var rtnMessage = data.d;
                if (rtnMessage.IsSuccessful) {
                    if (reloadAfterSuccessfulAjaxCall) {
                        redirectToSelfPage();
                    }
                } else {
                    displayErrorNotyNotification(rtnMessage.SystemMessage, 5000);
                }
            },
            failure: function (data) {
                var rtnMessage = data.d;
                displayErrorNotyNotification(rtnMessage.SystemMessage, 5000);
            }
        });
    } else {
        window.open(url, '_blank');
    }
}


function OpenInNewTab(URL) {
    window.open(URL, '_blank');
}

function downloadFileUsingiFrame(downloadUrl) {
    var downloadUrls = new Array();
    downloadUrls.push(downloadUrl);
    downloadFilesUsingiFrame(downloadUrls);

} // end of downloadFileUsingiFrame
function downloadFilesUsingiFrame(downloadUrls) {
    var arrayLength = downloadUrls.length;
    for (var i = 0; i < arrayLength; i++) {
        // Create an iframe.
        var iframe = document.createElement("iframe");

        // Point the iframe to the location of
        //  the long running process.
        iframe.src = downloadUrls[i];

        // Make the iframe invisible.
        iframe.style.display = "none";

        // Add the iframe to the DOM.  The process
        //  will begin execution at this point.
        document.body.appendChild(iframe);
    }
} // end of downloadFileUsingiFrame
function assignCurrentBrowserTabID(uniqueID) {
    if (window.sessionStorage.getItem('Factor360CurrentBrowserTabID') == undefined) {
        window.sessionStorage.setItem('Factor360CurrentBrowserTabID', uniqueID);
    }
}
function getCurrentBrowserTabID() {
    return window.sessionStorage.getItem('Factor360CurrentBrowserTabID');
}
function cancelNewLine(sender, eventArgs) {//used in telerik radtextbox
    var c = eventArgs.get_keyCode();
    if (c == 13) {
        //prevent the Enter key execution
        eventArgs.set_cancel(true);
    }
}