// globe.js — Interactive 3D Globe Explorer using Three.js

(function () {
  const globeSection = document.getElementById('globe-section');
  if (!globeSection) return;

  const container = document.getElementById('globe-container');
  const infoPanel = document.getElementById('globe-info-panel');
  const closePanelBtn = document.getElementById('globe-close-panel');

  let scene, camera, renderer, globe, atmosphere, markers = [];
  let mouseDown = false, mouseX = 0, mouseY = 0;
  let targetRotationX = 0.003, targetRotationY = 0;
  let isDragging = false;
  let tours = [];
  let raycaster, mouse;
  let animationId;
  let autoRotate = true;

  // Convert lat/lng to 3D position on sphere
  function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  async function init() {
    // Fetch tours with coordinates
    try {
      const res = await fetch('/api/tours');
      const data = await res.json();
      if (data.success) {
        tours = data.data.filter(t => t.coordinates && t.coordinates.lat && t.coordinates.lng);
      }
    } catch (e) {
      console.error('Failed to fetch tours for globe:', e);
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Earth
    const textureLoader = new THREE.TextureLoader();
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Using a stylized dark map texture
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe@2.35.0/example/img/earth-blue-marble.jpg');
    const bumpTexture = textureLoader.load('https://unpkg.com/three-globe@2.35.0/example/img/earth-topology.png');

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.03,
      specular: new THREE.Color(0x333333),
      shininess: 15
    });

    globe = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(globe);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x0ea5e9, 0.3);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);

    // Add tour markers
    addMarkers();

    // Event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);

    if (closePanelBtn) {
      closePanelBtn.addEventListener('click', closeInfoPanel);
    }

    // Start animation
    animate();
  }

  function addMarkers() {
    tours.forEach(tour => {
      const pos = latLngToVector3(tour.coordinates.lat, tour.coordinates.lng, 1.02);

      // Marker group
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(pos);
      markerGroup.lookAt(pos.clone().multiplyScalar(2));

      // Inner dot
      const dotGeometry = new THREE.SphereGeometry(0.02, 16, 16);
      const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      markerGroup.add(dot);

      // Pulsing ring
      const ringGeometry = new THREE.RingGeometry(0.025, 0.04, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      markerGroup.add(ring);

      // Outer glow ring
      const glowRingGeometry = new THREE.RingGeometry(0.04, 0.06, 32);
      const glowRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const glowRing = new THREE.Mesh(glowRingGeometry, glowRingMaterial);
      markerGroup.add(glowRing);

      markerGroup.userData = { tour, dot, ring, glowRing };
      globe.add(markerGroup);
      markers.push(markerGroup);
    });
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    // Auto rotation
    if (autoRotate && !isDragging) {
      globe.rotation.y += targetRotationX;
    }

    // Pulse markers
    const time = Date.now() * 0.003;
    markers.forEach((m, i) => {
      const { ring, glowRing } = m.userData;
      const scale = 1 + 0.3 * Math.sin(time + i * 0.7);
      ring.scale.set(scale, scale, 1);
      glowRing.scale.set(scale * 1.2, scale * 1.2, 1);
      ring.material.opacity = 0.6 - 0.3 * Math.sin(time + i * 0.7);
      glowRing.material.opacity = 0.3 - 0.15 * Math.sin(time + i * 0.7);
    });

    renderer.render(scene, camera);
  }

  function onMouseDown(e) {
    mouseDown = true;
    isDragging = false;
    mouseX = e.clientX;
    mouseY = e.clientY;
    autoRotate = false;
  }

  function onMouseMove(e) {
    if (!mouseDown) return;
    isDragging = true;
    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;
    globe.rotation.y += deltaX * 0.005;
    globe.rotation.x += deltaY * 0.005;
    globe.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, globe.rotation.x));
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function onMouseUp() {
    mouseDown = false;
    setTimeout(() => { autoRotate = true; }, 3000);
  }

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      mouseDown = true;
      isDragging = false;
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      autoRotate = false;
    }
  }

  function onTouchMove(e) {
    if (!mouseDown || e.touches.length !== 1) return;
    e.preventDefault();
    isDragging = true;
    const deltaX = e.touches[0].clientX - mouseX;
    const deltaY = e.touches[0].clientY - mouseY;
    globe.rotation.y += deltaX * 0.005;
    globe.rotation.x += deltaY * 0.005;
    globe.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, globe.rotation.x));
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }

  function onTouchEnd() {
    mouseDown = false;
    setTimeout(() => { autoRotate = true; }, 3000);
  }

  function onClick(e) {
    if (isDragging) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check marker intersections
    const allMarkerMeshes = [];
    markers.forEach(m => {
      m.children.forEach(child => {
        child._parentMarker = m;
        allMarkerMeshes.push(child);
      });
    });

    const intersects = raycaster.intersectObjects(allMarkerMeshes);
    if (intersects.length > 0) {
      const marker = intersects[0].object._parentMarker;
      if (marker && marker.userData.tour) {
        showInfoPanel(marker.userData.tour);
      }
    }
  }

  function starsHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }

  function showInfoPanel(tour) {
    if (!infoPanel) return;

    infoPanel.innerHTML = `
      <button class="globe-close-btn" id="globe-close-panel">&times;</button>
      <img src="${tour.imageUrl}" alt="${tour.name}" class="panel-img">
      <div class="panel-body">
        <h3>${tour.name}</h3>
        <p class="panel-desc">${tour.description}</p>
        <div class="panel-meta">
          <span>📍 ${tour.location}</span>
          <span>💰 ₹${tour.price.toLocaleString('en-IN')}</span>
          <span>📅 ${tour.duration} days</span>
          <span class="panel-rating">${starsHTML(tour.averageRating)} ${tour.averageRating.toFixed(1)}</span>
        </div>
        <a href="/gallery/gallery.html" class="btn panel-btn">View Full Details →</a>
      </div>
    `;

    infoPanel.classList.add('active');

    document.getElementById('globe-close-panel').addEventListener('click', closeInfoPanel);
  }

  function closeInfoPanel() {
    if (infoPanel) {
      infoPanel.classList.remove('active');
    }
  }

  function onResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
