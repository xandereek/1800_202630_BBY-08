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
import { retrieveReview } from './reviewManager';

// ---Expanded Reviews Page ---
// Handles toggling between Re views/ Sort / Filter views.
// using plain DOM APIs for simplicity and maintainability.

async function displayAllReviews(listingId) {
    const reviewContainer = document.getElementById("reviews-page-container");
    const postCount = document.getElementById("review-page-post-counter");

    console.log("Counter element found:", postCount);

    if (!reviewContainer) {
        return;
    }

    const reviews = await retrieveReview(listingId);
    console.log("Retrieved reviews:", reviews);

    if (postCount) {
        postCount.textContent = `${reviews.length} ${reviews.length === 1 ? 'Post' : 'Posts'}`
    }

    if (reviews.length === 0) {
        reviewContainer.innerHTML = "<p>No reviews yet for this Product.</p>";
        return;
    }

    reviewContainer.innerHTML = "";

    reviews.forEach((review) => {
        const reviewCard = document.createElement("div");
        reviewCard.className = "card mb-3 w-100 shadow-sm";

        reviewCard.innerHTML = `
            <div class="row g-0">
                <div class="col-md-4 d-flex align-items-center justify-content-center p-3">
                    <img src="${review.pfp || 'images/avatar placeholder.jpg'}" class="img-fluid rounded-start w-50" alt="avatar img">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${review.reviewer || 'User'}</h5>
                        <p class="card-text">${review.details}</p>
                        <p class="card-text"><strong>Rating:</strong> ${review.rating}/100</p>
                        <p class="card-text"><small class="text-body-secondary">Posted: ${review.created && typeof review.created.toDate === 'function' ? review.created.toDate().toLocaleDateString() : 'Recently'}</small></p>
                    </div>
                </div>
            </div>           
        `;

        reviewContainer.appendChild(reviewCard);
    });
}

function initReviewsUI() {

    // --- Information for Review Posting ---
    const params = new URLSearchParams(location.search);
    const listingId = params.get("id");

    console.log("Listing ID:", listingId);

    // --- DOM Elements ---
    const reviewview = document.getElementById("expanded-reviews-page");
    const filterview = document.getElementById("filterpage");
    const sortview = document.getElementById("sortpage");
    const filterbtn = document.getElementById("filterbtn");
    const sortbtn = document.getElementById("sortbtn");
    const reviewbackbtn = document.getElementById("back-in-review");
    const sortbackbtn = document.getElementById("back-in-sort");
    const filterbackbtn = document.getElementById("back-in-filter");
    const writereviewbtn = document.getElementById("to-write-review");
    const listingRedirectUrl = "listing_page.html";

    // --- Helper Functions ---
    // Toggle element visibility
    function setVisible(el, visible) {
        el.classList.toggle('d-none', !visible);
    };

    if (listingId) {
        displayAllReviews(listingId);
    }

    // --- Event Listeners ---
    writereviewbtn.addEventListener("click", () => {
        location.href = `review_writing.html?id=${listingId}`;
    });

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