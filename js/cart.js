/* Carrito: datos, avisos, carrito desplegable y armado de mensajes de WhatsApp.
   El carrito se guarda solo en el dispositivo del cliente: cantidades por plato.
   Al cargar se compara con la carta y se descarta lo que ya no existe. */
'use strict';

const Carrito = (() => {
  const CLAVE = 'pedido';
  const MAXIMO = 30;

  const limpiar = (crudo) => {
    const limpio = {};
    if (crudo && typeof crudo === 'object') {
      for (const [id, cantidad] of Object.entries(crudo)) {
        const plato = PLATOS.find((p) => p.id === id && p.disponible);
        if (plato && Number.isInteger(cantidad) && cantidad > 0) limpio[id] = Math.min(cantidad, MAXIMO);
      }
    }
    return limpio;
  };

  let items = limpiar(Guardado.leer(CLAVE, {}));

  const avisar = () => {
    Guardado.escribir(CLAVE, items);
    pintarCuentas();
    document.dispatchEvent(new CustomEvent('fredy:carrito'));
  };

  const cantidad = (id) => items[id] || 0;
  const unidades = () => Object.values(items).reduce((suma, n) => suma + n, 0);

  const cambiar = (id, delta) => {
    const nueva = Math.min(cantidad(id) + delta, MAXIMO);
    if (nueva <= 0) delete items[id];
    else items[id] = nueva;
    avisar();
  };

  const lista = () => PLATOS.filter((p) => items[p.id]).map((p) => ({ plato: p, cantidad: items[p.id] }));
  const vaciar = () => { items = {}; avisar(); };
  const copia = () => ({ ...items });
  const restaurar = (guardado) => { items = limpiar(guardado); avisar(); };

  /* Solo orientativo: algunos productos tienen precio por rango y el importe final
     lo confirma el restaurante. Nunca viaja en el mensaje de WhatsApp. */
  const totalEstimado = () => lista().reduce((total, { plato, cantidad: n }) => ({
    desde: total.desde + plato.precio * n,
    hasta: total.hasta + (plato.precioHasta || plato.precio) * n,
  }), { desde: 0, hasta: 0 });

  /* Lo guardado en el dispositivo es la única fuente de verdad. Se vuelve a leer cuando
     otra pestaña cambia el pedido o cuando "Atrás" devuelve la página desde la memoria
     del navegador (bfcache). No se reescribe, para no rebotar el cambio a otras pestañas. */
  const sincronizar = () => {
    items = limpiar(Guardado.leer(CLAVE, {}));
    pintarCuentas();
    document.dispatchEvent(new CustomEvent('fredy:carrito'));
  };

  window.addEventListener('storage', (e) => {
    /* key null: se borró todo el almacenamiento del sitio. */
    if (e.key === null || e.key === `fredy.${CLAVE}`) sincronizar();
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) sincronizar(); });

  return { cantidad, unidades, cambiar, lista, vaciar, copia, restaurar, totalEstimado };
})();

let cuentaAnterior = null;

function pintarCuentas() {
  const n = Carrito.unidades();
  document.querySelectorAll('[data-cuenta]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
    el.setAttribute('aria-label', t('nav.cuenta', { n }));
  });

  /* Botón del encabezado: dorado mientras haya pedido y un saltito de la bolsa al sumar.
     La primera pintada no salta: solo marca el estado con el que se abrió la página. */
  const sumo = cuentaAnterior !== null && n > cuentaAnterior;
  cuentaAnterior = n;
  const animar = sumo && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-boton-pedido]').forEach((boton) => {
    boton.classList.toggle('con-pedido', n > 0);
    if (!animar) return;
    boton.querySelector('.boton-pedido-ic')?.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-5px)' }, { transform: 'translateY(0)' }],
      { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    boton.querySelector('.cuenta-pedido')?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
      { duration: 260, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  });
}

