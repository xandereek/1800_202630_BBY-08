import { updateProfile } from 'firebase/auth';
import { onAuthReady, logoutUser } from './authentication.js';
import { updateReviewerNames } from './reviewManager.js';

let currentUser = null;

const signedOutPrompt = document.getElementById('signed-out-prompt');
const profileContent = document.getElementById('profile-content');
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileAlert = document.getElementById('profileAlert');
const profileForm = document.getElementById('profileForm');
const nameInput = document.getElementById('nameInput');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const logoutBtn = document.getElementById('logoutBtn');

function showAlert(message, type = 'success') {
    profileAlert.textContent = message;
    profileAlert.className = `alert alert-${type}`;
}

function hideAlert() {
    profileAlert.className = 'alert d-none';
    profileAlert.textContent = '';
}

function showHeader(user) {
    const displayName = user.displayName || 'User';
    profileName.textContent = displayName;
    profileEmail.textContent = user.email || '';
    profileAvatar.src = user.photoURL || 'images/avatar%20placeholder.jpg';
}

onAuthReady((user) => {
    if (!user) {
        currentUser = null;
        signedOutPrompt.classList.remove('d-none');
        profileContent.classList.add('d-none');
        return;
    }

    currentUser = user;
    signedOutPrompt.classList.add('d-none');
    profileContent.classList.remove('d-none');

    showHeader(user);
    nameInput.value = user.displayName || '';
});

editBtn?.addEventListener('click', () => {
    hideAlert();
    nameInput.disabled = false;
    saveBtn.disabled = false;
    nameInput.focus();
});

profileForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentUser) return;

    const updatedName = nameInput.value.trim();
    if (!updatedName) {
        showAlert('Display name cannot be empty.', 'danger');
        nameInput.focus();
        return;
    }

    saveBtn.disabled = true;
    try {
        await updateProfile(currentUser, { displayName: updatedName });
        await updateReviewerNames(currentUser.uid, updatedName);
        nameInput.disabled = true;
        showHeader(currentUser);
        showAlert('Profile updated!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        saveBtn.disabled = false;
        showAlert('Failed to update display name. Please try again.', 'danger');
    }
});

logoutBtn?.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    try {
        await logoutUser();
    } catch (error) {
        console.error('Error logging out:', error);
        logoutBtn.disabled = false;
        showAlert('Failed to log out. Please try again.', 'danger');
    }
});
