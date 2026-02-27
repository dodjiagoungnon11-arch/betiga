/* BETIGA SARL - Main Javascript */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    setupNavbar();
    setupSmoothScroll();
    setupForm();
    initBeninMap();
    buildCarousel();
    animateCounters();
    initAOS();
    initMenuToggle();
    initActiveNavHighlight();
    initHeroSlider();
    initProjectFilter();
    initBackToTop();
    setupPhoneLink();
    initProjectGallery();
    initVideoPlayer();
});

// --- UI Components & Initializers ---

function initPreloader() {
    window.addEventListener('load', () => {
        const p = document.getElementById('preloader');
        if (p) setTimeout(() => p.classList.add('hide'), 800);
    });
}

function setupNavbar() {
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('nav-scrolled');
        else nav.classList.remove('nav-scrolled');
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                const t = document.querySelector(href);
                if (t) {
                    e.preventDefault();
                    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

function initMenuToggle() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        document.body.style.overflow = '';
    }));
}

function initActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;
    window.addEventListener('scroll', () => {
        const y = window.pageYOffset;
        sections.forEach(s => {
            const h = s.offsetHeight, t = s.offsetTop - 120, id = s.getAttribute('id');
            const link = document.querySelector('.nav-link[href*="' + id + '"]');
            if (link) {
                if (y > t && y <= t + h) link.classList.add('active');
                else link.classList.remove('active');
            }
        });
    });
}

function initBackToTop() {
    const bt = document.getElementById('backToTop');
    if (!bt) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) bt.classList.add('show');
        else bt.classList.remove('show');
    });
    bt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// --- Specific Features ---

function initBeninMap() {
    const div = document.getElementById('beninMap');
    if (!div || typeof L === 'undefined') return;
    const map = L.map('beninMap', { scrollWheelZoom: false }).setView([9.3077, 2.3158], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    let cur = 0;
    slides.forEach((s, i) => { if (i === 0) s.classList.add('active'); });
    setInterval(() => {
        slides[cur].classList.remove('active');
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add('active');
    }, 8000);
}

function initAOS() {
    if (window.AOS) AOS.init({ duration: 1000, once: true, offset: 100 });
}

function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const target = parseInt(e.target.getAttribute('data-target') || e.target.innerText.replace('+', ''));
                let count = 0;
                const int = setInterval(() => {
                    count += Math.ceil(target / 30);
                    if (count >= target) { e.target.innerText = target; clearInterval(int); }
                    else { e.target.innerText = count; }
                }, 40);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
}

// --- Portfolio & Gallery ---

function initProjectFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    if (!btns.length || !cards.length) return;
    btns.forEach(b => b.addEventListener('click', function () {
        btns.forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        const f = this.dataset.filter;
        cards.forEach(c => {
            if (f === 'all' || c.dataset.category === f) {
                c.style.display = 'block';
                setTimeout(() => { c.style.opacity = '1'; c.style.transform = 'scale(1)'; }, 10);
            } else {
                c.style.opacity = '0'; c.style.transform = 'scale(0.95)';
                setTimeout(() => { c.style.display = 'none'; }, 300);
            }
        });
    }));
}

function initProjectGallery() {
    document.querySelectorAll('.project-gallery').forEach(g => {
        const main = g.querySelector('.gallery-main img');
        const thumbs = g.querySelectorAll('.gallery-thumbs img');
        if (!main || !thumbs.length) return;
        thumbs.forEach(t => t.addEventListener('click', () => {
            thumbs.forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            main.src = t.dataset.src || t.src;
        }));
    });
}

function buildCarousel() {
    // Placeholder if needed for specific carousels
}

// --- Modal System ---