document.addEventListener('fredy:listo', pintarCuentas);
document.addEventListener('fredy:idioma', pintarCuentas);

const nombreParaMensaje = (p) => (p.sinTacc ? `${p.nombre} (Sin TACC)` : p.nombre);

/* ---------- Aviso con opción de deshacer ----------
   Quitar se puede revertir: por eso hay aviso con Deshacer y no un "¿estás seguro?". */
const Aviso = (() => {
  const DURACION = 6000;
  let el = null;
  let temporizador = null;

  const ocultar = () => {
    clearTimeout(temporizador);
    el?.classList.remove('visible');
  };

  const mostrar = (texto, accion = null) => {
    if (!el) el = h('div', { class: 'aviso-flota', role: 'status' });
    /* Un <dialog> abierto tapa todo lo demás: el aviso tiene que ir adentro. */
    (document.querySelector('dialog[open]') || document.body).append(el);
    el.replaceChildren(h('span', { class: 'aviso-flota-t' }, texto),
      accion ? h('button', {
        class: 'aviso-flota-b', type: 'button',
        onClick: () => { ocultar(); accion.alTocar(); },
      }, accion.texto) : null);
    el.classList.remove('visible');
    void el.offsetWidth;
    el.classList.add('visible');
    clearTimeout(temporizador);
    temporizador = setTimeout(ocultar, DURACION);
  };

  return { mostrar, ocultar };
})();

/* ---------- Control − cantidad + ----------
   Con papelera: en la última unidad, el botón de restar pasa a ser un tacho. */
function crearControlCantidad(plato, alCambiar, { papelera = false } = {}) {
  const caja = h('div', { class: 'cant', dataset: { plato: plato.id } });

  const tocar = (delta) => {
    const copia = Carrito.copia();
    Carrito.cambiar(plato.id, delta);
    pintar();
    caja.querySelector(delta > 0 ? '.cant-mas' : 'button')?.focus();
    alCambiar?.(copia);
  };

  function pintar() {
    const n = Carrito.cantidad(plato.id);
    caja.dataset.n = String(n);
    if (n === 0) {
      caja.replaceChildren(h('button', {
        class: 'cant-btn cant-agregar cant-mas', type: 'button',
        'aria-label': t('a11y.agregar', { nombre: plato.nombre }),
        onClick: () => tocar(1),
      }, icono('mas')));
      return;
    }
    const quitaUltimo = papelera && n === 1;
    caja.replaceChildren(
      h('button', {
        class: `cant-btn${quitaUltimo ? ' cant-quitar' : ''}`, type: 'button',
        'aria-label': t(quitaUltimo ? 'a11y.quitar' : 'a11y.restar', { nombre: plato.nombre }),
        onClick: () => tocar(-1),
      }, icono(quitaUltimo ? 'tacho' : 'menos')),
      h('span', { class: 'cant-n', 'aria-live': 'polite', 'aria-label': t('a11y.cantidad', { n }) }, String(n)),
      h('button', {
        class: 'cant-btn cant-mas', type: 'button', 'aria-label': t('a11y.sumar', { nombre: plato.nombre }),
        onClick: () => tocar(1),
      }, icono('mas')));
  }

  caja.pintar = pintar;
  pintar();
  return caja;
}

/* ---------- Ventana emergente reutilizable ----------
   Usa <dialog> nativo: encierra el foco, cierra con Escape y devuelve el foco al botón.
   Hoja que sube en celular. En pantallas grandes, panel lateral o ventana centrada. */
