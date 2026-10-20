// -------------------------------------------------------------
// src/home.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the home nav button behaviour and redirects.
// -------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';

// --- Home Page ---
// Handles toggling between Home / History / Profile views.
// using plain DOM APIs for simplicity and maintainability.

function initNavbarUI() {
    // --- DOM Elements ---
    const homeview = document.getElementById("homepage");
    const profileview = document.getElementById("profile");
    const historyview = document.getElementById("history");
    const homebtn = document.getElementById("tohome");
    const profilebtn = document.getElementById("toprofile");
    const historybtn = document.getElementById("tohistory");

    // --- Helper Functions ---
    // Toggle element visibility
    function setVisible(el, visible) {
        el.classList.toggle('d-none', !visible);
    }

    // --- Event Listeners ---
    // Toggle buttons
    homebtn?.addEventListener('click', (e) => {
        e.preventDefault();
        setVisible(profileview, false);
        setVisible(historyview, false);
        setVisible(homeview, true);
    });

    profilebtn?.addEventListener('click', (e) => {
        e.preventDefault();
        setVisible(profileview, true);
        setVisible(historyview, false);
        setVisible(homeview, false);;
    });

    historybtn?.addEventListener('click', (e) => {
        e.preventDefault();
        setVisible(profileview, false);
        setVisible(historyview, true);
        setVisible(homeview, false);
    });

    // --- Default View ---
    setVisible(profileview, false);
    setVisible(historyview, false);
    setVisible(homeview, true);
    
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', initNavbarUI);