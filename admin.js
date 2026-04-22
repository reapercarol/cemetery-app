import { addGrave, deleteGrave, getGraves, pobierzIdZdarzeniaZmiany, updateGrave } from "./data/store.js";

if (localStorage.getItem("auth") !== "true") {
  window.location.replace("/login.html");
}

const KLUCZ_STRUKTURY = "cmentarz-struktura";

const stan = {
  groby: [],
  edytowanyId: null,
  struktura: []
};

const parametry = new URLSearchParams(window.location.search);
const wskazaneId = parametry.get("id");

const elementy = {
  komunikatAdmin: document.querySelector("#komunikat-admin"),
  sekcjaEdytora: document.querySelector("#sekcja-edytora"),
  tytulEdytora: document.querySelector("#tytul-edytora"),
  formularzGrobu: document.querySelector("#formularz-grobu"),
  tabelaGrobow: document.querySelector("#tabela-grobow"),
  przyciskDodaj: document.querySelector("#przycisk-dodaj"),
  przyciskWyloguj: document.querySelector("#przycisk-wyloguj"),
  anulujEdycje: document.querySelector("#anuluj-edycje"),
  wyczyscFormularz: document.querySelector("#wyczysc-formularz"),
  formularzSektora: document.querySelector("#formularz-sektora"),
  nowySektor: document.querySelector("#nowy-sektor"),
  listaSektorow: document.querySelector("#lista-sektorow")
};

function formatujDate(wartosc) {
  if (!wartosc) {
    return "Brak danych";
  }

  return new Intl.DateTimeFormat("pl-PL").format(new Date(wartosc));
}

function rozdzielImieNazwisko(imieNazwisko) {
  const czesci = String(imieNazwisko ?? "").trim().split(/\s+/).filter(Boolean);
  const imie = czesci.shift() ?? "";
  return {
    imie,
    nazwisko: czesci.join(" ")
  };
}

function polaczImieNazwisko(imie, nazwisko) {
  return [imie.trim(), nazwisko.trim()].filter(Boolean).join(" ");
}

function pokazKomunikat(tekst, wariant = "neutralny") {
  elementy.komunikatAdmin.textContent = tekst;
  elementy.komunikatAdmin.dataset.wariant = wariant;
}

function normalizujSektor(nazwa) {
  return String(nazwa ?? "").trim().toUpperCase();
}

function normalizujRzad(nazwa) {
  return String(nazwa ?? "").trim();
}

function zapiszStrukture() {
  localStorage.setItem(KLUCZ_STRUKTURY, JSON.stringify(stan.struktura));
}

function pobierzStruktureStartowa() {
  const sektoryMapy = new Map();

  for (const grob of stan.groby) {
    const sektor = normalizujSektor(grob.sektor);
    const rzad = normalizujRzad(grob.rzad);

    if (!sektoryMapy.has(sektor)) {
      sektoryMapy.set(sektor, new Set());
    }

    if (rzad) {
      sektoryMapy.get(sektor).add(rzad);
    }
  }

  return [...sektoryMapy.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "pl"))
    .map(([sektor, rzedy]) => ({
      sektor,
      rzedy: [...rzedy].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b, "pl"))
    }));
}

function odswiezStrukture() {
  const zapisane = localStorage.getItem(KLUCZ_STRUKTURY);

  if (!zapisane) {
    stan.struktura = pobierzStruktureStartowa();
    zapiszStrukture();
    return;
  }

  try {
    const struktura = JSON.parse(zapisane);

    if (!Array.isArray(struktura)) {
      throw new Error("Nieprawidłowa struktura.");
    }

    stan.struktura = struktura
      .map((pozycja) => ({
        sektor: normalizujSektor(pozycja.sektor),
        rzedy: Array.isArray(pozycja.rzedy)
          ? pozycja.rzedy.map(normalizujRzad).filter(Boolean).sort((a, b) => Number(a) - Number(b) || a.localeCompare(b, "pl"))
          : []
      }))
      .filter((pozycja) => pozycja.sektor)
      .sort((a, b) => a.sektor.localeCompare(b.sektor, "pl"));
  } catch {
    stan.struktura = pobierzStruktureStartowa();
    zapiszStrukture();
  }
}

function odswiezDane() {
  stan.groby = getGraves();
  odswiezStrukture();

  if (stan.edytowanyId && !stan.groby.some((grob) => grob.id === stan.edytowanyId)) {
    zamknijEdytor();
  }
}

function otworzEdytor(tytul) {
  elementy.tytulEdytora.textContent = tytul;
  elementy.sekcjaEdytora.classList.remove("ukryty");
}

function zamknijEdytor() {
  stan.edytowanyId = null;
  elementy.formularzGrobu.reset();
  document.querySelector("#grob-id").value = "";
  elementy.sekcjaEdytora.classList.add("ukryty");
}

