// -------------------------------------------------------------
// src/reviewManager.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the review saving and template logic
// -------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';
import { db, auth } from "./firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- A Manager to handle Review Template and Saving Logic ---

const reviewForm = document.getElementById("review-form")

export async function addReview(listingId, userId, rscore, details, userPScore, reviewerPfp) {
    try {
        // Get reference to "reviews" subcollection
        const reviewRef = collection(db, "listing", listingId, "reviews");

        await addDoc(reviewRef, {
            reviewer: userId,
            pfp: reviewerPfp,
            reviewerScore: userPScore,
            details: details,
            rscore: rscore,
            created: serverTimestamp()
        });

        console.log("Successfully added Review!");
    } catch (error) {
        console.error("Failed to post review", error); 
    }
}

//placeholder event listener
reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedScore = document.querySelector('input[name="inlineRadioOptions"]:checked');

    let rscore = 0
    if (selectedScore) {
        rscore = parseInt(selectedScore.id.replace("inlineRadio", ""));
    }

    const reviewTitle = document.getElementById("formGroupExampleInput").value;
    const details = document.getElementById("formGroupExampleInput2").value;

    const userId = auth.currentUser ? auth.currentUser.uid : "anonymous";
    const userPScore = 10;
    const reviewerPfp = auth.currentUser ? auth.currentUser.photoURL : "images/avatar placeholder.jpg";

    try {
        await addReview(listingId, userId, rscore, details, userPScore, reviewerPfp);
        alert("Review posted successfully!");
        location.href = "review_page.html";
    } catch (error) {
        console.error("Error submitting form:", error);
    }
})
