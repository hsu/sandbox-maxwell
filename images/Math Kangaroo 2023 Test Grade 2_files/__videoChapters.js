function goToVideoTimePoint(containerId, timePointInSeconds, playlistIndex) {
    jwplayer(containerId).seek(timePointInSeconds);
}