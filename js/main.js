// CICILIANO · demo — intro a tiza, bandeja de hoy con stock, carta corta, pie de tortas, capas.
import { initKit } from '../kit/kit.js?v=1';
import { opcionesRetiro } from '../kit/core/encargos.js?v=1';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const desk = () => matchMedia('(min-width: 900px)').matches;
const TZ = 'America/Argentina/Buenos_Aires';
let elegido = null; // pieza elegida en la bandeja
const DIAS_N = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/* ---------- hora real de Ciciliano ---------- */
function ahoraBA() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { dow, min: Number(p.hour) * 60 + Number(p.minute) };
}
const ABRE = 8 * 60 + 30;
const cierraEl = (dow) => (dow === 0 ? 16 * 60 : 18 * 60);
const abreDia = (dow) => dow !== 1; // lunes cerrado
const cierraTxt = (dow) => (dow === 0 ? '16:00' : '18:00');
function proximaApertura(dow, min) {
  if (abreDia(dow) && min < ABRE) return 'hoy a las 8:30 hs';
  for (let k = 1; k <= 7; k++) { const d = (dow + k) % 7; if (abreDia(d)) return `${k === 1 ? 'mañana' : 'el ' + DIAS_N[d]} a las 8:30 hs`; }
  return 'pronto';
}

/* =========================================================
   INTRO · la medialuna a tiza, el nombre y los tres paños
   ========================================================= */
function cargada(img) {
  if (!img || img.complete) return Promise.resolve();
  return new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
}
async function intro() {
  const el = $('.intro');
  if (!html.classList.contains('con-intro') || !el) { html.classList.add('listo'); el?.remove(); return; }
  const cel = innerWidth < 900;
  const recursos = Promise.race([Promise.all([document.fonts?.ready, cargada($('.hero__foto img'))]), esperar(2400)]);
  await esperar(80);
  el.classList.add('traza');
  await esperar(cel ? 380 : 520);
  el.classList.add('escribe');
  await Promise.all([esperar(cel ? 760 : 920), recursos]);
  el.classList.add('abre');
  await esperar(cel ? 200 : 260);
  html.classList.add('listo');
  await esperar(900);
  el.remove();
}
intro();

/* ---------- entradas al hacer scroll ---------- */
const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => {
  ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
}, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }) : null;
$$('.rv').forEach((el) => (io ? io.observe(el) : el.classList.add('visto')));

const pieEl = $('.pie');
if (io && pieEl) new IntersectionObserver(([e]) => html.classList.toggle('en-pie', e.isIntersecting), { threshold: 0 }).observe(pieEl);
const heroCtas = $('.hero__ctas');
if (io && heroCtas) new IntersectionObserver(([e]) => html.classList.toggle('en-hero', e.isIntersecting), { threshold: 0 }).observe(heroCtas);

/* ---------- barra ---------- */
const barra = $('[data-barra]');
let rafBarra = 0;
addEventListener('scroll', () => {
  if (rafBarra) return;
  rafBarra = requestAnimationFrame(() => { barra.classList.toggle('solida', scrollY > 24); rafBarra = 0; });
}, { passive: true });
barra.classList.toggle('solida', scrollY > 24);
const linksNav = $$('.barra__nav a');
if (io) {
  const ioNav = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (!e.isIntersecting) return;
    linksNav.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['hoy', 'carta', 'tortas', 'capas', 'visitanos'].forEach((id) => { const s = document.getElementById(id); if (s) ioNav.observe(s); });
}

/* ---------- bloqueo de scroll que funciona en iPhone ---------- */
let scrollGuardado = 0, bloqueos = 0;
function bloquear() { if (bloqueos++ === 0) { scrollGuardado = scrollY; document.body.style.cssText = `position:fixed;top:-${scrollGuardado}px;left:0;right:0`; } }
function liberar() {
  if (--bloqueos > 0) return; bloqueos = 0;
  document.body.style.cssText = '';
  html.style.scrollBehavior = 'auto'; scrollTo(0, scrollGuardado); html.style.scrollBehavior = '';
}

