

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "");
}

const SCAM_WORDS = {
  odkaz: [
    "http://", "https://", "www.",
    "bit.ly", "tinyurl", "t.co"
  ],

  institucia: [
    "banka", "slovenska posta", "posta",
    "policia", "ministerstvo",
    "socialna poistovna", "poistovna",
    "zdravotna poistovna", "tipos",
    "dopravna policia"
  ],

  citlive_udaje: [
    "heslo", "pin", "cislo karty",
    "udaje karty", "bankove udaje",
    "prihlasovacie udaje",
    "osobne udaje", "overte identitu",
    "potvrdte identitu"
  ],

  naliehavost: [
    "okamzite", "ihned", "urgentne",
    "urgent", "posledna vyzva",
    "do 24 hodin", "do 30 minut",
    "do jednej hodiny",
    "konajte okamzite",
    "posledna pripomienka"
  ],

  platba: [
    "zaplat", "uhrad", "poplatok",
    "nedoplatok", "dlh", "pokuta",
    "clo", "doplat", "na cislo uctu"
  ],

  zasielka: [
    "zasielka", "balik", "doruc",
    "colne konanie"
  ],

  vyhra: [
    "vyhra", "vyhrali", "odmena",
    "bonus", "gratulu",
    "financna cena", "vyzrebovan",
    "zrebovanie"
  ],

  hrozba: [
    "zablok", "deaktiv", "pozastav",
    "zadrzan", "zrusen",
    "odstranen", "nebude doruc",
    "zamraze"
  ],

  overenie: [
    "overte", "potvrdte",
    "prihlaste sa", "zadajte",
    "doplnte"
  ]
};

// 3. NÁZVY KATEGÓRIÍ

const NAMES = {
  odkaz: "Odkaz",
  institucia: "Inštitúcia",
  citlive_udaje: "Citlivé údaje",
  naliehavost: "Naliehavosť / nátlak",
  platba: "Požiadavka na platbu",
  zasielka: "Zásielka / doručenie",
  vyhra: "Výhra / odmena",
  hrozba: "Hrozba / problém",
  overenie: "Požiadavka na overenie"
};

// 4. HĽADANIE KATEGÓRIÍ

function findCategories(sms) {
  const text = normalize(sms);
  const found = [];

  for (const [category, words] of Object.entries(SCAM_WORDS)) {
    for (const word of words) {
      if (text.includes(normalize(word))) {
        found.push(category);
        break;
      }
    }
  }

  return found;
}

// 5. ANALÝZA SMS
// Bodovanie podľa pôvodného pryon.py

function analyzeSMS(sms) {
  const found = findCategories(sms);

  let score = 0;
  const reasons = [];

  if (found.includes("odkaz")) {
    score += 1;
    reasons.push("Obsahuje odkaz");
  }

  if (found.includes("citlive_udaje")) {
    score += 2;
    reasons.push("Požaduje alebo spomína citlivé údaje");
  }

  if (found.includes("naliehavost")) {
    score += 1;
    reasons.push("Vytvára časový nátlak");
  }

  if (found.includes("hrozba")) {
    score += 1;
    reasons.push("Obsahuje hrozbu alebo problém");
  }

  if (found.includes("vyhra")) {
    score += 1;
    reasons.push("Sľubuje výhru alebo odmenu");
  }

  if (
    found.includes("platba") &&
    found.includes("odkaz")
  ) {
    score += 2;
    reasons.push("Požaduje platbu cez odkaz");
  }

  if (
    found.includes("zasielka") &&
    found.includes("platba")
  ) {
    score += 2;
    reasons.push("Spája zásielku s požiadavkou na platbu");
  }

  if (
    found.includes("zasielka") &&
    found.includes("odkaz")
  ) {
    score += 1;
    reasons.push("Spája zásielku s odkazom");
  }

  if (
    found.includes("institucia") &&
    found.includes("citlive_udaje")
  ) {
    score += 2;
    reasons.push("Inštitúcia žiada citlivé údaje");
  }

  if (
    found.includes("institucia") &&
    found.includes("odkaz") &&
    found.includes("overenie")
  ) {
    score += 2;
    reasons.push("Inštitúcia žiada overenie cez odkaz");
  }

  if (
    found.includes("vyhra") &&
    found.includes("odkaz")
  ) {
    score += 2;
    reasons.push("Výhra alebo odmena obsahuje odkaz");
  }

  if (
    found.includes("vyhra") &&
    found.includes("citlive_udaje")
  ) {
    score += 2;
    reasons.push("Výhra alebo odmena žiada citlivé údaje");
  }

  if (
    found.includes("hrozba") &&
    found.includes("naliehavost")
  ) {
    score += 2;
    reasons.push("Kombinuje hrozbu s nátlakom");
  }

  if (
    found.includes("hrozba") &&
    found.includes("overenie")
  ) {
    score += 1;
    reasons.push("Po probléme požaduje overenie");
  }

  const result = score >= 4 ? "SCAM" : "LEGIT";

  return {
    result,
    score,
    categories: found,
    reasons
  };
}