function crearDialogo({ clase = '', titulo = null, alCerrar = null } = {}) {
  const VELOCIDAD_CIERRE = 0.11; /* px por ms: un gesto rápido alcanza para cerrar */
  const panel = h('section', { class: 'cajon-panel' });
  const dialogo = h('dialog', { class: `cajon ${clase}`, 'aria-labelledby': titulo },
    h('div', { class: 'cajon-fondo', onClick: () => cerrar() }), panel);
  let cerrando = false;

  function cerrar() {
    if (!dialogo.open || cerrando) return;
    cerrando = true;
    Aviso.ocultar();
    panel.style.transform = '';
    panel.style.transition = '';
    dialogo.classList.remove('abierto');
    const terminar = () => {
      if (!cerrando) return;
      cerrando = false;
      dialogo.close();
      document.documentElement.classList.remove('cajon-abierto');
      alCerrar?.();
    };
    panel.addEventListener('transitionend', terminar, { once: true });
    setTimeout(terminar, 320);
  }

  function abrir() {
    if (dialogo.open) return;
    const raiz = document.documentElement;
    raiz.style.setProperty('--ancho-scroll', `${window.innerWidth - raiz.clientWidth}px`);
    raiz.classList.add('cajon-abierto');
    dialogo.showModal();
    /* Fuerza el estado inicial para que la entrada sea una transición, no un salto. */
    void panel.offsetWidth;
    dialogo.classList.add('abierto');
  }

  /* Deslizar hacia abajo para cerrar (solo en la hoja de celular). */
  function permitirDeslizar(zona) {
    let inicio = null;
    let tiempo = 0;
    let distancia = 0;

    zona.addEventListener('pointerdown', (e) => {
      if (inicio !== null || e.target.closest('button') || matchMedia('(min-width: 640px)').matches) return;
      inicio = e.clientY;
      tiempo = performance.now();
      distancia = 0;
      zona.setPointerCapture(e.pointerId);
      panel.style.transition = 'none';
    });
    zona.addEventListener('pointermove', (e) => {
      if (inicio === null) return;
      distancia = e.clientY - inicio;
      /* Hacia arriba ofrece resistencia en lugar de frenar en seco. */
      const y = distancia > 0 ? distancia : distancia * 0.15;
      panel.style.transform = `translateY(${y}px)`;
    });
    const soltar = () => {
      if (inicio === null) return;
      const velocidad = Math.abs(distancia) / Math.max(performance.now() - tiempo, 1);
      const debeCerrar = distancia > 0 && (distancia > panel.offsetHeight * 0.3 || velocidad > VELOCIDAD_CIERRE);
      inicio = null;
      panel.style.transition = '';
      if (debeCerrar) cerrar();
      else panel.style.transform = '';
    };
    zona.addEventListener('pointerup', soltar);
    zona.addEventListener('pointercancel', soltar);
  }

  dialogo.addEventListener('cancel', (e) => { e.preventDefault(); cerrar(); });
  document.body.append(dialogo);
  return { dialogo, panel, abrir, cerrar, permitirDeslizar };
}

/* ---------- Pedido: lista, datos y envío ----------
   El mismo contenido se usa en el carrito desplegable y en la página Mi pedido. */
