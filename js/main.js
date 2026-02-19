/* Core site JS — cleaned and focused for projects + gallery pages */
const DEFAULT_CAROUSEL = ['image/GNSS.jpeg','image/Equipe.jpeg','image/Cartographie.jpg'];

function buildCarousel() {
    const container = document.getElementById('carousel');
    if (!container) return;
    container.innerHTML = '';
    const wrapper = document.createElement('div'); wrapper.className = 'carousel-wrapper';
    DEFAULT_CAROUSEL.forEach(src => {
        const img = document.createElement('div'); img.className = 'slide';
        img.style.backgroundImage = `url('${src}')`;
        wrapper.appendChild(img);
    });
    container.appendChild(wrapper);
    // simple fade cycle
    const slides = wrapper.querySelectorAll('.slide');
    if (!slides.length) return;
    slides[0].classList.add('active');
    let i = 0;
    setInterval(() => { slides[i].classList.remove('active'); i = (i+1)%slides.length; slides[i].classList.add('active'); }, 6000);
}

function animateCounters() {
    const counters = document.querySelectorAll('span.counter');
    if (!counters.length) return;
    
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = +el.getAttribute('data-target') || 0;
                let current = 0;
                const duration = 2000; // 2 secondes pour le comptage
                const startTime = performance.now();
                
                function animate(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    current = Math.floor(progress * target);
                    el.textContent = current;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        el.textContent = target;
                    }
                }
                
                requestAnimationFrame(animate);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.3 });
    
    counters.forEach(counter => io.observe(counter));
}

function setupNavbar(){ window.addEventListener('scroll', ()=>{ const n=document.getElementById('navbar'); if(!n) return; if(window.scrollY>50) n.classList.add('scrolled'); else n.classList.remove('scrolled'); }); }

