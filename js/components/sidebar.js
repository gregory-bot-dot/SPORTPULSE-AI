
/* ==========================================
   SPORTPULSE AI — SIDEBAR & MOBILE NAV
========================================== */

const Sidebar = {
  render() {
    const routes = window.SPORTPULSE_ROUTES || [];

    const desktopLinks = routes.map(route => `
      <button class="nav-link ${route.id === "dashboard" ? "active" : ""}"
        data-page="${route.id}">
        <span class="nav-icon">${route.icon}</span>
        <span>${route.label}</span>
      </button>
    `).join("");

    const mobilePages = [
      "dashboard",
      "matches",
      "analysis",
      "scanner"
    ];

    const mobileLinks = mobilePages.map(id => {
      const route = routes.find(item => item.id === id);
      if (!route) return "";

      return `
        <button class="mobile-nav-link ${id === "dashboard" ? "active" : ""}"
          data-page="${route.id}">
          <span>${route.icon}</span>
          <small>${route.label}</small>
        </button>
      `;
    }).join("");

    return `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-mark">S</div>
          <div>
            <strong>SPORTPULSE</strong>
            <small>AI INTELLIGENCE</small>
          </div>
        </div>

        <div class="sidebar-label">WORKSPACE</div>

        <nav class="sidebar-navigation">
          ${desktopLinks}
        </nav>

        <div class="sidebar-footer">
          <span class="status-dot"></span>
          <span>SPORTPULSE ENGINE</span>
          <small>v0.1</small>
        </div>
      </aside>

      <nav class="bottom-nav">
        <div class="mobile-nav-main">
          ${mobileLinks}

          <button class="mobile-nav-link" id="mobile-more">
            <span>•••</span>
            <small>Plus</small>
          </button>
        </div>

        <div class="mobile-more-menu" id="mobile-more-menu" hidden>
          ${routes
            .filter(route => !mobilePages.includes(route.id))
            .map(route => `
              <button class="nav-link" data-page="${route.id}">
                <span class="nav-icon">${route.icon}</span>
                <span>${route.label}</span>
              </button>
            `).join("")}
        </div>
      </nav>
    `;
  },

  init() {
    const desktopTarget = document.getElementById("app-sidebar");
    const mobileTarget = document.getElementById("app-bottom-nav");

    if (!desktopTarget || !mobileTarget) {
      console.error("SPORTPULSE: navigation containers missing.");
      return;
    }

    const markup = this.render();

    desktopTarget.innerHTML = markup.match(
      /<aside class="sidebar">[\s\S]*?<\/aside>/
    )[0];

    mobileTarget.innerHTML = markup.match(
      /<nav class="bottom-nav">[\s\S]*?<\/nav>/
    )[0];

    const moreButton = document.getElementById("mobile-more");
    const moreMenu = document.getElementById("mobile-more-menu");

    moreButton?.addEventListener("click", () => {
      moreMenu.hidden = !moreMenu.hidden;
    });

    document.addEventListener("click", event => {
      if (
        !event.target.closest("#mobile-more") &&
        !event.target.closest("#mobile-more-menu") &&
        moreMenu
      ) {
        moreMenu.hidden = true;
      }
    });
  }
};

window.SPORTPULSE_SIDEBAR = Sidebar;
