//https://demos.jwplayer.com/add-download-button/
// still not working. This is supposed to be used in custom jwplayer button, but issue is this method is always triggered after page load.
// for now, the download will be constructed in GenerateJWPlayerScript()
//function downloadMediaFromJWPlayer(playerInstanceId) {
//    const playlistItem = jwplayer(playerInstanceId).getPlaylistItem();
//    // Create an anchor element
//    const anchor = document.createElement('a');
//    // Set the anchor's `href` attribute to the media's file URL
//    const fileUrl = playlistItem.file;    anchor.setAttribute('href', fileUrl);

//    // set the anchor's `download` attribute to the media's file name
//    const downloadName = playlistItem.file.split('/').pop();
//    anchor.setAttribute('download', downloadName);
//    // Set the anchor's style to hide it when it's added to the page
//    anchor.style.display = 'none';
//    // Add the anchor to the page
//    document.body.appendChild(anchor);
//    // Trigger a click event to activate the anchor
//    anchor.click();
//    // Remove the anchor from the page, it's not needed anymore
//    document.body.removeChild(anchor);
//}