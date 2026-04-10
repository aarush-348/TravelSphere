// auth.js — Handles login and register form submissions

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('auth-error');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        errorDiv.textContent = '';

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userName', data.data.name);
          localStorage.setItem('userId', data.data._id);
          localStorage.setItem('userRole', data.data.role);
          window.location.href = '/index.html';
        } else {
          errorDiv.textContent = data.message;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Login';
        }
      } catch (err) {
        errorDiv.textContent = 'Something went wrong. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('auth-error');
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
        errorDiv.textContent = '';

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, confirmPassword })
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userName', data.data.name);
          localStorage.setItem('userId', data.data._id);
          localStorage.setItem('userRole', data.data.role);
          window.location.href = '/index.html';
        } else {
          errorDiv.textContent = data.message;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Register';
        }
      } catch (err) {
        errorDiv.textContent = 'Something went wrong. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
      }
    });
  }
});
