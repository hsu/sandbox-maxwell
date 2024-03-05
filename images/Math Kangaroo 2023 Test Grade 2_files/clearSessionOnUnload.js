

// Somehow when we need to pass in parameter, it's not working
function listenBeforeUnloadToClearSession(sessionKey, optionalPostBackFlagHiddenFieldClientID) {

    window.addEventListener("beforeunload", function (event) {
        console.log('before unload called from listenBeforeUnloadToClearSession');
        if (optionalPostBackFlagHiddenFieldClientID !== undefined) {
            if ($('#' + optionalPostBackFlagHiddenFieldClientID).val() == 'True') {
                return;
            }
        }
        var postData = new Object();
        postData.SessionKey = sessionKey;
        if (typeof navigator.sendBeacon === 'function') {
            //Support beacon api, use it (note we cannot use application/json with beacon api for chrome, so we will send it as text/plain and have server parse it)
            console.log('Supports beacon api. Calls ClearSessionData.');
            var _blobData = new Blob([JSON.stringify(postData)], { type: 'text/plain;charset=UTF-8' });
            navigator.sendBeacon('/WebServices/ActivityService.asmx/ClearSessionData', _blobData);
            console.log('sendBeacon:ClearSessionData done');
        } else {
            //Did not support beacon api ( this must be old browsers), use synchronous ajax (which still supported by old browsers)   
            console.log('Does not support beacon api. Calls ClearSessionData using ajax.');
            $.ajax({
                type: 'POST',
                url: '/WebServices/ActivityService.asmx/ClearSessionData',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(postData),
                async: false
            });
        } // end of beacon check
    });
} // end of listenBeforeUnloadToClearSession

//function listenBeforeUnloadToClearSession(sessionKey) {
//    // using lifecycle.es5.js 
//    lifecycle.addEventListener('statechange', function (event) {
//        if (event.newState === 'terminated') {
//            console.log('[lifecycle.js] STATE IS TERMINATED');
//            console.log('lifecycle statechange: terminated called from clearSessionOnUnload');
//            var postData = new Object();
//            postData.SessionKey = sessionKey;
//            console.log('PostData: ' + JSON.stringify(postData));
//                     if (typeof navigator.sendBeacon === 'function') {
//                //Support beacon api, use it (note we cannot use application/json with beacon api for chrome, so we will send it as text/plain and have server parse it)
//                console.log('Supports beacon api. Calls ClearSessionData.');
//                var _blobData = new Blob([JSON.stringify(postData)], { type: 'text/plain;charset=UTF-8' });
//                navigator.sendBeacon('/WebServices/ActivityService.asmx/ClearSessionData', _blobData);
//                console.log('sendBeacon:ClearSessionData done');  
//            } else {
//                //Did not support beacon api ( this must be old browsers), use synchronous ajax (which still supported by old browsers)   
//                console.log('Does not support beacon api. Calls ClearSessionData using ajax.');
//                $.ajax({
//                    type: 'POST',
//                    url: '/WebServices/ActivityService.asmx/ClearSessionData',
//                    contentType: "application/json; charset=utf-8",
//                    dataType: "json",
//                    data: JSON.stringify(postData),
//                    async: false
//                });
//            } // end of beacon check         
//        }
//    });
//} // end of listenBeforeUnloadToClearSession