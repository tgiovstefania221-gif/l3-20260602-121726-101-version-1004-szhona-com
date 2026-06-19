document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-site-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function activate(index) {
      activeIndex = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }
  }

  var textInput = document.querySelector("[data-filter-input]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var categorySelect = document.querySelector("[data-filter-category-select]");
  var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var selectedCategory = "all";

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    var keyword = normalize(textInput ? textInput.value : "");
    var year = yearSelect ? yearSelect.value : "all";
    var region = regionSelect ? regionSelect.value : "all";
    var category = categorySelect ? categorySelect.value : selectedCategory;

    cards.forEach(function (card) {
      var searchable = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.category,
        card.textContent
      ].join(" "));
      var matchedKeyword = !keyword || searchable.indexOf(keyword) !== -1;
      var matchedYear = year === "all" || card.dataset.year === year;
      var matchedRegion = region === "all" || card.dataset.region === region;
      var matchedCategory = category === "all" || card.dataset.category === category;
      card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear && matchedRegion && matchedCategory));
    });
  }

  if (textInput) {
    textInput.addEventListener("input", applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", applyFilters);
  }

  if (regionSelect) {
    regionSelect.addEventListener("change", applyFilters);
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", applyFilters);
  }

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedCategory = button.dataset.filterCategory || "all";
      categoryButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applyFilters();
    });
  });
});
