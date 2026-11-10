import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

async function send_listing() {
    const submitBtn = document.getElementById('listing_prompt_submit');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Adding Listing...";
    }

    const name = document.getElementById('product_name').value.trim();
    const price = document.getElementById('product_price').value.trim();
    const seller = document.getElementById('product_seller').value.trim();

    const url = sessionStorage.getItem('input_link') || '';

    const new_listing = {
        name: name,
        price: `$${price}`,
        seller: seller,
        url: url,
        reliability_score: 50,
        frequency: 1,
        details: "User submitted listing"
    };

    const listings = collection(db, "listings");

    const docRef = await addDoc(listings, new_listing);

    console.log("Created listing ID:", docRef.id);

    window.location.href = `listing_page.html?id=${docRef.id}`;
}

const submitBtn = document.getElementById('listing_prompt_submit');
submitBtn?.addEventListener('click', send_listing);