// navbar.js — Dynamic navbar: shows Login/Register or user name + Logout
// Include this script on every page

(function() {
  function updateNavbar() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    // Find the nav-right div
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;

    // Find or create the auth links container
    let authLinks = document.querySelector('.auth-links');
    if (!authLinks) {
      authLinks = document.createElement('div');
      authLinks.className = 'auth-links';
      navRight.appendChild(authLinks);
    }

    if (token && userName) {
      // User is logged in
      let adminLink = '';
      if (userRole === 'admin') {
        adminLink = '<a href="/admin.html" class="nav-auth-link">Admin</a>';
      }
      authLinks.innerHTML = `
        <span class="nav-user-name">👤 ${userName}</span>
        <a href="/bookings.html" class="nav-auth-link">My Bookings</a>
        ${adminLink}
        <a href="#" class="nav-auth-link nav-logout" id="nav-logout-btn">Logout</a>
      `;

      // Logout handler
      document.getElementById('nav-logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        window.location.href = '/index.html';
      });
    } else {
      // User is not logged in
      authLinks.innerHTML = `
        <a href="/login.html" class="nav-auth-link">Login</a>
        <a href="/register.html" class="nav-auth-link nav-register-btn">Register</a>
      `;
    }
  }

  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavbar);
  } else {
    updateNavbar();
  }
})();
