import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { recordVisitedListing } from "./listing_page.js";

function formatPrice(value) {
    const cleanup = value.replace(/[$,\s]/g, "");
    const number = Number(cleanup);
    if (!cleanup || Number.isNaN(number) || number < 0) {
        return null;
    }
    return `$${number.toFixed(2)}`
}


async function send_listing() {
    const submitBtn = document.getElementById('listing_prompt_submit');
    const name = document.getElementById('product_name').value.trim();
    const price = document.getElementById('product_price').value.trim();
    const seller = document.getElementById('product_seller').value.trim();
    const product_type = document.getElementById('product_type').value.trim();
    const formattedPrice = formatPrice(price);

    if (!name || !formattedPrice || !seller || !product_type) {
        alert("Please fill out all fields correctly");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Adding Listing...";
    }

    try {
        const url = sessionStorage.getItem('input_link') || '';

        const new_listing = {
            name: name,
            price: formattedPrice,
            seller: seller,
            url: url,
            reliability_score: 50,
            frequency: 1,
            details: "User submitted listing",
            product_type: product_type
        };

        const listings = collection(db, "listings");
        const docRef = await addDoc(listings, new_listing);
        recordVisitedListing(docRef.id);

        console.log("Created listing ID:", docRef.id);
        window.location.href = `listing_page.html?id=${docRef.id}`;
    } catch (err) {
        console.error("Failed to create listing:", err);
        alert("Something went wrong while trying to create the listing. Please try again.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
        }
    }
}

const submitBtn = document.getElementById('listing_prompt_submit');
submitBtn?.addEventListener('click', send_listing);