/* ---------- menú del celu ---------- */
const menu = $('#menu');
const btnMenu = $('[data-menu-abrir]');
function abrirMenu() {
  menu.hidden = false; menu.classList.add('abierto');
  btnMenu.setAttribute('aria-expanded', 'true');
  html.classList.add('menu-abierto'); bloquear();
  $('[data-menu-cerrar]').focus();
}
function cerrarMenu(destino) {
  if (menu.hidden) return;
  menu.hidden = true; menu.classList.remove('abierto');
  btnMenu.setAttribute('aria-expanded', 'false');
  html.classList.remove('menu-abierto'); liberar();
  if (destino) document.querySelector(destino)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  else btnMenu.focus();
}
btnMenu.addEventListener('click', abrirMenu);
$('[data-menu-cerrar]').addEventListener('click', () => cerrarMenu());
$$('.menu__nav a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); cerrarMenu(a.getAttribute('href')); }));
addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!menu.hidden) cerrarMenu(); else cerrarPieza(); } });

/* ---------- filas deslizables: arrastre fluido con el mouse, desde cualquier parte ---------- */
function arrastrable(el) {
  if (!el || el.dataset.drag) return;
  el.dataset.drag = '1';
  let x0 = 0, s0 = 0, activo = false, movio = false, ultX = 0, ultT = 0, vel = 0, raf = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (el.scrollWidth <= el.clientWidth + 2) return;
    cancelAnimationFrame(raf);
    activo = true; movio = false; x0 = ultX = e.clientX; s0 = el.scrollLeft; ultT = performance.now(); vel = 0;
  });
  addEventListener('pointermove', (e) => {
    if (!activo) return;
    const dx = e.clientX - x0;
    if (!movio && Math.abs(dx) > 5) { movio = true; el.classList.add('arrastrando'); }
    if (!movio) return;
    e.preventDefault();
    el.scrollLeft = s0 - dx;
    const t = performance.now(); const dt = Math.max(1, t - ultT);
    vel = 0.8 * ((ultX - e.clientX) / dt) + 0.2 * vel; ultX = e.clientX; ultT = t;
  }, { passive: false });
  addEventListener('pointerup', () => {
    if (!activo) return; activo = false;
    if (!movio) return;
    const bloq = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    el.addEventListener('click', bloq, { capture: true, once: true });
    setTimeout(() => el.removeEventListener('click', bloq, { capture: true }), 60);
    // inercia suave y después vuelve el snap
    let v = vel * 16;
    const paso = () => {
      if (Math.abs(v) < 0.6) { el.classList.remove('arrastrando'); return; }
      el.scrollLeft += v; v *= 0.92; raf = requestAnimationFrame(paso);
    };
    if (reduce) el.classList.remove('arrastrando'); else raf = requestAnimationFrame(paso);
  });
  el.addEventListener('dragstart', (e) => e.preventDefault());
}

/* =========================================================
   KIT
   ========================================================= */
const mini = (src) => (src ? src.replace('-700.webp', '-240.webp') : '');
const cuadrada = (src) => (src ? src.replace('-700.webp', '-sq.webp') : '');
function textoStock(ctx, p) {
  const q = ctx.stockDe(p); if (q == null) return '';
  return q === 0 ? 'Agotado por hoy' : q <= ctx.stockAviso ? `Últimas ${q}` : `Quedan ${q}`;
}
function itemCarta(p, ctx) {
  const q = ctx.stockDe(p);
  const pedible = ctx.carrito && ctx.pedible(p);
  const precio = ctx.money(p.precio) ?? 'Consultar';
  return `${p.foto ? `<span class="it__mini"><img src="${esc(mini(ctx.asset(p.foto)))}" alt="" width="240" height="318" loading="lazy" decoding="async"></span>` : ''}
    <div class="it__main">
      <h3 class="it__nom">${esc(p.nombre)}${(p.etiquetas || []).includes('nuevo') ? '<span class="it__nuevo">nuevo</span>' : ''}${p.foto ? '<span class="it__dot" aria-hidden="true"></span>' : ''}</h3>
      ${p.descripcion ? `<p class="it__desc">${esc(p.descripcion)}</p>` : ''}
    </div>
    <div class="it__der"><span class="it__info">${q != null ? `<b class="it__stock${q > 0 && q <= ctx.stockAviso ? ' poco' : ''}">${esc(textoStock(ctx, p))}</b> · ` : ''}${esc(precio)}</span>${pedible ? `<span class="it__qty" data-kit-qty="${esc(p.id)}"></span>` : `<span class="it__qty"><span class="it__manana">${q === 0 ? 'Mañana 8:30 hs' : ''}</span></span>`}</div>`;
}

