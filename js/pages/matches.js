
/* ==========================================
   SPORTPULSE AI — MATCHES ENGINE
   COUNTRY TABS + COMPACT MATCHES + FAVORITES
========================================== */

const Matches = {
  currentFixtures: [],
  currentFilter: "all",
  currentLeague: "all",
  currentCountry: "all",
  filtersInitialized: false,
  leagueFilterInitialized: false,
  favorites: {},
  favoritesLoaded: false,

  // ==========================================
  // INITIALISATION
  // ==========================================

  getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  loadFavorites() {
    if (this.favoritesLoaded) return;

    try {
      const saved = localStorage.getItem("sportpulse-favorites");
      this.favorites = saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("SPORTPULSE FAVORITES:", error);
      this.favorites = {};
    }

    this.favoritesLoaded = true;
  },

  saveFavorites() {
    try {
      localStorage.setItem(
        "sportpulse-favorites",
        JSON.stringify(this.favorites)
      );
    } catch (error) {
      console.error("Impossible de sauvegarder les favoris:", error);
    }
  },

  isFavorite(fixtureId) {
    this.loadFavorites();
    return Boolean(this.favorites[String(fixtureId)]);
  },

  toggleFavorite(match) {
    this.loadFavorites();

    const fixtureId = String(match.fixture?.id || "");
    if (!fixtureId) return;

    if (this.favorites[fixtureId]) {
      delete this.favorites[fixtureId];
    } else {
      this.favorites[fixtureId] = match;
    }

    this.saveFavorites();
    this.renderFilteredMatches();
    this.renderCountryTabs();
  },

  getFavoriteFixtures() {
    this.loadFavorites();

    return Object.values(this.favorites).filter(
      (match) => match?.fixture?.id
    );
  },

  // ==========================================
  // STATUTS ET FORMATS
  // ==========================================

  getStatus(status) {
    const liveStatuses = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];

    if (["FT", "AET", "PEN"].includes(status)) {
      return { label: "Terminé", type: "finished" };
    }

    if (liveStatuses.includes(status)) {
      return { label: "En direct", type: "live" };
    }

    if (status === "PST") {
      return { label: "Reporté", type: "postponed" };
    }

    if (status === "CANC") {
      return { label: "Annulé", type: "cancelled" };
    }

    return { label: "À venir", type: "upcoming" };
  },

  formatTime(dateString) {
    if (!dateString) return "--:--";

    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris"
    });
  },

  getCountry(match) {
    return match.league?.country || "Autres pays";
  },

  getLeagueKey(match) {
    return String(match.league?.id || match.league?.name || "unknown");
  },

  // ==========================================
  // IMAGES ET ÉQUIPES
  // ==========================================

  createFlag(url, className = "match-country-flag") {
    if (!url) return null;

    const flag = document.createElement("img");
    flag.src = url;
    flag.alt = "";
    flag.className = className;
    flag.loading = "lazy";

    flag.onerror = () => {
      flag.style.display = "none";
    };

    return flag;
  },

  createTeam(name, logo, side) {
    const team = document.createElement("div");
    team.className = `match-team match-team-${side}`;

    const image = document.createElement("img");
    image.className = "match-team-logo";
    image.alt = "";
    image.loading = "lazy";

    if (logo) {
      image.src = logo;
      image.onerror = () => {
        image.style.display = "none";
      };
    } else {
      image.style.display = "none";
    }

    const label = document.createElement("strong");
    label.className = "match-team-name";
    label.textContent = name || "Équipe inconnue";

    team.append(image, label);
    return team;
  },

  createLeagueHeader(leagueData) {
    const league = document.createElement("div");
    league.className = "match-league";

    const flag = this.createFlag(leagueData.flag);
    if (flag) league.appendChild(flag);

    const details = document.createElement("div");
    details.className = "match-league-details";

    const name = document.createElement("span");
    name.className = "match-league-name";
    name.textContent = leagueData.name || "Compétition";

    details.appendChild(name);

    const metadata = [];

    if (leagueData.country) metadata.push(leagueData.country);
    if (leagueData.season) metadata.push(`Saison ${leagueData.season}`);

    if (metadata.length) {
      const info = document.createElement("small");
      info.className = "match-league-info";
      info.textContent = metadata.join(" • ");
      details.appendChild(info);
    }

    league.appendChild(details);
    return league;
  },

  // ==========================================
  // CARTE DE MATCH COMPACTE
  // ==========================================

  createCard(match) {
    const card = document.createElement("article");
    card.className = "dashboard-match-card";

    const fixtureId = String(match.fixture?.id || "");

    card.dataset.fixtureId = fixtureId;
    card.dataset.homeTeam = match.teams?.home?.name || "";
    card.dataset.awayTeam = match.teams?.away?.name || "";
    card.dataset.leagueId = match.league?.id || "";

    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    card.setAttribute(
      "aria-label",
      `Détails du match ${match.teams?.home?.name || ""} contre ${match.teams?.away?.name || ""}`
    );

    const league = this.createLeagueHeader({
      name: match.league?.name,
      flag: match.league?.flag,
      country: match.league?.country,
      season: match.league?.season
    });

    const statusInfo = this.getStatus(match.fixture?.status?.short);

    const status = document.createElement("span");
    status.className = `match-status ${statusInfo.type}`;
    status.textContent = statusInfo.label;

    const teams = document.createElement("div");
    teams.className = "dashboard-match-teams";

    const home = this.createTeam(
      match.teams?.home?.name,
      match.teams?.home?.logo,
      "home"
    );

    const away = this.createTeam(
      match.teams?.away?.name,
      match.teams?.away?.logo,
      "away"
    );

    const score = document.createElement("strong");
    score.className = "match-score";

    const goals = match.goals || {};

    const hasScore =
      goals.home !== null &&
      goals.home !== undefined &&
      goals.away !== null &&
      goals.away !== undefined;

    score.textContent = hasScore
      ? `${goals.home} - ${goals.away}`
      : "VS";

    teams.append(home, score, away);

    const footer = document.createElement("div");
    footer.className = "match-card-footer";

    const time = document.createElement("span");

    time.textContent = statusInfo.type === "upcoming"
      ? this.formatTime(match.fixture?.date)
      : match.fixture?.status?.elapsed
        ? `${match.fixture.status.elapsed}'`
        : "";

    const footerLeft = document.createElement("div");
    footerLeft.className = "match-card-footer-left";
    footerLeft.append(status, time);

    // Bouton favori
    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "match-favorite-button";

    const favorite = this.isFavorite(fixtureId);

    favoriteButton.textContent = favorite ? "★" : "☆";
    favoriteButton.classList.toggle("active", favorite);
    favoriteButton.setAttribute(
      "aria-label",
      favorite ? "Retirer des favoris" : "Ajouter aux favoris"
    );

    favoriteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      this.toggleFavorite(match);
    });

    footer.append(footerLeft, favoriteButton);

    card.dataset.status = statusInfo.type;
    card.append(league, teams, footer);

    return card;
  },

  // ==========================================
  // STYLES
  // ==========================================

  injectGroupingStyles() {
    if (document.getElementById("sportpulse-grouping-styles")) return;

    const style = document.createElement("style");
    style.id = "sportpulse-grouping-styles";

    style.textContent = `
      /* Pays */

      .matches-country-group {
        margin-bottom: 14px;
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 12px;
        overflow: hidden;
        background: rgba(255,255,255,.015);
      }

      .matches-country-heading {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        background: rgba(255,255,255,.035);
        border-bottom: 1px solid rgba(255,255,255,.06);
        font-weight: 700;
        font-size: 13px;
      }

      .matches-country-heading .match-country-flag {
        width: 20px;
        height: 14px;
        object-fit: cover;
        border-radius: 3px;
      }

      .matches-country-title {
        flex: 1;
      }

      .matches-country-count {
        font-size: 11px;
        opacity: .6;
      }

      /* Championnats */

      .matches-league-group {
        padding: 7px 9px 9px;
        border-bottom: 1px solid rgba(255,255,255,.05);
      }

      .matches-league-group:last-child {
        border-bottom: none;
      }

      .matches-league-heading {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 5px 3px 8px;
        font-size: 12px;
        font-weight: 700;
        opacity: .9;
      }

      .matches-league-heading .match-country-flag {
        width: 17px;
        height: 12px;
        object-fit: cover;
        border-radius: 2px;
      }

      .matches-league-count {
        margin-left: auto;
        font-size: 10px;
        opacity: .55;
      }

      /* Cartes compactes */

      .matches-league-group .dashboard-match-card {
        position: relative;
        margin-bottom: 7px;
        padding: 10px 11px;
        border-radius: 10px;
      }

      .matches-league-group .dashboard-match-card:last-child {
        margin-bottom: 0;
      }

      .matches-league-group .match-league {
        margin-bottom: 7px;
      }

      .matches-league-group .match-league-name {
        font-size: 10px;
      }

      .matches-league-group .match-league-info {
        font-size: 9px;
      }

      .matches-league-group .dashboard-match-teams {
        gap: 5px;
      }

      .matches-league-group .match-team-logo {
        width: 25px;
        height: 25px;
      }

      .matches-league-group .match-team-name {
        font-size: 11px;
      }

      .matches-league-group .match-score {
        font-size: 14px;
      }

      .matches-league-group .match-card-footer {
        margin-top: 7px;
        padding-top: 6px;
      }

      /* Onglets des pays */

      .matches-country-tabs {
        display: flex;
        align-items: center;
        gap: 7px;
        overflow-x: auto;
        padding: 5px 1px 12px;
        margin-bottom: 4px;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }

      .matches-country-tabs::-webkit-scrollbar {
        display: none;
      }

      .matches-country-tab {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 34px;
        padding: 7px 11px;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 20px;
        background: #111922;
        color: inherit;
        font: inherit;
        font-size: 11px;
        font-weight: 650;
        white-space: nowrap;
        cursor: pointer;
      }

      .matches-country-tab.active {
        background: rgba(182,243,74,.13);
        border-color: #B6F34A;
        color: #B6F34A;
      }

      .matches-country-tab img {
        width: 17px;
        height: 12px;
        object-fit: cover;
        border-radius: 2px;
      }

      .matches-country-tab-count {
        opacity: .6;
        font-size: 10px;
      }

      /* Favoris */

      .match-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .match-card-footer-left {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .match-favorite-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 32px;
        width: 32px;
        height: 32px;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 50%;
        background: rgba(255,255,255,.04);
        color: #AAB4BD;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
      }

      .match-favorite-button.active {
        color: #B6F34A;
        border-color: rgba(182,243,74,.35);
        background: rgba(182,243,74,.1);
      }

      /* Filtre championnat */

      .matches-custom-filter {
        position: relative;
        width: 100%;
        margin: 8px 0 12px;
      }

      .matches-custom-filter-button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        min-height: 42px;
        padding: 9px 12px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 10px;
        background: #111922;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .matches-custom-filter-label {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        font-size: 12px;
      }

      .matches-custom-filter-label img {
        width: 19px;
        height: 13px;
        object-fit: cover;
        border-radius: 2px;
      }

      .matches-custom-filter-panel {
        display: none;
        position: absolute;
        z-index: 100;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        max-height: 320px;
        overflow-y: auto;
        padding: 7px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 12px;
        background: #111922;
        box-shadow: 0 12px 30px rgba(0,0,0,.4);
      }

      .matches-custom-filter.open .matches-custom-filter-panel {
        display: block;
      }

      .matches-filter-country {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 9px 8px 5px;
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .06em;
        opacity: .55;
      }

      .matches-filter-country img {
        width: 17px;
        height: 12px;
        object-fit: cover;
        border-radius: 2px;
      }

      .matches-filter-option {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .matches-filter-option:hover,
      .matches-filter-option.active {
        background: rgba(182,243,74,.12);
      }

      .matches-filter-option img {
        width: 19px;
        height: 13px;
        object-fit: cover;
        border-radius: 2px;
      }

      .matches-filter-option span {
        font-size: 12px;
      }

      .matches-native-select-hidden {
        display: none !important;
      }
    `;

    document.head.appendChild(style);
  },

  // ==========================================
  // GROUPES DE PAYS ET CHAMPIONNATS
  // ==========================================

  groupFixtures(fixtures) {
    const countries = new Map();

    fixtures.forEach((match) => {
      const country = this.getCountry(match);
      const leagueKey = this.getLeagueKey(match);

      if (!countries.has(country)) {
        countries.set(country, {
          flag: match.league?.flag || null,
          leagues: new Map()
        });
      }

      const countryGroup = countries.get(country);

      if (!countryGroup.flag && match.league?.flag) {
        countryGroup.flag = match.league.flag;
      }

      if (!countryGroup.leagues.has(leagueKey)) {
        countryGroup.leagues.set(leagueKey, {
          id: String(match.league?.id || ""),
          name: match.league?.name || "Compétition inconnue",
          flag: match.league?.flag || countryGroup.flag,
          matches: []
        });
      }

      countryGroup.leagues.get(leagueKey).matches.push(match);
    });

    return [...countries.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "fr"))
      .map(([country, data]) => ({
        country,
        flag: data.flag,
        leagues: [...data.leagues.values()]
          .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      }));
  },

  renderGroupedMatches(container, fixtures) {
    container.replaceChildren();

    const groups = this.groupFixtures(fixtures);

    groups.forEach((countryGroup) => {
      const countryBlock = document.createElement("section");
      countryBlock.className = "matches-country-group";

      const countryHeading = document.createElement("div");
      countryHeading.className = "matches-country-heading";

      const countryFlag = this.createFlag(countryGroup.flag);
      if (countryFlag) countryHeading.appendChild(countryFlag);

      const countryName = document.createElement("span");
      countryName.className = "matches-country-title";
      countryName.textContent = countryGroup.country;

      const countryCount = document.createElement("span");
      countryCount.className = "matches-country-count";

      const totalMatches = countryGroup.leagues.reduce(
        (total, league) => total + league.matches.length,
        0
      );

      countryCount.textContent =
        `${totalMatches} match${totalMatches > 1 ? "s" : ""}`;

      countryHeading.append(countryName, countryCount);
      countryBlock.appendChild(countryHeading);

      countryGroup.leagues.forEach((league) => {
        const leagueBlock = document.createElement("div");
        leagueBlock.className = "matches-league-group";

        const leagueHeading = document.createElement("div");
        leagueHeading.className = "matches-league-heading";

        const flag = this.createFlag(league.flag);
        if (flag) leagueHeading.appendChild(flag);

        const leagueName = document.createElement("span");
        leagueName.textContent = league.name;

        const leagueCount = document.createElement("span");
        leagueCount.className = "matches-league-count";
        leagueCount.textContent =
          `${league.matches.length} match${league.matches.length > 1 ? "s" : ""}`;

        leagueHeading.append(leagueName, leagueCount);
        leagueBlock.appendChild(leagueHeading);

        league.matches.forEach((match) => {
          leagueBlock.appendChild(this.createCard(match));
        });

        countryBlock.appendChild(leagueBlock);
      });

      container.appendChild(countryBlock);
    });
  },

  // ==========================================
  // ONGLET DES PAYS
  // ==========================================

  ensureCountryTabs() {
    const container = document.getElementById("matches-page-list");
    if (!container || !container.parentNode) return null;

    let tabs = document.getElementById("matches-country-tabs");

    if (!tabs) {
      tabs = document.createElement("div");
      tabs.id = "matches-country-tabs";
      tabs.className = "matches-country-tabs";
      tabs.setAttribute("aria-label", "Filtrer par pays");

      container.parentNode.insertBefore(tabs, container);
    }

    return tabs;
  },

  renderCountryTabs() {
    const tabs = this.ensureCountryTabs();
    if (!tabs) return;

    tabs.replaceChildren();

    const favoriteMatches = this.getFavoriteFixtures();
    const groups = this.groupFixtures(this.currentFixtures);

    const countries = groups.map((group) => ({
      name: group.country,
      flag: group.flag,
      count: group.leagues.reduce(
        (total, league) => total + league.matches.length,
        0
      )
    }));

    const definitions = [
      {
        id: "all",
        label: "Tous",
        count: this.currentFixtures.length
      },
      {
        id: "favorites",
        label: "★ Favoris",
        count: favoriteMatches.length
      },
      ...countries.map((country) => ({
        id: country.name,
        label: country.name,
        flag: country.flag,
        count: country.count
      }))
    ];

    definitions.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "matches-country-tab";
      button.classList.toggle("active", this.currentCountry === item.id);
      button.dataset.country = item.id;

      if (item.flag) {
        const flag = this.createFlag(item.flag);
        if (flag) button.appendChild(flag);
      }

      const label = document.createElement("span");
      label.textContent = item.label;
      button.appendChild(label);

      const count = document.createElement("span");
      count.className = "matches-country-tab-count";
      count.textContent = item.count;
      button.appendChild(count);

      button.addEventListener("click", () => {
        this.currentCountry = item.id;

        tabs.querySelectorAll(".matches-country-tab").forEach((tab) => {
          tab.classList.toggle("active", tab === button);
        });

        this.renderFilteredMatches();
      });

      tabs.appendChild(button);
    });
  },

  // ==========================================
  // FILTRES STATUT
  // ==========================================

  initFilters() {
    const filters = document.querySelector(".matches-filters");

    if (!filters || this.filtersInitialized) return;

    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-match-filter]");
      if (!button) return;

      this.currentFilter = button.dataset.matchFilter;

      filters.querySelectorAll("[data-match-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      this.renderFilteredMatches();
    });

    this.filtersInitialized = true;
  },

  // ==========================================
  // FILTRE CHAMPIONNAT
  // ==========================================

  initLeagueFilter() {
    const select = document.getElementById("matches-league-select");

    if (!select || this.leagueFilterInitialized) return;

    this.createCustomLeagueFilter(select);
    this.leagueFilterInitialized = true;
  },

  createCustomLeagueFilter(select) {
    this.injectGroupingStyles();

    let wrapper = document.getElementById("matches-custom-filter");

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "matches-custom-filter";
      wrapper.className = "matches-custom-filter";

      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
    }

    select.classList.add("matches-native-select-hidden");

    wrapper.querySelector(".matches-custom-filter-button")?.remove();
    wrapper.querySelector(".matches-custom-filter-panel")?.remove();

    const button = document.createElement("button");
    button.type = "button";
    button.className = "matches-custom-filter-button";
    button.setAttribute("aria-expanded", "false");

    const label = document.createElement("span");
    label.className = "matches-custom-filter-label";
    label.textContent = "Tous les championnats";

    const arrow = document.createElement("span");
    arrow.textContent = "⌄";

    button.append(label, arrow);

    const panel = document.createElement("div");
    panel.className = "matches-custom-filter-panel";

    wrapper.append(button, panel);

    button.addEventListener("click", () => {
      const isOpen = wrapper.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
    });

    panel.addEventListener("click", (event) => {
      const option = event.target.closest("[data-league-value]");
      if (!option) return;

      this.currentLeague = option.dataset.leagueValue;
      select.value = this.currentLeague;

      wrapper.classList.remove("open");
      button.setAttribute("aria-expanded", "false");

      this.updateCustomLeagueLabel();
      this.renderFilteredMatches();
    });

    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target)) {
        wrapper.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    });

    this.updateCustomLeagueLabel();
  },

  updateCustomLeagueLabel() {
    const wrapper = document.getElementById("matches-custom-filter");
    if (!wrapper) return;

    const button = wrapper.querySelector(".matches-custom-filter-label");
    const select = document.getElementById("matches-league-select");

    if (!button || !select) return;

    button.replaceChildren();

    const selected = select.options[select.selectedIndex];

    if (this.currentLeague === "all" || !selected) {
      button.textContent = "Tous les championnats";
      return;
    }

    const flag = this.createFlag(selected.dataset.flag);

    if (flag) button.appendChild(flag);

    const name = document.createElement("span");
    name.textContent = selected.textContent;
    button.appendChild(name);
  },

  populateLeagueFilter() {
    const select = document.getElementById("matches-league-select");
    if (!select) return;

    const groups = this.groupFixtures(this.currentFixtures);

    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "Tous les championnats";
    select.appendChild(allOption);

    groups.forEach((countryGroup) => {
      countryGroup.leagues.forEach((league) => {
        if (!league.id) return;

        const option = document.createElement("option");
        option.value = league.id;
        option.textContent = `${countryGroup.country} — ${league.name}`;
        option.dataset.flag = league.flag || "";
        select.appendChild(option);
      });
    });

    this.currentLeague = "all";
    select.value = "all";

    this.initLeagueFilter();

    const panel = document.querySelector(
      "#matches-custom-filter .matches-custom-filter-panel"
    );

    if (!panel) return;

    panel.replaceChildren();

    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "matches-filter-option active";
    allButton.dataset.leagueValue = "all";
    allButton.textContent = "Tous les championnats";
    panel.appendChild(allButton);

    groups.forEach((countryGroup) => {
      const countryLabel = document.createElement("div");
      countryLabel.className = "matches-filter-country";

      const flag = this.createFlag(countryGroup.flag);
      if (flag) countryLabel.appendChild(flag);

      const countryName = document.createElement("span");
      countryName.textContent = countryGroup.country;

      countryLabel.appendChild(countryName);
      panel.appendChild(countryLabel);

      countryGroup.leagues.forEach((league) => {
        if (!league.id) return;

        const option = document.createElement("button");
        option.type = "button";
        option.className = "matches-filter-option";
        option.dataset.leagueValue = league.id;

        const leagueFlag = this.createFlag(league.flag);
        if (leagueFlag) option.appendChild(leagueFlag);

        const name = document.createElement("span");
        name.textContent = league.name;

        option.appendChild(name);
        panel.appendChild(option);
      });
    });

    this.updateCustomLeagueLabel();
  },

  // ==========================================
  // COMPTEURS
  // ==========================================

  updateCounters() {
    const total = document.getElementById("matches-total");
    const live = document.getElementById("matches-live");
    const finished = document.getElementById("matches-finished");

    const liveCount = this.currentFixtures.filter((match) =>
      this.getStatus(match.fixture?.status?.short).type === "live"
    ).length;

    const finishedCount = this.currentFixtures.filter((match) =>
      this.getStatus(match.fixture?.status?.short).type === "finished"
    ).length;

    if (total) total.textContent = this.currentFixtures.length;
    if (live) live.textContent = liveCount;
    if (finished) finished.textContent = finishedCount;
  },

  // ==========================================
  // AFFICHAGE FILTRÉ
  // ==========================================

  renderFilteredMatches() {
    const container = document.getElementById("matches-page-list");
    if (!container) return;

    let sourceFixtures = this.currentCountry === "favorites"
      ? this.getFavoriteFixtures()
      : this.currentFixtures;

    const filtered = sourceFixtures.filter((match) => {
      const status = this.getStatus(match.fixture?.status?.short).type;

      const statusMatches =
        this.currentFilter === "all" ||
        status === this.currentFilter;

      const leagueMatches =
        this.currentLeague === "all" ||
        String(match.league?.id) === this.currentLeague;

      const countryMatches =
        this.currentCountry === "all" ||
        this.currentCountry === "favorites" ||
        this.getCountry(match) === this.currentCountry;

      return statusMatches && leagueMatches && countryMatches;
    });

    container.replaceChildren();

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "dashboard-empty";

      empty.textContent = this.currentCountry === "favorites"
        ? "Aucun match dans tes favoris pour le moment. Ajoute une étoile à une rencontre."
        : "Aucune rencontre ne correspond à ces filtres.";

      container.appendChild(empty);
      return;
    }

    this.renderGroupedMatches(container, filtered);
  },

  // ==========================================
  // CHARGEMENT DES RENCONTRES
  // ==========================================

  async loadToday(containerId = "dashboard-matches") {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.loadFavorites();

    container.textContent = "Chargement des rencontres...";

    try {
      const data = await window.SPORTPULSE_DATA.getFixtures(this.getToday());

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(JSON.stringify(data.errors));
      }

      const fixtures = data.response || [];

      if (containerId === "matches-page-list") {
        this.currentFixtures = fixtures;
        this.currentFilter = "all";
        this.currentLeague = "all";
        this.currentCountry = "all";

        this.injectGroupingStyles();
        this.initFilters();
        this.populateLeagueFilter();
        this.updateCounters();
        this.renderCountryTabs();

        const filters = document.querySelector(".matches-filters");

        if (filters) {
          filters.querySelectorAll("[data-match-filter]").forEach((button) => {
            button.classList.toggle(
              "active",
              button.dataset.matchFilter === "all"
            );
          });
        }

        this.renderFilteredMatches();
        return;
      }

      container.replaceChildren();

      if (fixtures.length === 0) {
        container.textContent = "Aucun match programmé aujourd'hui.";
        return;
      }

      this.renderGroupedMatches(container, fixtures);

      console.log(`SPORTPULSE : ${fixtures.length} matchs chargés.`);

    } catch (error) {
      console.error("SPORTPULSE MATCHES:", error);

      container.textContent =
        "Impossible de charger les matchs. Réessayez plus tard.";
    }
  }
};

window.SPORTPULSE_MATCHES = Matches;
