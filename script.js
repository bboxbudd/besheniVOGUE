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
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu')

    hamburger.addEventListener('click', (e) => {
        mobileMenu.classList.add('active');
    })

    closeMenu.addEventListener('click', (e) => {
        e.preventDefault();
        mobileMenu.classList.remove('active'); 
    })

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    })
})
document.addEventListener('DOMContentLoaded', function () {
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.fullscreen-btn'));
  if (!buttons.length) return;
  var enterFullscreen = function (el) {
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
    if (el.msRequestFullscreen) return el.msRequestFullscreen();
  };
  buttons.forEach(function (btn) {
    var video = btn.previousElementSibling;
    if (!video || !video.classList.contains('show-video')) return;
    video.muted = true;
    btn.addEventListener('click', function () {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        return;
      }
      enterFullscreen(video);
    });
  });
});
document.addEventListener('DOMContentLoaded', function () {
  var containers = Array.prototype.slice.call(document.querySelectorAll('.images-container'));
  if (!containers.length) return;
  containers.forEach(function (wrap) {
    var gallery = wrap.querySelector('.images');
    var prev = wrap.querySelector('.scroll-btn.prev');
    var next = wrap.querySelector('.scroll-btn.next');
    if (!gallery || !prev || !next) return;
    
    var images = Array.prototype.slice.call(gallery.querySelectorAll('img'));
    if (images.length < 2) return;
    
    var firstImg = images[0].cloneNode(true);
    var lastImg = images[images.length - 1].cloneNode(true);
    gallery.insertBefore(lastImg, images[0]);
    gallery.appendChild(firstImg);
    
    var scrolling = false;
    var amount = function () {
      return Math.max(gallery.clientWidth * 0.8, 200);
    };
    
    var scrollToReal = function () {
      if (scrolling) return;
      scrolling = true;
      var scrollLeft = gallery.scrollLeft;
      var scrollWidth = gallery.scrollWidth;
      var clientWidth = gallery.clientWidth;
      var firstImgWidth = lastImg.offsetWidth;
      var lastImgWidth = firstImg.offsetWidth;
      
      if (scrollLeft < firstImgWidth) {
        gallery.scrollTo({ left: scrollWidth - clientWidth - lastImgWidth, behavior: 'auto' });
      } else if (scrollLeft > scrollWidth - clientWidth - lastImgWidth) {
        gallery.scrollTo({ left: firstImgWidth, behavior: 'auto' });
      }
      scrolling = false;
    };
    
    prev.addEventListener('click', function () {
      var currentScroll = gallery.scrollLeft;
      var firstImgWidth = lastImg.offsetWidth;
      if (currentScroll <= firstImgWidth + 10) {
        gallery.scrollLeft = gallery.scrollWidth - gallery.clientWidth;
      }
      gallery.scrollBy({ left: -amount(), behavior: 'smooth' });
      setTimeout(scrollToReal, 300);
    });
    
    next.addEventListener('click', function () {
      var currentScroll = gallery.scrollLeft;
      var scrollWidth = gallery.scrollWidth;
      var clientWidth = gallery.clientWidth;
      var lastImgWidth = firstImg.offsetWidth;
      if (currentScroll >= scrollWidth - clientWidth - lastImgWidth - 10) {
        gallery.scrollLeft = lastImg.offsetWidth;
      }
      gallery.scrollBy({ left: amount(), behavior: 'smooth' });
      setTimeout(scrollToReal, 300);
    });
    
    gallery.scrollLeft = lastImg.offsetWidth;
  });
});