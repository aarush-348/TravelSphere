// script-gallery.js

window.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  // Click on a card -> enlarge slightly
  cards.forEach(card => {
    card.addEventListener("click", () => {
      // reset all cards
      cards.forEach(c => c.style.transform = "scale(1)");

      // enlarge clicked one
      card.style.transform = "scale(1.05)";
      card.style.transition = "transform 0.3s ease";
    });
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      navbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    } else {
      navbar.style.boxShadow = "";
    }
  });
});