const kit = await initKit({
  config: 'cliente.json',
  imagenes: { lqip: 'img/lqip.json' },
  cartas: { 'carta-kit': { itemClass: 'it', template: itemCarta } },
  carrito: { label: 'Tu bolsa', fab: false },
  badge: true,
});

/* ---------- contador de la bolsa ---------- */
const nBolsa = $('[data-bolsa-n]');
const btnBolsa = $('.bolsa-btn');
const cantDe = (id) => (kit.carrito?.lineas || []).filter((l) => l.id === id).reduce((s, l) => s + l.cant, 0);
function contar(bump) {
  const n = (kit.carrito?.lineas || []).reduce((s, l) => s + l.cant, 0);
  nBolsa.textContent = n; btnBolsa.classList.toggle('tiene', n > 0);
  btnBolsa.setAttribute('aria-label', n ? `Tu bolsa, ${n} ${n === 1 ? 'producto' : 'productos'}` : 'Tu bolsa');
  if (bump) { btnBolsa.classList.remove('bump'); void btnBolsa.offsetWidth; btnBolsa.classList.add('bump'); }
  pintarEnBolsa();
}
document.addEventListener('kit:carrito', (e) => contar(e.detail?.delta > 0));
kit.carrito?.listo?.then?.(() => contar());

// la píldora del panel se esconde con un popup del kit abierto
new MutationObserver(() => html.classList.toggle('pop-abierto', !!document.querySelector('.kit-pop, .kit-sheet, .kit-drawer, .kit-modal, [class*="kit-pop"][open]'))).observe(document.body, { childList: true });

let productos = [];
let categorias = [];
async function leerDatos() {
  try { [productos, categorias] = await Promise.all([kit.store.getProductos(), kit.store.getCategorias()]); }
  catch (err) { console.warn('[ciciliano] datos', err); }
}
await leerDatos();

/* =========================================================
   EL RELOJ DEL HORNO (?momento=temprano|mediodia|tarde|cerrado)
   ========================================================= */
function momentoActual() {
  const q = new URLSearchParams(location.search).get('momento');
  if (['temprano', 'mediodia', 'tarde', 'cerrado'].includes(q)) return q;
  const { dow, min } = ahoraBA();
  if (!abreDia(dow) || min < ABRE || min >= cierraEl(dow)) return 'cerrado';
  if (min < 11 * 60) return 'temprano';
  if (min < 14 * 60) return 'mediodia';
  return 'tarde';
}
const MOMENTOS = {
  temprano: ['recién salido del horno', 'Lo que salió del horno esta mañana y cuánto queda. Tocá una pieza y te la guardamos para retirar.'],
  mediodia: ['últimas bandejas de la mañana', 'Al mediodía ya empieza a faltar. Tocá una pieza y te la guardamos para retirar.'],
  tarde: ['lo que queda de hoy', 'A esta hora lo que hay, hay. Guardate lo tuyo antes de que se termine.'],
  cerrado: ['la vidriera descansa', 'Hoy ya cerramos. Guardate lo de la próxima horneada y pasalo a buscar.'],
};
function pintarMomento() {
  const m = momentoActual();
  const { dow, min } = ahoraBA();
  $('[data-momento-k]').textContent = MOMENTOS[m][0];
  $('[data-momento-sub]').textContent = m === 'cerrado' ? `Hoy ya cerramos: abrimos ${proximaApertura(dow, min)}. Guardate lo de la próxima horneada y pasalo a buscar.` : MOMENTOS[m][1];
  const abierto = m !== 'cerrado';
  $('[data-estado]').innerHTML = abierto
    ? `<span class="punto" aria-hidden="true"></span>Abierto hasta las ${cierraTxt(dow)} hs<span class="solo-desk"> · Av. Congreso 3201</span>`
    : `<span class="punto off" aria-hidden="true"></span>Cerrado · abrimos ${proximaApertura(dow, min)}<span class="solo-desk"> · Av. Congreso 3201</span>`;
  $$('[data-horario] li').forEach((li) => li.classList.toggle('es-hoy', Number(li.dataset.dia) === dow));
}
pintarMomento();
setInterval(pintarMomento, 60 * 1000);

