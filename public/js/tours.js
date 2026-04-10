// tours.js — Fetch tours from API, render cards, handle search/filter, and tour detail modal

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('tours-container');
  if (!container) return;

  let allTours = [];

  // Helper: generate star rating HTML
  function starsHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }

  // Render tour cards
  function renderTours(tours) {
    if (tours.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:2rem; color:#666; grid-column: 1/-1;">No tours found matching your search.</p>';
      return;
    }

    const token = localStorage.getItem('token');

    container.innerHTML = tours.map(tour => `
      <div class="card tour-card" data-tour-id="${tour._id}">
        <img src="${tour.imageUrl}" alt="${tour.name}">
        <p class="tour-name">${tour.name}</p>
        <div class="tour-meta">
          <span class="tour-location">📍 ${tour.location}</span>
          <span class="tour-price">₹${tour.price.toLocaleString('en-IN')}</span>
        </div>
        <div class="tour-meta">
          <span class="tour-rating">${starsHTML(tour.averageRating)} ${tour.averageRating.toFixed(1)}</span>
          <span class="tour-duration">${tour.duration} days</span>
        </div>
        <div class="tour-actions">
          <button class="btn tour-details-btn" data-id="${tour._id}">View Details</button>
          ${token ? `<button class="btn wishlist-btn" data-id="${tour._id}" title="Add to Wishlist">♡</button>` : ''}
        </div>
      </div>
    `).join('');

    // Attach click handlers for detail buttons
    document.querySelectorAll('.tour-details-btn').forEach(btn => {
      btn.addEventListener('click', () => openTourDetail(btn.dataset.id));
    });

    // Attach wishlist handlers
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWishlist(btn.dataset.id, btn);
      });
    });
  }

  // Fetch and render all tours
  async function fetchTours(queryString = '') {
    try {
      const res = await fetch('/api/tours' + queryString);
      const data = await res.json();
      if (data.success) {
        allTours = data.data;
        renderTours(allTours);
      }
    } catch (error) {
      container.innerHTML = '<p style="text-align:center; padding:2rem; color:#c94f4f; grid-column:1/-1;">Failed to load tours. Please refresh.</p>';
    }
  }

  // Search and filter handler
  const searchInput = document.getElementById('tour-search');
  const sortSelect = document.getElementById('tour-sort');

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = buildQuery();
        fetchTours(query);
      }, 300);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const query = buildQuery();
      fetchTours(query);
    });
  }

  function buildQuery() {
    const params = new URLSearchParams();
    if (searchInput && searchInput.value.trim()) {
      params.set('search', searchInput.value.trim());
    }
    if (sortSelect && sortSelect.value) {
      params.set('sortBy', sortSelect.value);
    }
    const qs = params.toString();
    return qs ? '?' + qs : '';
  }

  // Toggle wishlist
  async function toggleWishlist(tourId, btn) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add tours to your wishlist.');
      return;
    }
    try {
      const res = await fetch(`/api/auth/wishlist/${tourId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        btn.textContent = data.wishlisted ? '♥' : '♡';
        btn.classList.toggle('wishlisted', data.wishlisted);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  }

  // Open tour detail modal
  async function openTourDetail(tourId) {
    const token = localStorage.getItem('token');

    // Fetch tour data and reviews in parallel
    const [tourRes, reviewsRes] = await Promise.all([
      fetch(`/api/tours/${tourId}`),
      fetch(`/api/reviews/${tourId}`)
    ]);
    const tourData = await tourRes.json();
    const reviewsData = await reviewsRes.json();

    if (!tourData.success) return;

    const tour = tourData.data;
    const reviews = reviewsData.success ? reviewsData.data : [];

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'tour-modal-overlay';
    modal.innerHTML = `
      <div class="tour-modal">
        <button class="modal-close">&times;</button>
        <div class="modal-content">
          <img src="${tour.imageUrl}" alt="${tour.name}" class="modal-img">
          <div class="modal-info">
            <h2>${tour.name}</h2>
            <p>${tour.description}</p>
            <div class="modal-details">
              <span>📍 ${tour.location}</span>
              <span>💰 ₹${tour.price.toLocaleString('en-IN')} per person</span>
              <span>📅 ${tour.duration} days</span>
              <span>👥 Max ${tour.maxGroupSize} people</span>
              <span>${starsHTML(tour.averageRating)} ${tour.averageRating.toFixed(1)} (${tour.totalReviews} reviews)</span>
            </div>

            ${token ? `
              <div class="booking-section">
                <h3>Book This Tour</h3>
                <form id="booking-form">
                  <input type="hidden" name="tourId" value="${tour._id}">
                  <label for="booking-date">Select Date:</label>
                  <input type="date" id="booking-date" name="date" required min="${new Date().toISOString().split('T')[0]}">
                  <label for="booking-people">Number of People:</label>
                  <input type="number" id="booking-people" name="numberOfPeople" min="1" max="${tour.maxGroupSize}" value="1" required>
                  <p class="booking-total">Total: ₹<span id="booking-price">${tour.price.toLocaleString('en-IN')}</span></p>
                  <button type="submit" class="btn">Book Now</button>
                </form>
                <div id="booking-message"></div>
              </div>
            ` : '<p class="login-prompt"><a href="/login.html">Login</a> to book this tour or write a review.</p>'}

            <div class="reviews-section">
              <h3>Reviews (${reviews.length})</h3>
              ${token ? `
                <form id="review-form">
                  <div class="star-input">
                    <label>Your Rating:</label>
                    <div class="star-selector">
                      ${[1,2,3,4,5].map(n => `<span class="star-option" data-value="${n}">☆</span>`).join('')}
                    </div>
                    <input type="hidden" id="review-rating" name="rating" required>
                  </div>
                  <textarea id="review-comment" name="comment" placeholder="Write your review..." rows="3" required></textarea>
                  <button type="submit" class="btn">Submit Review</button>
                  <div id="review-message"></div>
                </form>
              ` : ''}
              <div class="reviews-list">
                ${reviews.length > 0 ? reviews.map(r => `
                  <div class="review-item">
                    <div class="review-header">
                      <strong>${r.user?.name || 'Anonymous'}</strong>
                      <span class="review-stars">${starsHTML(r.rating)}</span>
                      <span class="review-date">${new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>${r.comment}</p>
                  </div>
                `).join('') : '<p class="no-reviews">No reviews yet. Be the first to review!</p>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = '';
      }
    });

    // Star selector
    const starOptions = modal.querySelectorAll('.star-option');
    const ratingInput = modal.querySelector('#review-rating');
    starOptions.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value);
        ratingInput.value = val;
        starOptions.forEach((s, i) => {
          s.textContent = i < val ? '★' : '☆';
          s.classList.toggle('active', i < val);
        });
      });
    });

    // Booking form — price calculation
    const bookingPeople = modal.querySelector('#booking-people');
    const bookingPrice = modal.querySelector('#booking-price');
    if (bookingPeople && bookingPrice) {
      bookingPeople.addEventListener('input', () => {
        const total = tour.price * (parseInt(bookingPeople.value) || 1);
        bookingPrice.textContent = total.toLocaleString('en-IN');
      });
    }

    // Booking form submit
    const bookingForm = modal.querySelector('#booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgDiv = modal.querySelector('#booking-message');
        const btn = bookingForm.querySelector('button[type="submit"]');
        try {
          btn.disabled = true;
          btn.textContent = 'Processing...';
          const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              tourId: tour._id,
              date: modal.querySelector('#booking-date').value,
              numberOfPeople: parseInt(modal.querySelector('#booking-people').value)
            })
          });
          const data = await res.json();
          if (data.success) {
            msgDiv.innerHTML = `<p class="success-msg">✅ ${data.message}</p>`;
            bookingForm.style.display = 'none';
          } else {
            msgDiv.innerHTML = `<p class="error-msg">❌ ${data.message}</p>`;
            btn.disabled = false;
            btn.textContent = 'Book Now';
          }
        } catch (err) {
          msgDiv.innerHTML = '<p class="error-msg">❌ Network error. Please try again.</p>';
          btn.disabled = false;
          btn.textContent = 'Book Now';
        }
      });
    }

    // Review form submit
    const reviewForm = modal.querySelector('#review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgDiv = modal.querySelector('#review-message');
        const rating = parseInt(modal.querySelector('#review-rating').value);
        const comment = modal.querySelector('#review-comment').value;

        if (!rating) {
          msgDiv.innerHTML = '<p class="error-msg">Please select a star rating.</p>';
          return;
        }

        try {
          const res = await fetch(`/api/reviews/${tourId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating, comment })
          });
          const data = await res.json();
          if (data.success) {
            msgDiv.innerHTML = '<p class="success-msg">✅ Review submitted! Refreshing...</p>';
            setTimeout(() => {
              modal.remove();
              document.body.style.overflow = '';
              fetchTours(buildQuery());
            }, 1000);
          } else {
            msgDiv.innerHTML = `<p class="error-msg">❌ ${data.message}</p>`;
          }
        } catch (err) {
          msgDiv.innerHTML = '<p class="error-msg">❌ Network error. Please try again.</p>';
        }
      });
    }
  }

  // Initial load
  await fetchTours();
});