function pobierzPayloadZFormularza() {
  return {
    imieNazwisko: polaczImieNazwisko(
      document.querySelector("#imie").value,
      document.querySelector("#nazwisko").value
    ),
    dataUrodzenia: document.querySelector("#dataUrodzenia").value,
    dataZgonu: document.querySelector("#dataZgonu").value,
    sektor: document.querySelector("#sektor").value.trim().toUpperCase(),
    rzad: document.querySelector("#rzad").value.trim(),
    numerGrobu: document.querySelector("#numerGrobu").value.trim()
  };
}

function wypelnijFormularz(grob) {
  const { imie, nazwisko } = rozdzielImieNazwisko(grob.imieNazwisko);

  stan.edytowanyId = grob.id;
  document.querySelector("#grob-id").value = grob.id;
  document.querySelector("#imie").value = imie;
  document.querySelector("#nazwisko").value = nazwisko;
  document.querySelector("#dataUrodzenia").value = grob.dataUrodzenia;
  document.querySelector("#dataZgonu").value = grob.dataZgonu;
  document.querySelector("#sektor").value = grob.sektor;
  document.querySelector("#rzad").value = grob.rzad;
  document.querySelector("#numerGrobu").value = grob.numerGrobu;
}

function renderujTabele() {
  elementy.tabelaGrobow.innerHTML = "";

  if (stan.groby.length === 0) {
    const wiersz = document.createElement("tr");
    wiersz.innerHTML =
      '<td colspan="7" class="brak-danych">Brak wpisów w rejestrze. Użyj przycisku "Dodaj osobę".</td>';
    elementy.tabelaGrobow.append(wiersz);
    return;
  }

  for (const grob of stan.groby) {
    const wiersz = document.createElement("tr");

    if (grob.id === stan.edytowanyId) {
      wiersz.classList.add("wiersz-aktywny");
    }

    wiersz.innerHTML = `
      <td>${grob.imieNazwisko}</td>
      <td>${formatujDate(grob.dataUrodzenia)}</td>
      <td>${formatujDate(grob.dataZgonu)}</td>
      <td>${grob.sektor}</td>
      <td>${grob.rzad}</td>
      <td>${grob.numerGrobu}</td>
      <td class="akcje-tabeli">
        <button class="mini-przycisk" type="button" data-akcja="edytuj" data-id="${grob.id}">Edytuj</button>
        <button class="mini-przycisk mini-przycisk--niebezpieczny" type="button" data-akcja="usun" data-id="${grob.id}">Usuń</button>
      </td>
    `;
    elementy.tabelaGrobow.append(wiersz);
  }
}

function renderujStrukture() {
  elementy.listaSektorow.innerHTML = "";

  if (stan.struktura.length === 0) {
    const pusty = document.createElement("div");
    pusty.className = "komunikat-pusty";
    pusty.textContent = "Brak sektorów. Dodaj pierwszy sektor.";
    elementy.listaSektorow.append(pusty);
    return;
  }

  for (const pozycja of stan.struktura) {
    const karta = document.createElement("article");
    karta.className = "karta-struktury";

    const listaRzedow = pozycja.rzedy.length
      ? pozycja.rzedy.map((rzad) => `<span class="tag-rzedu">Rząd ${rzad}</span>`).join("")
      : '<p class="tekst-pomocniczy tekst-pomocniczy--maly">Brak rzędów w sektorze.</p>';

    karta.innerHTML = `
      <div class="karta-struktury__naglowek">
        <div>
          <p class="nadtytul">Sektor</p>
          <h3>${pozycja.sektor}</h3>
        </div>
      </div>
      <div class="karta-struktury__rzedy">${listaRzedow}</div>
      <form class="formularz-rzedu" data-sektor="${pozycja.sektor}">
        <label class="pole-formularza">
          <span>Nowy rząd</span>
          <input type="text" name="rzad" placeholder="Np. 5" required />
        </label>
        <button class="przycisk przycisk--jasny" type="submit">Dodaj rząd</button>
      </form>
    `;

    elementy.listaSektorow.append(karta);
  }
}

function renderujWidok() {
  odswiezDane();
  renderujTabele();
  renderujStrukture();
}

function rozpocznijDodawanie() {
  stan.edytowanyId = null;
  elementy.formularzGrobu.reset();
  document.querySelector("#grob-id").value = "";
  otworzEdytor("Nowa osoba");
  renderujTabele();
  pokazKomunikat("Wprowadź dane nowej osoby.", "neutralny");
}

function rozpocznijEdycje(id) {
  const grob = stan.groby.find((element) => element.id === id);

  if (!grob) {
    pokazKomunikat("Nie znaleziono wpisu do edycji.", "blad");
    return;
  }

  wypelnijFormularz(grob);
  otworzEdytor("Edycja danych");
  pokazKomunikat("Edytujesz wybrany wpis.", "neutralny");
  renderujTabele();
}

