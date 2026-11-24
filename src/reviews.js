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
import { retrieveReview, deleteReview } from './reviewManager.js';
import { onAuthReady } from './authentication.js';

// ---Expanded Reviews Page ---
// Handles toggling between Re views/ Sort / Filter views.
// using plain DOM APIs for simplicity and maintainability.

let masterReviews = [];
let currentUser = null;
let activeListingId = null;

onAuthReady((user) => {
    currentUser = user;
    if (masterReviews.length > 0) {
        applySortFilter();
    }
});

async function displayAllReviews(listingId) {
    const reviewContainer = document.getElementById("reviews-page-container");

    if (!reviewContainer) {
        return;
    }

    if (masterReviews.length === 0) {
        const reviews = await retrieveReview(listingId);
        masterReviews = reviews || [];
        console.log("Retrieved reviews:", reviews);
    }

    applySortFilter();
}

function applySortFilter() {
    const reviewContainer = document.getElementById("reviews-page-container");
    const postCount = document.getElementById("review-page-post-counter");

    console.log("Counter element found:", postCount);

    if (!reviewContainer) {
        return;
    }
    
    const sortValue = document.getElementById("sort-select")?.value || "newest";
    const selectedFilter = document.querySelector('input[name="rating-filter"]:checked');
    const filterValue = selectedFilter ? selectedFilter.value : "all";

    let processedReviews = masterReviews.filter(review => {
        const rating = Number(review.rating);
        if (filterValue === "positive") return rating >= 61;
        if (filterValue === "mixed") return rating >= 40 && rating <= 60;
        if (filterValue === "negative") return rating <= 39;
        return true;
    });


    processedReviews.sort((a, b) => {
        const timeA = a.created ? a.created.toMillis() : 0;
        const timeB = b.created ? b.created.toMillis() : 0;
        const ratingA = Number(a.rating || 0);
        const ratingB = Number(b.rating || 0);

        if (sortValue === "newest") return timeB - timeA;
        if (sortValue === "oldest") return timeA - timeB;
        if (sortValue === "highest-rating") return ratingB - ratingA;
        if (sortValue === "lowest-rating") return ratingA - ratingB;
        return 0;
    });

    if (postCount) {
        postCount.textContent = `${processedReviews.length} ${processedReviews.length === 1 ? 'Post' : 'Posts'}`
    }

    if (processedReviews.length === 0) {
        reviewContainer.innerHTML = "<p>No reviews yet or no reviews match your criteria.</p>";
        return;
    }

    reviewContainer.innerHTML = "";

    processedReviews.forEach((review) => {
        const reviewCard = document.createElement("div");
        reviewCard.className = "card mb-3 w-100 shadow-sm";
        const isOwner = Boolean(currentUser && review.reviewer === currentUser.uid);

        reviewCard.innerHTML = `
            <div class="row g-0">
                <div class="col-md-4 d-flex align-items-center justify-content-center p-3">
                    <img src="${review.pfp || 'images/avatar placeholder.jpg'}" class="img-fluid rounded-start w-50" alt="avatar img">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${review.reviewerName || 'User'}</h5>
                        <p class="card-text">${review.details}</p>
                        <p class="card-text"><strong>Rating:</strong> ${review.rating}/100</p>
                        <p class="card-text"><small class="text-body-secondary">Posted: ${review.created && typeof review.created.toDate === 'function' ? review.created.toDate().toLocaleDateString() : 'Recently'}</small></p>
                        ${isOwner ? '<button type="button" class="btn btn-outline-danger btn-sm delete-review-btn">Delete</button>' : ''}
                    </div>
                </div>
            </div>           
        `;

        if (isOwner) {
            const deleteBtn = reviewCard.querySelector(".delete-review-btn");
            deleteBtn?.addEventListener("click", async () => {
                if (!window.confirm("Are you sure you want to delete this review?")) {
                    return;
                }
                deleteBtn.disabled = true;
                deleteBtn.textContent = "Deleting...";
                try {
                    await deleteReview(activeListingId, review.id);
                    masterReviews = masterReviews.filter((r) => r.id !== review.id);
                    applySortFilter();
                } catch (err) {
                    console.error("Error deleting review:", err);
                    deleteBtn.disabled = false;
                    deleteBtn.textContent = "Delete";
                    alert("Failed to delete review. Please try again.");
                }
            });
        }

        reviewContainer.appendChild(reviewCard);
    });    
}          


function initReviewsUI() {

    // --- Information for Review Posting ---
    const params = new URLSearchParams(location.search);
    const listingId = params.get("id");
    activeListingId = listingId;

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
    const listingRedirectUrl = listingId
        ? `listing_page.html?id=${encodeURIComponent(listingId)}`
        : "home.html";

    // --- Helper Functions ---
    // Toggle element visibility
    function setVisible(el, visible) {
        el.classList.toggle('d-none', !visible);
    };

    if (listingId) {
        displayAllReviews(listingId);
    }

    // --- Event Listeners ---
    writereviewbtn?.addEventListener("click", () => {
        if (!listingId) {
            alert("No product listing selected.");
            location.href = "home.html";
            return;
        }
        location.href = `review_writing.html?id=${encodeURIComponent(listingId)}`;
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

    document.getElementById("sort-select")?.addEventListener("change", applySortFilter);
    document.querySelectorAll('input[name="rating-filter"]').forEach(input => {
        input.addEventListener("change", applySortFilter);
    });
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', initReviewsUI);