// script-culture.js

window.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".card");

  // When you click a card, it becomes highlighted
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      // reset all cards
      cards.forEach(c => c.style.transform = "scale(1)");
      cards.forEach(c => c.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)");

      // highlight the clicked one
      card.style.transform = "scale(1.05)";
      card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
    });
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 30) {
      navbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    } else {
      navbar.style.boxShadow = "";
    }
  });
});
