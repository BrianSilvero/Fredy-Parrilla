/* Lógica del Inicio: intro (logo → idioma → espátulas) y carrusel de platos. */
'use strict';

const sinMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

/* ---------- Intro ---------- */
function iniciarIntro() {
  const raiz = document.documentElement;
  const intro = document.getElementById('intro');
  if (!raiz.classList.contains('con-intro') || !intro) {
    intro?.remove();
    return;
  }

  const parametros = new URLSearchParams(location.search);
  const volver = Object.values(PAGINAS).includes(parametros.get('volver')) ? parametros.get('volver') : null;
  const soloIdioma = parametros.has('idioma');
  const formulario = intro.querySelector('#form-idioma');
  const lista = intro.querySelector('#opciones-idioma');
  const fondo = [...document.body.children].filter((el) => el !== intro);

  fondo.forEach((el) => { el.inert = true; });
  document.body.classList.add('intro-activa');

  /* Filas del selector: radios nativos, así funcionan con teclado y lector. */
  lista.replaceChildren(...IDIOMAS.map((i) => h('label', { class: 'opcion', lang: i.id },
    h('input', { type: 'radio', name: 'idioma', value: i.id, checked: i.id === idioma() }),
    bandera(i.bandera, 28, 19),
    h('span', { class: 'opcion-cod' }, i.id.toUpperCase()),
    h('span', { class: 'opcion-txt' }, h('span', { class: 'opcion-nom' }, i.nombre), h('span', { class: 'opcion-reg' }, i.region)),
    h('span', { class: 'opcion-marca', 'aria-hidden': 'true' }, icono('check')))));

  const pintarSugerencia = () => {
    const movil = matchMedia('(pointer: coarse)').matches;
    intro.querySelector('#intro-sugerido').textContent = t(movil ? 'intro.sugeridoMovil' : 'intro.sugerido');
  };

  lista.addEventListener('change', (e) => {
    cambiarIdioma(e.target.value, { guardar: false });
    pintarSugerencia();
  });
  pintarSugerencia();

  const mostrarIdiomas = () => {
    intro.dataset.etapa = 'idioma';
    /* El foco va al título: el teclado sigue desde ahí y no aparece un borde al cargar. */
    intro.querySelector('#titulo-idioma').focus({ preventScroll: true });
  };

  const terminar = () => {
    fondo.forEach((el) => { el.inert = false; });
    document.body.classList.remove('intro-activa');
    raiz.classList.remove('con-intro');
    arrancarCarteles();
    history.replaceState(null, '', location.pathname);
    document.getElementById('contenido')?.focus({ preventScroll: true });
    intro.addEventListener('transitionend', () => intro.remove(), { once: true });
    intro.classList.add('saliendo');
    setTimeout(() => intro.remove(), 600);
  };

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    cambiarIdioma(new FormData(formulario).get('idioma'));
    intro.dataset.etapa = 'salida';
    const minimo = sinMovimiento() ? 350 : 1300;
    await Promise.all([
      esperar(minimo),
      Promise.race([document.fonts?.ready ?? Promise.resolve(), esperar(2000)]),
    ]);
    if (volver && volver !== PAGINAS.inicio) location.href = volver;
    else terminar();
  });

  if (soloIdioma) mostrarIdiomas();
  else setTimeout(mostrarIdiomas, sinMovimiento() ? 300 : 1500);
}

/* ---------- Carrusel de platos destacados ----------
   Vitrina con desplazamiento nativo (scroll-snap): el plato activo queda al centro y los vecinos
   asoman a los costados. Al final hay una tarjeta "Ver la carta"; después de una pausa vuelve al inicio.
   El tiempo lo marca una barrita que se llena (animación CSS): al terminar, pasa al siguiente.
   Si se pausa, se pasa el mouse o el foco está adentro, la barrita se congela donde estaba. */
