<<<<<<< HEAD
/* Fichier : script.js */

// 1. Initialisation des animations AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// 2. Initialisation de la Carte interactive (WebGIS Preview)
const initMap = () => {
    const map = L.map('map', { 
        zoomControl: false,
        scrollWheelZoom: false 
    }).setView([6.4913, 2.6276], 15); // Coordonnées Porto-Novo

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '© BETIGA SARL | Données Géospatiales'
    }).addTo(map);

    // Ajout d'un polygone simulant un plan foncier réalisé
    const zoneExemple = L.polygon([
        [6.4920, 2.6260],
        [6.4935, 2.6280],
        [6.4910, 2.6295]
    ], {
        color: '#2C74B3',
        fillColor: '#2C74B3',
        fillOpacity: 0.4
    }).addTo(map);

    zoneExemple.bindPopup("<b>Réalisation BETIGA</b><br>Levé Topographique parcellaire.");
};

document.addEventListener('DOMContentLoaded', initMap);

// 3. Gestion du changement de style de la navigation au scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
=======
/* Fichier : script.js */

// 1. Initialisation des animations AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// 2. Initialisation de la Carte interactive (WebGIS Preview)
const initMap = () => {
    const map = L.map('map', { 
        zoomControl: false,
        scrollWheelZoom: false 
    }).setView([6.4913, 2.6276], 15); // Coordonnées Porto-Novo

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '© BETIGA SARL | Données Géospatiales'
    }).addTo(map);

    // Ajout d'un polygone simulant un plan foncier réalisé
    const zoneExemple = L.polygon([
        [6.4920, 2.6260],
        [6.4935, 2.6280],
        [6.4910, 2.6295]
    ], {
        color: '#2C74B3',
        fillColor: '#2C74B3',
        fillOpacity: 0.4
    }).addTo(map);

    zoneExemple.bindPopup("<b>Réalisation BETIGA</b><br>Levé Topographique parcellaire.");
};

document.addEventListener('DOMContentLoaded', initMap);

// 3. Gestion du changement de style de la navigation au scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
>>>>>>> c86b9781d0d135011ff885b924e66dcef5e75e05
});