// contact.js — Handle contact form submission via fetch API

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('input[type="submit"]');
    const originalText = submitBtn.value;

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('contact').value,
      message: document.getElementById('message').value,
      subscribe: document.getElementById('subscribe').checked
    };

    try {
      submitBtn.disabled = true;
      submitBtn.value = 'Sending...';

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = '/thank-you.html';
      } else {
        alert(data.message || 'Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.value = originalText;
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
      submitBtn.disabled = false;
      submitBtn.value = originalText;
    }
  });
});
