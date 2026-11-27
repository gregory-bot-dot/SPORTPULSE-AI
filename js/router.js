
/* ==========================================
   SPORTPULSE AI — ROUTER
========================================== */

const routes = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "matches", label: "Live & Matchs", icon: "⚽" },
  { id: "analysis", label: "Analyses", icon: "◈" },
  { id: "odds", label: "Odds Center", icon: "▤" },
  { id: "scanner", label: "Scanner", icon: "⌕" },
  { id: "players", label: "Joueurs", icon: "♙" },
  { id: "performance", label: "Performance Lab", icon: "▥" },
  { id: "ai-lab", label: "AI Lab", icon: "✳" }
];

const Router = {
  currentPage: "dashboard",

  navigate(page) {
    const route = routes.find(item => item.id === page);

    if (!route) return;

    this.currentPage = page;

    document.querySelectorAll("[data-page]").forEach(element => {
      element.classList.toggle(
        "active",
        element.dataset.page === page
      );
    });

    document.querySelectorAll("[data-view]").forEach(element => {
      element.hidden = element.dataset.view !== page;
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    window.dispatchEvent(
      new CustomEvent("sportpulse:navigate", {
        detail: { page }
      })
    );
  },

  init() {
    document.addEventListener("click", event => {
      const link = event.target.closest("[data-page]");

      if (!link) return;

      event.preventDefault();
      this.navigate(link.dataset.page);
    });

    this.navigate(this.currentPage);
  }
};

window.SPORTPULSE_ROUTES = routes;
window.SPORTPULSE_ROUTER = Router;
