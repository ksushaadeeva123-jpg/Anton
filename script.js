const header = document.querySelector(".header");
      const toTop = document.querySelector(".to-top");
      const burger = document.querySelector(".header__burger");
      const mobileMenu = document.querySelector(".mobile-menu");
      const mobileDropdown = document.querySelector(".mobile-menu__dropdown");
      const mobileDropdownToggle = document.querySelector(
        ".mobile-menu__dropdown-toggle",
      );

      function backgroundIsDark() {
        const elements = document.elementsFromPoint(
          Math.round(window.innerWidth / 2),
          Math.round(header.offsetHeight / 2),
        );

        for (const el of elements) {
          if (header.contains(el)) continue;
          const match = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
          if (!match) continue;
          const [r, g, b, a = 1] = match.map(Number);
          if (a < 0.5) continue;
          return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
        }

        return false;
      }

      function updateHeader() {
        const scrolled = window.scrollY > 16;
        header.classList.toggle("header--scrolled", scrolled);

        const isMobile = window.matchMedia("(max-width: 1023px)").matches;
        const menuOpen = mobileMenu.classList.contains("is-open");
        const light = isMobile && !menuOpen && !scrolled;

        header.classList.toggle("header--light", light || backgroundIsDark());
        toTop.classList.toggle(
          "is-visible",
          window.scrollY > 100 && !(isMobile && menuOpen),
        );
      }

      function closeMobileDropdown() {
        if (!mobileDropdown || !mobileDropdownToggle) return;
        mobileDropdown.classList.remove("is-open");
        mobileDropdownToggle.setAttribute("aria-expanded", "false");
      }

      function closeMenu() {
        mobileMenu.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        closeMobileDropdown();
        updateHeader();
      }

      burger.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("is-open");
        burger.classList.toggle("is-open", isOpen);
        burger.setAttribute("aria-expanded", String(isOpen));
        document.body.style.overflow = isOpen ? "hidden" : "";
        if (!isOpen) closeMobileDropdown();
        updateHeader();
      });

      if (mobileDropdown && mobileDropdownToggle) {
        mobileDropdownToggle.addEventListener("click", () => {
          const isOpen = mobileDropdown.classList.toggle("is-open");
          mobileDropdownToggle.setAttribute("aria-expanded", String(isOpen));
        });
      }

      const headerDropdown = document.querySelector(
        ".header__nav-item--dropdown",
      );
      const headerDropdownLink =
        headerDropdown && headerDropdown.querySelector("a");

      if (headerDropdown && headerDropdownLink) {
        const headerDropdownMenu =
          headerDropdown.querySelector(".header__dropdown");

        headerDropdownLink.addEventListener("click", (event) => {
          event.preventDefault();
          const isVisible =
            getComputedStyle(headerDropdownMenu).visibility === "visible";
          headerDropdown.classList.toggle("is-closed", isVisible);
          headerDropdown.classList.toggle("is-open", !isVisible);
        });

        headerDropdown
          .querySelectorAll(".header__dropdown a")
          .forEach((link) => {
            link.addEventListener("click", () => {
              headerDropdown.classList.remove("is-open");
              headerDropdown.classList.add("is-closed");
              link.blur();
            });
          });

        headerDropdown.addEventListener("mouseleave", () => {
          headerDropdown.classList.remove("is-closed");
          headerDropdown.classList.remove("is-open");
        });

        document.addEventListener("click", (event) => {
          if (!headerDropdown.contains(event.target)) {
            headerDropdown.classList.remove("is-open");
          }
        });
      }

      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });

      const navLinks = Array.from(
        document.querySelectorAll(".header__nav a, .mobile-menu__nav > a"),
      );

      const visibleSections = new Set();

      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleSections.add(entry.target.id);
            } else {
              visibleSections.delete(entry.target.id);
            }
          });

          const activeId = Array.from(visibleSections).pop();

          navLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            const hash = href.includes("#") ? href.split("#")[1] : "";
            link.classList.toggle(
              "is-active",
              Boolean(activeId) && hash === activeId,
            );
          });
          if (mobileDropdownToggle) {
            mobileDropdownToggle.classList.toggle(
              "is-active",
              activeId === "services",
            );
          }
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );

      ["home", "about", "services", "reviews", "contacts"].forEach((id) => {
        const section = document.getElementById(id);
        if (section) sectionObserver.observe(section);
      });

      window.addEventListener("scroll", updateHeader, { passive: true });
      window.addEventListener("resize", updateHeader);
      updateHeader();

      const isTouch = window.matchMedia("(hover: none)").matches;

      if (isTouch) {
        document.querySelectorAll(".service-card").forEach((card) => {
          card.addEventListener("click", (e) => {
            if (!card.classList.contains("is-revealed")) {
              e.preventDefault();
              document
                .querySelectorAll(".service-card.is-revealed")
                .forEach((c) => c.classList.remove("is-revealed"));
              card.classList.add("is-revealed");
            }
          });
        });
      }

      const statsBlock = document.querySelector(".about__stats");

      function animateStat(el) {
        const text = el.textContent.trim();
        const targets = Array.from(text.matchAll(/\d+/g), ([number]) =>
          Number(number),
        );
        if (!targets.length) return;

        const duration = 1600;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          let index = 0;
          el.textContent = text.replace(/\d+/g, () =>
            String(Math.round(targets[index++] * eased)),
          );
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      }

      if (statsBlock) {
        const stats = statsBlock.querySelectorAll("strong");

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          stats.forEach((el) => {
            const match = el.textContent.trim().match(/^(\d+)(\D*)$/);
            if (match) el.textContent = match[1] + match[2];
          });
        } else {
          const statsObserver = new IntersectionObserver(
            (entries, observer) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                stats.forEach(animateStat);
                observer.disconnect();
              });
            },
            { threshold: 0.4 },
          );

          statsObserver.observe(statsBlock);
        }
      }

      document.querySelectorAll("[data-reviews-carousel]").forEach((carousel) => {
        const track = carousel.querySelector(".reviews__track");
        const slides = Array.from(carousel.querySelectorAll(".review"));
        const prevButton = carousel.querySelector(".reviews__arrow--prev");
        const nextButton = carousel.querySelector(".reviews__arrow--next");
        const dots = Array.from(carousel.querySelectorAll(".reviews__dot"));
        const viewport = carousel.querySelector(".reviews__viewport");

        if (!track || !viewport || slides.length < 2) return;

        const autoplayDelay =
          parseInt(carousel.dataset.autoplay, 10) || 5000;
        let currentIndex = 0;
        let maxIndex = slides.length - 1;
        let autoplayTimer = null;
        let resizeTimer = null;

        const getSlidesPerView = () => {
          const slideWidth = slides[0].getBoundingClientRect().width;
          const gap = parseFloat(getComputedStyle(track).columnGap) || 0;

          if (!slideWidth) return 1;

          return Math.max(
            1,
            Math.floor((viewport.clientWidth + gap + 1) / (slideWidth + gap)),
          );
        };

        const updateLayout = () => {
          maxIndex = Math.max(0, slides.length - getSlidesPerView());
          currentIndex = Math.min(currentIndex, maxIndex);

          dots.forEach((dot, dotIndex) => {
            dot.hidden = dotIndex > maxIndex;
          });
        };

        const updateDots = () => {
          dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === currentIndex);
          });
        };

        const getSlideOffset = (index) =>
          slides[index].getBoundingClientRect().left -
          slides[0].getBoundingClientRect().left;

        const goToSlide = (index) => {
          const positions = maxIndex + 1;
          currentIndex = ((index % positions) + positions) % positions;

          const offset = getSlideOffset(currentIndex);
          track.style.transform = `translateX(-${offset}px)`;
          updateDots();
        };

        const nextSlide = () => goToSlide(currentIndex + 1);
        const prevSlide = () => goToSlide(currentIndex - 1);

        const stopAutoplay = () => {
          if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
          }
        };

        const startAutoplay = () => {
          stopAutoplay();
          autoplayTimer = setInterval(nextSlide, autoplayDelay);
        };

        const handleAction = (action) => {
          stopAutoplay();
          action();
          startAutoplay();
        };

        if (prevButton) {
          prevButton.addEventListener("click", () => handleAction(prevSlide));
        }

        if (nextButton) {
          nextButton.addEventListener("click", () => handleAction(nextSlide));
        }

        dots.forEach((dot, index) => {
          dot.addEventListener("click", () => {
            handleAction(() => goToSlide(index));
          });
        });

        carousel.addEventListener("mouseenter", stopAutoplay);
        carousel.addEventListener("mouseleave", startAutoplay);
        carousel.addEventListener("focusin", stopAutoplay);
        carousel.addEventListener("focusout", startAutoplay);

        let touchStartX = 0;
        let touchStartY = 0;
        let isSwiping = false;

        viewport.addEventListener(
          "touchstart",
          (event) => {
            const touch = event.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            isSwiping = true;
            stopAutoplay();
          },
          { passive: true },
        );

        viewport.addEventListener(
          "touchend",
          (event) => {
            if (!isSwiping) return;

            isSwiping = false;

            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
              if (deltaX < 0) {
                nextSlide();
              } else {
                prevSlide();
              }
            }

            startAutoplay();
          },
          { passive: true },
        );

        window.addEventListener("resize", () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            updateLayout();
            goToSlide(currentIndex);
          }, 150);
        });

        updateLayout();
        goToSlide(0);
        startAutoplay();
      });