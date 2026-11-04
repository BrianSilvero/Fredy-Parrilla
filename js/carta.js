/* Lógica de la Carta: categorías, lista de platos, ficha de plato y acceso al pedido. */
'use strict';

function iniciarCarta() {
  const barra = document.getElementById('carta-chips');
  const cuerpo = document.getElementById('carta-cuerpo');
  const nota = document.getElementById('carta-cubierto');
  const acceso = document.getElementById('carta-acceso');
  let observador = null;
  let ficha = null;

  const nombreCategoria = (plato) => tr(CATEGORIAS.find((c) => c.id === plato.categoria).nombre);

  /* ---------- Ficha de plato ---------- */
  function abrirFicha(plato) {
    if (!ficha) ficha = crearDialogo({ clase: 'cajon-centro', titulo: 'ficha-t' });
    let cantidad = 1;
    const descripcion = tr(plato.descripcion);
    const numero = h('span', { class: 'cant-n', 'aria-live': 'polite' }, '1');

    const cambiar = (delta) => {
      cantidad = Math.min(Math.max(cantidad + delta, 1), 30);
      numero.textContent = String(cantidad);
    };

    const agregar = () => {
      Carrito.cambiar(plato.id, cantidad);
      ficha.cerrar();
      /* Se espera a que cierre la ficha, para que el aviso quede sobre la carta. */
      setTimeout(() => Aviso.mostrar(t('car.agregado', { n: cantidad, nombre: plato.nombre }), {
        texto: t('carta.verPedido'), alTocar: Cajon.abrir,
      }), 340);
    };

    const whatsapp = h('a', {
      class: 'pill p-wa-borde', target: '_blank', rel: 'noopener', href: '#',
      onClick: (e) => {
        /* El enlace se arma al tocar: así lleva la cantidad elegida. */
        e.currentTarget.href = urlWhatsApp(mensajePedido({
          codigo: codigoPedido(), nombre: '', retiro: 'lo antes posible', aclaracion: '',
          items: [{ plato, cantidad }],
        }));
      },
    }, icono('whatsapp'), h('span', {}, t('fic.directo')));

    const asa = h('span', { class: 'cajon-asa', 'aria-hidden': 'true' });
    const foto = h('div', { class: 'ph ficha-foto' }, asa, h('span', {}, `${t('intro.foto')} · ${plato.nombre}`));

    ficha.panel.replaceChildren(
      foto,
      h('button', {
        class: 'cajon-cerrar ficha-cerrar', type: 'button', 'aria-label': t('fic.cerrar'),
        onClick: () => ficha.cerrar(),
      }, icono('cerrar')),
      h('div', { class: 'ficha-txt' },
        h('p', { class: 'ficha-cat' }, nombreCategoria(plato)),
        h('h2', { class: 'ficha-t', id: 'ficha-t', lang: 'es' }, plato.nombre),
        plato.sinTacc ? h('span', { class: 'tag-tacc ficha-tag' }, t('carta.sinTacc')) : null,
        descripcion ? h('p', { class: 'ficha-desc' }, descripcion) : null,
        h('p', { class: 'ficha-precio' }, precioPlato(plato)),
        h('div', { class: 'ficha-compra' },
          h('div', { class: 'cant cant-pastilla', role: 'group', 'aria-label': t('fic.cantidad') },
            h('button', { class: 'cant-btn', type: 'button', 'aria-label': t('a11y.restar', { nombre: plato.nombre }), onClick: () => cambiar(-1) }, icono('menos')),
            numero,
            h('button', { class: 'cant-btn', type: 'button', 'aria-label': t('a11y.sumar', { nombre: plato.nombre }), onClick: () => cambiar(1) }, icono('mas'))),
          h('button', { class: 'pill p-gold ficha-agregar', type: 'button', onClick: agregar },
            icono('bolsa'), h('span', {}, t('carta.agregar')))),
        whatsapp));
    ficha.permitirDeslizar(foto);
    ficha.abrir();
  }

  /* ---------- Lista ---------- */
  const filaPlato = (plato) => {
    const descripcion = tr(plato.descripcion);
    /* El id permite llegar directo al plato desde el carrusel del Inicio (carta.html#plato-…). */
    return h('li', { class: 'plato', id: `plato-${plato.id}` },
      h('button', {
        class: 'plato-txt', type: 'button', 'aria-label': t('a11y.ver', { nombre: plato.nombre }),
        onClick: () => abrirFicha(plato),
      },
        h('span', { class: 'plato-nom', lang: 'es' }, plato.nombre),
        plato.sinTacc ? h('span', { class: 'tag-tacc' }, t('carta.sinTacc')) : null,
        descripcion ? h('span', { class: 'plato-desc' }, descripcion) : null),
      h('span', { class: 'plato-precio' }, precioPlato(plato)),
      crearControlCantidad(plato));
  };

  const listaPlatos = (platos) => h('ul', { class: 'platos' }, platos.map(filaPlato));

  const seccion = (categoria) => {
    const platos = PLATOS.filter((p) => p.categoria === categoria.id && p.disponible);
    const subgrupos = SUBGRUPOS.filter((s) => platos.some((p) => p.subgrupo === s.id));
    const contenido = subgrupos.length
      ? subgrupos.map((s) => h('div', { class: 'subgrupo' },
        h('h3', { class: 'subgrupo-t' }, tr(s.nombre)),
        listaPlatos(platos.filter((p) => p.subgrupo === s.id))))
      : listaPlatos(platos);
    return h('section', { class: `cat cat-${categoria.id}`, id: categoria.id, 'aria-labelledby': `t-${categoria.id}` },
      h('h2', { class: 'cat-t', id: `t-${categoria.id}` }, tr(categoria.nombre)),
      contenido);
  };

  const marcarChip = (id) => {
    barra.querySelectorAll('a').forEach((a) => {
      const activa = a.dataset.cat === id;
      a.classList.toggle('on', activa);
      if (activa) {
        a.setAttribute('aria-current', 'true');
        barra.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
      } else a.removeAttribute('aria-current');
    });
  };

  const pintar = () => {
    barra.setAttribute('aria-label', t('a11y.categorias'));
    barra.replaceChildren(...CATEGORIAS.map((c) => h('a', { href: `#${c.id}`, dataset: { cat: c.id } }, tr(c.corto || c.nombre))));
    cuerpo.replaceChildren(...CATEGORIAS.map(seccion));
    nota.textContent = t('carta.cubierto', { precio: precio(NEGOCIO.cubierto) });

    observador?.disconnect();
    /* Marca la categoría que está en pantalla. */
    if ('IntersectionObserver' in window) {
      observador = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => { if (e.isIntersecting) marcarChip(e.target.id); });
      }, { rootMargin: '-30% 0px -65% 0px' });
      cuerpo.querySelectorAll('.cat').forEach((s) => observador.observe(s));
    }
  };

  let unidadesAntes = Carrito.unidades();

  const pintarAcceso = () => {
    const n = Carrito.unidades();
    acceso.hidden = false;
    acceso.classList.toggle('visible', n > 0);
    acceso.inert = n === 0;
    acceso.querySelector('[data-acceso-n]').textContent = String(n);
    /* Un pulso corto confirma que el plato entró al pedido. */
    if (n > unidadesAntes && unidadesAntes > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      acceso.querySelector('.carta-acceso-n').animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
        { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    }
    unidadesAntes = n;
  };

  /* Lo que cambia en el carrito se refleja en las filas de la carta. */
  const sincronizarFilas = () => {
    cuerpo.querySelectorAll('.cant').forEach((control) => {
      if (Number(control.dataset.n) !== Carrito.cantidad(control.dataset.plato)) control.pintar();
    });
  };

  /* En pantallas grandes la bolsa va a la izquierda del botón de WhatsApp. El botón cerrado es
     solo el círculo (--ancho-wa); abierto mide el mensaje completo (--ancho-wa-abierto), que cambia
     con el idioma. Con los dos, la bolsa se corre justo lo necesario cuando el mensaje se despliega. */
  const botonWa = document.querySelector('.wa-flota');
  const iconoWa = botonWa?.querySelector('.wa-flota-ic');
  if (botonWa && iconoWa && 'ResizeObserver' in window) {
    new ResizeObserver(() => {
      const raiz = document.documentElement.style;
      raiz.setProperty('--ancho-wa', `${iconoWa.offsetWidth + 16}px`);
      raiz.setProperty('--ancho-wa-abierto', `${botonWa.offsetWidth}px`);
    }).observe(botonWa);
  }

  document.addEventListener('fredy:idioma', pintar);
  document.addEventListener('fredy:carrito', pintarAcceso);
  document.addEventListener('fredy:carrito', sincronizarFilas);
  pintar();
  pintarAcceso();

  /* La lista se arma por JS: el salto a #categoría hay que hacerlo acá. */
  if (location.hash) {
    const destino = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (destino) requestAnimationFrame(() => destino.scrollIntoView({ block: destino.classList.contains('plato') ? 'center' : 'start' }));
    /* Si se llegó a un plato, se resalta un momento para que el ojo lo encuentre. */
    if (destino?.classList.contains('plato')) {
      destino.classList.add('resaltado');
      destino.addEventListener('animationend', () => destino.classList.remove('resaltado'), { once: true });
    }
  }
}

document.addEventListener('fredy:listo', iniciarCarta);
