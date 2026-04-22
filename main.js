import { deleteGrave, getGraves, pobierzIdZdarzeniaZmiany, updateGrave } from "./data/store.js";

const stan = {
  groby: [],
  wybraneId: null,
  czyTrybEdycji: false
};

const elementy = {
  szukajImie: document.querySelector("#szukaj-imie"),
  filtrSektor: document.querySelector("#filtr-sektor"),
  filtrRzad: document.querySelector("#filtr-rzad"),
  listaWynikow: document.querySelector("#lista-wynikow"),
  licznikWynikow: document.querySelector("#licznik-wynikow"),
  wyczyscFiltry: document.querySelector("#wyczysc-filtry"),
  mapaGrid: document.querySelector("#mapa-grid"),
  szczegolyGrobu: document.querySelector("#szczegoly-grobu")
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

function pobierzWybranyGrob() {
  return stan.groby.find((grob) => grob.id === stan.wybraneId) ?? null;
}

function wybierzGrob(id) {
  stan.wybraneId = id;
  stan.czyTrybEdycji = false;
  renderujWyniki();
  renderujMape();
  renderujSzczegoly();
}

function odswiezDane() {
  stan.groby = getGraves();

  if (!stan.groby.some((grob) => grob.id === stan.wybraneId)) {
    stan.wybraneId = stan.groby[0]?.id ?? null;
    stan.czyTrybEdycji = false;
  }
}

function pobierzPrzefiltrowaneGroby() {
  const tekst = elementy.szukajImie.value.trim().toLowerCase();
  const sektor = elementy.filtrSektor.value;
  const rzad = elementy.filtrRzad.value;

  return stan.groby.filter((grob) => {
    const zgodneImie = grob.imieNazwisko.toLowerCase().includes(tekst);
    const zgodnySektor = !sektor || grob.sektor === sektor;
    const zgodnyRzad = !rzad || grob.rzad === rzad;
    return zgodneImie && zgodnySektor && zgodnyRzad;
  });
}

function czyWyszukiwanieAktywne() {
  const tekst = elementy.szukajImie.value.trim();
  return tekst.length >= 2 || Boolean(elementy.filtrSektor.value) || Boolean(elementy.filtrRzad.value);
}

function wypelnijFiltry() {
  const aktualnySektor = elementy.filtrSektor.value;
  const aktualnyRzad = elementy.filtrRzad.value;
  const sektory = [...new Set(stan.groby.map((grob) => grob.sektor))].sort((a, b) =>
    a.localeCompare(b, "pl")
  );
  const rzedy = [...new Set(stan.groby.map((grob) => grob.rzad))].sort((a, b) => Number(a) - Number(b));

  elementy.filtrSektor.innerHTML = '<option value="">Wszystkie sektory</option>';
  elementy.filtrRzad.innerHTML = '<option value="">Wszystkie rzędy</option>';

  for (const sektor of sektory) {
    const option = document.createElement("option");
    option.value = sektor;
    option.textContent = sektor;
    elementy.filtrSektor.append(option);
  }

  for (const rzad of rzedy) {
    const option = document.createElement("option");
    option.value = rzad;
    option.textContent = rzad;
    elementy.filtrRzad.append(option);
  }

  elementy.filtrSektor.value = sektory.includes(aktualnySektor) ? aktualnySektor : "";
  elementy.filtrRzad.value = rzedy.includes(aktualnyRzad) ? aktualnyRzad : "";
}

function renderujWyniki() {
  elementy.listaWynikow.innerHTML = "";

  if (!czyWyszukiwanieAktywne()) {
    elementy.licznikWynikow.textContent = "0 wyników";

    const pusty = document.createElement("div");
    pusty.className = "komunikat-pusty";
    pusty.textContent = "Wpisz dane, aby rozpocząć wyszukiwanie";
    elementy.listaWynikow.append(pusty);
    return;
  }

  const groby = pobierzPrzefiltrowaneGroby();
  elementy.licznikWynikow.textContent = `${groby.length} ${groby.length === 1 ? "wynik" : "wyników"}`;

  if (groby.length === 0) {
    const pusty = document.createElement("div");
    pusty.className = "komunikat-pusty";
    pusty.textContent = "Brak wyników dla podanych kryteriów";
    elementy.listaWynikow.append(pusty);
    return;
  }

  for (const grob of groby) {
    const karta = document.createElement("button");
    karta.type = "button";
    karta.className = "karta-wyniku";
    karta.dataset.id = grob.id;

    if (grob.id === stan.wybraneId) {
      karta.classList.add("karta-wyniku--aktywna");
    }

    karta.innerHTML = `
      <div class="karta-wyniku__glowne">
        <h3>${grob.imieNazwisko}</h3>
        <p>Data zgonu: <strong>${formatujDate(grob.dataZgonu)}</strong></p>
      </div>
      <div class="metryka-lokalizacji">
        <span>Sektor ${grob.sektor}</span>
        <span>Rząd ${grob.rzad}</span>
        <span>Grób ${grob.numerGrobu}</span>
      </div>
    `;
    karta.addEventListener("click", () => {
      wybierzGrob(grob.id);
      document.querySelector(`[data-pole-id="${grob.id}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });
    elementy.listaWynikow.append(karta);
  }
}

function renderujSzczegoly() {
  const grob = pobierzWybranyGrob();

  if (!grob) {
    elementy.szczegolyGrobu.innerHTML = `
      <p class="nadtytul">Szczegóły grobu</p>
      <h3>Wybierz grób</h3>
      <p class="tekst-pomocniczy">
        Po wskazaniu wyniku lub pola na mapie zobaczysz pełne dane i opcje edycji.
      </p>
    `;
    return;
  }

  if (stan.czyTrybEdycji) {
    const { imie, nazwisko } = rozdzielImieNazwisko(grob.imieNazwisko);

    elementy.szczegolyGrobu.innerHTML = `
      <p class="nadtytul">Edycja danych</p>
      <h3>${grob.imieNazwisko}</h3>
      <form class="formularz-szczegolow" id="formularz-szczegolow">
        <label class="pole-formularza">
          <span>Imię</span>
          <input id="szczegoly-imie" type="text" value="${imie}" required />
        </label>
        <label class="pole-formularza">
          <span>Nazwisko</span>
          <input id="szczegoly-nazwisko" type="text" value="${nazwisko}" required />
        </label>
        <label class="pole-formularza">
          <span>Data urodzenia</span>
          <input id="szczegoly-data-urodzenia" type="date" value="${grob.dataUrodzenia}" required />
        </label>
        <label class="pole-formularza">
          <span>Data zgonu</span>
          <input id="szczegoly-data-zgonu" type="date" value="${grob.dataZgonu}" required />
        </label>
        <label class="pole-formularza">
          <span>Sektor</span>
          <input id="szczegoly-sektor" type="text" maxlength="2" value="${grob.sektor}" required />
        </label>
        <label class="pole-formularza">
          <span>Rząd</span>
          <input id="szczegoly-rzad" type="text" value="${grob.rzad}" required />
        </label>
        <label class="pole-formularza">
          <span>Numer grobu</span>
          <input id="szczegoly-numer-grobu" type="text" value="${grob.numerGrobu}" required />
        </label>
        <div class="grupa-przyciskow grupa-przyciskow--szczegoly">
          <button class="przycisk" type="submit">Zapisz</button>
          <button class="przycisk przycisk--jasny" type="button" id="anuluj-edycje-szczegolow">Anuluj</button>
          <button class="mini-przycisk mini-przycisk--niebezpieczny" type="button" id="usun-grob">Usuń</button>
        </div>
      </form>
    `;

    document.querySelector("#formularz-szczegolow")?.addEventListener("submit", (event) => {
      event.preventDefault();

      const payload = {
        imieNazwisko: polaczImieNazwisko(
          document.querySelector("#szczegoly-imie").value,
          document.querySelector("#szczegoly-nazwisko").value
        ),
        dataUrodzenia: document.querySelector("#szczegoly-data-urodzenia").value,
        dataZgonu: document.querySelector("#szczegoly-data-zgonu").value,
        sektor: document.querySelector("#szczegoly-sektor").value.trim().toUpperCase(),
        rzad: document.querySelector("#szczegoly-rzad").value.trim(),
        numerGrobu: document.querySelector("#szczegoly-numer-grobu").value.trim()
      };

      try {
        updateGrave(grob.id, payload);
        odswiezDane();
        stan.czyTrybEdycji = false;
        renderujWyniki();
        renderujMape();
        renderujSzczegoly();
      } catch (blad) {
        window.alert(blad.message);
      }
    });

    document.querySelector("#anuluj-edycje-szczegolow")?.addEventListener("click", () => {
      stan.czyTrybEdycji = false;
      renderujSzczegoly();
    });

    document.querySelector("#usun-grob")?.addEventListener("click", () => {
      const czyUsunac = window.confirm("Czy na pewno usunąć wybrany grób?");

      if (!czyUsunac) {
        return;
      }

      try {
        deleteGrave(grob.id);
        odswiezDane();
        renderujWyniki();
        renderujMape();
        renderujSzczegoly();
      } catch (blad) {
        window.alert(blad.message);
      }
    });

    return;
  }

  elementy.szczegolyGrobu.innerHTML = `
    <p class="nadtytul">Szczegóły grobu</p>
    <h3>${grob.imieNazwisko}</h3>
    <dl class="lista-szczegolow">
      <div><dt>Data urodzenia</dt><dd>${formatujDate(grob.dataUrodzenia)}</dd></div>
      <div><dt>Data zgonu</dt><dd>${formatujDate(grob.dataZgonu)}</dd></div>
      <div><dt>Sektor</dt><dd>${grob.sektor}</dd></div>
      <div><dt>Rząd</dt><dd>${grob.rzad}</dd></div>
      <div><dt>Numer grobu</dt><dd>${grob.numerGrobu}</dd></div>
    </dl>
    <div class="grupa-przyciskow grupa-przyciskow--szczegoly">
      <button class="przycisk przycisk--pelna-szerokosc" type="button" id="edytuj-dane">Edytuj dane</button>
      <a class="przycisk przycisk--jasny przycisk--pelna-szerokosc" href="/admin.html?id=${grob.id}">Otwórz w panelu</a>
    </div>
  `;

  document.querySelector("#edytuj-dane")?.addEventListener("click", () => {
    stan.czyTrybEdycji = true;
    renderujSzczegoly();
  });
}

function renderujMape() {
  const sektory = [...new Set(stan.groby.map((grob) => grob.sektor))].sort((a, b) =>
    a.localeCompare(b, "pl")
  );
  elementy.mapaGrid.innerHTML = "";

  if (sektory.length === 0) {
    const pusty = document.createElement("div");
    pusty.className = "komunikat-pusty";
    pusty.textContent = "Brak danych do wyświetlenia na mapie.";
    elementy.mapaGrid.append(pusty);
    return;
  }

  for (const sektor of sektory) {
    const kartaSektora = document.createElement("section");
    kartaSektora.className = "sektor";

    const grobySektora = stan.groby
      .filter((grob) => grob.sektor === sektor)
      .sort((a, b) => Number(a.rzad) - Number(b.rzad) || Number(a.numerGrobu) - Number(b.numerGrobu));

    const rzedyMapy = new Map();

    for (const grob of grobySektora) {
      if (!rzedyMapy.has(grob.rzad)) {
        rzedyMapy.set(grob.rzad, []);
      }

      rzedyMapy.get(grob.rzad).push(grob);
    }

    const naglowek = document.createElement("div");
    naglowek.className = "sektor__naglowek";
    naglowek.innerHTML = `<h3>Sektor ${sektor}</h3><span>${grobySektora.length} pozycji</span>`;
    kartaSektora.append(naglowek);

    const siatkaRzedow = document.createElement("div");
    siatkaRzedow.className = "sektor__rzedy";

    for (const [rzad, grobyRzedu] of [...rzedyMapy.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
      const sekcjaRzedu = document.createElement("section");
      sekcjaRzedu.className = "rzad";

      const naglowekRzedu = document.createElement("div");
      naglowekRzedu.className = "rzad__naglowek";
      naglowekRzedu.innerHTML = `<h4>Rząd ${rzad}</h4><span>${grobyRzedu.length} grobów</span>`;
      sekcjaRzedu.append(naglowekRzedu);

      const siatkaGrobow = document.createElement("div");
      siatkaGrobow.className = "rzad__siatka";

      for (const grob of grobyRzedu) {
        const przycisk = document.createElement("button");
        przycisk.type = "button";
        przycisk.className = "pole-grobu";
        przycisk.dataset.poleId = grob.id;
        przycisk.setAttribute("aria-label", `Grób ${grob.numerGrobu}, sektor ${grob.sektor}, rząd ${grob.rzad}`);

        if (stan.wybraneId === grob.id) {
          przycisk.classList.add("pole-grobu--aktywne");
        }

        przycisk.innerHTML = `<strong>${grob.numerGrobu}</strong>`;
        przycisk.addEventListener("click", () => {
          wybierzGrob(grob.id);
        });
        siatkaGrobow.append(przycisk);
      }

      sekcjaRzedu.append(siatkaGrobow);
      siatkaRzedow.append(sekcjaRzedu);
    }

    kartaSektora.append(siatkaRzedow);
    elementy.mapaGrid.append(kartaSektora);
  }
}

function renderujWidok() {
  odswiezDane();
  wypelnijFiltry();
  renderujWyniki();
  renderujMape();
  renderujSzczegoly();
}

elementy.szukajImie.addEventListener("input", renderujWyniki);
elementy.filtrSektor.addEventListener("change", renderujWyniki);
elementy.filtrRzad.addEventListener("change", renderujWyniki);
elementy.wyczyscFiltry.addEventListener("click", () => {
  elementy.szukajImie.value = "";
  elementy.filtrSektor.value = "";
  elementy.filtrRzad.value = "";
  renderujWyniki();
});

window.addEventListener("storage", renderujWidok);
window.addEventListener(pobierzIdZdarzeniaZmiany(), renderujWidok);

renderujWidok();