/* =========================================================
   HERO · el ticket de la bandeja
   ========================================================= */
const prod = (id) => productos.find((p) => p.id === id);
function pintarTicket() {
  const filas = [['medialunas', 'medialunas'], ['croissant', 'croissants'], ['danesa-pera', 'danesas de pera']];
  $('[data-ticket-lista]').innerHTML = filas.map(([id, nom]) => {
    const p = prod(id); const q = p ? kit.stockDe(p) : null;
    if (q == null) return '';
    return `<li class="${q === 0 ? 'off' : ''}"><span>${q === 0 ? nom : nom}</span><b>${q === 0 ? 'agotado' : q}</b></li>`;
  }).join('');
}

/* =========================================================
   LA BANDEJA DE HOY
   ========================================================= */
const EN_BANDEJA = ['medialunas', 'medialunas-pastelera', 'croissant', 'palmeritas', 'fosforitos-jyq', 'roll-canela', 'danesa-pera', 'danesa-frutas', 'danesa-salada', 'pan-campo', 'baguette', 'focaccia-morrones'];
const bandeja = $('[data-bandeja]');
const pieza = $('[data-pieza]');
const piezaFondo = $('[data-pieza-fondo]');
const nombreCorto = (p) => p.nombre.replace(' 100% manteca', '').replace(' con frosting', '').replace(' de masa madre y biga', '').replace(' blanco', '');
function pintarBandeja() {
  const lista = EN_BANDEJA.map(prod).filter((p) => p && p.foto && kit.stockDe(p) != null && p.disponible !== false);
  bandeja.innerHTML = lista.map((p, i) => {
    const q = kit.stockDe(p);
    return `<li class="bp${q === 0 ? ' off' : ''}${p.id === elegido ? ' on' : ''}" style="--i:${i}" data-id="${esc(p.id)}">
      <button type="button" class="bp__btn" data-pieza-id="${esc(p.id)}" aria-label="${esc(p.nombre)}: ${esc(textoStock(kit, p).toLowerCase())}" aria-pressed="${p.id === elegido}">
        <span class="bp__img"><img src="${esc(cuadrada(kit.asset(p.foto)))}" alt="" width="360" height="360" loading="lazy" decoding="async" draggable="false"><span class="bp__agotado">agotado</span></span>
        <span class="bp__n${q <= kit.stockAviso ? ' poco' : ''}" aria-hidden="true">${q}</span>
        <span class="bp__nom">${esc(nombreCorto(p))}</span>
      </button></li>`;
  }).join('');
  if (!elegido || !lista.some((p) => p.id === elegido)) elegido = (lista.find((p) => kit.stockDe(p) > 0) || lista[0])?.id || null;
  marcarElegido();
  pintarPieza(false);
}
function marcarElegido() {
  $$('.bp', bandeja).forEach((li) => { const on = li.dataset.id === elegido; li.classList.toggle('on', on); $('.bp__btn', li).setAttribute('aria-pressed', String(on)); });
}
function pintarPieza(animar = true) {
  const p = prod(elegido); if (!p) return;
  const q = kit.stockDe(p);
  const img = $('[data-pieza-img]');
  const src = kit.asset(p.foto);
  if (img.dataset.src !== src) {
    img.dataset.src = src;
    if (animar && !reduce) { img.classList.add('cambia'); setTimeout(() => { img.src = src; cargada(img).then(() => img.classList.remove('cambia')); }, 160); }
    else img.src = src;
  }
  img.alt = p.nombre;
  $('[data-pieza-q]').textContent = q === 0 ? 'se terminó por hoy' : q <= kit.stockAviso ? `últimas ${q}` : `quedan ${q}`;
  $('[data-pieza-t]').textContent = p.nombre;
  $('[data-pieza-d]').textContent = p.descripcion || '';
  $('[data-pieza-precio]').textContent = kit.money(p.precio) ?? 'Precio: consultar';
  const btn = $('[data-pieza-add]');
  const tope = q != null && cantDe(p.id) >= q;
  btn.disabled = q === 0 || tope;
  btn.textContent = q === 0 ? 'Mañana 8:30 hs' : tope ? 'Ya son todas tuyas' : 'Guardame';
  pintarEnBolsa();
}
function pintarEnBolsa() {
  const el = $('[data-pieza-en]'); if (!el || !elegido) return;
  const n = cantDe(elegido);
  el.innerHTML = n ? `${n === 1 ? 'Ya tenés 1' : `Ya tenés ${n}`} en tu bolsa · <button type="button" data-ver-bolsa>Ver tu bolsa</button>` : '&nbsp;';
}
function abrirPieza() {
  if (desk()) return;
  pieza.classList.add('abierta'); piezaFondo.hidden = false; html.classList.add('pieza-abierta'); bloquear();
  setTimeout(() => $('[data-pieza-cerrar]').focus({ preventScroll: true }), 60);
}
function cerrarPieza() {
  if (!pieza.classList.contains('abierta')) return;
  pieza.classList.remove('abierta'); piezaFondo.hidden = true; html.classList.remove('pieza-abierta'); liberar();
  $(`.bp[data-id="${elegido}"] .bp__btn`)?.focus({ preventScroll: true });
}
bandeja.addEventListener('click', (e) => {
  const b = e.target.closest('[data-pieza-id]'); if (!b) return;
  elegido = b.dataset.piezaId; marcarElegido(); pintarPieza(true); abrirPieza();
});
$('[data-pieza-cerrar]').addEventListener('click', cerrarPieza);
piezaFondo.addEventListener('click', cerrarPieza);
$('[data-pieza-add]').addEventListener('click', (e) => {
  if (!elegido) return;
  kit.carrito.agregar(elegido, 1, { origen: desk() ? e.currentTarget : $('.bolsa-btn') });
  pintarPieza(false);
});
pieza.addEventListener('click', (e) => {
  if (!e.target.closest('[data-ver-bolsa]')) return;
  cerrarPieza(); setTimeout(() => kit.carrito.abrir(), desk() ? 0 : 320);
});
addEventListener('resize', () => { if (desk() && pieza.classList.contains('abierta')) cerrarPieza(); }, { passive: true });

