// Image sequence scroll-driven animation
const frameCount = 100;
const images = [];
const imageFolder = 'sequence/';
const imageExt = '.webp';
const canvas = document.querySelector('.model-visual-canvas');
const context = canvas.getContext('2d');
let loaded = 0;

function pad(num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = imageFolder + pad(i + 1, 5) + imageExt;
  images.push(img);
  img.onload = () => {
    loaded++;
    if (loaded === 1) render(); // Draw first frame ASAP
  };
}

function render(frame = 0) {
  if (images[frame] && images[frame].complete) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(images[frame], 0, 0, canvas.width, canvas.height);
  }
}

// GSAP ScrollTrigger
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  let obj = {frame: 0};
  gsap.to(obj, {
    frame: frameCount - 1,
    snap: 'frame',
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: `+=${window.innerHeight * 2}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      onUpdate: self => {
        render(Math.floor(obj.frame));
      },
      onLeave: () => {
        // Optionally, show next section or unlock scroll
      }
    },
    onUpdate: () => render(Math.floor(obj.frame))
  });
} else {
  // fallback: just show first frame
  render(0);
}

// Animate other sections as before
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