document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-year]').forEach(function (node) {
    node.textContent = new Date().getFullYear();
  });
  document.querySelectorAll('.announcement').forEach(function (banner) {
    if (banner.querySelector('.announcement-close')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'announcement-close';
    button.textContent = 'Close';
    button.addEventListener('click', function () {
      banner.classList.add('hide');
    });
    banner.appendChild(button);
  });
  var revealTargets = Array.prototype.slice.call(document.querySelectorAll('.hero, .section'));
  var makeVisible = function () {
    revealTargets.forEach(function (el) {
      if (el.classList.contains('visible')) return;
      if (el.getBoundingClientRect().top < window.innerHeight - 80) {
        el.classList.add('visible');
      }
    });
  };
  revealTargets.forEach(function (el, index) {
    el.classList.add('reveal');
    var delay = (index % 5) * 0.12;
    el.style.setProperty('--reveal-delay', delay + 's');
  });
  window.addEventListener('scroll', makeVisible);
  window.addEventListener('resize', makeVisible);
  makeVisible();
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    var toggle = function () {
      if (window.scrollY > 240) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', toggle);
    toggle();
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
