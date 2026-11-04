/* Funciones compartidas por todas las páginas: guardado, idioma, horario,
   encabezado, pie, cartel y aparición al bajar.
   Los datos siempre se escriben con textContent, nunca con innerHTML. */
'use strict';

const PAGINAS = {
  inicio: 'index.html',
  carta: 'carta.html',
  historia: 'historia.html',
  noches: 'noches-de-show.html',
  contacto: 'contacto.html',
  reservar: 'reservar.html',
  pedir: 'pedir.html',
};

/* ---------- Guardado en el dispositivo (puede estar bloqueado) ---------- */
const Guardado = {
  leer(clave, porDefecto = null) {
    try {
      const valor = localStorage.getItem(`fredy.${clave}`);
      return valor === null ? porDefecto : JSON.parse(valor);
    } catch { return porDefecto; }
  },
  escribir(clave, valor) {
    try { localStorage.setItem(`fredy.${clave}`, JSON.stringify(valor)); } catch { /* sin guardado, sigue andando */ }
  },
  borrar(clave) {
    try { localStorage.removeItem(`fredy.${clave}`); } catch { /* idem */ }
  },
};

/* ---------- Idioma ---------- */
const idiomaValido = (id) => IDIOMAS.some((i) => i.id === id);

function idiomaSugerido() {
  const lista = navigator.languages || [navigator.language || 'es'];
  for (const codigo of lista) {
    const base = String(codigo).slice(0, 2).toLowerCase();
    if (idiomaValido(base)) return base;
  }
  return 'es';
}

let idiomaActual = (() => {
  const guardado = Guardado.leer('idioma');
  return idiomaValido(guardado) ? guardado : idiomaSugerido();
})();

const idioma = () => idiomaActual;

function t(clave, vars = {}, lang = idiomaActual) {
  const base = TEXTOS[lang]?.[clave] ?? TEXTOS.es[clave] ?? clave;
  return base.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

/* Texto en 4 idiomas: { es, en, pt, fr } */
const tr = (obj, lang = idiomaActual) => (obj ? obj[lang] ?? obj.es ?? '' : '');

function aplicarTextos(raiz = document) {
  raiz.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  raiz.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
}

function cambiarIdioma(id, { guardar = true } = {}) {
  if (!idiomaValido(id)) return;
  idiomaActual = id;
  document.documentElement.lang = id;
  if (guardar) Guardado.escribir('idioma', id);
  aplicarTextos();
  const pagina = document.body.dataset.pagina;
  if (pagina) document.title = t(`meta.${pagina}`);
  document.dispatchEvent(new CustomEvent('fredy:idioma'));
}

/* ---------- Creación segura de elementos ---------- */
function h(etiqueta, atributos = {}, ...hijos) {
  const el = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (clave === 'class') el.className = valor;
    else if (clave === 'dataset') Object.assign(el.dataset, valor);
    else if (clave.startsWith('on')) el.addEventListener(clave.slice(2).toLowerCase(), valor);
    else if (clave === 'value') el.value = valor;
    else el.setAttribute(clave, valor === true ? '' : valor);
  }
  el.append(...hijos.flat().filter((hijo) => hijo !== null && hijo !== undefined && hijo !== false));
  return el;
}

/* Los SVG son constantes de icons.js: acá no entra ningún dato. */
function svg(cadena) {
  const plantilla = document.createElement('template');
  plantilla.innerHTML = cadena.trim();
  return plantilla.content.firstElementChild;
}

const icono = (nombre) => svg(ICONOS[nombre]);

function bandera(id, ancho = 22, alto = 15) {
  const { vb, svg: formas } = BANDERAS[id];
  return svg(`<svg class="flag" width="${ancho}" height="${alto}" viewBox="${vb}" aria-hidden="true" focusable="false">${formas}</svg>`);
}

