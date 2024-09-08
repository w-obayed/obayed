// accordion js code
function toggleAccordion(element) {
  const content = element.nextElementSibling;
  const icon = element.querySelector(".accordion-icon");

  if (content.style.display === "block") {
    content.style.display = "none";
    icon.style.display = "inline";
  } else {
    content.style.display = "block";
    icon.style.display = "none";
  }
}

// hamburger-menu js code
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav-links");

  hamburgerMenu.addEventListener("click", () => {
    if (navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
    } else {
      navLinks.classList.add("active");
    }
  });
});

// CSS Grid to handle the equal heights of card
function setEqualHeight() {
  const cards = document.querySelectorAll(".card");
  let maxHeight = 0;

  // Reset heights
  cards.forEach((card) => {
    card.style.height = "auto";
  });

  // Find the maximum height
  cards.forEach((card) => {
    const cardHeight = card.offsetHeight;
    if (cardHeight > maxHeight) {
      maxHeight = cardHeight;
    }
  });

  // Set all cards to the maximum height
  cards.forEach((card) => {
    card.style.height = maxHeight + "px";
  });
}

window.addEventListener("resize", setEqualHeight);
window.addEventListener("load", setEqualHeight);

// slider js
var swiper = new Swiper(".mySwiper", {
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
// slider js
var swiperOne = new Swiper(".c-swiper", {
  slidesPerView: 3,
  spaceBetween: 50,
  loop: true,
  fade: "true",
  grabCursor: "true",
  centeredSlides: true,
  // autoplay: {
  //   delay: 3000,
  //   disableOnInteraction: false,
  // },
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
