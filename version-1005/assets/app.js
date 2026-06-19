(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mainNav');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterForms = document.querySelectorAll('[data-filter-root]');
  filterForms.forEach(function (root) {
    var search = root.querySelector('[data-search]');
    var year = root.querySelector('[data-year-filter]');
    var genre = root.querySelector('[data-genre-filter]');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-title]'));
    var empty = root.querySelector('[data-empty]');

    function update() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var g = genre ? genre.value : '';
      var visible = 0;

      items.forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-genre') || '',
          item.getAttribute('data-region') || '',
          item.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var ok = (!q || haystack.indexOf(q) !== -1) && (!y || item.getAttribute('data-year') === y) && (!g || (item.getAttribute('data-genre') || '').indexOf(g) !== -1);
        item.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [search, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });
  });
})();
