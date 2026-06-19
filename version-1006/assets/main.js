(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var header = document.querySelector(".site-header");
    if (!button || !header) {
      return;
    }
    button.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-target")) || 0);
        restart();
      });
    });

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    restart();
  }

  function setupCategoryFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    var list = document.querySelector("[data-filter-list]");
    if (!scope || !list) {
      return;
    }

    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-filter-year]");
    var genre = scope.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function filter() {
      var q = (input && input.value || "").trim().toLowerCase();
      var y = year && year.value || "";
      var g = (genre && genre.value || "").trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" ").toLowerCase();
        var matchQuery = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || card.getAttribute("data-year") === y;
        var matchGenre = !g || (card.getAttribute("data-genre") || "").toLowerCase().indexOf(g) !== -1;
        card.classList.toggle("is-filter-hidden", !(matchQuery && matchYear && matchGenre));
      });
    }

    [input, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filter);
        control.addEventListener("change", filter);
      }
    });
  }

  function setupPlayer() {
    var shell = document.querySelector(".player-shell[data-video-url]");
    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-overlay");
    var source = shell.getAttribute("data-video-url");
    var initialized = false;

    function attachSource() {
      if (initialized || !video || !source) {
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 && button) {
        button.classList.remove("is-hidden");
      }
    });
  }

  function setupSearchPage() {
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var summary = document.getElementById("searchSummary");
    if (!input || !results || !summary || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function makeCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + movie.url + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy" onerror="this.onerror=null;this.src=\'assets/cover-fallback.svg\';">',
        '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <a class="movie-card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
        '    <div class="movie-meta-line"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
        '    <p>' + escapeHtml(movie.one_line) + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function run() {
      var q = input.value.trim().toLowerCase();
      var pool = window.MOVIE_SEARCH_INDEX;
      var matches = q ? pool.filter(function (movie) {
        return movie.search.indexOf(q) !== -1;
      }) : pool.slice(0, 80);

      summary.textContent = q ? '找到 ' + matches.length + ' 个与“' + input.value.trim() + '”相关的影片。' : '展示最近入库的 80 部影片，可输入关键词继续筛选。';
      results.innerHTML = matches.slice(0, 120).map(makeCard).join('');
    }

    input.addEventListener("input", run);
    run();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupCategoryFilters();
    setupPlayer();
    setupSearchPage();
  });
})();