function obsluzWskazanieZLinku() {
  if (!wskazaneId) {
    return;
  }

  const grob = stan.groby.find((element) => element.id === wskazaneId);

  if (!grob) {
    pokazKomunikat("Nie znaleziono wpisu wskazanego z widoku głównego.", "blad");
    return;
  }

  wypelnijFormularz(grob);
  otworzEdytor("Edycja danych");
  renderujTabele();
  pokazKomunikat("Otworzono wpis wskazany z mapy lub listy.", "neutralny");
}

elementy.przyciskDodaj.addEventListener("click", rozpocznijDodawanie);

elementy.przyciskWyloguj.addEventListener("click", () => {
  localStorage.removeItem("auth");
  window.location.replace("/login.html");
});

elementy.formularzSektora.addEventListener("submit", (event) => {
  event.preventDefault();

  const sektor = normalizujSektor(elementy.nowySektor.value);

  if (!sektor) {
    pokazKomunikat("Podaj nazwę sektora.", "blad");
    return;
  }

  if (stan.struktura.some((pozycja) => pozycja.sektor === sektor)) {
    pokazKomunikat("Taki sektor już istnieje.", "blad");
    return;
  }

  stan.struktura.push({
    sektor,
    rzedy: []
  });
  stan.struktura.sort((a, b) => a.sektor.localeCompare(b.sektor, "pl"));
  zapiszStrukture();
  renderujStrukture();
  elementy.formularzSektora.reset();
  pokazKomunikat(`Dodano sektor ${sektor}.`, "sukces");
});

elementy.anulujEdycje.addEventListener("click", () => {
  zamknijEdytor();
  renderujTabele();
  pokazKomunikat("Formularz został zamknięty.", "neutralny");
});

elementy.wyczyscFormularz.addEventListener("click", () => {
  elementy.formularzGrobu.reset();
  document.querySelector("#grob-id").value = "";
  stan.edytowanyId = null;
  elementy.tytulEdytora.textContent = "Nowa osoba";
  renderujTabele();
});

elementy.formularzGrobu.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = document.querySelector("#grob-id").value;
  const payload = pobierzPayloadZFormularza();

  try {
    if (id) {
      updateGrave(id, payload);
      pokazKomunikat("Zmiany zostały zapisane.", "sukces");
    } else {
      addGrave(payload);
      pokazKomunikat("Nowa osoba została dodana.", "sukces");
    }

    zamknijEdytor();
    renderujWidok();
  } catch (blad) {
    pokazKomunikat(blad.message, "blad");
  }
});

elementy.tabelaGrobow.addEventListener("click", (event) => {
  const przycisk = event.target.closest("button[data-akcja]");

  if (!przycisk) {
    return;
  }

  const { akcja, id } = przycisk.dataset;

  if (akcja === "edytuj") {
    rozpocznijEdycje(id);
    return;
  }

  if (akcja === "usun") {
    const czyUsunac = window.confirm("Czy na pewno usunąć wybrany grób z rejestru?");

    if (!czyUsunac) {
      return;
    }

    try {
      deleteGrave(id);
      if (stan.edytowanyId === id) {
        zamknijEdytor();
      }
      renderujWidok();
      pokazKomunikat("Wpis został usunięty.", "sukces");
    } catch (blad) {
      pokazKomunikat(blad.message, "blad");
    }
  }
});

elementy.listaSektorow.addEventListener("submit", (event) => {
  const formularz = event.target.closest(".formularz-rzedu");

  if (!formularz) {
    return;
  }

  event.preventDefault();

  const sektor = formularz.dataset.sektor;
  const pole = formularz.querySelector('input[name="rzad"]');
  const rzad = normalizujRzad(pole.value);

  if (!rzad) {
    pokazKomunikat("Podaj numer lub nazwę rzędu.", "blad");
    return;
  }

  const pozycja = stan.struktura.find((element) => element.sektor === sektor);

  if (!pozycja) {
    pokazKomunikat("Nie znaleziono sektora.", "blad");
    return;
  }

  if (pozycja.rzedy.includes(rzad)) {
    pokazKomunikat(`Rząd ${rzad} już istnieje w sektorze ${sektor}.`, "blad");
    return;
  }

  pozycja.rzedy.push(rzad);
  pozycja.rzedy.sort((a, b) => Number(a) - Number(b) || a.localeCompare(b, "pl"));
  zapiszStrukture();
  renderujStrukture();
  pokazKomunikat(`Dodano rząd ${rzad} do sektora ${sektor}.`, "sukces");
});

window.addEventListener("storage", renderujWidok);
window.addEventListener(pobierzIdZdarzeniaZmiany(), renderujWidok);

renderujWidok();
obsluzWskazanieZLinku();