function crearPanelPedido({ alSeguir = null } = {}) {
  const MAX_NOMBRE = 80;
  const MAX_ACLARACION = 300;
  const texto = (clave, etiqueta = 'span', extras = {}) => h(etiqueta, { 'data-i18n': clave, ...extras }, t(clave));

  const seguirEnlace = (clave, clase) => h('a', {
    class: clase, href: PAGINAS.carta,
    onClick: (e) => { if (alSeguir?.()) e.preventDefault(); },
  }, texto(clave));

  /* Vacío */
  const vacio = h('div', { class: 'pedido-vacio', id: 'pedido-vacio', hidden: true },
    h('span', { class: 'pedido-vacio-ic' }, icono('bolsa')),
    texto('ped.vacio.t', 'p', { class: 'pedido-vacio-t' }),
    texto('ped.vacio.p', 'p', { class: 'lead' }),
    h('a', {
      class: 'pill p-red', href: PAGINAS.carta,
      onClick: (e) => { if (alSeguir?.()) e.preventDefault(); },
    }, texto('ped.vacio.b'), h('span', { class: 'ar' }, icono('flecha'))));

  /* Lista */
  const lista = h('ul', { class: 'pedido-lista', id: 'pedido-lista', tabindex: '-1' });
  const cuenta = h('span', {});
  const importe = h('b', { class: 'pedido-importe' });

  /* Datos */
  const nombre = h('input', { id: 'nombre', name: 'nombre', type: 'text', autocomplete: 'name', maxlength: MAX_NOMBRE, required: true, 'aria-describedby': 'nombre-e' });
  const hora = h('input', { id: 'hora', name: 'hora', type: 'time', 'aria-describedby': 'hora-e' });
  const aclaracion = h('textarea', { id: 'aclaracion', name: 'aclaracion', rows: '2', maxlength: MAX_ACLARACION, 'aria-describedby': 'aclaracion-h' });
  const lugar = h('span', {});

  const opcionRetiro = (valor, clave, marcada = false) => h('label', { class: 'seg-op' },
    h('input', { type: 'radio', name: 'retiro', value: valor, checked: marcada }), texto(clave));

  const cajaHora = h('div', { class: 'campo', id: 'caja-hora', hidden: true },
    texto('ped.hora.l', 'label', { for: 'hora' }), hora,
    h('p', { class: 'campo-error', id: 'hora-e', hidden: true }));

  const formulario = h('form', { class: 'pedido-form', id: 'form-pedido', novalidate: true },
    h('fieldset', { class: 'campo' }, texto('car.cuando', 'legend'),
      h('div', { class: 'seg' }, opcionRetiro('pronto', 'ped.pronto', true), opcionRetiro('hora', 'ped.hora'))),
    cajaHora,
    h('div', { class: 'campo' },
      h('label', { for: 'nombre' }, texto('ped.nombre'), h('span', { class: 'req', 'aria-hidden': 'true' }, ' *')), nombre,
      h('p', { class: 'campo-error', id: 'nombre-e', hidden: true })),
    h('div', { class: 'campo' },
      h('label', { for: 'aclaracion' }, texto('ped.aclaracion'), ' ', texto('form.opcional', 'small')), aclaracion,
      texto('ped.aclaracion.h', 'p', { class: 'campo-ayuda', id: 'aclaracion-h' })),
    h('p', { class: 'aviso' }, lugar, ' ', texto('ped.aviso')));

  const acciones = h('div', { class: 'pedido-acciones' },
    seguirEnlace('car.seguir', 'quieto'),
    h('button', {
      class: 'quieto quieto-peligro', type: 'button',
      onClick: () => {
        const copia = Carrito.copia();
        Carrito.vaciar();
        Aviso.mostrar(t('car.vaciado'), { texto: t('car.deshacer'), alTocar: () => Carrito.restaurar(copia) });
      },
    }, icono('tacho'), texto('car.vaciar')));

  const armado = h('div', { class: 'pedido-armado', id: 'pedido-armado', hidden: true },
    lista, formulario, acciones);

  /* Enviado */
  const tituloOk = h('h2', { class: 'ok-t', id: 'pedido-ok-t', tabindex: '-1' });
  const reabrir = h('a', { class: 'pill p-wa', id: 'pedido-reabrir', target: '_blank', rel: 'noopener' },
    icono('whatsapp'), texto('ped.ok.abrir'));
  const exito = h('div', { class: 'pedido-ok', id: 'pedido-ok', hidden: true },
    h('span', { class: 'pedido-ok-ic' }, icono('check')), tituloOk,
    texto('ped.ok.p', 'p', { class: 'lead' }), reabrir,
    h('button', {
      class: 'quieto', id: 'pedido-otro', type: 'button',
      onClick: () => {
        Carrito.vaciar();
        formulario.reset();
        cajaHora.hidden = true;
        codigoEnviado = '';
        exito.hidden = true;
        pintar();
      },
    }, texto('ped.ok.otro')));

  /* Pie fijo: el total estimado y el botón de envío siempre quedan a la vista. */
  const pie = h('div', { class: 'cajon-pie' },
    h('div', { class: 'pedido-total' }, h('span', { class: 'pedido-total-t' }, cuenta, texto('ped.ref', 'small')), importe),
    h('button', { class: 'pill p-wa pedido-enviar', type: 'submit', form: 'form-pedido' },
      icono('whatsapp'), texto('ped.enviar')));

  const raiz = h('div', { class: 'pedido' },
    h('div', { class: 'cajon-cuerpo' }, vacio, armado, exito), pie);

  let codigoEnviado = '';
  let idsPintados = '';
  const retiro = () => new FormData(formulario).get('retiro');

  function filaItem({ plato, cantidad }) {
    return h('li', { class: 'tarjeta-item' },
      h('div', { class: 'item-txt' },
        h('span', { class: 'item-nom', lang: 'es' }, plato.nombre),
        plato.sinTacc ? h('span', { class: 'tag-tacc' }, t('carta.sinTacc')) : null,
        h('span', { class: 'item-precio' }, `${precioPlato(plato)} ${t('car.cUnidad')}`)),
      crearControlCantidad(plato, (copia) => {
        if (Carrito.cantidad(plato.id) > 0) return;
        lista.focus();
        Aviso.mostrar(t('car.quitaste', { nombre: plato.nombre }), {
          texto: t('car.deshacer'), alTocar: () => Carrito.restaurar(copia),
        });
      }, { papelera: true }));
  }

  function pintar() {
    const items = Carrito.lista();
    const hay = items.length > 0;
    const enviado = !exito.hidden;
    vacio.hidden = hay || enviado;
    armado.hidden = !hay || enviado;
    pie.hidden = !hay || enviado;

    const ids = items.map(({ plato }) => plato.id).join();
    if (ids !== idsPintados) {
      idsPintados = ids;
      lista.replaceChildren(...items.map(filaItem));
    }
    /* Si solo cambió la cantidad de un plato que ya estaba (por ejemplo, desde la carta),
       la fila sigue siendo la misma: hay que actualizar su número. */
    lista.querySelectorAll('.cant').forEach((control) => {
      if (Number(control.dataset.n) !== Carrito.cantidad(control.dataset.plato)) control.pintar();
    });
    const n = Carrito.unidades();
    const productos = n === 1 ? t('car.producto1') : t('car.productoN', { n });
    const { desde, hasta } = Carrito.totalEstimado();
    cuenta.textContent = `${t('car.total')} · ${productos}`;
    importe.textContent = desde === hasta ? precio(desde) : `${precio(desde)} - ${precio(hasta)}`;
    lugar.textContent = t('ped.lugar', { direccion: NEGOCIO.direccion });
    if (codigoEnviado) tituloOk.textContent = t('ped.ok.t', { codigo: codigoEnviado });
  }

  function pintarIdioma() {
    idsPintados = '';
    pintar();
  }

  function validar() {
    const errores = [
      [hora, retiro() === 'hora' && !hora.value ? 'ped.hora.e' : ''],
      [nombre, nombre.value.trim() ? '' : 'ped.nombre.e'],
    ];
    errores.forEach(([campo, error]) => marcarCampo(campo, error));
    const primero = errores.find(([, error]) => error);
    primero?.[0].focus();
    return !primero;
  }

  formulario.addEventListener('change', (e) => {
    if (e.target.name !== 'retiro') return;
    cajaHora.hidden = retiro() !== 'hora';
    if (cajaHora.hidden) marcarCampo(hora, '');
  });

  [nombre, hora].forEach((campo) => {
    campo.addEventListener('input', () => { if (campo.hasAttribute('aria-invalid')) marcarCampo(campo, ''); });
  });

  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validar()) return;
    codigoEnviado = codigoPedido();
    const url = urlWhatsApp(mensajePedido({
      codigo: codigoEnviado,
      nombre: nombre.value.trim().slice(0, MAX_NOMBRE),
      retiro: retiro() === 'hora' ? `${hora.value} hs` : 'lo antes posible',
      items: Carrito.lista(),
      aclaracion: aclaracion.value.trim().slice(0, MAX_ACLARACION),
    }));
    reabrir.href = url;
    window.open(url, '_blank', 'noopener');
    exito.hidden = false;
    pintar();
    tituloOk.focus();
  });

  document.addEventListener('fredy:carrito', pintar);
  document.addEventListener('fredy:idioma', pintarIdioma);
  pintar();

  return { raiz, pintar };
}

