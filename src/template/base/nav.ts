const setup = () => {
  // Get navbar burgers
  const navbarBurgers = document.querySelectorAll(".navbar-burger");

  navbarBurgers.forEach(el => {
    if (el instanceof HTMLElement) {
      el.addEventListener("click", () => {
        // Get the target element from data-target
        const { target } = el.dataset;
        if (target) {
          const targetEl = document.getElementById(target);

          if (targetEl) {
            el.classList.toggle("is-active");
            targetEl.classList.toggle("is-active");
          }
        }
      });
    }
  });

  // Add active class
  const navItems = document.querySelectorAll(".navbar-item");
  navItems.forEach(el => {
    if (el instanceof HTMLAnchorElement && el.href === location.href) {
      el.classList.add("is-active");
    }
  });
};

export default setup;
