function checkJWPlayerPlayPromise(playerId, playlistIndex, muteFirst) {
    if (playlistIndex > 0) {
        jwplayer(playerId).playlistItem(playlistIndex);
    }
    var videoElement = jwplayer(playerId).getContainer().getElementsByTagName('video')[0];
    // browser restriction for autoplay to work, we need to mute it.
    if (muteFirst !== undefined) {
        videoElement.muted = true;
    }
    var originalPlayPromise = videoElement.play();
    originalPlayPromise.then(function (e) {
        console.log('video play permission is fulfilled. ' + e);
        }, function (error) {
        console.log('video play permission is not fulfilled. ' + error);
                jwplayer(playerId).play(false);//we don't use stop() because it really stop the player for autoplay the next video. and pause() simply does not work probably because the state is still buffering.
    }).catch(function (error) {
        console.log('video play permission error out. ' + error);
        jwplayer(playerId).play(false);
    });
} // end of checkJWPlayerPlayPromise