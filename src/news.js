import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

async function LoadNews() {
    // Gather listings from firebase
    const listings = await getDocs(collection(db, "listings"));

    let all_listings = [];
    listings.forEach((doc) => {
        all_listings.push({ id: doc.id, ...doc.data() });
    });

    // Sort descending by frequency so the highest-frequency items come first
    all_listings.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));

    // Take top 3 unique listings
    const top_listings = all_listings.slice(0, 3);

    console.log('Top listings:', top_listings);

    // Populate each carousel slide
    for (let i = 1; i <= top_listings.length; i++) {
        let current_listing = top_listings[i - 1];
        console.log('current index:', i);

        const titleEl = document.getElementById(`news_card_title_${i}`);
        if (titleEl) {
            titleEl.innerHTML = current_listing.name + ` (${current_listing.price})`;
        }

        const bodyEl = document.getElementById(`news_card_body_${i}`);
        if (bodyEl) {
            bodyEl.innerHTML = `This product sold by "${current_listing.seller}" has been searched frequently.<br>Details: "${current_listing.details}"`;
        }

        const scoreEl = document.getElementById(`trust_score_${i}`);
        if (scoreEl) {
            if (current_listing.reliability_score < 25) {
                scoreEl.innerHTML = `<div class="alert alert-danger" role="alert">Our rating for this listing is: ${current_listing.reliability_score}/100</div>`;
            } else if (current_listing.reliability_score < 50) {
                scoreEl.innerHTML = `<div class="alert alert-warning" role="alert">Our rating for this listing is: ${current_listing.reliability_score}/100</div>`;
            } else if (current_listing.reliability_score < 75) {
                scoreEl.innerHTML = `<div class="alert alert-primary" role="alert">Our rating for this listing is: ${current_listing.reliability_score}/100</div>`;
            } else {
                scoreEl.innerHTML = `<div class="alert alert-success" role="alert">Our rating for this listing is: ${current_listing.reliability_score}/100</div>`;
            }
        }

        const readMoreBtn = document.getElementById(`news_read_more_${i}`);
        if (readMoreBtn) {
            readMoreBtn.href = `listing_page.html?id=${current_listing.id}`;
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LoadNews);
} else {
    LoadNews();
}