const EXAMPLE_SMS = [
  {
    text: "Vasa banka zaznamenala problem. Okamzite overte identitu a heslo na http://bit.ly/3qJzX7Y. Inak bude ucet zablokovany.",
    actualType: "SCAM"
  },
  {
    text: "Ahoj, pridem dnes asi o 15 minut neskor. Vidime sa!",
    actualType: "LEGIT"
  },
  {
    text: "Vas balik nebolo mozne dorucit. Uhradte poplatok do 24 hodin na http://bit.ly/5ksHk7Y.",
    actualType: "SCAM"
  },
  {
    text: "Dobry den, pripominam Vam termin stretnutia zajtra o 10:00.",
    actualType: "LEGIT"
  },
  {
    text: "Gratulujeme! Vyhrali ste financnu cenu v zrebovani Jackpotu! Potvrdte svoje osobne udaje na https://bit.ly/4DH8ydY.",
    actualType: "SCAM"
  },
  {
    text: "Dakujeme za nakup. Vasa objednavka je pripravena na vyzdvihnutie.",
    actualType: "LEGIT"
  },
  {
    text: "Posledna pripomienka! Vas bankovy ucet bude zablokovany. Okamzite zadajte heslo.",
    actualType: "SCAM"
  },
  {
    text: "Ahoj, nezabudni si zajtra priniest poznamky do skoly.",
    actualType: "LEGIT"
  },
  {
    text: "Ministerstvo vnutra zaznamenalo podozrivu aktivitu na vasom ucte. Overte identitu na https://bit.ly/3qJzA7Y do 24 hodin.",
    actualType: "SCAM"
  },
  {
    text: "Dopravna policia zaznamenala prekrocenie rychlosti. Uhradte pokutu na https://bit.ly/3qJzX7Y. Konajte okamzite, inak bude pokuta zdvojnasobena!",
    actualType: "SCAM"
  },
  {
    text: "Vas balik je pripraveny na vyzdvihnutie. Kod na vyzdvihnutie: 028 485.",
    actualType: "LEGIT"
  },
  {
    text: "Slovenska posta oznamuje, ze vas balik SK-8492-3854-5613 je na ceste. Ocakavajte dorucenie 20.10.2026 do 18:00.",
    actualType: "LEGIT"
  },
  {
    text: "Vasa banka zaznamenala podozrivu aktivitu. Okamzite overte identitu a heslo na https://bit.ly/3qD3X7Y.",
    actualType: "SCAM"
  },
  {
    text: "Ahoj, skoc po skole do obchodu a kup prosim mlieko a chlieb dakujem ❤ ",
    actualType: "LEGIT"
  },
  {
    text: "Vas ucet bol zablokovany. Okamzite zadajte heslo a pin na https://bit.ly/U6m0K7Y.",
    actualType: "SCAM"
  },
  {
    text: "[Zdravotna poistovna UNION] Vase udaje su neaktualne. Overte identitu na https://bit.ly/7eLX7Y.",
    actualType: "SCAM"
  },
  {
    text: "Upozornenie na colne konanie: Mate nedoplatok za clo. Uhradte do 30 minut na https://bit.ly/3qJzX7Y, inak bude ucet zablokovany a objednavka zrusena.",
    actualType: "SCAM"
  },
  {
    text: "Dobry den. Dnes je termin vasej pravidelnej preventivne kontroly. Prosime, dostavte sa do ambulancie o 10:00. MuDr. Novakova",
    actualType: "LEGIT"
  }
];

const smsInput = document.getElementById("smsInput");
const charCount = document.getElementById("charCount");

const randomBtn = document.getElementById("randomBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");

const errorMessage = document.getElementById("errorMessage");
const resultSection = document.getElementById("resultSection");

const resultBanner = document.getElementById("resultBanner");
const resultTitle = document.getElementById("resultTitle");
const resultDescription = document.getElementById("resultDescription");
const resultIcon = document.getElementById("resultIcon");