/* ---------- Formatos ---------- */
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const precio = (n) => `$ ${miles(n)}`;
const precioPlato = (p) => (p.precioHasta ? `${precio(p.precio)} - ${precio(p.precioHasta)}` : precio(p.precio));
const urlWhatsApp = (mensaje) => `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
const aMinutos = (hhmm) => { const [a, b] = hhmm.split(':').map(Number); return a * 60 + b; };

/* ---------- Horario: siempre con la hora de Buenos Aires ---------- */
function ahoraEnBuenosAires(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: NEGOCIO.zonaHoraria, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(fecha);
  const v = Object.fromEntries(partes.map((p) => [p.type, p.value]));
  return { iso: `${v.year}-${v.month}-${v.day}`, minutos: (Number(v.hour) % 24) * 60 + Number(v.minute) };
}

function estaAbierto(fecha = new Date()) {
  const { minutos } = ahoraEnBuenosAires(fecha);
  const abre = aMinutos(NEGOCIO.horario.abre);
  const cierra = aMinutos(NEGOCIO.horario.cierra);
  return abre < cierra ? minutos >= abre && minutos < cierra : minutos >= abre || minutos < cierra;
}

/* ---------- Cartel "tabla de parrilla" ---------- */
let contadorCartel = 0;

function pintarCartel(el) {
  const abierto = estaAbierto();
  const horario = abierto
    ? t('cartel.hasta', { h: NEGOCIO.horario.cierra })
    : t('cartel.abre', { h: NEGOCIO.horario.abre });
  el.classList.toggle('is-open', abierto);
  el.classList.toggle('is-closed', !abierto);
  el.querySelector('.fz-estado').textContent = t(abierto ? 'cartel.abierto' : 'cartel.cerrado');
  el.querySelector('.fz-horario').textContent = horario;
  el.querySelector('.fz-sr').textContent = `${t('a11y.horarios')}: ${t(abierto ? 'cartel.abierto' : 'cartel.cerrado')}. ${horario}. `;
}

function crearCartel({ animar = false } = {}) {
  const u = ++contadorCartel;
  const texto = h('span', { class: 'fz-texto' },
    h('span', { class: 'fz-fila' }, h('span', { class: 'fz-dot', 'aria-hidden': 'true' }), h('span', { class: 'fz-estado' })),
    h('span', { class: 'fz-horario' }));
  const tabla = h('span', { class: 'fz-tabla' }, svg(SVG_CARTEL_VETAS), h('span', { class: 'fz-ranura' }), texto);
  const colgante = h('span', { class: 'fz-hang' }, tabla, svg(SVG_CARTEL_HERRAJE));
  const interior = h('span', { class: 'fz-inner' }, svg(svgCartelTenedor(u)), colgante, svg(svgCartelCuchillo(u)));
  const cartel = h('a', { class: `fz-cartel${animar ? '' : ' fz-quieto'}`, href: `${PAGINAS.contacto}#horarios` },
    h('span', { class: 'fz-sr' }), interior);
  pintarCartel(cartel);
  return cartel;
}

function montarCarteles() {
  const lugares = document.querySelectorAll('[data-cartel]');
  /* Se anima una sola vez por visita: repetirlo en cada página cansa. */
  let yaVisto = false;
  try { yaVisto = sessionStorage.getItem('fredy.cartel') === '1'; sessionStorage.setItem('fredy.cartel', '1'); } catch { /* sin guardado */ }
  lugares.forEach((lugar, i) => {
    lugar.replaceChildren(crearCartel({ animar: !yaVisto && i === 0 }));
  });
}

document.addEventListener('fredy:idioma', () => document.querySelectorAll('.fz-cartel').forEach(pintarCartel));

/* ---------- Encabezado ---------- */
const ENLACES_MENU = [
  ['inicio', 'nav.inicio'], ['carta', 'nav.carta'], ['historia', 'nav.historia'],
  ['noches', 'nav.noches'], ['contacto', 'nav.contacto'],
];

