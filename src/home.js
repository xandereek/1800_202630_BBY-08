// -------------------------------------------------------------
// src/home.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the home nav button behaviour and redirects.
// -------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';
import {onAuthReady} from './authentication.js'

// --- Home Page ---
// Handles toggling between Home / History / Profile views.
// using plain DOM APIs for simplicity and maintainability.

onAuthReady(function(user){
    let current_window = window.location.pathname
    if(!user){
        console.log('user not signed in');
        if (current_window != '/index.html'){
            window.location.href = 'index.html'
        }
    }
    else{
        console.log('user signed in');
        if (current_window != '/home.html'){
            window.location.href = 'home.html'
        }
        
    }
});