/* =========================================================
   LA CARTA: una sección por vez
   ========================================================= */
const fotoImg = $('[data-foto-img]');
const fotoNom = $('[data-foto-nom]');
function armarCarta(el, cats = []) {
  const tabs = $$('.kit-tab', el);
  $$('.kit-carta__panel', el).forEach((panel, i) => {
    if ($('.carta-cab', panel)) return;
    const cat = panel.id.split('-p-').pop();
    const info = cats.find((c) => c.id === cat) || {};
    const items = $$('.kit-item', panel);
    items.forEach((it) => { if (!$('.it__mini', it)) it.classList.add('sin-foto'); });
    const cab = document.createElement('div');
    cab.className = 'carta-cab';
    cab.innerHTML = `<h3 class="carta-cab__t">${esc(tabs[i]?.textContent.trim() || info.nombre || '')}</h3><span class="carta-cab__n">${items.length} opciones</span>${info.bajada ? `<p class="carta-cab__sub">${esc(info.bajada)}</p>` : ''}`;
    const cont = document.createElement('div');
    cont.className = 'carta-items';
    items.forEach((it) => cont.appendChild(it));
    const prev = tabs[i - 1], next = tabs[i + 1];
    const nav = document.createElement('div');
    nav.className = 'carta-nav';
    nav.innerHTML = `<button type="button" data-prev ${prev ? '' : 'disabled'}>← ${prev ? esc(prev.textContent.trim()) : 'Anterior'}</button><button type="button" data-next ${next ? '' : 'disabled'}>${next ? esc(next.textContent.trim()) : 'Siguiente'} →</button>`;
    nav.querySelector('[data-prev]').addEventListener('click', () => irA(prev));
    nav.querySelector('[data-next]').addEventListener('click', () => irA(next));
    panel.replaceChildren(cab, cont, nav);
  });
  centrarTab(el);
}
function centrarTab(el) {
  const on = $('.kit-tab.is-on', el); const lista = $('.kit-tabs', el);
  if (!on || !lista || matchMedia('(min-width: 1000px)').matches) return;
  lista.scrollTo({ left: on.offsetLeft - (lista.clientWidth - on.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
}
function irA(tab) {
  if (!tab) return;
  tab.click();
  const el = $('#carta-kit');
  const top = el.getBoundingClientRect().top;
  if (top < 0 || top > innerHeight * 0.5) scrollTo({ top: scrollY + top - (desk() ? 110 : 76), behavior: reduce ? 'auto' : 'smooth' });
}
const kitCarta = $('#carta-kit');
document.addEventListener('kit:carta', (e) => { if (e.detail.el.id === 'carta-kit') armarCarta(e.detail.el, e.detail.categorias); contar(); });
if ($('.kit-carta__panel', kitCarta)) armarCarta(kitCarta, categorias);
kitCarta.addEventListener('click', (e) => { if (e.target.closest('.kit-tab')) centrarTab(kitCarta); });
let rafFoto = 0, ultimo = null;
kitCarta.addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse') return;
  const it = e.target.closest('.kit-item');
  if (!it || it === ultimo) return;
  cancelAnimationFrame(rafFoto);
  rafFoto = requestAnimationFrame(() => {
    ultimo?.classList.remove('hover'); ultimo = it; it.classList.add('hover');
    const src = it.dataset.photo;
    if (!src || fotoImg.dataset.src === src) return;
    fotoImg.dataset.src = src;
    fotoImg.classList.add('cambia');
    const nom = $('.it__nom', it)?.firstChild?.textContent.trim() || '';
    setTimeout(() => { fotoImg.src = src; fotoNom.textContent = nom.toLowerCase(); cargada(fotoImg).then(() => fotoImg.classList.remove('cambia')); }, 160);
  });
});
kitCarta.addEventListener('pointerleave', () => { ultimo?.classList.remove('hover'); ultimo = null; });

/* =========================================================
   TORTAS: el pie de tortas + para regalar
   ========================================================= */
const pies = $('[data-pies]');
const fotoGrande = (src) => src;
function botonEncargo(p, cls) {
  return kit.carrito && kit.pedible(p) ? `<button type="button" class="btn btn--corteza ${cls}" data-encargar="${esc(p.id)}">Encargar</button>` : '<span class="pt__precio">Hoy no se toma</span>';
}
function pintarTortas() {
  const tortas = productos.filter((p) => p.categoria === 't-tortas' && p.disponible !== false);
  pies.innerHTML = tortas.map((p) => `<article class="pt" data-id="${esc(p.id)}">
      <figure class="pt__foto"><img src="${esc(fotoGrande(kit.asset(p.foto)))}" alt="${esc(p.nombre)}" width="700" height="868" loading="lazy" decoding="async" draggable="false"></figure>
      <div class="pt__pie" aria-hidden="true"><span class="pt__plato"></span><span class="pt__tallo"></span><span class="pt__base"></span></div>
      <div class="pt__body">
        <h3 class="pt__nom">${esc(p.nombre)}</h3>
        <p class="pt__desc">${esc(p.descripcion || '')}</p>
        <div class="pt__acc"><span class="pt__precio">${esc(kit.money(p.precio) ?? 'Precio: consultar')}</span>${botonEncargo(p, 'pt__btn')}</div>
        <p class="pt__en" data-en="${esc(p.id)}" aria-live="polite"></p>
      </div>
    </article>`).join('');
  const visibles = new Set(kit.visibles(categorias).map((c) => c.id));
  const extra = productos.filter((p) => ['t-finde', 't-fiestas'].includes(p.categoria) && visibles.has(p.categoria) && p.disponible !== false);
  const kick = { 't-finde': 'para el finde', 't-fiestas': 'fiestas' };
  $('[data-regalar]').innerHTML = extra.map((p) => `<article class="rg" data-id="${esc(p.id)}">
      <span class="rg__foto">${p.foto ? `<img src="${esc(kit.asset(p.foto))}" alt="" width="700" height="700" loading="lazy" decoding="async">` : ''}</span>
      <div class="rg__body">
        <span class="rg__k">${p.id === 'box-surtido' ? 'para regalar' : kick[p.categoria] || ''}</span>
        <h4 class="rg__nom">${esc(p.nombre)}</h4>
        <p class="rg__desc">${esc(p.descripcion || '')}</p>
        <div class="rg__acc">${botonEncargo(p, 'rg__btn')}<span class="rg__en" data-en="${esc(p.id)}" aria-live="polite"></span></div>
      </div>
    </article>`).join('');
  pintarEncargados();
  flechas();
}
function pintarEncargados() {
  $$('[data-en]').forEach((el) => { const n = cantDe(el.dataset.en); el.textContent = n ? `${n} en tu bolsa` : ''; });
}
document.addEventListener('kit:carrito', pintarEncargados);
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-encargar]'); if (!b) return;
  kit.carrito.agregar(b.dataset.encargar, 1, { origen: b });
  setTimeout(() => kit.carrito.abrir(), reduce ? 0 : 650);
});
function anchoPaso() { const c = $('.pt', pies); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(pies).columnGap || 24) : 320; }
function flechas() {
  const prev = $('[data-tortas-prev]'), next = $('[data-tortas-next]');
  prev.disabled = pies.scrollLeft < 8;
  next.disabled = pies.scrollLeft + pies.clientWidth >= pies.scrollWidth - 8;
}
$('[data-tortas-prev]').addEventListener('click', () => pies.scrollBy({ left: -anchoPaso(), behavior: reduce ? 'auto' : 'smooth' }));
$('[data-tortas-next]').addEventListener('click', () => pies.scrollBy({ left: anchoPaso(), behavior: reduce ? 'auto' : 'smooth' }));
pies.addEventListener('scroll', () => requestAnimationFrame(flechas), { passive: true });
addEventListener('resize', flechas, { passive: true });
arrastrable(pies);
arrastrable($('[data-pasos]'));

