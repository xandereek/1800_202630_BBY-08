// -------------------------------------------------------------
// src/review_writing.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the review-form submission logic
// -------------------------------------------------------------

import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { addReview } from "./reviewManager.js";

// --- A Manager to handle Review form Logic ---

const params = new URLSearchParams(location.search);
const reviewForm = document.getElementById("review-form");
const submitbtn = reviewForm.querySelector("button[type='submit']");
const cancelbtn = document.getElementById("review-form-cancel");
const listingId = params.get("id");

console.log("Listing ID:", listingId);

let currentUser = null;

onAuthReady((user) => {
    if (!user) {
        location.href = "login.html";
        return;
    }
    currentUser = user;
    loadListingInfo(currentUser);
});

async function postReview(e) {
    e.preventDefault();

    if (!currentUser) {
        console.error("User needs to be logged in");
        alert("You must be logged in to post a review")
        location.href = "login.html";
        return;
    }

    try {
        if (submitbtn) {
            submitbtn.disabled = true;
        }
        const rating = Number(document.getElementById("ratingrange").value);
        const details = document.getElementById("review-form-details").value.trim();
        const reviewerPfp = currentUser.photoURL || "images/avatar%20placeholder.jpg";
        const reviewerName = currentUser.displayName || "User";

        if (Number.isNaN(rating) || !details) {
            alert("Please provide both a rating and a message.");
            return;
        }

        await addReview(
            listingId,
            currentUser.uid,
            rating,
            details,
            0,
            reviewerPfp,
            reviewerName
        );

        console.log("Review posted!");
        reviewForm.reset();
        alert("Your review has been posted!")
        location.href = listingId
            ? `listing_page.html?id=${encodeURIComponent(listingId)}`
            : "home.html";
    } catch (error) {
        console.error("Error posting review", error);
        alert("Failed to post review. Please try again");
    } finally {
        if (submitbtn) {
            submitbtn.disabled = false;
        }
    }
};

if (cancelbtn) {
    cancelbtn.addEventListener("click", () => {
        reviewForm.reset();
        if (document.referrer && document.referrer.includes(location.hostname)) {
            history.back();
        } else {
            location.href = listingId
                ? `review_page.html?id=${encodeURIComponent(listingId)}`
                : "home.html";
        }
    });
}

async function loadListingInfo() {
    const name = document.getElementById("review-form-product-name");
    const price = document.getElementById("review-form-product-price");
    const url = document.getElementById("review-form-product-url");

    if (!listingId) {
        return;
    }

    try {
        const snap = await getDoc(doc(db, "listings", listingId));
        console.log(snap.exists());
        if (!snap.exists()) {
            return;
        }

        const listing = snap.data();

        if (name) {
            name.textContent = listing.name || "Untitled Listing";
        }
        if (price) {
            price.textContent = listing.price !== undefined && listing.price !== null ? `${listing.price}` : "Price: N/A";
        }
        if (url) {
            const targetUrl = listing.url || `listing_page.html?id=${encodeURIComponent(listingId)}`;
            url.href = targetUrl;
            url.textContent = listing.url ? "View Source" : "View Listing";
        }
    } catch (err) {
        console.error("Error loading listing info for review form", err);
        return;
    }
}

reviewForm.addEventListener("submit", postReview);