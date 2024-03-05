

//FIX for ImageButton on IE 10 Bug
//Cause:
//IE10 generates the X and Y coordinates for the image button as double values instead of integer values
// and as a result fails to correctly parse them on the postdata call.
// source: http://stackoverflow.com/questions/13299685/ie10-sending-image-button-click-coordinates-with-decimals-floating-point-values/14626909#14626909

$(function () {
    // Patch fractional .x, .y form parameters for IE10.
    if (typeof (Sys) !== 'undefined' && Sys.Browser.agent === Sys.Browser.InternetExplorer && Sys.Browser.version === 10) {
        Sys.WebForms.PageRequestManager.getInstance()._onFormElementActive = function Sys$WebForms$PageRequestManager$_onFormElementActive(element, offsetX, offsetY) {
            if (element.disabled) {
                return;
            }
            this._activeElement = element;
            this._postBackSettings = this._getPostBackSettings(element, element.name);
            if (element.name) {
                var tagName = element.tagName.toUpperCase();
                if (tagName === 'INPUT') {
                    var type = element.type;
                    if (type === 'submit') {
                        this._additionalInput = encodeURIComponent(element.name) + '=' + encodeURIComponent(element.value);
                    }
                    else if (type === 'image') {
                        this._additionalInput = encodeURIComponent(element.name) + '.x=' + Math.floor(offsetX) + '&' + encodeURIComponent(element.name) + '.y=' + Math.floor(offsetY);
                    }
                }
                else if ((tagName === 'BUTTON') && (element.name.length !== 0) && (element.type === 'submit')) {
                    this._additionalInput = encodeURIComponent(element.name) + '=' + encodeURIComponent(element.value);
                }
            }
        };
    }
});
