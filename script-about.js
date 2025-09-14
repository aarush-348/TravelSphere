// script.js

window.addEventListener("DOMContentLoaded", function () {
  // ---------------- Highlight Team Member on Click ----------------
  const members = document.querySelectorAll(".member");

  members.forEach(function (member) {
    member.addEventListener("click", function () {
      // Remove highlight from all
      members.forEach(m => m.style.backgroundColor = "#f9f9f9");

      // Highlight the one clicked
      member.style.backgroundColor = "#e6f2ff";
    });
  });

  // ---------------- Navbar Shadow on Scroll ----------------
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 30) {
      navbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    } else {
      navbar.style.boxShadow = "";
    }
  });
});
