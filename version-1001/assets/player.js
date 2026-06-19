
import { H as Hls } from './hls-vendor.js';

(function () {
    var video = document.querySelector('video[data-stream]');
    var overlay = document.querySelector('.play-overlay');
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function showOverlay() {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    }

    function startVideo() {
        var streamUrl = video.getAttribute('data-stream');

        if (!streamUrl) {
            return;
        }

        hideOverlay();

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.getAttribute('src')) {
                video.setAttribute('src', streamUrl);
            }
            video.play().catch(showOverlay);
            return;
        }

        if (Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(showOverlay);
                });
                hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showOverlay();
                    }
                });
                return;
            }
            video.play().catch(showOverlay);
            return;
        }

        video.setAttribute('src', streamUrl);
        video.play().catch(showOverlay);
    }

    if (overlay) {
        overlay.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo();
        }
    });

    video.addEventListener('play', hideOverlay);
})();
