// script.js

window.addEventListener("DOMContentLoaded", function () {
  // ---------------- Navbar Shadow ----------------
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    } else {
      navbar.style.boxShadow = "";
    }
  });

  // ---------------- Card Hover ----------------
  const cards = document.querySelectorAll(".card");

  cards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      card.style.transform = "scale(1.03)";
      card.style.transition = "transform 0.3s ease";
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "scale(1)";
    });
  });

  // ---------------- Smooth Scroll ----------------
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      const targetId = link.getAttribute("href");

      if (targetId.length > 1) {
        e.preventDefault();
        const target = document.querySelector(targetId);

        if (target) {
          const targetPosition = target.offsetTop; // distance from top
          window.scrollTo({
            top: targetPosition - 60, // adjust for navbar height if needed
            behavior: "smooth"
          });
        }
      }
    });
  });
});