/* ---------- Carrito desplegable ---------- */
const Cajon = (() => {
  let ventana = null;

  const crear = () => {
    ventana = crearDialogo({ titulo: 'cajon-t' });
    const cerrarBoton = h('button', {
      class: 'cajon-cerrar', type: 'button', 'data-i18n-aria': 'car.cerrar', 'aria-label': t('car.cerrar'),
      onClick: () => ventana.cerrar(),
    }, icono('cerrar'));
    const cabeza = h('div', { class: 'cajon-cabeza' },
      h('span', { class: 'cajon-asa', 'aria-hidden': 'true' }),
      h('span', { class: 'cajon-ic' }, icono('bolsa')),
      h('h2', { class: 'cajon-t', id: 'cajon-t', 'data-i18n': 'ped.t' }, t('ped.t')),
      cerrarBoton);
    const contenido = crearPanelPedido({
      /* Ya en la carta, seguir eligiendo es solo cerrar. */
      alSeguir: () => {
        if (document.body.dataset.pagina !== 'carta') return false;
        ventana.cerrar();
        return true;
      },
    });
    ventana.panel.append(cabeza, contenido.raiz);
    ventana.permitirDeslizar(cabeza);
    ventana.contenido = contenido;
  };

  const abrir = () => {
    if (!ventana) crear();
    ventana.contenido.pintar();
    ventana.abrir();
  };

  return { abrir, cerrar: () => ventana?.cerrar() };
})();

