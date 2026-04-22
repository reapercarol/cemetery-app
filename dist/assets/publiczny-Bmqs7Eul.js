import"./style-BCQzVWXB.js";import{p as j,g as h,u as E,d as $}from"./store-BCj69SNw.js";const o={groby:[],wybraneId:null,czyTrybEdycji:!1},a={szukajImie:document.querySelector("#szukaj-imie"),filtrSektor:document.querySelector("#filtr-sektor"),filtrRzad:document.querySelector("#filtr-rzad"),listaWynikow:document.querySelector("#lista-wynikow"),licznikWynikow:document.querySelector("#licznik-wynikow"),wyczyscFiltry:document.querySelector("#wyczysc-filtry"),mapaGrid:document.querySelector("#mapa-grid"),szczegolyGrobu:document.querySelector("#szczegoly-grobu")};function w(e){return e?new Intl.DateTimeFormat("pl-PL").format(new Date(e)):"Brak danych"}function N(e){const t=String(e??"").trim().split(/\s+/).filter(Boolean);return{imie:t.shift()??"",nazwisko:t.join(" ")}}function L(e,t){return[e.trim(),t.trim()].filter(Boolean).join(" ")}function q(){return o.groby.find(e=>e.id===o.wybraneId)??null}function S(e){o.wybraneId=e,o.czyTrybEdycji=!1,c(),b(),y()}function f(){o.groby=h(),o.groby.some(e=>e.id===o.wybraneId)||(o.wybraneId=o.groby[0]?.id??null,o.czyTrybEdycji=!1)}function G(){const e=a.szukajImie.value.trim().toLowerCase(),t=a.filtrSektor.value,r=a.filtrRzad.value;return o.groby.filter(s=>{const n=s.imieNazwisko.toLowerCase().includes(e),i=!t||s.sektor===t,p=!r||s.rzad===r;return n&&i&&p})}function I(){return a.szukajImie.value.trim().length>=2||!!a.filtrSektor.value||!!a.filtrRzad.value}function R(){const e=a.filtrSektor.value,t=a.filtrRzad.value,r=[...new Set(o.groby.map(n=>n.sektor))].sort((n,i)=>n.localeCompare(i,"pl")),s=[...new Set(o.groby.map(n=>n.rzad))].sort((n,i)=>Number(n)-Number(i));a.filtrSektor.innerHTML='<option value="">Wszystkie sektory</option>',a.filtrRzad.innerHTML='<option value="">Wszystkie rzędy</option>';for(const n of r){const i=document.createElement("option");i.value=n,i.textContent=n,a.filtrSektor.append(i)}for(const n of s){const i=document.createElement("option");i.value=n,i.textContent=n,a.filtrRzad.append(i)}a.filtrSektor.value=r.includes(e)?e:"",a.filtrRzad.value=s.includes(t)?t:""}function c(){if(a.listaWynikow.innerHTML="",!I()){a.licznikWynikow.textContent="0 wyników";const t=document.createElement("div");t.className="komunikat-pusty",t.textContent="Wpisz dane, aby rozpocząć wyszukiwanie",a.listaWynikow.append(t);return}const e=G();if(a.licznikWynikow.textContent=`${e.length} ${e.length===1?"wynik":"wyników"}`,e.length===0){const t=document.createElement("div");t.className="komunikat-pusty",t.textContent="Brak wyników dla podanych kryteriów",a.listaWynikow.append(t);return}for(const t of e){const r=document.createElement("button");r.type="button",r.className="karta-wyniku",r.dataset.id=t.id,t.id===o.wybraneId&&r.classList.add("karta-wyniku--aktywna"),r.innerHTML=`
      <div class="karta-wyniku__glowne">
        <h3>${t.imieNazwisko}</h3>
        <p>Data zgonu: <strong>${w(t.dataZgonu)}</strong></p>
      </div>
      <div class="metryka-lokalizacji">
        <span>Sektor ${t.sektor}</span>
        <span>Rząd ${t.rzad}</span>
        <span>Grób ${t.numerGrobu}</span>
      </div>
    `,r.addEventListener("click",()=>{S(t.id),document.querySelector(`[data-pole-id="${t.id}"]`)?.scrollIntoView({behavior:"smooth",block:"center"})}),a.listaWynikow.append(r)}}function y(){const e=q();if(!e){a.szczegolyGrobu.innerHTML=`
      <p class="nadtytul">Szczegóły grobu</p>
      <h3>Wybierz grób</h3>
      <p class="tekst-pomocniczy">
        Po wskazaniu wyniku lub pola na mapie zobaczysz pełne dane i opcje edycji.
      </p>
    `;return}if(o.czyTrybEdycji){const{imie:t,nazwisko:r}=N(e.imieNazwisko);a.szczegolyGrobu.innerHTML=`
      <p class="nadtytul">Edycja danych</p>
      <h3>${e.imieNazwisko}</h3>
      <form class="formularz-szczegolow" id="formularz-szczegolow">
        <label class="pole-formularza">
          <span>Imię</span>
          <input id="szczegoly-imie" type="text" value="${t}" required />
        </label>
        <label class="pole-formularza">
          <span>Nazwisko</span>
          <input id="szczegoly-nazwisko" type="text" value="${r}" required />
        </label>
        <label class="pole-formularza">
          <span>Data urodzenia</span>
          <input id="szczegoly-data-urodzenia" type="date" value="${e.dataUrodzenia}" required />
        </label>
        <label class="pole-formularza">
          <span>Data zgonu</span>
          <input id="szczegoly-data-zgonu" type="date" value="${e.dataZgonu}" required />
        </label>
        <label class="pole-formularza">
          <span>Sektor</span>
          <input id="szczegoly-sektor" type="text" maxlength="2" value="${e.sektor}" required />
        </label>
        <label class="pole-formularza">
          <span>Rząd</span>
          <input id="szczegoly-rzad" type="text" value="${e.rzad}" required />
        </label>
        <label class="pole-formularza">
          <span>Numer grobu</span>
          <input id="szczegoly-numer-grobu" type="text" value="${e.numerGrobu}" required />
        </label>
        <div class="grupa-przyciskow grupa-przyciskow--szczegoly">
          <button class="przycisk" type="submit">Zapisz</button>
          <button class="przycisk przycisk--jasny" type="button" id="anuluj-edycje-szczegolow">Anuluj</button>
          <button class="mini-przycisk mini-przycisk--niebezpieczny" type="button" id="usun-grob">Usuń</button>
        </div>
      </form>
    `,document.querySelector("#formularz-szczegolow")?.addEventListener("submit",s=>{s.preventDefault();const n={imieNazwisko:L(document.querySelector("#szczegoly-imie").value,document.querySelector("#szczegoly-nazwisko").value),dataUrodzenia:document.querySelector("#szczegoly-data-urodzenia").value,dataZgonu:document.querySelector("#szczegoly-data-zgonu").value,sektor:document.querySelector("#szczegoly-sektor").value.trim().toUpperCase(),rzad:document.querySelector("#szczegoly-rzad").value.trim(),numerGrobu:document.querySelector("#szczegoly-numer-grobu").value.trim()};try{E(e.id,n),f(),o.czyTrybEdycji=!1,c(),b(),y()}catch(i){window.alert(i.message)}}),document.querySelector("#anuluj-edycje-szczegolow")?.addEventListener("click",()=>{o.czyTrybEdycji=!1,y()}),document.querySelector("#usun-grob")?.addEventListener("click",()=>{if(window.confirm("Czy na pewno usunąć wybrany grób?"))try{$(e.id),f(),c(),b(),y()}catch(n){window.alert(n.message)}});return}a.szczegolyGrobu.innerHTML=`
    <p class="nadtytul">Szczegóły grobu</p>
    <h3>${e.imieNazwisko}</h3>
    <dl class="lista-szczegolow">
      <div><dt>Data urodzenia</dt><dd>${w(e.dataUrodzenia)}</dd></div>
      <div><dt>Data zgonu</dt><dd>${w(e.dataZgonu)}</dd></div>
      <div><dt>Sektor</dt><dd>${e.sektor}</dd></div>
      <div><dt>Rząd</dt><dd>${e.rzad}</dd></div>
      <div><dt>Numer grobu</dt><dd>${e.numerGrobu}</dd></div>
    </dl>
    <div class="grupa-przyciskow grupa-przyciskow--szczegoly">
      <button class="przycisk przycisk--pelna-szerokosc" type="button" id="edytuj-dane">Edytuj dane</button>
      <a class="przycisk przycisk--jasny przycisk--pelna-szerokosc" href="/admin.html?id=${e.id}">Otwórz w panelu</a>
    </div>
  `,document.querySelector("#edytuj-dane")?.addEventListener("click",()=>{o.czyTrybEdycji=!0,y()})}function b(){const e=[...new Set(o.groby.map(t=>t.sektor))].sort((t,r)=>t.localeCompare(r,"pl"));if(a.mapaGrid.innerHTML="",e.length===0){const t=document.createElement("div");t.className="komunikat-pusty",t.textContent="Brak danych do wyświetlenia na mapie.",a.mapaGrid.append(t);return}for(const t of e){const r=document.createElement("section");r.className="sektor";const s=o.groby.filter(d=>d.sektor===t).sort((d,m)=>Number(d.rzad)-Number(m.rzad)||Number(d.numerGrobu)-Number(m.numerGrobu)),n=new Map;for(const d of s)n.has(d.rzad)||n.set(d.rzad,[]),n.get(d.rzad).push(d);const i=document.createElement("div");i.className="sektor__naglowek",i.innerHTML=`<h3>Sektor ${t}</h3><span>${s.length} pozycji</span>`,r.append(i);const p=document.createElement("div");p.className="sektor__rzedy";for(const[d,m]of[...n.entries()].sort((z,k)=>Number(z[0])-Number(k[0]))){const z=document.createElement("section");z.className="rzad";const k=document.createElement("div");k.className="rzad__naglowek",k.innerHTML=`<h4>Rząd ${d}</h4><span>${m.length} grobów</span>`,z.append(k);const g=document.createElement("div");g.className="rzad__siatka";for(const u of m){const l=document.createElement("button");l.type="button",l.className="pole-grobu",l.dataset.poleId=u.id,l.setAttribute("aria-label",`Grób ${u.numerGrobu}, sektor ${u.sektor}, rząd ${u.rzad}`),o.wybraneId===u.id&&l.classList.add("pole-grobu--aktywne"),l.innerHTML=`<strong>${u.numerGrobu}</strong>`,l.addEventListener("click",()=>{S(u.id)}),g.append(l)}z.append(g),p.append(z)}r.append(p),a.mapaGrid.append(r)}}function v(){f(),R(),c(),b(),y()}a.szukajImie.addEventListener("input",c);a.filtrSektor.addEventListener("change",c);a.filtrRzad.addEventListener("change",c);a.wyczyscFiltry.addEventListener("click",()=>{a.szukajImie.value="",a.filtrSektor.value="",a.filtrRzad.value="",c()});window.addEventListener("storage",v);window.addEventListener(j(),v);v();
