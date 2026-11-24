// -------------------------------------------------------------
// src/reviewManager.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the review saving and template logic
// -------------------------------------------------------------

import { db } from "./firebaseConfig.js";
import { collection, collectionGroup, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// --- A Manager to handle Review Template and Saving Logic ---

export async function recalculateListingScore(listingId) {
    const reviewRef = collection(db, "listings", listingId, "reviews");
    const snapshot = await getDocs(reviewRef);

    let total = 0;
    let count = 0;
    snapshot.forEach((reviewDoc) => {
        const rating = Number(reviewDoc.data().rating);
        if (!Number.isNaN(rating)) {
            total += rating;
            count++;
        }
    });

    const updatedScore = count > 0 ? Math.round(total / count) : 50;
    const listingRef = doc(db, "listings", listingId);
    await updateDoc(listingRef, { reliability_score: updatedScore });
    return updatedScore;
}

export async function addReview(listingId, userId, rscore, details, userPScore, reviewerPfp, reviewerName = "User") {
    try {
        // Get reference to "reviews" subcollection
        const reviewRef = collection(db, "listings", listingId, "reviews");

        await addDoc(reviewRef, {
            reviewer: userId,
            reviewerName: reviewerName || "User",
            pfp: reviewerPfp,
            reviewerScore: userPScore,
            details: details,
            rating: rscore,
            created: serverTimestamp()
        });

        await recalculateListingScore(listingId);

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

export async function updateReviewerNames(userId, newName) {
    try {
        const q = query(
            collectionGroup(db, "reviews"),
            where("reviewer", "==", userId)
        );
        const snapshot = await getDocs(q);
        const updates = snapshot.docs.map((reviewDoc) =>
            updateDoc(reviewDoc.ref, { reviewerName: newName })
        );
        await Promise.all(updates);
    } catch (error) {
        console.error("Failed to sync reviewer name on existing reviews", error);
    }
}

export async function deleteReview(listingId, reviewId) {
    try {
        const targetReviewRef = doc(db, "listings", listingId, "reviews", reviewId);
        await deleteDoc(targetReviewRef);
        await recalculateListingScore(listingId);
        console.log("Successfully Deleted Review!");
    } catch (error) {
        console.error("Failed to delete review", error);
        throw error;
    }
}
