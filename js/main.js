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
    try { swiperInstanceMain.destroy(true, true); } catch (e) {}
    swiperInstanceMain = null;
  }
  if (swiperInstanceOne) {
    try { swiperInstanceOne.destroy(true, true); } catch (e) {}
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

  if (!clientSlider || !priceSlider || !clientVal || !priceVal || !mrrVal || !arrVal) return;

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

// Global page component initializer (called on load & client-side route transitions)
window.initPageScripts = function () {
  initRoiCalculator();
  setEqualHeight();
  initSwiperSliders();
};

window.addEventListener("resize", setEqualHeight);
window.addEventListener("load", setEqualHeight);

// Initial setup on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav-links");

  if (hamburgerMenu && navLinks && !hamburgerMenu.dataset.initialized) {
    hamburgerMenu.dataset.initialized = "true";
    hamburgerMenu.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const isExpanded = navLinks.classList.contains("active");
      hamburgerMenu.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    });
  }

  window.initPageScripts();
});
