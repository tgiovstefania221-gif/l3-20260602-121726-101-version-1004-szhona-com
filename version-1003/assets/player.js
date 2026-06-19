import { H as Hls } from "./hls.js";

document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var stream = player.getAttribute("data-stream");
    var hls = null;
    var ready = false;

    function attachStream() {
      if (!video || !stream || ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function start() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        video.play().catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }
  });
});
