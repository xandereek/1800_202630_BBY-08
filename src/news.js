import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

async function LoadNews() {
    //gather the stuff from firebase
    const listings = await getDocs(collection(db, "listings"));

    let top_listings = []

    listings.forEach((doc) => {
        const data = doc.data();

        if (top_listings.length < 3) {
            top_listings.push(data);
        }
        else {
            for (i = 0; i < 3; i++) {
                if (top_listings[i].frequency < data.frequency) {
                    top_listings[i] = data;
                }
            }
        }
    });

    console.log('Top listings:', top_listings);

    //put the stuff on the news thignys
    for (let i = 1; i <= top_listings.length; i++) {
        let current_listing = top_listings[i - 1]
        console.log('current index:', i)
        document.getElementById(`news_card_title_${i}`).innerHTML = current_listing.name + ` (${current_listing.price})`
        document.getElementById(`news_card_body_${i}`).innerHTML = `This product sold by "${current_listing.seller}" Has been inputted the most recently. <br>Heres what we have to say about it: "${current_listing.details}"`

        console.log('current score', current_listing.reliability_score)
        if (current_listing.reliability_score < 25) {
            document.getElementById(`trust_score_${i}`).innerHTML = `<div class="alert alert-danger" role="alert">Our rating for this listings is: ${current_listing.reliability_score}/100</div>`
        }
        else if (current_listing.reliability_score < 50) {
            document.getElementById(`trust_score_${i}`).innerHTML = `<div class="alert alert-warning" role="alert">Our rating for this listings is: ${current_listing.reliability_score}/100</div>`
        }
        else if (current_listing.reliability_score < 75) {
            document.getElementById(`trust_score_${i}`).innerHTML = `<div class="alert alert-primary" role="alert">Our rating for this listings is: ${current_listing.reliability_score}/100</div>`
        }
        else{
            document.getElementById(`trust_score_${i}`).innerHTML = `<div class="alert alert-success" role="alert">Our rating for this listings is: ${current_listing.reliability_score}/100</div>`
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LoadNews);
} else {
    LoadNews();
}