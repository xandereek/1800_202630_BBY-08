import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';
import { collectionGroup, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { deleteReview } from "./reviewManager.js";

async function loadUserListingHistory(user) {
    const listingHistoryContainer = document.getElementById("listing-history-container");
    const listingCounter = document.getElementById("listing-counter");

    if (!listingHistoryContainer) {
        return;
    }

    // Check if user is logged in
    if (!user) {
        listingHistoryContainer.innerHTML = "<p>Please <a href='login.html'>log in</a> to view your listing history.</p>";
        if (listingCounter) {
            listingCounter.textContent = "";
        }
        return;
    }

    try {
        let visitedIds = [];
        try {
            // Retrieve visited Listings from local storage
            const storedIds = localStorage.getItem("visitedListings");
            const parsedIds = storedIds ? JSON.parse(storedIds) : [];

            if (Array.isArray(parsedIds)) {
                visitedIds = parsedIds;
            }
        } catch (err) {
            console.error("Could not parse visitedListings form localStorage:", err);
            visitedIds = [];
        }

        if (visitedIds.length === 0) {
            if (listingCounter) {
                listingCounter.textContent = "0 Visited";
            }
            listingHistoryContainer.innerHTML = "<p>You have not viewed any listings yet.</p>";
            return;
        }

        const listings = [];
        for (let i = 0; i < visitedIds.length; i++) {
            const listingId = visitedIds[i];
            const listingsnap = await getDoc(doc(db, "listings", listingId));
            if (listingsnap.exists()) {
                listings.push({ id: listingId, ...listingsnap.data() });
            }
        }

        if (listings.length === 0) {
            if (listingCounter) {
                listingCounter.textContent = "0 Visited";
            }
            listingHistoryContainer.innerHTML = "<p>You have not viewed any listings yet.</p>";
            return;
        }

        if (listingCounter) {
            listingCounter.textContent = `${listings.length} Visited`;
        }

        listingHistoryContainer.innerHTML = "";

        for (let i = 0; i < listings.length; i++) {
            const listing = listings[i];
            const listingCard = document.createElement("div");
            listingCard.className = "card mb-3 w-100 shadow-sm";

            listingCard.innerHTML = `
                <div class="row g-0">
                    <div class="col-md-12">
                        <div class="card-body">
                            <h5 class="card-title">${listing.name}</h5>
                            <p class="card-text mb-1"><strong>Price:</strong> ${listing.price}</p>
                            <p class="card-text mb-1"><strong>Seller:</strong> ${listing.seller}</p>
                            <p class="card-text mb-1"><strong>Type:</strong> ${listing.product_type}</p>
                            <p class="card-text mb-1"><strong>Score:</strong> ${listing.reliability_score}</p>
                            <div class="d-flex flex-wrap gap-2">
                                <a href="listing_page.html?id=${listing.id}" class="btn btn-primary btn-sm">View Product Listing</a>
                                <button type="button" class="btn btn-outline-danger btn-sm delete-listing-history-btn">Delete</button>
                            </div>
                        </div>
                    </div>
                </div> 
            `;

            const deleteBtn = listingCard.querySelector(".delete-listing-history-btn");
            deleteBtn?.addEventListener("click", () => {
                if (!window.confirm("Are you sure you want to delete this listing from your history?")) {
                    return;
                }
                deleteBtn.disabled = true;
                try {
                    let currentIds = [];
                    try {
                        const storedIds = localStorage.getItem("visitedListings");
                        const parsedIds = storedIds ? JSON.parse(storedIds) : [];

                        if (Array.isArray(parsedIds)) {
                            currentIds = parsedIds;
                        }
                    } catch (err) {
                        console.error("Could not parse visitedListings from localStorage:", err);
                        currentIds = [];
                    }

                    const updatedIds = currentIds.filter((id) => id !== listing.id);
                    localStorage.setItem("visitedListings", JSON.stringify(updatedIds));

                    listingCard.remove();

                    const remainingIds = listingHistoryContainer.querySelectorAll(".card").length;
                    if (listingCounter) {
                        listingCounter.textContent = `${remainingIds} Visited`;
                    }
                    if (remainingIds === 0) {
                        listingHistoryContainer.innerHTML = "<p>You have not viewed any listings yet.</p>";
                    }
                } catch (err) {
                    console.error("Error Removing Listing from history:", err);
                    deleteBtn.disabled = false;
                    alert("Failed to delete listing from history. Please try again.");
                }
            });

            listingHistoryContainer.appendChild(listingCard);
        }
    } catch (err) {
        console.error("Error loading listing history:", err);
        listingHistoryContainer.innerHTML = "<p>Error loading listing history. Please try again.</p>";
    }
}

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
                    <div class="col-md-3 d-none d-md-flex align-items-center justify-content-center p-3">
                        <img src="${review.pfp || 'images/avatar placeholder.jpg'}" class="img-fluid rounded-start w-50" alt="avatar img">
                    </div>
                    <div class="col-md-9">
                        <div class="card-body">
                            <h5 class="card-title">${productName}</h5>
                            <p class="card-text">${review.details}</p>
                            <p class="card-text"><strong>Rating:</strong> ${review.rating}/100</p>
                            <p class="card-text"><small class="text-body-secondary">Posted: ${dateStr}</small></p>
                            <div class="d-flex flex-wrap gap-2">
                                <a href="listing_page.html?id=${review.listingId}" class="btn btn-primary btn-sm">View Product Listing</a>
                                <button type="button" class="btn btn-outline-danger btn-sm delete-review-btn">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>           
            `;

            const deleteBtn = reviewCard.querySelector(".delete-review-btn");
            deleteBtn?.addEventListener("click", async () => {
                if (!window.confirm("Are you sure you want to delete this review?")) {
                    return;
                }
                deleteBtn.disabled = true;
                deleteBtn.textContent = "Deleting...";
                try {
                    await deleteReview(review.listingId, review.id);
                    reviewCard.remove();
                    const remaining = historyContainer.querySelectorAll(".card").length;
                    if (counterEl) {
                        counterEl.textContent = `${remaining} ${remaining === 1 ? 'Post' : 'Posts'}`;
                    }
                    if (remaining === 0) {
                        historyContainer.innerHTML = "<p>You have not posted any reviews yet.</p>";
                    }
                } catch (err) {
                    console.error("Error deleting review from history:", err);
                    deleteBtn.disabled = false;
                    deleteBtn.textContent = "Delete";
                    alert("Failed to delete review. Please try again.");
                }
            });

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
    loadUserListingHistory(user);
});
