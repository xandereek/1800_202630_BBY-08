# SafeShop Product Scanner

## Overview
SafeShop Product Scanner is a client-side JavaScript web application built for BCIT's COMP 1800 (Projects 1) course by Team BBY-08. It helps online shoppers evaluate whether a product listing is trustworthy or potentially sketchy before purchasing. Users can paste a product URL to look up its crowd-sourced reliability score (`0–100`), read and filter community reviews, submit new listings that are not yet in the database, and manage their own review history and account profile.

Developed using User-Centred Design practices and agile sprint workflows, SafeShop integrates Vite, Bootstrap 5, Firebase Authentication, and Cloud Firestore.

---

## Features Implemented So Far

- **Product Link Scanner & Smart Lookup**
  - Paste a product URL on the landing/home page (`index.html` / `home.html`) to check Firestore for a matching listing by URL or parsed product title.
  - Redirects directly to the product's listing page (`listing_page.html?id=...`) when found, or to the submission prompt (`listing_prompt.html`) when a listing is not yet in the database.
- **Product Listing & Dynamic Reliability Score**
  - Displays product title, price, seller, description, category placeholder image (`placehold.co`), color-coded reliability score badge (red `< 25`, yellow `<= 50`, grey `<= 75`, green `> 75`), and recent community reviews.
  - Automatically recalculates and saves a listing's `reliability_score` in Firestore whenever a review is posted or deleted (defaulting to `50` when no reviews exist).
- **Community Reviews (Write, Sort, Filter, & Delete)**
  - Authenticated users can submit `0–100` rated reviews with written feedback (`review_writing.html`).
  - Expanded reviews page (`review_page.html`) supports client-side sorting (Newest, Oldest, Highest Rating, Lowest Rating) and rating-band filtering (All, Positive `61–100`, Mixed `40–60`, Negative `0–39`).
  - Review cards display the reviewer's display name (`reviewerName`), and signed-in users can delete their own reviews with confirmation.
- **Important News Carousel**
  - Highlights the top 3 trending listings on `index.html` and `home.html` ranked by a weighted combination of search frequency and reliability score, displaying a warning alert on trending items with low reliability scores (`< 50`).
- **User Authentication, Review History, & Profile Management**
  - Email/password sign-up, login, and logout powered by Firebase Authentication (`login.html`), with auth-aware routing between `index.html` and `home.html`.
  - Personal review history page (`history.html`) showing all reviews posted by the signed-in user across products, with links back to each listing and the ability to delete reviews.
  - Profile page (`profile.html`) displaying user avatar, display name, and email, allowing display name updates (synced to Firebase Auth and existing reviews) and sign-out.
- **Responsive Mobile-Friendly Layout**
  - Shared fixed bottom navigation bar (`Home`, `History`, `Profile`) rendered via `src/navbar.js` and styled with Bootstrap 5.

---

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES Modules), [Bootstrap 5](https://getbootstrap.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firebase Authentication & Cloud Firestore)

---

## Usage & Local Setup

To run the application locally:

1. **Clone** the repository.
2. **Install dependencies** in the project root directory:
   ```bash
   npm install
   ```
3. **Configure Firebase environment variables** by creating a `.env` file in the project root with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. Open the local URL printed in your terminal (typically `http://localhost:5173`).

### Basic Walkthrough
1. Paste a product URL into the **Product Link** bar and click **Scan Page**, or browse the **Important News** carousel.
2. Sign up or log in (`login.html`) to post reviews, track your **Review History** (`history.html`), delete your own reviews, and edit your display name on the **Profile** page (`profile.html`).
3. If a scanned URL is not yet in Firestore, fill out the form on `listing_prompt.html` to add it for other shoppers.

---

## Project Structure

```text
1800_202630_BBY-08/
├── index.html              # Signed-out landing page with scanner & news carousel
├── home.html               # Signed-in home page with scanner & news carousel
├── login.html              # Email/password login and signup page
├── listing_page.html       # Product details, reliability score badge, and top reviews
├── listing_prompt.html     # Form to add an unrecognized product link to Firestore
├── review_page.html        # Full product reviews list with sort & filter views
├── review_writing.html     # Form to rate (0–100) and review a product listing
├── history.html            # Signed-in user's review history with delete support
├── profile.html            # User account info, display name editor, and logout
├── skeleton.html           # Base page template
├── src/
│   ├── authentication.js   # Firebase Auth helpers (login, signup, logout, onAuthReady)
│   ├── firebaseConfig.js   # Firebase App, Auth, and Firestore initialization
│   ├── history.js          # Review history queries, rendering, and deletion
│   ├── home.js             # Auth-based routing between index.html and home.html
│   ├── listing_page.js     # URL matching, scan handler, listing & review preview rendering
│   ├── loginSignup.js      # Login/signup form toggling and submission
│   ├── main.js             # Global Bootstrap/CSS imports and navbar loader
│   ├── navbar.js           # Shared bottom navigation bar injection
│   ├── news.js             # Important News carousel ranking and card population
│   ├── profile.js          # Profile display, displayName updates, and logout handler
│   ├── reviewManager.js    # Firestore CRUD for reviews, score recalculation, and name sync
│   ├── review_writing.js   # Review submission and cancel navigation logic
│   ├── reviews.js          # Client-side sort/filter logic and owner-only review deletion
│   └── submit_listing.js   # New listing submission from listing_prompt.html
├── styles/
│   └── style.css           # Custom styling for header, inputs, navbar padding, and carousel
├── images/                 # Local avatar and asset images
├── package.json
└── README.md
```

---

## Contributors
- **Alice** - BCIT CST Student with a passion for gaming, likes playing Minecraft on PC.
- **Nicholas M** - I don't really know what's going on but I like to pretend that I do.
- **Xander Eksteen** - BCIT CST Student with a passion for music, and interest in low-level programming languages.
- **Leon Ru** - BCIT CST Student with a passion for gaming and reading. Fun fact: "Lord of the Mysteries" and its sequel "Circle of Inevitability" is his favourite web novel.

---

## Acknowledgments

- Built upon the COMP 1800 Vite + Bootstrap + Firebase starter template.
- Bootstrap components and utilities from [Bootstrap 5](https://getbootstrap.com/) and icons from [Bootstrap Icons](https://icons.getbootstrap.com/).
- Placeholder category images generated via [placehold.co](https://placehold.co/).
- Reference documentation from [MDN Web Docs](https://developer.mozilla.org/) and [Firebase Documentation](https://firebase.google.com/docs).

---

## Limitations and Future Work

### Current Limitations
- Product metadata for unknown URLs must currently be entered manually via `listing_prompt.html` rather than scraped automatically from retailer pages.
- Listing thumbnails use category text placeholders (`placehold.co`) rather than live product photos.
- URL matching relies on client-side substring/title comparison across Firestore listings rather than server-side indexing.
- Firestore rules are currently configured for development/demo use and will need tightened production rules before public deployment.

### Planned / Future Work
- Automated product metadata & image fetching via a backend service or retailer API.
- Search frequency incrementing when existing listings are scanned.
- Editing existing reviews and allowing custom profile picture uploads.
- Production deployment (e.g., Firebase Hosting) with locked-down Firestore security rules and a multi-page Vite production build config.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
