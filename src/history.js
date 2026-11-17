import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';
import { collectionGroup, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";

async function loadUserReviewHistory(user) {
    const historyContainer = document.getElementById("history-container");
    const counterEl = document.getElementById("history-counter");

    if (!historyContainer) {
        return;
    }

    // Check if user is logged in
    if (!user) {
        historyContainer.innerHTML = "<p>Please <a href='login.html'>log in</a> to view your review history.</p>";
        if (counterEl) {
            counterEl.textContent = "";
        }
        return;
    }

    try {
        // Query all reviews where reviewer matches current user UID
        const q = query(
            collectionGroup(db, "reviews"),
            where("reviewer", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        // If no reviews found
        if (snapshot.empty) {
            if (counterEl) {
                counterEl.textContent = "0 Posts";
            }
            historyContainer.innerHTML = "<p>You have not posted any reviews yet.</p>";
            return;
        }

        if (counterEl) {
            counterEl.textContent = `${snapshot.docs.length} ${snapshot.docs.length === 1 ? 'Post' : 'Posts'}`;
        }

        historyContainer.innerHTML = "";

        // Collect all reviews into an array so we can sort them
        const reviews = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const listingId = docSnap.ref.parent.parent.id;
            reviews.push({ id: docSnap.id, listingId: listingId, ...data });
        });

        // Sort from newest to oldest
        reviews.sort((a, b) => {
            let timeA = a.created ? a.created.toMillis() : 0;
            let timeB = b.created ? b.created.toMillis() : 0;
            return timeB - timeA;
        });

        // Loop through each review and build a card
        for (let i = 0; i < reviews.length; i++) {
            const review = reviews[i];

            // Get the product name from the parent listing
            let productName = "Product";
            const listingDoc = await getDoc(doc(db, "listings", review.listingId));
            if (listingDoc.exists()) {
                productName = listingDoc.data().name || "Product";
            }

            let dateStr = "Recently";
            if (review.created && typeof review.created.toDate === 'function') {
                dateStr = review.created.toDate().toLocaleDateString();
            }

            const reviewCard = document.createElement("div");
            reviewCard.className = "card mb-3 w-100 shadow-sm";

            reviewCard.innerHTML = `
                <div class="row g-0">
                    <div class="col-md-3 d-flex align-items-center justify-content-center p-3">
                        <img src="${review.pfp || 'images/avatar placeholder.jpg'}" class="img-fluid rounded-start w-50" alt="avatar img">
                    </div>
                    <div class="col-md-9">
                        <div class="card-body">
                            <h5 class="card-title">${productName}</h5>
                            <p class="card-text">${review.details}</p>
                            <p class="card-text"><strong>Rating:</strong> ${review.rating}/100</p>
                            <p class="card-text"><small class="text-body-secondary">Posted: ${dateStr}</small></p>
                            <a href="listing_page.html?id=${review.listingId}" class="btn btn-primary btn-sm">View Product Listing</a>
                        </div>
                    </div>
                </div>           
            `;

            historyContainer.appendChild(reviewCard);
        }

    } catch (err) {
        console.error("Error loading review history:", err);
        historyContainer.innerHTML = "<p>Error loading review history. Please try again.</p>";
    }
}

// Run when auth state is resolved
onAuthReady((user) => {
    loadUserReviewHistory(user);
});