function showSuccessModal(text) {
    let m = document.getElementById('successModal');

    const closeModal = () => {
        if (!m) return;
        m.classList.remove('open');
        m.style.display = 'none';
        m.setAttribute('aria-hidden', 'true');
    };

    if (!m) {
        // Fallback: create modal if it doesn't exist in HTML
        m = document.createElement('div');
        m.id = 'successModal';
        m.className = 'modal';
        m.innerHTML = `
            <div class="modal-content">
                <button class="modal-close-btn" style="position:absolute; top:10px; right:15px; border:none; background:none; font-size:20px; cursor:pointer;">×</button>
                <div class="modal-iconSuccess"><i class="fas fa-check-circle"></i></div>
                <h3>Succès !</h3>
                <p>${text}</p>
                <button class="btn btn-primary modal-ok-btn" style="margin-top:20px;">D'accord</button>
            </div>`;
        document.body.appendChild(m);
    } else {
        // Use existing modal in HTML
        const bodyContent = m.querySelector('.modal-body') || m.querySelector('p');
        if (bodyContent) bodyContent.textContent = text;
    }

    // Always attach/re-attach listeners to be safe (handles all possible classes)
    const triggers = m.querySelectorAll('.modal-close, .modal-ok, .modal-close-btn, .modal-ok-btn');
    triggers.forEach(t => {
        t.onclick = closeModal;
    });

    // Show it: override any inline display:none and then add class for transitions
    m.style.display = 'flex';
    setTimeout(() => {
        m.classList.add('open');
        m.setAttribute('aria-hidden', 'false');
    }, 10);
}

function setupForm() {
    const form = document.getElementById('contactForm');
    const msg = document.getElementById('formMessage');
    if (!form || !msg) return;

    // Gestion du sujet automatique via URL (?subject=cadastre)
    const urlParams = new URLSearchParams(window.location.search);
    const subjectParam = urlParams.get('subject');
    if (subjectParam === 'cadastre') {
        const subjectSelect = form.querySelector('#subject');
        if (subjectSelect) {
            subjectSelect.value = "Enregistrement Individuel au Cadastre";
        }
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Manual Validation
        let valid = true;
        form.querySelectorAll('[required]').forEach(i => {
            if (!i.value.trim()) {
                i.setCustomValidity('Veuillez remplir ce champ');
                i.reportValidity();
                valid = false;
            } else {
                i.setCustomValidity('');
            }
        });
        if (!valid) return;

        msg.className = 'form-message show';
        msg.textContent = 'Envoi en cours...';

        // EmailJS Configuration
        const SERVICE_ID = 'service_43v06hi';
        const TEMPLATE_ID = 'template_0u7rqso';

        // 1. Détection des placeholders non remplis
        if (SERVICE_ID === 'service_votre_id' || TEMPLATE_ID === 'template_votre_id') {
            msg.className = 'form-message show error';
            msg.innerHTML = `⚠️ <strong>Configuration incomplète :</strong><br>Vous devez remplacer les clés par vos vrais IDs dans <code>js/main.js</code>.`;
            return;
        }

        // 2. Vérification de la taille du fichier (EmailJS Free = limite 50 Ko)
        const fileInput = form.querySelector('input[type="file"]');
        if (fileInput && fileInput.files.length > 0) {
            const fileSize = fileInput.files[0].size / 1024; // Taille en Ko
            if (fileSize > 50) {
                msg.className = 'form-message show error';
                msg.innerHTML = `⚠️ <strong>Fichier trop lourd (${Math.round(fileSize)} Ko) :</strong><br>La version gratuite d'EmailJS limite les pièces jointes à <strong>50 Ko</strong>. Veuillez envoyer un fichier plus petit ou tester sans fichier.`;
                return;
            }
        }

        try {
            const res = await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this);

            if (res.status === 200) {
                msg.classList.remove('error');
                msg.classList.add('success');
                msg.textContent = 'Message envoyé avec succès via EmailJS !';
                form.reset();
                showSuccessModal('Votre message a bien été envoyé. Nous vous répondrons sous 24h.');
            } else {
                // EmailJS renvoie souvent l'explication dans res.text (ex: "Account not found")
                throw new Error("Erreur " + res.status + " : " + (res.text || "Requête invalide"));
            }
        } catch (err) {
            msg.classList.remove('success');
            msg.classList.add('error');
            msg.textContent = 'Erreur lors de l\'envoi. Vérifiez la console (F12) pour le détail.';
            console.error('EmailJS Debug:', err);
            if (err.text) console.error('Détail technique EmailJS:', err.text);
        }
    });
}

// --- Utils ---

function setupPhoneLink() {
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    document.querySelectorAll('.phone-link').forEach(a => {
        if (!isMobile) {
            a.addEventListener('click', e => {
                e.preventDefault();
                const tel = a.getAttribute('href').replace('tel:', '');
                navigator.clipboard.writeText(tel);
                showToast('Numéro copié : ' + tel);
            });
        }
    });
}

function showToast(m) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = m; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function initVideoPlayer() { }
