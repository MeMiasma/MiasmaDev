// script.js — Полная логика портфолио: проекты, отзывы, анимации, поиск

let allProjects = window.PROJECTS || [];
let allReviews = window.REVIEWS || [];
let filteredProjects = [...allProjects];
let filteredReviews = [...allReviews];
let visibleCount = 30;
const BATCH_SIZE = 30;
let currentReviewPage = 0;
const REVIEWS_PER_PAGE = 6;
let currentReviewFilter = "all";

const CATEGORY_NAMES = {
  ecommerce: "E-commerce", fintech: "Финтех", saas: "SaaS",
  automation: "Автоматизация", logistics: "Логистика",
  medical: "Медицина", education: "Образование",
  realestate: "Недвижимость", delivery: "Доставка",
  mobile: "Мобильные", gambling: "Гемблинг"
};

// ===== КАРТИНКИ ПРОЕКТОВ (реальные фото с Unsplash) =====
const PROJECT_IMAGES = {
  ecommerce: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop",
  fintech: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&q=80&auto=format&fit=crop",
  saas: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop",
  automation: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop",
  logistics: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600&q=80&auto=format&fit=crop",
  medical: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80&auto=format&fit=crop",
  education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80&auto=format&fit=crop",
  realestate: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80&auto=format&fit=crop",
  delivery: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&q=80&auto=format&fit=crop",
  mobile: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80&auto=format&fit=crop",
  gambling: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&q=80&auto=format&fit=crop"
};

const SPECIFIC_IMAGES = {
  shopflow: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80&auto=format&fit=crop",
  fooddelivery: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop",
  taxiapp: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80&auto=format&fit=crop",
  neobank: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80&auto=format&fit=crop",
  "payment-gateway": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop",
  "crypto-exchange": "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&q=80&auto=format&fit=crop",
  medbot: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80&auto=format&fit=crop",
  lms: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80&auto=format&fit=crop",
  cargo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80&auto=format&fit=crop",
  crypto: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&q=80&auto=format&fit=crop"
};

function getProjectImage(project) {
  if (SPECIFIC_IMAGES[project.id]) return SPECIFIC_IMAGES[project.id];
  return PROJECT_IMAGES[project.category] || PROJECT_IMAGES.saas;
}

// ===== ПАРТИКЛЫ =====
function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const particles = [];
  const PARTICLE_COUNT = Math.min(70, Math.floor(window.innerWidth / 22));

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 0.8,
      color: Math.random() > 0.5 ? "157,140,255" : "180,255,92",
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(157,140,255,${0.09 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      grad.addColorStop(0, `rgba(${p.color},${p.alpha})`);
      grad.addColorStop(1, `rgba(${p.color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== КУРСОР =====
function initCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow || window.matchMedia("(max-width: 700px)").matches) return;
  let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  function animate() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`;
    requestAnimationFrame(animate);
  }
  animate();
}

// ===== ПРОГРЕСС СКРОЛЛА =====
function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + "%";
  }, { passive: true });
}

// ===== КНОПКА НАВЕРХ =====
function initScrollTop() {
  const btn = document.getElementById("scrollTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 600) btn.classList.add("visible");
    else btn.classList.remove("visible");
  }, { passive: true });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ===== СЧЁТЧИКИ =====
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.done) {
        entry.target.dataset.done = "1";
        const target = parseFloat(entry.target.dataset.count);
        const decimal = parseInt(entry.target.dataset.decimal || "0");
        const duration = 1800;
        const start = performance.now();
        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          entry.target.textContent = decimal ? value.toFixed(decimal) : Math.floor(value);
          if (progress < 1) requestAnimationFrame(update);
          else entry.target.textContent = decimal ? target.toFixed(decimal) : target;
        }
        requestAnimationFrame(update);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ===== ЗВЁЗДЫ =====
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "★" : "") + "☆".repeat(empty);
}