function setupSmoothScroll(){ document.querySelectorAll('a[href^="#"]').forEach(a=>{ a.addEventListener('click', e=>{ const href=a.getAttribute('href'); if(href.startsWith('#') && href.length>1){ const t=document.querySelector(href); if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth', block:'start'}); } } }); }); }

function setupForm(){
    const form = document.getElementById('contactForm');
    const msg = document.getElementById('formMessage');
    if(!form || !msg) return;

    form.addEventListener('submit', async function(e){
        e.preventDefault();
        msg.className = 'form-message show';
        msg.classList.remove('success','error');
        msg.textContent = 'Envoi en cours...';

        const fd = new FormData(form);

        // Use FormSubmit AJAX endpoint when configured
        let endpoint = form.action || '';
        if(endpoint.includes('formsubmit.co')){
            // explicit AJAX endpoint for FormSubmit
            endpoint = 'https://formsubmit.co/ajax/sbetiga@gmail.com';
        }

        try{
            // Add dynamic subject and template for nicer emails
            const senderName = fd.get('name') || '';
            const subjectField = fd.get('subject') || '';
            fd.set('_subject', `Site BETIGA - ${subjectField} - ${senderName}`);
            fd.set('_template', 'table');

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: fd
            });

            if(res.ok){
                // success response (FormSubmit returns JSON)
                msg.classList.add('success');
                msg.textContent = 'Message envoyé avec succès. Nous vous répondrons sous 24h.';
                form.reset();
                // show larger modal confirmation
                showSuccessModal('Votre message a bien été envoyé. Merci de nous avoir contactés — nous répondrons sous 24h.');
            } else {
                // Try fallback: non-AJAX submit to ensure delivery
                try {
                    msg.classList.add('error');
                    msg.textContent = 'Échec de l\'envoi AJAX, tentative de soumission de secours...';
                    // remove event listener to avoid loop, then submit normally
                    form.removeEventListener('submit', arguments.callee);
                    // submit via hidden iframe technique
                    const iframe = document.createElement('iframe');
                    iframe.name = 'form-target'; iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    form.target = 'form-target';
                    form.submit();
                    setTimeout(()=>{
                        msg.classList.remove('error'); msg.classList.add('success');
                        msg.textContent = 'Message envoyé (mode secours). Si vous ne recevez rien, contactez-nous directement.';
                        showSuccessModal('Votre message a bien été envoyé (mode secours).');
                        form.reset();
                        if(iframe) document.body.removeChild(iframe);
                    }, 1500);
                } catch (fbErr) {
                    const text = await res.text().catch(()=>null);
                    msg.classList.add('error');
                    msg.textContent = text || 'Erreur lors de l\'envoi. Veuillez réessayer.';
                    showErrorModal('Impossible d\'envoyer votre message pour le moment. Essayez plus tard ou contactez-nous directement.');
                }
            }
        }catch(err){
            msg.classList.add('error');
            msg.textContent = 'Erreur réseau. Vérifiez votre connexion et réessayez.';
        }

        // hide message after a short delay
        setTimeout(()=>{ msg.className = 'form-message'; msg.textContent = ''; }, 8000);
    });
}

// Modal helper
function showSuccessModal(text){
    const modal = document.getElementById('successModal');
    if(!modal) return;
    const body = modal.querySelector('.modal-body');
    if(body) body.textContent = text;
    modal.classList.add('open');
}

function closeSuccessModal(){
    const modal = document.getElementById('successModal');
    if(!modal) return;
    modal.classList.remove('open');
}

// Close modal when clicking close button or overlay
document.addEventListener('click', function(e){
    const modal = document.getElementById('successModal');
    if(!modal || !modal.classList.contains('open')) return;
    if(e.target.matches('.modal-close') || e.target.matches('#successModal')){
        closeSuccessModal();
    }
});

// Close modal on OK button and clear form message
document.addEventListener('click', function(e){
    if(e.target && e.target.matches('.modal-ok')){
        closeSuccessModal();
        const msg = document.getElementById('formMessage');
        if(msg){ msg.className = 'form-message'; msg.textContent = ''; }
        const nameInput = document.getElementById('name');
        if(nameInput) nameInput.focus();
    }
});

// Error modal
function showErrorModal(text){
    let modal = document.getElementById('errorModal');
    if(!modal){
        modal = document.createElement('div'); modal.id = 'errorModal'; modal.className = 'modal open';
        modal.innerHTML = '<div class="modal-content" role="dialog" aria-modal="true"><button class="modal-close" aria-label="Fermer">×</button><h3>Erreur</h3><p class="modal-body">'+text+'</p><div style="margin-top:18px; text-align:center;"><button class="btn btn-primary modal-ok">OK</button></div></div>';
        document.body.appendChild(modal);
    } else {
        modal.querySelector('.modal-body').textContent = text;
        modal.classList.add('open');
    }
}

function initBeninMap(){ const mapDiv=document.getElementById('beninMap'); if(!mapDiv || typeof L==='undefined') return; const beninCenter=[9.3077,2.3158]; const map=L.map('beninMap',{scrollWheelZoom:false}).setView(beninCenter,6); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© OpenStreetMap contributors'}).addTo(map); }

function initAOS(){ if(window.AOS) AOS.init({duration:1000, once:true, offset:100}); }
function initPreloader(){ window.addEventListener('load', ()=>{ const p=document.getElementById('preloader'); if(!p) return; setTimeout(()=>p.classList.add('hide'), 800); }); }
function initMenuToggle(){ const menuToggle=document.getElementById('menuToggle'), navMenu=document.getElementById('navMenu'); if(!menuToggle||!navMenu) return; menuToggle.addEventListener('click', ()=>{ menuToggle.classList.toggle('active'); navMenu.classList.toggle('active'); document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : ''; }); document.querySelectorAll('.nav-link').forEach(link=>link.addEventListener('click', ()=>{ if(menuToggle) menuToggle.classList.remove('active'); if(navMenu) navMenu.classList.remove('active'); document.body.style.overflow=''; })); }

function initActiveNavHighlight(){ const sections=document.querySelectorAll('section[id]'); if(!sections.length) return; function highlight(){ const y=window.pageYOffset; sections.forEach(s=>{ const h=s.offsetHeight, top=s.offsetTop-120, id=s.getAttribute('id'); const link=document.querySelector('.nav-link[href*="'+id+'"]'); if(!link) return; if(y>top && y<= top+h) link.classList.add('active'); else link.classList.remove('active'); }); } window.addEventListener('scroll', highlight); }

function initHeroSlider(){ const slides=document.querySelectorAll('.slide'); if(!slides.length) return; let cur=0; setInterval(()=>{ slides[cur].classList.remove('active'); cur=(cur+1)%slides.length; slides[cur].classList.add('active'); },6000); }

function initHeroSlider(){
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    let current = 0;
    slides.forEach((s,i)=>{ if(i===0) s.classList.add('active'); });

    // controls
    const hero = document.querySelector('.hero');
    const controls = document.createElement('div'); controls.className = 'hero-controls';
    const prev = document.createElement('button'); prev.innerHTML = '‹';
    const next = document.createElement('button'); next.innerHTML = '›';
    controls.appendChild(prev); controls.appendChild(next);
    if (hero) hero.appendChild(controls);

    function goTo(i){ slides[current].classList.remove('active'); current = (i + slides.length) % slides.length; slides[current].classList.add('active'); }

    let interval = setInterval(()=> goTo(current+1), 9000);
    // pause on hover
    if (hero) {
        hero.addEventListener('mouseenter', ()=> clearInterval(interval));
        hero.addEventListener('mouseleave', ()=> { interval = setInterval(()=> goTo(current+1), 9000); });
    }

    prev.addEventListener('click', ()=> { goTo(current-1); });
    next.addEventListener('click', ()=> { goTo(current+1); });
}

function initProjectFilter(){ const filterBtns=document.querySelectorAll('.filter-btn'); const projectCards=document.querySelectorAll('.project-card'); if(!filterBtns.length||!projectCards.length) return; filterBtns.forEach(btn=>btn.addEventListener('click', function(){ filterBtns.forEach(b=>b.classList.remove('active')); this.classList.add('active'); const filter=this.getAttribute('data-filter'); projectCards.forEach(card=>{ if(filter==='all' || card.getAttribute('data-category')===filter){ card.style.display='block'; setTimeout(()=>{ card.style.opacity='1'; card.style.transform='scale(1)'; },10); } else { card.style.opacity='0'; card.style.transform='scale(0.96)'; setTimeout(()=>{ card.style.display='none'; },280); } }); })); }

function initBackToTop(){ const bt=document.getElementById('backToTop'); if(!bt) return; window.addEventListener('scroll', ()=>{ if(window.scrollY>400) bt.classList.add('show'); else bt.classList.remove('show'); }); bt.addEventListener('click', ()=>window.scrollTo({top:0, behavior:'smooth'})); }

/* Project page gallery initializer. Project pages include a .project-gallery element with
   .gallery-main img and multiple thumbnails inside .gallery-thumbs img */
function initProjectGallery(){ document.querySelectorAll('.project-gallery').forEach(g=>{
    const main = g.querySelector('.gallery-main img'); const thumbs = Array.from(g.querySelectorAll('.gallery-thumbs img'));
    if(!main || !thumbs.length) return;
    thumbs.forEach((t, idx)=>{ t.addEventListener('click', ()=>{ thumbs.forEach(x=>x.classList.remove('active')); t.classList.add('active'); main.src = t.dataset.src || t.src; }); });
    // set first active
    thumbs[0].classList.add('active'); main.src = thumbs[0].dataset-src || thumbs[0].src;
}); }

document.addEventListener('DOMContentLoaded', ()=>{
    setupNavbar(); setupSmoothScroll(); setupForm(); initBeninMap(); buildCarousel(); animateCounters(); initAOS(); initPreloader(); initMenuToggle(); initActiveNavHighlight(); initHeroSlider(); initProjectFilter(); initBackToTop(); setupPhoneLink(); initProjectGallery();
});

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

/* Phone link behavior: on desktop copy number to clipboard; on mobile keep tel: behavior */
function setupPhoneLink(){
    const links = document.querySelectorAll('.phone-link');
    if(!links.length) return;
    const isMobile = (('maxTouchPoints' in navigator && navigator.maxTouchPoints>0) || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    links.forEach(a=>{
        a.addEventListener('click', async function(e){
            if(isMobile) return; // let tel: open dialer/app on mobile
            e.preventDefault();
            const tel = a.dataset.tel || a.getAttribute('href') || a.textContent.trim();
            try{
                if(navigator.clipboard && navigator.clipboard.writeText){
                    await navigator.clipboard.writeText(tel.replace(/^tel:/i, ''));
                    showToast('Numéro copié : ' + a.textContent.trim());
                } else {
                    const inp = document.createElement('input'); inp.value = tel.replace(/^tel:/i, ''); document.body.appendChild(inp); inp.select(); document.execCommand('copy'); document.body.removeChild(inp);
                    showToast('Numéro copié : ' + a.textContent.trim());
                }
            }catch(err){
                showToast('Numéro : ' + a.textContent.trim());
            }
        });
    });
}

function showToast(text){
    let t = document.getElementById('siteToast');
    if(!t){ t = document.createElement('div'); t.id = 'siteToast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = text;
    t.classList.add('show');
    if(t._timeout) clearTimeout(t._timeout);
    t._timeout = setTimeout(()=>{ t.classList.remove('show'); }, 3800);
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