function pintarProximo() {
  const p = productos.find((x) => x.categoria === 't-tortas'); const el = $('[data-proximo]');
  if (!p || !el) return;
  try {
    const r = opcionesRetiro({ horarios: kit.config.horarios, encargo: kit.config.pedidos?.encargo, tz: kit.tz, productos: [p], categorias, lineas: [{ id: p.id, cant: 1 }] });
    const d = (r.dias || []).find((x) => x.franjas.some((f) => f.disponible));
    if (d) { const dt = new Date(d.fecha + 'T12:00:00'); el.innerHTML = `Si encargás hoy, la retirás desde el <b>${DIAS_N[dt.getDay()]} ${dt.getDate()}/${dt.getMonth() + 1}</b>.`; }
  } catch (_) { /* queda el texto fijo */ }
}

/* =========================================================
   CONTÁ LAS CAPAS
   ========================================================= */
const lupa = $('[data-lupa]');
const linea = $('[data-lupa-linea]');
const rango = $('[data-lupa-r]');
const nomCapa = $('[data-lupa-nom]');
const CAPAS = [[36, 'corteza dorada'], [47, 'capas de manteca'], [56, 'el corazón tierno'], [68, 'alvéolos abiertos'], [101, 'corteza dorada']];
function moverLupa(pct) {
  pct = Math.max(2, Math.min(98, pct));
  linea.style.left = pct + '%';
  rango.value = Math.round(pct);
  const nom = CAPAS.find(([h]) => pct < h)[1];
  if (nomCapa.textContent !== nom) nomCapa.textContent = nom;
}
let arrLupa = false;
function pctDe(e) { const r = lupa.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; }
lupa.addEventListener('pointerdown', (e) => { arrLupa = true; lupa.setPointerCapture?.(e.pointerId); moverLupa(pctDe(e)); });
lupa.addEventListener('pointermove', (e) => { if (arrLupa) moverLupa(pctDe(e)); else if (e.pointerType === 'mouse') moverLupa(pctDe(e)); });
lupa.addEventListener('pointerup', () => { arrLupa = false; });
lupa.addEventListener('pointercancel', () => { arrLupa = false; });
rango.addEventListener('input', () => moverLupa(Number(rango.value)));
moverLupa(44);

/* =========================================================
   TODO JUNTO + se actualiza cuando el dueño edita en /admin
   ========================================================= */
function pintarTodo() { pintarTicket(); pintarBandeja(); pintarTortas(); pintarProximo(); contar(); }
pintarTodo();
kit.store.onChange?.(async () => { await leerDatos(); pintarTodo(); });