// ===== ПРОЕКТЫ =====
function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (filteredProjects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Ничего не найдено</h3>
        <p>Попробуйте изменить фильтры или поисковый запрос</p>
      </div>
    `;
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    updateProjectsCounter();
    return;
  }

  const toShow = filteredProjects.slice(0, visibleCount);
  toShow.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.style.animationDelay = `${(i % 12) * 40}ms`;
    const img = getProjectImage(p);
    card.innerHTML = `
      <div class="project-art">
        <img src="${img}" alt="${p.title}" loading="lazy" />
        <div class="project-art-overlay"></div>
        <div class="project-category-badge">${CATEGORY_NAMES[p.category] || "PROJECT"}</div>
      </div>
      <div class="project-body">
        <div class="project-meta">
          <span>${String(i + 1).padStart(2, "0")} / ${p.year}</span>
          <span class="project-status">${p.year}</span>
        </div>
        <h3>${p.title}</h3>
        <p>${p.subtitle}</p>
        <div class="project-client">👤 ${p.client}</div>
        <div class="project-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span>${p.rating.toFixed(1)}</span>
          <span class="date">${p.date}</span>
        </div>
        <div class="tag-list">
          ${p.tags.slice(0, 4).map(t => `<span>${t}</span>`).join("")}
        </div>
      </div>
    `;
    card.addEventListener("click", () => openModal(p));
    grid.appendChild(card);
  });

  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    if (visibleCount >= filteredProjects.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "inline-flex";
      const remaining = Math.min(BATCH_SIZE, filteredProjects.length - visibleCount);
      loadMoreBtn.textContent = `Показать ещё ${remaining} проектов ↓`;
    }
  }
  updateProjectsCounter();
}

function updateProjectsCounter() {
  const counter = document.getElementById("projectsCounter");
  if (!counter) return;
  const shown = Math.min(visibleCount, filteredProjects.length);
  counter.textContent = `Показано ${shown} из ${filteredProjects.length}`;
}

function updateCategoryCounts() {
  const counts = { all: allProjects.length };
  allProjects.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });
  Object.keys(counts).forEach(key => {
    const el = document.getElementById(`count-${key}`);
    if (el) el.textContent = counts[key];
  });
}

function applyFilters() {
  const activeFilter = document.querySelector(".filter-button.active")?.dataset.filter || "all";
  const searchQuery = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const sortValue = document.getElementById("sortSelect")?.value || "date-desc";

  filteredProjects = allProjects.filter(p => {
    const matchCategory = activeFilter === "all" || p.category === activeFilter;
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery) ||
      p.subtitle.toLowerCase().includes(searchQuery) ||
      p.client.toLowerCase().includes(searchQuery) ||
      p.desc.toLowerCase().includes(searchQuery) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery));
    return matchCategory && matchSearch;
  });

  filteredProjects.sort((a, b) => {
    if (sortValue === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sortValue === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sortValue === "rating-desc") return b.rating - a.rating;
    if (sortValue === "title-asc") return a.title.localeCompare(b.title);
    return 0;
  });

  visibleCount = BATCH_SIZE;
  renderProjects();
}

function openModal(project) {
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  document.getElementById("modalHero").style.backgroundImage = `url(${getProjectImage(project)})`;
  document.getElementById("modalEyebrow").textContent = `PROJECT / ${(CATEGORY_NAMES[project.category] || project.category).toUpperCase()}`;
  document.getElementById("modalTitle").textContent = project.title;
  document.getElementById("modalDescription").textContent = project.desc;

  document.getElementById("modalMeta").innerHTML = `
    <span class="meta-client">👤 ${project.client}</span>
    <span>📅 ${project.date}</span>
    <span>🏷️ ${CATEGORY_NAMES[project.category] || project.category}</span>
  `;

  document.getElementById("modalFeatures").innerHTML = project.features.map(f => `<li>${f}</li>`).join("");
  document.getElementById("modalTags").innerHTML = project.tags.map(t => `<span>${t}</span>`).join("");
  document.getElementById("modalRating").innerHTML = `
    <span class="stars">${renderStars(project.rating)}</span>
    <span class="rating-value">${project.rating.toFixed(1)} / 5.0</span>
    <span style="color: #6e7892; margin-left: auto;">${project.year}</span>
  `;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// ===== ОТЗЫВЫ =====
function applyReviewFilter() {
  let filtered = [...allReviews];
  if (currentReviewFilter === "5") {
    filtered = filtered.filter(r => r.rating === 5);
  } else if (currentReviewFilter === "4.5") {
    filtered = filtered.filter(r => r.rating >= 4.5);
  } else if (currentReviewFilter === "recent") {
    filtered.sort((a, b) => {
      const months = { "Январь":1,"Февраль":2,"Март":3,"Апрель":4,"Май":5,"Июнь":6,"Июль":7,"Август":8,"Сентябрь":9,"Октябрь":10,"Ноябрь":11,"Декабрь":12 };
      const parseDate = (s) => {
        const parts = s.split(" ");
        const m = months[parts[0]] || 1;
        const y = parseInt(parts[1]) || 2024;
        return y * 12 + m;
      };
      return parseDate(b.date) - parseDate(a.date);
    });
  }
  filteredReviews = filtered;
  currentReviewPage = 0;
  renderReviews();
}

function renderReviews() {
  const pageEl = document.getElementById("reviewsPage");
  const infoEl = document.getElementById("reviewsPageInfo");
  if (!pageEl) return;

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));

  // Защита от выхода за границы
  if (currentReviewPage >= totalPages) currentReviewPage = totalPages - 1;
  if (currentReviewPage < 0) currentReviewPage = 0;

  const start = currentReviewPage * REVIEWS_PER_PAGE;
  const end = start + REVIEWS_PER_PAGE;
  const pageReviews = filteredReviews.slice(start, end);

  if (pageReviews.length === 0) {
    pageEl.innerHTML = `<div class="empty-state"><div class="empty-icon">💬</div><h3>Отзывов не найдено</h3><p>Попробуйте другой фильтр</p></div>`;
  } else {
    pageEl.innerHTML = pageReviews.map((r, i) => {
      const stars = renderStars(r.rating);
      const initial = r.name.charAt(0).toUpperCase();
      return `
        <article class="review-card" style="animation-delay: ${i * 60}ms">
          <div class="review-quote">"</div>
          <div class="review-header">
            <img class="review-avatar-img" src="${r.avatar}" alt="${r.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';" />
            <div class="review-avatar-fallback" style="display:none">${initial}</div>
            <div class="review-author">
              <strong>${r.name}</strong>
              <span>${r.nick} · ${r.role}</span>
            </div>
            <div class="review-rating">${stars}</div>
          </div>
          <p class="review-text">«${r.text}»</p>
          <div class="review-footer">
            <span class="review-date">📅 ${r.date}</span>
            <span class="review-rating-value">${r.rating.toFixed(1)} / 5.0</span>
          </div>
        </article>
      `;
    }).join("");
  }

  if (infoEl) infoEl.textContent = `Страница ${currentReviewPage + 1} из ${totalPages}`;

  const prevBtn = document.getElementById("reviewsPrev");
  const nextBtn = document.getElementById("reviewsNext");
  if (prevBtn) prevBtn.disabled = currentReviewPage === 0;
  if (nextBtn) nextBtn.disabled = currentReviewPage >= totalPages - 1;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initCursorGlow();
  initScrollProgress();
  initScrollTop();
  initCounters();
  updateCategoryCounts();

  // Фильтры проектов
  document.querySelectorAll(".filter-button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
  });

  // Поиск с debounce
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let debounce;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(applyFilters, 220);
    });
  }

  // Сортировка
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.addEventListener("change", applyFilters);

  // Показать ещё
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += BATCH_SIZE;
      renderProjects();
    });
  }

  // Модалка проекта
  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  document.getElementById("projectModal")?.addEventListener("click", (e) => {
    if (e.target.id === "projectModal") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Мобильное меню
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  // Фильтры отзывов
  document.querySelectorAll(".reviews-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".reviews-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentReviewFilter = btn.dataset.rfilter;
      applyReviewFilter();
    });
  });

  // Пагинация отзывов
  const prevBtn = document.getElementById("reviewsPrev");
  const nextBtn = document.getElementById("reviewsNext");
  if (prevBtn) prevBtn.addEventListener("click", () => {
    if (currentReviewPage > 0) {
      currentReviewPage--;
      renderReviews();
      document.getElementById("reviews").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  if (nextBtn) nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
    if (currentReviewPage < totalPages - 1) {
      currentReviewPage++;
      renderReviews();
      document.getElementById("reviews").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // Первичный рендер
  applyFilters();
  renderReviews();

  // Появление секций
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".section-block").forEach(s => observer.observe(s));
});