// -------------------------------------------------------------
// src/reviewManager.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the review saving and template logic
// -------------------------------------------------------------

import { db } from "./firebaseConfig.js";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

// --- A Manager to handle Review Template and Saving Logic ---

export async function addReview(listingId, userId, rscore, details, userPScore, reviewerPfp) {
    try {
        // Get reference to "reviews" subcollection
        const reviewRef = collection(db, "listings", listingId, "reviews");

        await addDoc(reviewRef, {
            reviewer: userId,
            pfp: reviewerPfp,
            reviewerScore: userPScore,
            details: details,
            rating: rscore,
            created: serverTimestamp()
        });

        console.log("Successfully Posted Review!");
    } catch (error) {
        console.error("Failed to post review", error);
    }
};

export async function retrieveReview(listingId) {
    try {
        // Get reference to "reviews" subcollection
        const reviewRef = collection(db, "listings", listingId, "reviews");
        const q = query(reviewRef, orderBy("created", "desc"));
        const snapshot = await getDocs(q);

        const reviews = [];
        snapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        return reviews;
    } catch (error) {
        console.error("Failed to retrieve reviews", error);
        return [];
    }
};
