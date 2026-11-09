// -------------------------------------------------------------
// src/review_writing.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the review-form submission logic
// -------------------------------------------------------------

import { onAuthReady } from "./authentication.js";
import { addReview } from "./reviewManager.js";

// --- A Manager to handle Review form Logic ---

const params = new URLSearchParams(location.search);
const reviewForm = document.getElementById("review-form");
const submitbtn = reviewForm.querySelector("button[type='submit']");
const listingId = params.get("id");

console.log("Listing ID:", listingId);

let currentUser = null;

onAuthReady((user) => {
    if (!user) {
        location.href = "loginSignup.html";
        return;
    }
    currentUser = user;
});

async function postReview(e) {
    e.preventDefault();

    if (!currentUser) {
        console.error("User needs to be logged in");
        alert("You must be logged in to post a review")
        location.href = "loginSignup.html";
        return;
    }

    try {
        if (submitbtn) {
            submitbtn.disabled = true;
        }
        const rating = Number(document.getElementById("ratingrange").value);
        const details = document.getElementById("review-form-details").value.trim();
        const reviewerPfp = currentUser.photoURl || "images/avatar%20placeholder.jpg";

        if (!rating || !details) {
            alert("Please provide both a rating and a message.");
            return;
        }

        await addReview(
            listingId,
            currentUser.uid,
            rating,
            details,
            0,
            reviewerPfp
        );

        console.log("Review posted!");
        reviewForm.reset();
        alert("Your review has been posted!")
        location.href = `review_page.html?id=${listingId}`;
    } catch (error) {
        console.error("Error posting review", error);
        alert("Failed to post review. Please try again");
    } finally {
        if (submitbtn) {
            submitbtn.disabled = false;
        }
    }
};

reviewForm.addEventListener("submit", postReview);