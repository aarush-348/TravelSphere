// buddy.js — Real-Time Travel Buddy Matcher using Socket.io

(function () {
  let socket = null;
  let currentTourRoom = null;
  let currentUserName = null;

  // Initialize socket connection
  function initSocket() {
    if (socket) return;
    socket = io({
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('connect', () => {
      console.log('🔗 Connected to TravelBuddy');
    });

    socket.on('viewer-count', (data) => {
      updateViewerCount(data.count, data.tourId);
    });

    socket.on('chat-message', (msg) => {
      appendChatMessage(msg);
    });

    socket.on('system-message', (msg) => {
      appendSystemMessage(msg);
    });

    socket.on('group-formed', (data) => {
      showGroupNotification(data);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from TravelBuddy');
    });
  }

  // Join a tour room
  function joinTourRoom(tourId, userName) {
    if (!socket) initSocket();
    currentTourRoom = tourId;
    currentUserName = userName || 'Traveler';
    socket.emit('join-tour-room', { tourId, userName: currentUserName });
  }

  // Leave current room
  function leaveTourRoom() {
    if (socket && currentTourRoom) {
      socket.emit('leave-tour-room', { tourId: currentTourRoom });
      currentTourRoom = null;
    }
  }

  // Send chat message
  function sendMessage(message) {
    if (!socket || !currentTourRoom || !message.trim()) return;
    socket.emit('chat-message', {
      tourId: currentTourRoom,
      message: message.trim(),
      userName: currentUserName
    });
  }

  // Request group up
  function requestGroupUp(tourId) {
    if (!socket) return;
    socket.emit('group-request', { tourId, userName: currentUserName });
  }

  // Update viewer count badge
  function updateViewerCount(count, tourId) {
    const badge = document.getElementById(`viewer-count-${tourId}`);
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle('multiple', count > 1);
    }
    // Also update the main count in chat
    const chatCount = document.getElementById('buddy-viewer-count');
    if (chatCount && tourId === currentTourRoom) {
      chatCount.textContent = `${count} traveler${count !== 1 ? 's' : ''} viewing`;
      // Enable/disable group button based on count
      const groupBtn = document.getElementById('buddy-group-btn');
      if (groupBtn) {
        groupBtn.disabled = count < 2;
        groupBtn.title = count < 2 ? 'Need at least 2 travelers to group up' : 'Form a group for 10% discount!';
      }
    }
  }

  // Append a chat message to the chat feed
  function appendChatMessage(msg) {
    const feed = document.getElementById('buddy-chat-feed');
    if (!feed) return;

    const isOwnMessage = msg.userName === currentUserName;
    const msgEl = document.createElement('div');
    msgEl.className = `buddy-msg ${isOwnMessage ? 'own' : 'other'}`;
    msgEl.innerHTML = `
      <span class="buddy-msg-name">${isOwnMessage ? 'You' : msg.userName}</span>
      <span class="buddy-msg-text">${escapeHtml(msg.message)}</span>
      <span class="buddy-msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    feed.appendChild(msgEl);
    feed.scrollTop = feed.scrollHeight;
  }

  // Append a system message
  function appendSystemMessage(msg) {
    const feed = document.getElementById('buddy-chat-feed');
    if (!feed) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'buddy-msg system';
    msgEl.innerHTML = `<span class="buddy-msg-text">${msg.message}</span>`;
    feed.appendChild(msgEl);
    feed.scrollTop = feed.scrollHeight;
  }

  // Show group notification
  function showGroupNotification(data) {
    const feed = document.getElementById('buddy-chat-feed');
    if (!feed) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'buddy-msg group-notification';
    msgEl.innerHTML = `
      <span class="buddy-msg-text">🎉 Group formed! ${data.members} travelers are going together. <strong>10% group discount unlocked!</strong></span>
    `;
    feed.appendChild(msgEl);
    feed.scrollTop = feed.scrollHeight;

    // Store group discount token
    if (data.discountToken) {
      sessionStorage.setItem('groupDiscount_' + currentTourRoom, data.discountToken);
      // Update booking button if exists
      const bookBtn = document.querySelector('#booking-form button[type="submit"]');
      if (bookBtn) {
        bookBtn.textContent = '🎉 Book Now (10% Group Discount!)';
        bookBtn.dataset.groupDiscount = 'true';
      }
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Create Buddy UI in Tour Modal ----
  function createBuddyButton(tourId) {
    const token = localStorage.getItem('token');
    if (!token) return '';

    return `
      <div class="buddy-section">
        <button class="btn buddy-toggle-btn" id="buddy-toggle-${tourId}" data-tour-id="${tourId}">
          🧑‍🤝‍🧑 Find a Travel Buddy
          <span class="viewer-badge" id="viewer-count-${tourId}">0</span>
        </button>
        <div class="buddy-chat-panel" id="buddy-panel-${tourId}" style="display:none;">
          <div class="buddy-chat-header">
            <div>
              <strong>Travel Buddy Chat</strong>
              <span class="buddy-viewer-info" id="buddy-viewer-count">Connecting...</span>
            </div>
            <button class="btn buddy-group-btn" id="buddy-group-btn" disabled title="Need at least 2 travelers">
              🤝 Group Up (10% off)
            </button>
          </div>
          <div class="buddy-chat-feed" id="buddy-chat-feed"></div>
          <div class="buddy-chat-input">
            <input type="text" id="buddy-msg-input" placeholder="Say hello to fellow travelers..." autocomplete="off">
            <button class="btn buddy-send-btn" id="buddy-send-btn">Send</button>
          </div>
        </div>
      </div>
    `;
  }

  function initBuddyPanel(tourId) {
    const toggleBtn = document.getElementById(`buddy-toggle-${tourId}`);
    const panel = document.getElementById(`buddy-panel-${tourId}`);

    if (!toggleBtn || !panel) return;

    initSocket();

    // Auto-join tour room for viewer count
    const userName = localStorage.getItem('userName') || 'Traveler';
    joinTourRoom(tourId, userName);

    toggleBtn.addEventListener('click', () => {
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      toggleBtn.querySelector('.viewer-badge').style.display = isVisible ? 'inline-flex' : 'none';

      if (!isVisible) {
        // Focus input
        const input = document.getElementById('buddy-msg-input');
        if (input) input.focus();
      }
    });

    // Send message
    const sendBtn = document.getElementById('buddy-send-btn');
    const msgInput = document.getElementById('buddy-msg-input');

    if (sendBtn && msgInput) {
      sendBtn.addEventListener('click', () => {
        sendMessage(msgInput.value);
        msgInput.value = '';
        msgInput.focus();
      });

      msgInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          sendMessage(msgInput.value);
          msgInput.value = '';
        }
      });
    }

    // Group up button
    const groupBtn = document.getElementById('buddy-group-btn');
    if (groupBtn) {
      groupBtn.addEventListener('click', () => {
        requestGroupUp(tourId);
        groupBtn.textContent = '✅ Group Requested!';
        groupBtn.disabled = true;
      });
    }
  }

  // Cleanup when modal closes
  function cleanup() {
    leaveTourRoom();
  }

  // Expose API
  window.TravelBuddy = {
    createBuddyButton,
    initBuddyPanel,
    cleanup,
    getGroupDiscount: (tourId) => sessionStorage.getItem('groupDiscount_' + tourId)
  };
})();
