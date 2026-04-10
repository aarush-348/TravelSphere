window.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector("form");
  const submitBtn = form.querySelector('input[type="submit"]');
  const resetBtn = form.querySelector('input[type="reset"]');
  const requiredFields = ["name", "contact", "email", "message"];

  // Function to check if all required fields are filled
  function checkFields() {
    let allFilled = true;
    requiredFields.forEach(id => {
      const field = document.getElementById(id);
      if (!field.value.trim()) {
        allFilled = false;
      }
    });

    if (allFilled) {
      submitBtn.style.opacity = "1";
      submitBtn.style.pointerEvents = "auto";
    } else {
      submitBtn.style.opacity = "0.3";
      submitBtn.style.pointerEvents = "none";
    }
  }

  // Run checkFields on page load and whenever input changes
  checkFields();
  requiredFields.forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener("input", checkFields);
  });

  // Highlight required fields if empty on submit
  form.addEventListener("submit", function(e) {
    let valid = true;

    requiredFields.forEach(function(id) {
      const field = document.getElementById(id);
      if (!field.value.trim()) {
        field.style.border = "1px";
        field.style.borderColor = "red";
        valid = false;
      } else {
        field.style.borderColor = "#ccc";
      }
    });

    if (!valid) {
      e.preventDefault(); // prevent form submission
      alert("Please fill in all required fields!");
    }
  });

  // Reset highlights and check fields when reset button is clicked
  resetBtn.addEventListener("click", function() {
    requiredFields.forEach(function(id) {
      document.getElementById(id).style.borderColor = "#ccc";
    });
    checkFields();
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", function() {
    if (window.scrollY > 30) {
      navbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    } else {
      navbar.style.boxShadow = "";
    }
  });

  // Hover effect for Submit button
  submitBtn.addEventListener("mouseenter", function() {
    submitBtn.style.transform = "scale(1.05)";
    submitBtn.style.transition = "transform 0.2s ease";
  });

  submitBtn.addEventListener("mouseleave", function() {
    submitBtn.style.transform = "scale(1)";
  });

  // Hover effect for Reset button
  resetBtn.addEventListener("mouseenter", function() {
    resetBtn.style.transform = "scale(1.05)";
    resetBtn.style.transition = "transform 0.2s ease";
  });

  resetBtn.addEventListener("mouseleave", function() {
    resetBtn.style.transform = "scale(1)";
  });
});