const logo = (ancho, alt = '') => h('img', { src: 'img/logo.png', alt, width: ancho, height: ancho, decoding: 'async' });

function enlaceTexto(pagina, clave, extras = {}, antes = null) {
  const actual = document.body.dataset.pagina === pagina;
  return h('a', { href: PAGINAS[pagina], 'aria-current': actual ? 'page' : null, ...extras },
    antes, h('span', { 'data-i18n': clave }, t(clave)));
}

function crearSelectorIdioma() {
  const lugar = h('div', { class: 'lang' });
  const boton = h('button', { class: 'lbtn', type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false' });
  const lista = h('ul', { class: 'lmenu', hidden: true });

  const cerrar = (devolverFoco = false) => {
    lista.hidden = true;
    boton.setAttribute('aria-expanded', 'false');
    if (devolverFoco) boton.focus();
  };

  const pintar = () => {
    const actual = IDIOMAS.find((i) => i.id === idioma());
    boton.setAttribute('aria-label', t('a11y.idioma', { nombre: actual.nombre }));
    boton.replaceChildren(bandera(actual.bandera), actual.id.toUpperCase(), icono('chevron'));
    lista.replaceChildren(...IDIOMAS.map((i) => h('li', {},
      h('button', {
        class: `lopt${i.id === actual.id ? ' on' : ''}`, type: 'button', lang: i.id,
        'aria-pressed': String(i.id === actual.id),
        onClick: () => { cerrar(true); cambiarIdioma(i.id); },
      }, bandera(i.bandera, 24, 16), h('span', { class: 'lopt-nombre' }, i.nombre), i.id === actual.id ? icono('check') : null))));
  };

  boton.addEventListener('click', () => {
    const abrir = lista.hidden;
    lista.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
  });
  document.addEventListener('click', (e) => { if (!lugar.contains(e.target)) cerrar(); });
  lugar.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lista.hidden) cerrar(true); });
  document.addEventListener('fredy:idioma', pintar);
  pintar();

  lugar.append(boton, lista);
  return lugar;
}

function crearBotonIdiomaMovil() {
  const volver = encodeURIComponent(location.pathname.split('/').pop() || PAGINAS.inicio);
  const enlace = h('a', { class: 'lflag', href: `${PAGINAS.inicio}?idioma&volver=${volver}` });
  const pintar = () => {
    const actual = IDIOMAS.find((i) => i.id === idioma());
    enlace.setAttribute('aria-label', t('a11y.idioma', { nombre: actual.nombre }));
    enlace.replaceChildren(bandera(actual.bandera, 28, 19));
  };
  document.addEventListener('fredy:idioma', pintar);
  pintar();
  return enlace;
}

function contadorPedido(extra = '') {
  return h('span', { class: `cuenta ${extra}`, 'data-cuenta': true, hidden: true });
}

