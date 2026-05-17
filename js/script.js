const menu = document.getElementById('menu');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.main-nav a');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.slider-dots button');
const carouselTrack = document.getElementById('carouselTrack');
const revealItems = document.querySelectorAll('.reveal');
const carouselButtons = document.querySelectorAll('[data-carousel-direction]');
const serviceToggles = document.querySelectorAll('[data-service-toggle]');
const floatingWhatsApp = document.querySelector('.floating-whatsapp');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let currentSlide = 0;
let heroTimer;
let carouselTimer;

function closeMenu(){
  if(!menu || !menuToggle) return;

  menu.classList.remove('active');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

function toggleMenu(){
  if(!menu || !menuToggle) return;

  const isOpen = menu.classList.toggle('active');
  menuToggle.classList.toggle('active', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
}

function showSlide(index){
  if(!slides.length || !dots.length || index === currentSlide) return;

  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  dots[currentSlide].removeAttribute('aria-current');

  currentSlide = index;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
  dots[currentSlide].setAttribute('aria-current', 'true');
}

function nextSlide(){
  showSlide((currentSlide + 1) % slides.length);
}

function startHeroSlider(){
  if(reduceMotion || slides.length < 2) return;

  stopHeroSlider();
  heroTimer = setInterval(nextSlide, 4200);
}

function stopHeroSlider(){
  clearInterval(heroTimer);
}

function scrollCarousel(direction){
  if(!carouselTrack) return;

  const card = carouselTrack.querySelector('.service-card');
  const cardWidth = card ? card.offsetWidth + 22 : 330;
  carouselTrack.scrollBy({
    left:direction * cardWidth,
    behavior:reduceMotion ? 'auto' : 'smooth'
  });
}

function startCarouselAuto(){
  if(reduceMotion || !carouselTrack) return;

  stopCarouselAuto();
  carouselTimer = setInterval(() => {
    const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth - 8;

    if(carouselTrack.scrollLeft >= maxScroll){
      carouselTrack.scrollTo({ left:0, behavior:reduceMotion ? 'auto' : 'smooth' });
      return;
    }

    scrollCarousel(1);
  }, 5200);
}

function stopCarouselAuto(){
  clearInterval(carouselTimer);
}

function toggleService(button){
  const card = button.closest('.service-card');
  if(!card) return;

  const isActive = card.classList.toggle('active');
  button.textContent = isActive ? 'Ocultar' : 'Ver detalle';
  button.setAttribute('aria-expanded', String(isActive));
}

function setupRevealAnimations(){
  if(!('IntersectionObserver' in window) || reduceMotion){
    revealItems.forEach(item => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:.16 });

  revealItems.forEach(item => observer.observe(item));
}

function setupActiveNavigation(){
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if(!('IntersectionObserver' in window) || !sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;

      navLinks.forEach(link => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        if(isCurrent){
          link.setAttribute('aria-current', 'page');
        }else{
          link.removeAttribute('aria-current');
        }
      });
    });
  }, {
    rootMargin:'-35% 0px -55% 0px',
    threshold:0
  });

  sections.forEach(section => observer.observe(section));
}

function updateFloatingWhatsApp(){
  if(!floatingWhatsApp) return;

  floatingWhatsApp.classList.toggle('is-visible', window.scrollY > 520);
}

if(menuToggle){
  menuToggle.addEventListener('click', toggleMenu);
}

navLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('click', (event) => {
  if(!menu || !menuToggle || !menu.classList.contains('active')) return;
  if(menu.contains(event.target) || menuToggle.contains(event.target)) return;

  closeMenu();
});

document.addEventListener('keydown', (event) => {
  if(event.key === 'Escape'){
    closeMenu();
  }
});

window.addEventListener('scroll', updateFloatingWhatsApp, { passive:true });

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    stopHeroSlider();
    showSlide(index);
    startHeroSlider();
  });
});

carouselButtons.forEach(button => {
  button.addEventListener('click', () => {
    const direction = Number(button.dataset.carouselDirection);
    scrollCarousel(direction);
  });
});

serviceToggles.forEach(button => {
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => toggleService(button));
});

if(carouselTrack){
  startCarouselAuto();
  carouselTrack.addEventListener('mouseenter', stopCarouselAuto);
  carouselTrack.addEventListener('mouseleave', startCarouselAuto);
  carouselTrack.addEventListener('focusin', stopCarouselAuto);
  carouselTrack.addEventListener('focusout', startCarouselAuto);
  carouselTrack.addEventListener('touchstart', stopCarouselAuto, { passive:true });
  carouselTrack.addEventListener('touchend', startCarouselAuto, { passive:true });
}

startHeroSlider();
setupRevealAnimations();
setupActiveNavigation();
updateFloatingWhatsApp();