/* Los accesos a "Pedir" despliegan el carrito. El enlace sigue llevando a pedir.html
   si se abre en otra pestaña o si JavaScript no cargó. */
document.addEventListener('click', (e) => {
  const enlace = e.target.closest(`a[href="${PAGINAS.pedir}"]`);
  if (!enlace || document.body.dataset.pagina === 'pedir') return;
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
  e.preventDefault();
  Cajon.abrir();
});

/* ---------- Mensajes siempre en español: los lee el personal del restaurante ---------- */
function codigoPedido() {
  const azar = new Uint16Array(1);
  crypto.getRandomValues(azar);
  return `F-${String(azar[0] % 10000).padStart(4, '0')}`;
}

function mensajePedido({ codigo, nombre, retiro, items, aclaracion }) {
  const lineas = [
    'Hola, quiero hacer un pedido para retirar.',
    `Pedido ${codigo}`,
    ...(nombre ? [`Nombre: ${nombre}`] : []),
    `Retiro: ${retiro}`,
    '',
    ...items.map(({ plato, cantidad }) => `• ${cantidad} × ${nombreParaMensaje(plato)}`),
  ];
  if (aclaracion) lineas.push('', `Aclaración: ${aclaracion}`);
  return lineas.join('\n');
}

function mensajeReserva({ fecha, hora, personas, zona, nombre, nota }) {
  const lineas = [
    'Hola, quiero reservar una mesa.',
    `Nombre: ${nombre}`,
    `Fecha: ${fecha}`,
    `Hora: ${hora}`,
    `Personas: ${personas}`,
  ];
  if (zona) lineas.push(`Zona preferida: ${zona}`);
  if (nota) lineas.push(`Nota: ${nota}`);
  return lineas.join('\n');
}