function montarEncabezado(destino) {
  const cabecera = h('header', { class: 'cabecera', id: 'cabecera' },
    h('div', { class: 'cabecera-in' },
      h('a', { class: 'cabecera-logo', href: PAGINAS.inicio, 'data-i18n-aria': 'a11y.inicio', 'aria-label': t('a11y.inicio') }, logo(84)),
      h('nav', { class: 'menu', 'data-i18n-aria': 'a11y.principal', 'aria-label': t('a11y.principal') },
        /* "Noches de show" va al final del menú de arriba (el pie conserva el orden de ENLACES_MENU),
           con su propio fondo dorado y un micrófono que aparece al pasar el mouse. */
        [...ENLACES_MENU.filter(([p]) => p !== 'noches'), ...ENLACES_MENU.filter(([p]) => p === 'noches')]
          .map(([pagina, clave]) => (pagina === 'noches'
          ? enlaceTexto(pagina, clave, { class: 'menu-show' }, h('span', { class: 'menu-mic', 'aria-hidden': 'true' }, icono('microfono')))
          : enlaceTexto(pagina, clave)))),
      h('div', { class: 'cabecera-estado' },
        h('div', { class: 'cartel-lugar', 'data-cartel': true }),
        crearSelectorIdioma(),
        crearBotonIdiomaMovil(),
        h('a', { class: 'llamar', href: `tel:${NEGOCIO.telefono}`, 'data-i18n-aria': 'a11y.llamar', 'aria-label': t('a11y.llamar') }, icono('telefono'))),
      h('div', { class: 'cabecera-acciones' },
        /* Bolsa con el número de productos; la frase queda para lectores de pantalla.
           cart.js lo pinta de dorado cuando hay pedido y hace saltar la bolsa al sumar. */
        h('a', { class: 'pill p-ghost solo chico boton-pedido', href: PAGINAS.pedir, 'data-boton-pedido': true },
          h('span', { class: 'boton-pedido-ic' }, icono('bolsa')), contadorPedido('cuenta-pedido'),
          h('span', { class: 'sr', 'data-i18n': 'nav.pedirOnline' }, t('nav.pedirOnline'))),
        h('a', { class: 'pill p-red solo chico', href: PAGINAS.reservar },
          h('span', { 'data-i18n': 'nav.reservarMesa' }, t('nav.reservarMesa'))))));
  destino.replaceWith(cabecera);

  /* Se compacta al bajar. Dos umbrales distintos para que no tiemble en el borde. */
  const alBajar = () => {
    const y = window.scrollY;
    if (y > 48) cabecera.classList.add('compacta');
    else if (y < 8) cabecera.classList.remove('compacta');
  };
  window.addEventListener('scroll', alBajar, { passive: true });
  alBajar();
}

function montarBarraMovil() {
  const actual = document.body.dataset.pagina;
  const acceso = (pagina, clave, nombreIcono, extra = '', hijoExtra = null) => h('a', {
    class: `barra-item ${extra}`, href: PAGINAS[pagina], 'aria-current': actual === pagina ? 'page' : null,
  }, h('span', { class: 'barra-ic' }, icono(nombreIcono), hijoExtra), h('span', { 'data-i18n': clave }, t(clave)));

  document.body.append(h('nav', { class: 'barra', 'data-i18n-aria': 'a11y.accesos', 'aria-label': t('a11y.accesos') },
    acceso('carta', 'nav.carta', 'libro'),
    acceso('historia', 'nav.historia', 'pergamino'),
    acceso('contacto', 'nav.contacto', 'charla'),
    acceso('reservar', 'nav.reservar', 'calendario'),
    acceso('pedir', 'nav.pedir', 'bolsa', '', contadorPedido('cuenta-barra'))));
}

function montarWhatsAppFlotante() {
  document.body.append(h('a', {
    class: 'wa-flota', href: `https://wa.me/${NEGOCIO.whatsapp}`, target: '_blank', rel: 'noopener',
  },
  /* Cerrado se ve solo el ícono; al pasar el mouse se despliega el mensaje hacia la izquierda (CSS). */
  h('span', { class: 'wa-flota-pastilla' },
    h('span', { class: 'wa-flota-t', 'data-i18n': 'nav.consultas' }, t('nav.consultas')),
    h('span', { class: 'wa-flota-ic' }, icono('whatsapp')))));
}