const scoreValue = document.getElementById("scoreValue");
const categoriesList = document.getElementById("categoriesList");
const reasonsList = document.getElementById("reasonsList");

const exampleAnswer = document.getElementById("exampleAnswer");
const exampleAnswerText = document.getElementById("exampleAnswerText");

let selectedExample = null;

function updateCharCount() {
  charCount.textContent = `${smsInput.value.length} / 2000`;
}

smsInput.addEventListener("input", () => {
  updateCharCount();

  selectedExample = null;

  errorMessage.hidden = true;
  resultSection.hidden = true;
});

function generateRandomSMS() {
  const randomIndex = Math.floor(
    Math.random() * EXAMPLE_SMS.length
  );

  selectedExample = EXAMPLE_SMS[randomIndex];

  smsInput.value = selectedExample.text;

  updateCharCount();

  errorMessage.hidden = true;
  resultSection.hidden = true;

  smsInput.focus();
}

randomBtn.addEventListener("click", generateRandomSMS);

function displayResult(analysis) {
  resultSection.hidden = false;

  const isScam = analysis.result === "SCAM";

  resultBanner.className = isScam
    ? "result-banner scam"
    : "result-banner legit";

  resultTitle.textContent = analysis.result;

  resultDescription.textContent = isScam
    ? "Algoritmus označil správu ako podozrivú."
    : "Algoritmus nenašiel dostatočné skóre na označenie správy ako podvodnej.";

  resultIcon.textContent = isScam ? "!" : "✓";

  scoreValue.textContent = `${analysis.score} bodov`;

  categoriesList.replaceChildren();

  if (analysis.categories.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-text";
    empty.textContent = "Neboli nájdené žiadne sledované znaky.";

    categoriesList.appendChild(empty);
  } else {
    for (const category of analysis.categories) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = NAMES[category];

      categoriesList.appendChild(tag);
    }
  }

  reasonsList.replaceChildren();

  if (analysis.reasons.length === 0) {
    const item = document.createElement("li");

    item.textContent =
      "Neboli splnené žiadne bodované podmienky.";

    reasonsList.appendChild(item);
  } else {
    for (const reason of analysis.reasons) {
      const item = document.createElement("li");
      item.textContent = reason;

      reasonsList.appendChild(item);
    }
  }

  if (selectedExample) {
    exampleAnswer.hidden = false;

    const correct = selectedExample.actualType === analysis.result;

    exampleAnswerText.textContent =
      `Zamýšľaný typ ukážky: ${selectedExample.actualType}. ` +
      (correct
        ? "PryOn ju vyhodnotil rovnako."
        : "PryOn ju vyhodnotil inak.");
  } else {
    exampleAnswer.hidden = true;
  }

  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function handleAnalyze() {
  const sms = smsInput.value.trim();

  if (!sms) {
    errorMessage.hidden = false;
    resultSection.hidden = true;
    smsInput.focus();
    return;
  }

  errorMessage.hidden = true;

  const analysis = analyzeSMS(sms);

  displayResult(analysis);
}

analyzeBtn.addEventListener("click", handleAnalyze);



resetBtn.addEventListener("click", () => {
  smsInput.value = "";
  selectedExample = null;

  updateCharCount();

  errorMessage.hidden = true;
  resultSection.hidden = true;

  smsInput.focus();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


// 13. INICIALIZÁCIA

updateCharCount();
// ==========================================
// DARK / LIGHT MODE
// ==========================================

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// Načítanie uloženého nastavenia
const savedTheme = localStorage.getItem("pryon-theme");

// Ak používateľ ešte nič nevybral,
// použijeme nastavenie jeho zariadenia.
const systemPrefersDark = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;

const initialTheme =
  savedTheme === "dark" || savedTheme === "light"
    ? savedTheme
    : systemPrefersDark
      ? "dark"
      : "light";

function setTheme(theme) {
  document.documentElement.setAttribute(
    "data-theme",
    theme
  );

  // V dark mode ukazujeme slnko,
  // pretože kliknutie prepne na light mode.
  themeIcon.textContent = theme === "dark" ? "☀" : "☾";

  themeToggle.setAttribute(
    "aria-label",
    theme === "dark"
      ? "Prepnúť na svetlý režim"
      : "Prepnúť na tmavý režim"
  );

  themeToggle.setAttribute(
    "aria-pressed",
    String(theme === "dark")
  );
}

setTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme =
    document.documentElement.getAttribute("data-theme");

  const newTheme =
    currentTheme === "dark" ? "light" : "dark";

  setTheme(newTheme);

  localStorage.setItem("pryon-theme", newTheme);
});
