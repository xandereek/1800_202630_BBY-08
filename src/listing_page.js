import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { retrieveReview } from "./reviewManager.js";

export function parseTitleFromUrl(url) {
    if (!url) return '';
    try {
        const parts = url.split('/');
        if (parts.length > 3 && parts[3]) {
            const titleDashed = parts[3].split('-');
            return titleDashed.join(' ').trim();
        }
    } catch (err) {
        console.error('error parsing title:', err);
    }
    return '';
}

export async function findMatchingListing(rawUrl) {
    if (!rawUrl) return null;

    const parsedTitle = parseTitleFromUrl(rawUrl);
    const userLink = rawUrl.toLowerCase();
    const userTitle = parsedTitle.toLowerCase();

    try {
        const snapshot = await getDocs(collection(db, "listings"));
        let match = null;
        let matchId = null;

        snapshot.forEach((docItem) => {
            const data = docItem.data();
            const dbUrl = (data.url || '').toLowerCase();
            const dbName = (data.name || '').toLowerCase();

            if (
                (dbUrl && userLink.includes(dbUrl)) ||
                (dbUrl && dbUrl.includes(userLink.split('?')[0])) ||
                (dbName && userTitle && userTitle.includes(dbName))
            ) {
                match = data;
                matchId = docItem.id;
            }
        });

        if (match) {
            return { id: matchId, ...match };
        }
    } catch (err) {
        console.error("Firestore lookup error in findMatchingListing:", err);
    }
    return null;
}

export async function handleScan() {
    const inputElement = document.getElementById('link_input');
    const inputLink = inputElement ? inputElement.value.trim() : '';

    if (!inputLink) {
        alert("Please paste a product link first.");
        return;
    }

    sessionStorage.setItem('input_link', inputLink);
    console.log('link inputted:', inputLink);

    const scanButtons = document.querySelectorAll('#scan_button, .scan-button');
    scanButtons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = "Scanning...";
    });

    try {
        const match = await findMatchingListing(inputLink);
        if (match && match.id) {
            console.log("Product found in database! Redirecting to listing page:", match.id);
            window.location.href = `listing_page.html?id=${match.id}`;
        } else {
            console.log("Product not found in database. Redirecting to listing prompt page.");
            window.location.href = "listing_prompt.html";
        }
    } catch (err) {
        console.error("Error during scan check:", err);
        window.location.href = "listing_prompt.html";
    } finally {
        scanButtons.forEach(btn => {
            btn.disabled = false;
            btn.textContent = "Scan Page";
        });
    }
}

function PullLink() {
    handleScan();
}

async function displayReview(listingId) {
    const reviewContainer = document.getElementById("listing-reviews-container");
    if (!reviewContainer) {
        return;
    }

    const reviews = await retrieveReview(listingId);
    console.log("Retrieved reviews:", reviews);

    if (reviews.length === 0) {
        reviewContainer.innerHTML = "<p>No reviews yet for this Product.</p>";
        return;
    }

    reviewContainer.innerHTML = "";

    const limitReviews = reviews.slice(0, 5);

    limitReviews.forEach((review) => {
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

async function PlaceLink() {
    const linkPlacing = document.getElementById('link_placing');
    const nameElement = document.getElementById('product_name');

    // Only run if on listing_page.html or listing_prompt.html
    if (!linkPlacing && !nameElement) {
        return;
    }

    console.log("PlaceLink() started");

    let saved_link = sessionStorage.getItem('input_link');
    console.log('saved link:', saved_link);

    if (saved_link && linkPlacing) {
        linkPlacing.innerHTML = 'Product Link';
        linkPlacing.href = saved_link;
    }

    let parsedTitle = parseTitleFromUrl(saved_link);
    if (parsedTitle && nameElement) {
        nameElement.innerHTML = parsedTitle;
        nameElement.value = parsedTitle;
    }

    try {
        const params = new URLSearchParams(location.search);
        const urlId = params.get('id');

        let match = null;
        let currentListingId = urlId || null;

        if (urlId) {
            const docSnap = await getDoc(doc(db, "listings", urlId));
            if (docSnap.exists()) {
                match = docSnap.data();
            }
        }

        if (!match && saved_link) {
            const found = await findMatchingListing(saved_link);
            if (found) {
                match = found;
                currentListingId = found.id;
            }
        }

        console.log("Current listing ID:", currentListingId);
        if (currentListingId) {
            displayReview(currentListingId);
        }

        document.getElementById("to-write-review")?.addEventListener("click", () => {
            location.href = `review_writing.html?id=${currentListingId}`;
        });

        document.getElementById("to-review-page")?.addEventListener("click", () => {
            location.href = `review_page.html?id=${currentListingId}`;
        });

        if (match) {
            console.log('match found in database:', match);
            if (document.getElementById('product_name')) {
                document.getElementById('product_name').innerText = match.name;
            }
            if (document.getElementById('product_price')) {
                document.getElementById('product_price').innerText = match.price;
            }
            if (document.getElementById('product_seller')) {
                document.getElementById('product_seller').innerText = "Seller: " + match.seller;
            }
            if (document.getElementById('reliability_score')) {
                document.getElementById('reliability_score').innerText = "Score: " + match.reliability_score + " / 100";
            }
            if (document.getElementById('product_details')) {
                document.getElementById('product_details').innerText = match.details || "";
            }
            if (match.image && document.getElementById('product_image')) {
                document.getElementById('product_image').src = match.image;
            }
        } else {
            console.log('no match found in database, keeping parsed title');
            const scoreEl = document.getElementById('reliability_score');
            if (scoreEl) {
                scoreEl.innerText = "Unverified Link";
            }
        }
    } catch (err) {
        console.error('firestore error:', err);
    }
}

function initListingUI() {
    const scanBtn = document.getElementById('scan_button');
    if (scanBtn) {
        scanBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleScan();
        });
    }

    const linkInput = document.getElementById('link_input');
    if (linkInput) {
        linkInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleScan();
            }
        });
    }

    PlaceLink();
}

window.PullLink = PullLink;
window.PlaceLink = PlaceLink;
window.handleScan = handleScan;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListingUI);
} else {
    initListingUI();
}
