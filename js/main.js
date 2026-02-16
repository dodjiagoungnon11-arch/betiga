// Editable content: change images and projects here
const DEFAULT_CAROUSEL = [
    'images/slide1.jpg',
    'images/slide2.jpg',
    'images/slide3.jpg'
];

const DEFAULT_PROJECTS = [
    { title: 'Projet Exemple A', desc: 'Étude topographique et SIG pour aménagement local.', img: 'images/proj1.jpg' },
    { title: 'Projet Exemple B', desc: 'Cartographie et télédétection pour suivi environnemental.', img: 'images/proj2.jpg' },
    { title: 'Projet Exemple C', desc: 'Relevés topographiques pour projet d’infrastructure.', img: 'images/proj3.jpg' }
];

const LS_KEY_IMAGES = 'betiga_carousel_images';
const LS_KEY_PROJECTS = 'betiga_projects';

let carouselImages = JSON.parse(localStorage.getItem(LS_KEY_IMAGES) || 'null') || DEFAULT_CAROUSEL.slice();
let projects = JSON.parse(localStorage.getItem(LS_KEY_PROJECTS) || 'null') || DEFAULT_PROJECTS.slice();

/* -------------------- Carousel 3D -------------------- */
function buildCarousel() {
    const container = document.getElementById('carousel');
    if (!container) return;
    // clear previous
    container.innerHTML = '';
    const n = Math.max(1, carouselImages.length);
    const scene = document.createElement('div');
    scene.className = 'carousel-scene';
    container.appendChild(scene);

    const slides = [];
    carouselImages.forEach((src) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.style.backgroundImage = `url('${src}')`;
        scene.appendChild(slide);
        slides.push(slide);
    });

    const angle = 360 / n;
    let slideWidth = Math.min(560, container.offsetWidth * 0.9);
    let radius = Math.round((slideWidth / 2) / Math.tan(Math.PI / n));

    function positionSlides() {
        slideWidth = Math.min(560, container.offsetWidth * 0.9);
        radius = Math.round((slideWidth / 2) / Math.tan(Math.PI / n));
        slides.forEach((s, i) => {
            const rot = i * angle;
            s.style.width = slideWidth + 'px';
            s.style.transform = `rotateY(${rot}deg) translateZ(${radius}px) translateX(-50%)`;
        });
    }
    positionSlides();

    let current = 0;
    function rotateTo(i) {
        scene.style.transform = `translateZ(-100px) rotateY(${-i * angle}deg)`;
    }

    // Controls
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    const prev = document.createElement('button');
    prev.className = 'carousel-btn';
    prev.innerText = '‹';
    prev.addEventListener('click', () => { current = (current - 1 + n) % n; rotateTo(current); });

    const next = document.createElement('button');
    next.className = 'carousel-btn';
    next.innerText = '›';
    next.addEventListener('click', () => { current = (current + 1) % n; rotateTo(current); });

    controls.appendChild(prev);
    controls.appendChild(next);
    container.appendChild(controls);

    // autoplay
    let interval = setInterval(() => { current = (current + 1) % n; rotateTo(current); }, 4200);
    container.addEventListener('mouseenter', () => clearInterval(interval));
    container.addEventListener('mouseleave', () => { interval = setInterval(() => { current = (current + 1) % n; rotateTo(current); }, 4200); });

    // responsive
    window.addEventListener('resize', () => { positionSlides(); rotateTo(current); });

    // initial
    rotateTo(0);
}

/* -------------------- Counters -------------------- */
function animateCounters() {
    const els = document.querySelectorAll('.stat-number[data-target]');
    if (!els.length) return;

    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target')) || 0;
                const duration = 1500;
                const start = 0;
                const startTime = performance.now();
                function step(now) {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const value = Math.floor(progress * (target - start) + start);
                    el.textContent = value;
                    if (progress < 1) requestAnimationFrame(step);
                    else el.textContent = target;
                }
                requestAnimationFrame(step);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    els.forEach(e => io.observe(e));
}

/* -------------------- Projects Section -------------------- */
function buildProjects() {
    const container = document.getElementById('projets-grid');
    if (!container) return;
    container.innerHTML = '';
    projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';
        const img = document.createElement('div');
        img.className = 'project-image';
        img.style.backgroundImage = `url('${p.img}')`;
        const body = document.createElement('div');
        body.className = 'project-body';
        const h3 = document.createElement('h3');
        h3.textContent = p.title;
        const pdesc = document.createElement('p');
        pdesc.textContent = p.desc;
        body.appendChild(h3);
        body.appendChild(pdesc);
        card.appendChild(img);
        card.appendChild(body);
        container.appendChild(card);
    });
}

