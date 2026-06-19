import { H as Hls } from "./hls-vendor.js";

export function setupPlayer(options) {
    const player = document.querySelector("[data-player]");

    if (!player || !options || !options.stream) {
        return;
    }

    const video = player.querySelector("video");
    const overlay = player.querySelector("[data-play]");
    let hls = null;
    let prepared = false;

    const prepare = () => {
        if (prepared || !video) {
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(options.stream);
            hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.stream;
        }

        prepared = true;
    };

    const play = () => {
        prepare();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        video.controls = true;
        const request = video.play();

        if (request && typeof request.catch === "function") {
            request.catch(() => {});
        }
    };

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    video.addEventListener("click", () => {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", () => {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
        }
    });
}
