// ==========================================================================
// OBAYED Agency - Main JavaScript File
// ==========================================================================

// Accordion toggle functionality
function toggleAccordion(element) {
  const content = element.nextElementSibling;
  const icon = element.querySelector(".accordion-icon");
  const parent = element.closest(".accordion-item");

  if (!content) return;

  if (content.style.display === "block") {
    content.style.display = "none";
    element.setAttribute("aria-expanded", "false");
    if (icon) icon.style.transform = "rotate(0deg)";
    if (parent) parent.classList.remove("active");
  } else {
    content.style.display = "block";
    element.setAttribute("aria-expanded", "true");
    if (icon) icon.style.transform = "rotate(180deg)";
    if (parent) parent.classList.add("active");
  }
}

// Swiper Instance Storage
let swiperInstanceMain = null;
let swiperInstanceOne = null;

// Initialize Swiper Sliders
function initSwiperSliders() {
  if (typeof Swiper === "undefined") return;

  if (swiperInstanceMain) {
    try {
      swiperInstanceMain.destroy(true, true);
    } catch (e) {}
    swiperInstanceMain = null;
  }
  if (swiperInstanceOne) {
    try {
      swiperInstanceOne.destroy(true, true);
    } catch (e) {}
    swiperInstanceOne = null;
  }

  if (document.querySelector(".mySwiper")) {
    swiperInstanceMain = new Swiper(".mySwiper", {
      slidesPerView: 4,
      loop: true,
      fade: "true",
      grabCursor: "true",
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".next",
        prevEl: ".prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        320: {
          slidesPerView: 1.2,
          centeredSlides: true,
        },
        768: {
          slidesPerView: 4,
        },
      },
    });
  }

  if (document.querySelector(".c-swiper")) {
    swiperInstanceOne = new Swiper(".c-swiper", {
      slidesPerView: 3,
      spaceBetween: 50,
      loop: true,
      fade: "true",
      grabCursor: "true",
      centeredSlides: true,
      navigation: {
        nextEl: ".next-one",
        prevEl: ".prev-one",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 3,
        },
      },
    });
  }
}

// Interactive ROI Revenue Calculator for White-Label WhatsApp CRM
function initRoiCalculator() {
  const clientSlider = document.getElementById("client-count-slider");
  const priceSlider = document.getElementById("price-per-client-slider");
  const clientVal = document.getElementById("client-count-val");
  const priceVal = document.getElementById("price-per-client-val");
  const mrrVal = document.getElementById("mrr-val");
  const arrVal = document.getElementById("arr-val");

  if (
    !clientSlider ||
    !priceSlider ||
    !clientVal ||
    !priceVal ||
    !mrrVal ||
    !arrVal
  )
    return;

  function updateRoiCalculator() {
    const clients = parseInt(clientSlider.value, 10);
    const price = parseInt(priceSlider.value, 10);

    const mrr = clients * price;
    const arr = mrr * 12;

    clientVal.textContent = clients + (clients === 1 ? " Client" : " Clients");
    priceVal.textContent = "$" + price.toLocaleString() + "/mo";
    mrrVal.textContent = "$" + mrr.toLocaleString() + "/mo";
    arrVal.textContent = "$" + arr.toLocaleString() + "/yr";
  }

  // Remove old listeners by replacing elements clone or directly setting oninput
  clientSlider.oninput = updateRoiCalculator;
  priceSlider.oninput = updateRoiCalculator;
  updateRoiCalculator();
}

// CSS Grid equal height handler for cards
function setEqualHeight() {
  const cards = document.querySelectorAll(".card");
  if (!cards.length) return;

  let maxHeight = 0;
  cards.forEach((card) => {
    card.style.height = "auto";
  });

  cards.forEach((card) => {
    const cardHeight = card.offsetHeight;
    if (cardHeight > maxHeight) {
      maxHeight = cardHeight;
    }
  });

  cards.forEach((card) => {
    card.style.height = maxHeight + "px";
  });
}

// Mobile Navigation Setup & Controls
function getOrCreateOverlay() {
  let overlay = document.querySelector(".nav-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }
  return overlay;
}

window.closeMobileMenu = function () {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks =
    document.querySelector(".nav-links") || document.getElementById("main-nav");
  const overlay = document.querySelector(".nav-overlay");

  if (navLinks) {
    navLinks.classList.remove("active", "is-active");
  }
  if (hamburgerMenu) {
    hamburgerMenu.classList.remove("is-active");
    hamburgerMenu.setAttribute("aria-expanded", "false");
  }
  if (overlay) {
    overlay.classList.remove("is-active");
  }
  document.body.classList.remove("nav-open");
};

function initMobileMenu() {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks =
    document.querySelector(".nav-links") || document.getElementById("main-nav");

  if (!hamburgerMenu || !navLinks) return;

  const overlay = getOrCreateOverlay();

  function openMobileMenu() {
    navLinks.classList.add("active", "is-active");
    hamburgerMenu.classList.add("is-active");
    hamburgerMenu.setAttribute("aria-expanded", "true");
    overlay.classList.add("is-active");
    document.body.classList.add("nav-open");
  }

  function toggleMobileMenu(e) {
    if (e) {
      e.stopPropagation();
    }
    const isExpanded = hamburgerMenu.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      window.closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  // Prevent duplicate event listener bindings across page transitions
  if (!hamburgerMenu.dataset.initialized) {
    hamburgerMenu.dataset.initialized = "true";
    hamburgerMenu.addEventListener("click", toggleMobileMenu);

    // Keyboard support - Escape key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        if (hamburgerMenu.getAttribute("aria-expanded") === "true") {
          window.closeMobileMenu();
          hamburgerMenu.focus();
        }
      }
    });

    // Close when overlay is clicked
    overlay.addEventListener("click", () => {
      window.closeMobileMenu();
    });

    // Handle window resize to automatically close mobile menu on desktop views
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024) {
        window.closeMobileMenu();
      }
    });
  }

  // Delegate link clicks inside navLinks to close mobile menu
  if (!navLinks.dataset.initialized) {
    navLinks.dataset.initialized = "true";
    navLinks.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link) {
        window.closeMobileMenu();
      }
    });
  }
}

// Global page component initializer (called on load & client-side route transitions)
window.initPageScripts = function () {
  initRoiCalculator();
  setEqualHeight();
  initSwiperSliders();
  initMobileMenu();
};

window.addEventListener("resize", setEqualHeight);
window.addEventListener("load", setEqualHeight);

// Initial setup on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  window.initPageScripts();
});
