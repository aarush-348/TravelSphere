// destinations.js — Fetch destinations from API and render them dynamically

document.addEventListener('DOMContentLoaded', async () => {
  // We are using national-destinations and international-destinations now

  // Color theme configurations matching the original CSS
  const colorThemes = {
    rajasthan: { bg: '#fff0e5', border: '#c94f4f' },
    kerala:    { bg: '#e5f7f0', border: '#2e8b57' },
    punjab:    { bg: '#fff8cc', border: '#d4aa00' },
    default:   { bg: '#f0f0ff', border: '#4a4aa0' }
  };

  try {
    const res = await fetch('/api/destinations');
    const data = await res.json();

    const natContainer = document.getElementById('national-destinations');
    const intContainer = document.getElementById('international-destinations');

    if (!natContainer || !intContainer) return;

    if (data.success && data.data.length > 0) {
      const nationalNames = ['Rajasthan', 'Kerala', 'Punjab'];
      const nationalDestinations = data.data.filter(d => nationalNames.includes(d.name));
      const internationalDestinations = data.data.filter(d => !nationalNames.includes(d.name));

      const generateCards = (destinations) => {
        if (destinations.length === 0) return '<p style="text-align:center; padding: 2rem; color: #666;">No destinations available yet.</p>';
        return destinations.map(dest => {
          const theme = colorThemes[dest.colorTheme] || colorThemes.default;
          return `
            <div class="card ${dest.colorTheme}" style="background-color: ${theme.bg}; border-left: 8px solid ${theme.border};">
              <img src="${dest.imageUrl}" alt="${dest.name}">
              <div class="content">
                <h2>${dest.name}</h2>
                <p>${dest.description}</p>
                <ul>
                  <li><b>Festivals:</b> ${dest.festivals.join(', ')}</li>
                  <li><b>Traditional Food:</b> ${dest.foods.join(', ')}</li>
                </ul>
              </div>
            </div>
          `;
        }).join('');
      };

      natContainer.innerHTML = generateCards(nationalDestinations);
      intContainer.innerHTML = generateCards(internationalDestinations);
    } else {
      natContainer.innerHTML = '<p style="text-align:center; padding: 2rem; color: #666;">No destinations available yet. Check back soon!</p>';
      intContainer.innerHTML = '<p style="text-align:center; padding: 2rem; color: #666;">No destinations available yet. Check back soon!</p>';
    }
  } catch (error) {
    const natContainer = document.getElementById('national-destinations');
    const intContainer = document.getElementById('international-destinations');
    if (natContainer && intContainer) {
      natContainer.innerHTML = '<p style="text-align:center; padding: 2rem; color: #c94f4f;">Failed to load destinations. Please refresh the page.</p>';
      intContainer.innerHTML = '<p style="text-align:center; padding: 2rem; color: #c94f4f;">Failed to load destinations. Please refresh the page.</p>';
    }
    console.error('Error fetching destinations:', error);
  }
});
