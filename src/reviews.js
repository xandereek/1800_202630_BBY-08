// -------------------------------------------------------------
// src/reviews.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the sort / filter behaviour and redirects.
// -------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';

// ---Expanded Reviews Page ---
// Handles toggling between Re views/ Sort / Filter views.
// using plain DOM APIs for simplicity and maintainability.

function initReviewsUI() {
    // --- DOM Elements ---
    const reviewview = document.getElementById("expanded-reviews-page");
    const filterview = document.getElementById("filterpage");
    const sortview = document.getElementById("sortpage");
    const filterbtn = document.getElementById("filterbtn");
    const sortbtn = document.getElementById("sortbtn");
    const reviewbackbtn = document.getElementById("back-in-review");
    const sortbackbtn = document.getElementById("back-in-sort");
    const filterbackbtn = document.getElementById("back-in-filter");
    const listingRedirectUrl = "listing_page.html";

    // --- Helper Functions ---
    // Toggle element visibility
    function setVisible(el, visible) {
        el.classList.toggle('d-none', !visible);
    }

    // --- Event Listeners ---
    // Toggle buttons
    reviewbackbtn?.addEventListener('click', (e) => {
        e.preventDefault();
        location.href = listingRedirectUrl;
    });

    filterbtn?.addEventListener('click', (e) => {
        e.preventDefault();
        setVisible(filterview, true);
        setVisible(reviewview, false);
        setVisible(sortview, false);
    });

    filterbackbtn?.addEventListener('click', (e) => {
        e.preventDefault();
        setVisible(filterview, false);
        setVisible(reviewview, true);
        setVisible(sortview, false);
    });

    sortbtn?.addEventListener('click', (e) => {
        e.preventDefault();
        setVisible(filterview, false);
        setVisible(reviewview, false);
        setVisible(sortview, true);
    });

    sortbackbtn?.addEventListener('click', (e) => {
        e.preventDefault();
        setVisible(filterview, false);
        setVisible(reviewview, true);
        setVisible(sortview, false);
    });

    // --- Default View ---
    setVisible(filterview, false);
    setVisible(reviewview, true);
    setVisible(sortview, false);
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', initReviewsUI);