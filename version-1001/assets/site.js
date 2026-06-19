
(function () {
    var headerSearch = document.querySelector('.header-search-wrap');
    var searchToggle = document.querySelector('.search-toggle');
    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (searchToggle && headerSearch) {
        searchToggle.addEventListener('click', function () {
            headerSearch.classList.toggle('is-open');
            var input = headerSearch.querySelector('input');
            if (headerSearch.classList.contains('is-open') && input) {
                input.focus();
            }
        });
    }

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var activeIndex = 0;
    var heroTimer;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('active', itemIndex === activeIndex);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('active', itemIndex === activeIndex);
        });
    }

    function restartHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5800);
        }
    }

    if (slides.length) {
        showSlide(0);
        restartHero();
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                restartHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                restartHero();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restartHero();
            });
        });
    }

    var filterInput = document.querySelector('.movie-filter-input');
    var selects = Array.prototype.slice.call(document.querySelectorAll('.movie-filter-select'));
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('.movie-filter-item'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!filterItems.length) {
            return;
        }
        var query = normalize(filterInput ? filterInput.value : '');
        var filters = selects.map(function (select) {
            return {
                key: select.getAttribute('data-filter-key'),
                value: normalize(select.value)
            };
        }).filter(function (item) {
            return item.key && item.value;
        });

        filterItems.forEach(function (item) {
            var text = normalize([
                item.getAttribute('data-title'),
                item.getAttribute('data-keywords'),
                item.getAttribute('data-year'),
                item.getAttribute('data-type'),
                item.getAttribute('data-region'),
                item.getAttribute('data-channel')
            ].join(' '));
            var matchedQuery = !query || text.indexOf(query) !== -1;
            var matchedFilters = filters.every(function (filter) {
                return normalize(item.getAttribute('data-' + filter.key)).indexOf(filter.value) !== -1;
            });
            item.classList.toggle('hidden-by-filter', !(matchedQuery && matchedFilters));
        });
    }

    if (filterInput || selects.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && filterInput) {
            filterInput.value = initialQuery;
        }
        if (filterInput) {
            filterInput.addEventListener('input', applyFilters);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });
        applyFilters();
    }
})();