function montarPie(destino) {
  const enlaceRed = (url, nombreIcono, texto) => h('a', { href: url, target: '_blank', rel: 'noopener' }, icono(nombreIcono), texto);
  destino.replaceWith(h('footer', { class: 'pie' },
    h('div', { class: 'wrap pie-in' },
      h('div', { class: 'pie-cols' },
        h('div', { class: 'pie-logo' }, logo(104, 'Fredy Puerto Madero')),
        h('nav', { class: 'fl', 'data-i18n-aria': 'a11y.pie', 'aria-label': t('a11y.pie') },
          h('p', { class: 'fh', 'data-i18n': 'pie.sitio' }, t('pie.sitio')),
          ENLACES_MENU.map(([pagina, clave]) => h('a', { href: PAGINAS[pagina], 'data-i18n': clave }, t(clave)))),
        h('div', { class: 'fl' },
          h('p', { class: 'fh', 'data-i18n': 'pie.visitanos' }, t('pie.visitanos')),
          h('p', { class: 'fl-texto' }, NEGOCIO.direccion, h('br'), NEGOCIO.barrio, h('br'),
            h('span', { 'data-i18n': 'pie.horario' }, t('pie.horario')))),
        h('div', { class: 'fl' },
          h('p', { class: 'fh', 'data-i18n': 'pie.seguinos' }, t('pie.seguinos')),
          enlaceRed(NEGOCIO.instagram, 'instagram', 'Instagram'),
          enlaceRed(NEGOCIO.facebook, 'facebook', 'Facebook'),
          h('a', { class: 'fl-wa', href: `https://wa.me/${NEGOCIO.whatsapp}`, target: '_blank', rel: 'noopener' }, icono('whatsapp'), 'WhatsApp'))),
      h('div', { class: 'pie-base' },
        h('span', { 'data-i18n': 'pie.derechos' }, t('pie.derechos')),
        h('span', { 'data-i18n': 'pie.nfcard' }, t('pie.nfcard'))))));
}

/* ---------- Aparición al bajar ---------- */
function observarApariciones() {
  const elementos = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('visible'));
    return;
  }
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('visible');
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  elementos.forEach((el) => observador.observe(el));
}

/* ---------- Validación de formularios ---------- */
function marcarCampo(campo, error) {
  const caja = campo.closest('.campo');
  const aviso = caja?.querySelector('.campo-error');
  if (error) campo.setAttribute('aria-invalid', 'true');
  else campo.removeAttribute('aria-invalid');
  if (aviso) {
    aviso.dataset.i18n = error || '';
    aviso.textContent = error ? t(error) : '';
    aviso.hidden = !error;
  }
}

/* Dirección y enlaces salen de data.js: se cambian en un solo lugar. */
function aplicarDatos() {
  const enlaces = {
    llegar: NEGOCIO.mapaLlegar,
    ficha: NEGOCIO.mapaFicha,
    whatsapp: `https://wa.me/${NEGOCIO.whatsapp}`,
    telefono: `tel:${NEGOCIO.telefono}`,
  };
  document.querySelectorAll('[data-enlace]').forEach((el) => { el.href = enlaces[el.dataset.enlace]; });
  document.querySelectorAll('[data-dato]').forEach((el) => { el.textContent = NEGOCIO[el.dataset.dato]; });
  document.querySelectorAll('[data-icono]').forEach((el) => {
    const nombre = el.dataset.icono;
    el.replaceChildren(nombre === 'espatula' ? svg(ESPATULA) : icono(nombre));
  });
}

/* ---------- Puesta en marcha de todas las páginas ---------- */
let cartelesListos = false;

function arrancarCarteles() {
  if (cartelesListos) return;
  cartelesListos = true;
  montarCarteles();
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.lang = idioma();
  const pagina = document.body.dataset.pagina;
  if (pagina) document.title = t(`meta.${pagina}`);

  const lugarCabecera = document.getElementById('lugar-cabecera');
  const lugarPie = document.getElementById('lugar-pie');
  if (lugarCabecera) montarEncabezado(lugarCabecera);
  if (lugarPie) montarPie(lugarPie);
  montarBarraMovil();
  montarWhatsAppFlotante();
  aplicarDatos();
  aplicarTextos();
  observarApariciones();

  /* En el Inicio con intro, el cartel se anima recién cuando termina la intro. */
  if (!document.documentElement.classList.contains('con-intro')) arrancarCarteles();
  document.dispatchEvent(new CustomEvent('fredy:listo'));
});
