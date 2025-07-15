const modelVisual = document.getElementsByClassName('model-visual')[0];
const scrollLockContainer = document.getElementById('scroll-lock-container');
const heroSection = document.querySelector('.hero-section');
const afterHeroSection = document.querySelector('.after-hero');
const heroLeft = document.querySelector('.hero-left');
const heroRight = document.querySelector('.hero-right');

let isScrollLocked = true;
let virtualScroll = 0;
let maxVirtualScroll = 1000; // px, can be adjusted for scroll sensitivity
let targetTime = 0;
let lerpedTime = 0;
const SCROLL_SENSITIVITY = 7.5; // Increased for more movement per scroll
const SMOOTHNESS = 0.07;
let isSeeking = false;

function setMaxVirtualScroll() {
  if (modelVisual.duration) {
    maxVirtualScroll = Math.max(800, modelVisual.duration * 600);
  }
}

modelVisual.addEventListener('loadedmetadata', setMaxVirtualScroll);
modelVisual.addEventListener('seeking', () => { isSeeking = true; });
modelVisual.addEventListener('seeked', () => { isSeeking = false; });

function animateModelWithVirtualScroll() {
  if (!isScrollLocked) return;
  const duration = modelVisual.duration || 1;
  const scrollFraction = Math.min(virtualScroll / maxVirtualScroll, 1);
  targetTime = scrollFraction * duration;
}

function unlockHeroSection() {
  isScrollLocked = false;
  heroSection.classList.add('unlocked');
  document.body.classList.remove('locked');
  setTimeout(() => {
    afterHeroSection.classList.add('visible');
  }, 350);
}

function lockHeroSection() {
  isScrollLocked = true;
  heroSection.classList.remove('unlocked');
  document.body.classList.add('locked');
  afterHeroSection.classList.remove('visible');
  animateModelWithVirtualScroll();
}

function syncVirtualScrollWithPage() {
  if (window.scrollY < scrollLockContainer.offsetHeight / 2) {
    const percent = 1 - (window.scrollY / (scrollLockContainer.offsetHeight / 2));
    virtualScroll = percent * maxVirtualScroll;
    virtualScroll = Math.max(0, Math.min(virtualScroll, maxVirtualScroll));
    animateModelWithVirtualScroll();
  }
}

function onWheel(e) {
  if (isScrollLocked || window.scrollY < scrollLockContainer.offsetHeight - 10) {
    e.preventDefault();
    virtualScroll += e.deltaY * SCROLL_SENSITIVITY;
    virtualScroll = Math.max(0, Math.min(virtualScroll, maxVirtualScroll));
    animateModelWithVirtualScroll();
    if (virtualScroll >= maxVirtualScroll && isScrollLocked) {
      unlockHeroSection();
      window.scrollTo({ top: scrollLockContainer.offsetHeight, behavior: 'auto' });
    }
    if (virtualScroll <= 0 && !isScrollLocked && window.scrollY < scrollLockContainer.offsetHeight / 2) {
      lockHeroSection();
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }
}

function onTouchMove(e) {
  if (isScrollLocked || window.scrollY < scrollLockContainer.offsetHeight - 10) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (typeof onTouchMove.lastY === 'number') {
        const deltaY = touch.clientY - onTouchMove.lastY;
        virtualScroll -= deltaY * SCROLL_SENSITIVITY;
        virtualScroll = Math.max(0, Math.min(virtualScroll, maxVirtualScroll));
        animateModelWithVirtualScroll();
        if (virtualScroll >= maxVirtualScroll && isScrollLocked) {
          unlockHeroSection();
          window.scrollTo({ top: scrollLockContainer.offsetHeight, behavior: 'auto' });
        }
        if (virtualScroll <= 0 && !isScrollLocked && window.scrollY < scrollLockContainer.offsetHeight / 2) {
          lockHeroSection();
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      }
      onTouchMove.lastY = touch.clientY;
    }
  }
}
function onTouchEnd() {
  delete onTouchMove.lastY;
}

window.addEventListener('scroll', () => {
  if (!isScrollLocked && window.scrollY < scrollLockContainer.offsetHeight / 2) {
    lockHeroSection();
    syncVirtualScrollWithPage();
  }
});

function smoothModelUpdate() {
  if (modelVisual.readyState >= 1 && !isSeeking) {
    lerpedTime += (targetTime - lerpedTime) * SMOOTHNESS;
    if (Math.abs(lerpedTime - targetTime) < 0.01) lerpedTime = targetTime;
    if (Math.abs(modelVisual.currentTime - lerpedTime) > 0.03) {
      modelVisual.currentTime = lerpedTime;
    }
  }
  requestAnimationFrame(smoothModelUpdate);
}
smoothModelUpdate();

lockHeroSection();

window.addEventListener('wheel', onWheel, { passive: false });
window.addEventListener('touchmove', onTouchMove, { passive: false });
window.addEventListener('touchend', onTouchEnd);

// Scroll-triggered animation for new sections
function animateOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.scroll-fade-up, .scroll-fade-left, .scroll-fade-right').forEach(el => {
    observer.observe(el);
  });
}

window.addEventListener('DOMContentLoaded', animateOnScroll);

modelVisual.addEventListener('play', () => modelVisual.pause()); 