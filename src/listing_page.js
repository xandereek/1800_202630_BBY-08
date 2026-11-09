import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { retrieveReview } from "./reviewManager.js";

function PullLink() {
    let input_link = 'no input_link inputted';

    // pull the inputted text(the link) from the input field
    const inputElement = document.getElementById('link_input');
    if (inputElement) {
        input_link = inputElement.value;
    }

    // save it for the session
    sessionStorage.setItem('input_link', input_link);
    console.log('link inputted: ' + input_link);
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
    console.log("PlaceLink() started");

    let saved_link = sessionStorage.getItem('input_link');
    console.log('saved link:', saved_link);

    if (!saved_link) {
        console.log('no saved link in sessionStorage yet');
        return;
    }

    const linkPlacing = document.getElementById('link_placing');
    if (linkPlacing) {
        linkPlacing.innerHTML = 'Product Link';
        linkPlacing.href = saved_link;
    }

    let parsedTitle = '';
    try {
        let title_dashed = saved_link.split('/')[3].split('-');
        console.log('dashed title:', title_dashed);

        for (let i = 0; i < title_dashed.length; i++) {
            parsedTitle = parsedTitle + ' ' + title_dashed[i];
        }
        parsedTitle = parsedTitle.trim();
        console.log('parsed title:', parsedTitle);

        const nameElement = document.getElementById('product_name');
        if (nameElement) {
            nameElement.innerHTML = parsedTitle;
        }
    } catch (err) {
        console.error('error parsing title:', err);
    }

    try {
        const snapshot = await getDocs(collection(db, "listings"));
        console.log('listings found in firestore:', snapshot.docs.length);

        let match = null;
        let currentListingId = null

        snapshot.forEach((doc) => {
            const data = doc.data();

            let dbUrl = (data.url || '').toLowerCase();
            let dbName = (data.name || '').toLowerCase();
            let userLink = saved_link.toLowerCase();
            let userTitle = parsedTitle.toLowerCase();

            if ((dbUrl && userLink.includes(dbUrl)) || (dbUrl && dbUrl.includes(userLink.split('?')[0])) || (dbName && userTitle.includes(dbName))) {
                match = data;
                currentListingId = doc.id
            }
        });

        console.log("Current listing ID:", currentListingId)
        if (currentListingId) {
            displayReview(currentListingId);
        }
        document.getElementById("to-write-review").addEventListener("click", () => {
            location.href =`review_writing.html?id=${currentListingId}`;
        });

        document.getElementById("to-review-page").addEventListener("click", () => {
            location.href =`review_page.html?id=${currentListingId}`;
        });

        if (match) {
            console.log('match found in database:', match);
            document.getElementById('product_name').innerText = match.name;
            document.getElementById('product_price').innerText = match.price;
            document.getElementById('product_seller').innerText = "Seller: " + match.seller;
            document.getElementById('reliability_score').innerText = "Score: " + match.reliability_score + " / 100";
            document.getElementById('product_details').innerText = match.details || "";
            if (match.image) {
                document.getElementById('product_image').src = match.image;
            }
        } else {
            console.log('no match found in database, keeping parsed title');
            document.getElementById('reliability_score').innerText = "Unverified Link";
        }
    } catch (err) {
        console.error('firestore error:', err);
    }
}



window.PullLink = PullLink;
window.PlaceLink = PlaceLink;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PlaceLink);
} else {
    PlaceLink();
}