/* -------------------- Image manager UI -------------------- */
function initImageManager() {
    const openBtn = document.getElementById('open-image-manager');
    const panel = document.getElementById('image-manager');
    const closeBtn = document.getElementById('close-image-manager');
    const addBtn = document.getElementById('add-image-btn');
    const saveBtn = document.getElementById('save-images-btn');
    const list = document.getElementById('images-list');
    const input = document.getElementById('new-image-url');
    if (!openBtn || !panel) return;

    function renderList() {
        list.innerHTML = '';
        carouselImages.forEach((src, i) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '8px';

            const thumb = document.createElement('div');
            thumb.style.width = '64px';
            thumb.style.height = '44px';
            thumb.style.backgroundImage = `url('${src}')`;
            thumb.style.backgroundSize = 'cover';
            thumb.style.backgroundPosition = 'center';
            thumb.style.borderRadius = '6px';

            const label = document.createElement('div');
            label.style.flex = '1';
            label.style.wordBreak = 'break-all';
            label.textContent = src;

            const del = document.createElement('button');
            del.textContent = 'Suppr';
            del.style.background = '#f8d7da';
            del.style.border = 'none';
            del.style.padding = '6px 8px';
            del.style.borderRadius = '6px';
            del.addEventListener('click', () => { carouselImages.splice(i,1); renderList(); });

            row.appendChild(thumb);
            row.appendChild(label);
            row.appendChild(del);
            list.appendChild(row);
        });
    }

    openBtn.addEventListener('click', () => { panel.style.display = 'block'; renderList(); });
    closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
    addBtn.addEventListener('click', () => {
        const val = input.value && input.value.trim();
        if (!val) return;
        carouselImages.push(val);
        input.value = '';
        renderList();
    });
    saveBtn.addEventListener('click', () => {
        localStorage.setItem(LS_KEY_IMAGES, JSON.stringify(carouselImages));
        buildCarousel();
        panel.style.display = 'none';
    });
}

/* -------------------- Misc (navbar, smooth scroll, form) -------------------- */
function setupNavbar() {
    window.addEventListener('scroll', function () {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function setupForm() {
    const form = document.getElementById('contactForm');
    const msgEl = document.getElementById('formMessage');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        msgEl.textContent = 'Envoi en cours...';
        const fd = new FormData(form);
        try {
            const res = await fetch(form.action || 'send.php', { method: 'POST', body: fd });
            const text = await res.text();
            if (res.ok) {
                msgEl.textContent = 'Message envoyé. Merci !';
                form.reset();
            } else {
                msgEl.textContent = text || 'Erreur lors de l\'envoi.';
            }
        } catch (err) {
            msgEl.textContent = 'Erreur réseau. Réessayez.';
        }
        setTimeout(() => { msgEl.textContent = ''; }, 8000);
    });
}

function initBeninMap() {
    const mapDiv = document.getElementById('beninMap');
    if (!mapDiv || typeof L === 'undefined') return;
    const beninCenter = [9.3077, 2.3158];
    const map = L.map('beninMap', { scrollWheelZoom: false }).setView(beninCenter, 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

/* -------------------- Init -------------------- */
document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    setupSmoothScroll();
    setupForm();
    initBeninMap();
    buildCarousel();
    animateCounters();
    buildProjects();
    initImageManager();
});

/* -------------------- Additional initializers (from inline script) -------------------- */
function initAOS() {
    if (window.AOS) {
        AOS.init({ duration: 1000, once: true, offset: 100 });
    }
}

function initPreloader() {
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        setTimeout(function() {
            preloader.classList.add('hide');
        }, 1200);
    });
}

function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (menuToggle) menuToggle.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

function initActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    function highlightNav() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const link = document.querySelector('.nav-link[href*="' + sectionId + '"]');
            if (!link) return;

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNav);
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, 6000);
}

function initProjectFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Re-bind DOMContentLoaded to initialize added behavior along with existing init
document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    initPreloader();
    initMenuToggle();
    initActiveNavHighlight();
    initHeroSlider();
    initProjectFilter();
    initBackToTop();
});
