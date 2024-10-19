// Hamburger menu functionality using the eye button
let eye = document.getElementById("eye");
let links = document.querySelector(".links");

// Ensure the eye starts closed
eye.classList.add('closed');
links.classList.remove("open"); // Ensure the links are hidden initially

// Toggle the eye opening/closing and the menu list visibility
eye.addEventListener('click', () => {
    // Toggle the eye open/close animation
    if (eye.classList.contains('open')) {
        eye.classList.remove('open');
        eye.classList.add('closed');
        links.classList.remove("open"); // Hide the menu when closing the eye
    } else {
        eye.classList.remove('closed');
        eye.classList.add('open');
        links.classList.add("open"); // Show the menu when opening the eye
    }
});