function iniciarCarrusel() {
  const raiz = document.getElementById('carrusel');
  if (!raiz) return;

  const DURACION_PLATO = 6000;
  const DURACION_FINAL = 9000;

  const platos = ORDEN_DESTACADOS.map((nombre) => PLATOS.find((p) => p.nombre === nombre)).filter(Boolean);
  const pista = raiz.querySelector('#carrusel-pista');
  const pausa = raiz.querySelector('#carrusel-pausa');
  const anterior = raiz.querySelector('#carrusel-ant');
  const siguiente = raiz.querySelector('#carrusel-sig');
  const anuncio = raiz.querySelector('#carrusel-anuncio');

  let actual = 0;
  let reproduciendo = !sinMovimiento();
  let suspendido = false;
  let enPantalla = true;
  let slides = [];

  const categoria = (p) => {
    const nombre = tr(CATEGORIAS.find((c) => c.id === p.categoria).nombre);
    return p.peso ? `${nombre} · ${p.peso}` : nombre;
  };

  /* Foto real si el plato la tiene; si no, el marco provisorio con degradé. */
  const foto = (p, i) => (p.foto
    ? h('span', { class: 'vslide-foto con-foto' }, h('img', { src: p.foto, alt: '', loading: 'lazy', decoding: 'async' }))
    : h('span', { class: `ph vslide-foto s${i % 5}` }, h('span', {}, `${t('intro.foto')} · ${p.nombreCorto}`)));

  /* Cada tarjeta: el enlace "Ver …" cubre toda la superficie (::after), así se puede tocar en
     cualquier lado, y el botón de pausa puede ir al lado sin quedar dentro de un enlace. */
  const tarjeta = ({ clase = '', fotoEl, cat, nombre, desc, precio = null, href, textoVer, etiqueta }, i) => h('div', {
    class: `vslide ${clase}`, dataset: { i: String(i) },
    onClick: (e) => {
      /* Un vecino primero viene al centro; recién el del centro lleva a la carta. */
      if (i === actual) return;
      e.preventDefault();
      ir(i, true);
    },
  },
    fotoEl,
    h('span', { class: 'vslide-pie' },
      h('span', { class: 'vslide-cat' }, cat),
      h('span', { class: 'vslide-nombre' }, nombre),
      h('span', { class: 'vslide-desc' }, desc),
      h('span', { class: 'vslide-fila' },
        precio ? h('span', { class: 'vslide-precio' }, precio) : h('span'),
        h('span', { class: 'vslide-acciones' },
          h('a', { class: 'vslide-ver', href, 'aria-label': etiqueta }, h('span', {}, textoVer), icono('flecha'))))),
    h('span', { class: 'vslide-barra', 'aria-hidden': 'true' }));

  /* Solo el activo se puede enfocar y lo leen los lectores de pantalla: los vecinos son decorado.
     El botón de pausa se muda al plato activo, a la izquierda de "Ver en la carta". */
  const marcar = () => {
    slides.forEach((s, i) => {
      const activa = i === actual;
      s.classList.toggle('activa', activa);
      s.setAttribute('aria-hidden', String(!activa));
      s.querySelector('.vslide-ver').tabIndex = activa ? 0 : -1;
    });
    const acciones = slides[actual].querySelector('.vslide-acciones');
    if (pausa.parentElement !== acciones && !acciones.contains(document.activeElement)) acciones.prepend(pausa);
    slides[actual].style.setProperty('--duracion', `${actual === slides.length - 1 ? DURACION_FINAL : DURACION_PLATO}ms`);
  };

  const actualizarDetenido = () => {
    const introAbierta = document.documentElement.classList.contains('con-intro');
    raiz.classList.toggle('detenido', !reproduciendo || suspendido || !enPantalla || introAbierta);
    raiz.classList.toggle('sin-reproduccion', !reproduciendo);
  };

  const centrar = (comportamiento) => {
    const s = slides[actual];
    pista.scrollTo({ left: s.offsetLeft - (pista.clientWidth - s.offsetWidth) / 2, behavior: comportamiento });
  };

  /* Centra la tarjeta i dentro de la pista sin mover el resto de la página. */
  function ir(indice, porPersona = false) {
    actual = (indice + slides.length) % slides.length;
    centrar(sinMovimiento() ? 'auto' : 'smooth');
    marcar();
    /* Solo se anuncia cuando lo pidió la persona: el giro automático no interrumpe. */
    if (porPersona) {
      const p = platos[actual];
      anuncio.textContent = p ? `${p.nombreCorto}, ${precioPlato(p)}. ${tr(p.descripcion)}` : t('home.carta.b');
    }
  }

  const pintarPausa = () => {
    pausa.replaceChildren(icono(reproduciendo ? 'pausa' : 'play'));
    pausa.setAttribute('aria-label', t(reproduciendo ? 'a11y.pausar' : 'a11y.reanudar'));
    actualizarDetenido();
  };

  const pintar = () => {
    const disponibles = PLATOS.filter((p) => p.disponible).length;
    const resumen = ['parrilla', 'achuras', 'pastas', 'postres', 'bodega']
      .map((id) => CATEGORIAS.find((c) => c.id === id)).filter(Boolean).map((c) => tr(c.corto || c.nombre)).join(' · ');

    slides = [
      ...platos.map((p, i) => tarjeta({
        fotoEl: foto(p, i), cat: categoria(p), nombre: p.nombreCorto, desc: tr(p.descripcion), precio: precioPlato(p),
        href: `${PAGINAS.carta}#plato-${p.id}`, textoVer: t('home.carta.verPlato'),
        etiqueta: t('home.carta.irPlato', { nombre: p.nombreCorto }),
      }, i)),
      /* Tarjeta final: invita a recorrer la carta completa. */
      tarjeta({
        clase: 'vslide-final', fotoEl: h('span', { class: 'ph vslide-foto vslide-foto-final' }),
        cat: t('home.carta.t'), nombre: t('home.carta.cta', { n: disponibles }), desc: resumen,
        href: PAGINAS.carta, textoVer: t('home.carta.b'), etiqueta: t('home.carta.b'),
      }, platos.length),
    ];
    pista.replaceChildren(...slides);

    anterior.setAttribute('aria-label', t('a11y.anterior'));
    siguiente.setAttribute('aria-label', t('a11y.siguiente'));
    raiz.setAttribute('aria-label', t('a11y.carrusel'));
    pintarPausa();
    marcar();
    /* Tras repintar (por ejemplo al cambiar de idioma) se vuelve a centrar sin animación. */
    requestAnimationFrame(() => centrar('auto'));
  };

  /* La barrita del activo terminó de llenarse: toca pasar a la siguiente tarjeta. */
  pista.addEventListener('animationend', (e) => {
    if (e.animationName === 'vitrina-tiempo' && e.target.closest('.vslide') === slides[actual]) ir(actual + 1);
  });

  /* Al deslizar con el dedo o el trackpad, el activo es el que quedó más centrado. */
  let esperaScroll = null;
  pista.addEventListener('scroll', () => {
    clearTimeout(esperaScroll);
    esperaScroll = setTimeout(() => {
      const centro = pista.scrollLeft + pista.clientWidth / 2;
      const distancia = (s) => Math.abs(s.offsetLeft + s.offsetWidth / 2 - centro);
      const cercano = slides.reduce((mejor, s, i) => (distancia(s) < distancia(slides[mejor]) ? i : mejor), 0);
      if (cercano !== actual) { actual = cercano; marcar(); }
    }, 90);
  }, { passive: true });

  anterior.addEventListener('click', () => ir(actual - 1, true));
  siguiente.addEventListener('click', () => ir(actual + 1, true));
  pausa.addEventListener('click', (e) => {
    e.stopPropagation();
    reproduciendo = !reproduciendo;
    pintarPausa();
  });
  raiz.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    ir(actual + (e.key === 'ArrowLeft' ? -1 : 1), true);
    slides[actual].querySelector('.vslide-ver').focus({ preventScroll: true });
  });

  /* Se detiene con el mouse encima o con foco de teclado; al tocar en celular queda en pausa. */
  raiz.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { suspendido = true; actualizarDetenido(); } });
  raiz.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { suspendido = false; actualizarDetenido(); } });
  raiz.addEventListener('focusin', () => { suspendido = true; actualizarDetenido(); });
  raiz.addEventListener('focusout', () => { suspendido = false; actualizarDetenido(); });
  raiz.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' && reproduciendo) { reproduciendo = false; pintarPausa(); }
  });

  /* Mientras está fuera de pantalla o la intro está abierta, tampoco avanza. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { enPantalla = e.isIntersecting; actualizarDetenido(); }).observe(raiz);
  }
  new MutationObserver(actualizarDetenido).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  /* Si cambia el ancho, el activo se vuelve a centrar. */
  window.addEventListener('resize', () => centrar('auto'), { passive: true });

  document.addEventListener('fredy:idioma', pintar);
  pintar();
}

document.addEventListener('fredy:listo', () => {
  iniciarCarrusel();
  iniciarIntro();
});
