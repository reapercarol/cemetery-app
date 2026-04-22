import { danePoczatkowe } from "./graves.js";

const KLUCZ_GROBOW = "cmentarz-groby";
const ZDARZENIE_ZMIANY = "groby-zmienione";

function generujId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `grob-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizujGrob(grob) {
  return {
    id: String(grob.id ?? generujId()),
    imieNazwisko: String(grob.imieNazwisko ?? "").trim(),
    dataUrodzenia: String(grob.dataUrodzenia ?? "").trim(),
    dataZgonu: String(grob.dataZgonu ?? "").trim(),
    sektor: String(grob.sektor ?? "").trim().toUpperCase(),
    rzad: String(grob.rzad ?? "").trim(),
    numerGrobu: String(grob.numerGrobu ?? "").trim()
  };
}

function walidujGrob(grob) {
  const wymaganePola = [
    "imieNazwisko",
    "dataUrodzenia",
    "dataZgonu",
    "sektor",
    "rzad",
    "numerGrobu"
  ];

  const brakujace = wymaganePola.filter((pole) => !String(grob[pole] ?? "").trim());

  if (brakujace.length > 0) {
    throw new Error(`Uzupełnij wszystkie pola: ${brakujace.join(", ")}.`);
  }
}

function zapiszGroby(groby) {
  localStorage.setItem(KLUCZ_GROBOW, JSON.stringify(groby));
  window.dispatchEvent(new CustomEvent(ZDARZENIE_ZMIANY));
}

export function inicjalizujStore() {
  const zapisane = localStorage.getItem(KLUCZ_GROBOW);

  if (zapisane) {
    try {
      const groby = JSON.parse(zapisane);

      if (Array.isArray(groby)) {
        return groby.map(normalizujGrob);
      }
    } catch {
      localStorage.removeItem(KLUCZ_GROBOW);
    }
  }

  const daneStartowe = danePoczatkowe.map(normalizujGrob);
  zapiszGroby(daneStartowe);
  return daneStartowe;
}

export function getGraves() {
  const groby = inicjalizujStore();
  return [...groby].sort((a, b) => {
    return (
      a.sektor.localeCompare(b.sektor, "pl") ||
      Number(a.rzad) - Number(b.rzad) ||
      Number(a.numerGrobu) - Number(b.numerGrobu) ||
      a.imieNazwisko.localeCompare(b.imieNazwisko, "pl")
    );
  });
}

export function addGrave(payload) {
  const nowyGrob = normalizujGrob({
    ...payload,
    id: generujId()
  });

  walidujGrob(nowyGrob);

  const groby = getGraves();
  groby.push(nowyGrob);
  zapiszGroby(groby);
  return nowyGrob;
}

export function updateGrave(id, payload) {
  const groby = getGraves();
  const indeks = groby.findIndex((grob) => grob.id === id);

  if (indeks === -1) {
    throw new Error("Nie znaleziono grobu do aktualizacji.");
  }

  const zaktualizowanyGrob = normalizujGrob({
    ...groby[indeks],
    ...payload,
    id
  });

  walidujGrob(zaktualizowanyGrob);
  groby[indeks] = zaktualizowanyGrob;
  zapiszGroby(groby);
  return zaktualizowanyGrob;
}

export function deleteGrave(id) {
  const groby = getGraves();
  const pozostale = groby.filter((grob) => grob.id !== id);

  if (pozostale.length === groby.length) {
    throw new Error("Nie znaleziono grobu do usunięcia.");
  }

  zapiszGroby(pozostale);
}

export function pobierzIdZdarzeniaZmiany() {
  return ZDARZENIE_ZMIANY;
}
