const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation?.classList.toggle('open', !isOpen);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

document.querySelectorAll('[data-carousel]').forEach((carousel) => {  const track = carousel.querySelector('[data-carousel-track]');
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const dotsContainer = carousel.parentElement.querySelector('[data-carousel-dots]');
  const slides = Array.from(track?.children ?? []);
  if (!track || slides.length === 0) return;

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to design ${index + 1}`);
    dot.addEventListener('click', () => {
      slides[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsContainer?.appendChild(dot);
    return dot;
  });

  const scrollByAmount = () => {
    const slide = slides[0];
    const gap = parseFloat(getComputedStyle(track).columnGap || '0');
    return slide.getBoundingClientRect().width + gap;
  };

  prevButton?.addEventListener('click', () => {
    track.scrollBy({ left: -scrollByAmount(), behavior: 'smooth' });
  });
  nextButton?.addEventListener('click', () => {
    track.scrollBy({ left: scrollByAmount(), behavior: 'smooth' });
  });

  if ('IntersectionObserver' in window && dots.length > 0) {
    const dotObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = slides.indexOf(entry.target);
          if (index === -1) return;
          dots[index].classList.toggle('active', entry.isIntersecting);
        });
      },
      { root: track, threshold: 0.6 }
    );
    slides.forEach((slide) => dotObserver.observe(slide));
  } else {
    dots[0]?.classList.add('active');
  }
});

const designForm = document.querySelector('[data-design-form]');
const designFormSuccess = document.querySelector('[data-design-form-success]');
const designFormStatus = designForm?.querySelector('[data-form-status]');

designForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = designForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  if (designFormStatus) {
    designFormStatus.hidden = false;
    designFormStatus.textContent = 'Sending your design…';
  }

  try {
    const response = await fetch(designForm.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(designForm),
    });

    if (!response.ok) throw new Error('Submission failed');

    designForm.hidden = true;
    if (designFormSuccess) designFormSuccess.hidden = false;
  } catch (error) {
    submitButton.disabled = false;
    if (designFormStatus) {
      designFormStatus.textContent = 'Something went wrong sending your design. Please try again.';
    }
  }
});
