const setup = () => {
  // Get navbar burgers
  const navbarBurgers = document.querySelectorAll(".navbar-burger");

  if (navbarBurgers.length > 0) {
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
  }
};

export default setup;
