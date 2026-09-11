(function () {
  "use strict";

  var track = document.getElementById("track");
  var pages = document.querySelectorAll(".page");
  var navDots = document.querySelectorAll(".nav-dot");
  var totalPages = pages.length;
  var currentPage = 0;
  var isLocked = false;
  var lockDuration = 950;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    lockDuration = 250;
  }

  function goToPage(index) {
    if (index < 0 || index >= totalPages || index === currentPage) {
      return;
    }
    currentPage = index;
    track.style.transform = "translateX(-" + currentPage * 100 + "vw)";
    updateNav();
  }

  function updateNav() {
    navDots.forEach(function (dot, i) {
      var active = i === currentPage;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function lockNavigation() {
    isLocked = true;
    window.setTimeout(function () {
      isLocked = false;
    }, lockDuration);
  }

  function step(direction) {
    if (isLocked) {
      return;
    }
    var target = currentPage + direction;
    if (target < 0 || target >= totalPages) {
      return;
    }
    lockNavigation();
    goToPage(target);
  }

  navDots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      if (isLocked) {
        return;
      }
      var target = parseInt(dot.getAttribute("data-page"), 10);
      if (target !== currentPage) {
        lockNavigation();
        goToPage(target);
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      if (!isLocked && currentPage !== 0) {
        lockNavigation();
        goToPage(0);
      }
    } else if (e.key === "End") {
      e.preventDefault();
      if (!isLocked && currentPage !== totalPages - 1) {
        lockNavigation();
        goToPage(totalPages - 1);
      }
    }
  });

  var wheelAccum = 0;
  var wheelThreshold = 60;
  var wheelResetTimer = null;

  window.addEventListener(
    "wheel",
    function (e) {
      var isHorizontalIntent =
        Math.abs(e.deltaX) > Math.abs(e.deltaY);
      var delta = isHorizontalIntent ? e.deltaX : e.deltaY;

      if (Math.abs(delta) < 2) {
        return;
      }

      e.preventDefault();

      if (isLocked) {
        return;
      }

      wheelAccum += delta;

      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(function () {
        wheelAccum = 0;
      }, 200);

      if (wheelAccum > wheelThreshold) {
        wheelAccum = 0;
        step(1);
      } else if (wheelAccum < -wheelThreshold) {
        wheelAccum = 0;
        step(-1);
      }
    },
    { passive: false }
  );

  var touchStartX = 0;
  var touchStartY = 0;
  var touchActive = false;
  var touchDecided = false;
  var touchIsHorizontal = false;
  var swipeThreshold = 50;

  var appEl = document.getElementById("app");

  appEl.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length !== 1) {
        return;
      }
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchActive = true;
      touchDecided = false;
      touchIsHorizontal = false;
    },
    { passive: true }
  );

  appEl.addEventListener(
    "touchmove",
    function (e) {
      if (!touchActive || e.touches.length !== 1) {
        return;
      }

      var dx = e.touches[0].clientX - touchStartX;
      var dy = e.touches[0].clientY - touchStartY;

      if (!touchDecided) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          touchDecided = true;
          touchIsHorizontal = Math.abs(dx) > Math.abs(dy);
        }
      }

      if (touchIsHorizontal) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  appEl.addEventListener(
    "touchend",
    function (e) {
      if (!touchActive) {
        return;
      }
      touchActive = false;

      if (!touchIsHorizontal || isLocked) {
        return;
      }

      var dx = e.changedTouches[0].clientX - touchStartX;

      if (dx <= -swipeThreshold) {
        lockNavigation();
        step(1);
      } else if (dx >= swipeThreshold) {
        lockNavigation();
        step(-1);
      }
    },
    { passive: true }
  );

  appEl.addEventListener("touchcancel", function () {
    touchActive = false;
    touchDecided = false;
    touchIsHorizontal = false;
  });

  updateNav();
})();
