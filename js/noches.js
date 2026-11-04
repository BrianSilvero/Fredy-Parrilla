/* Lógica de Noches de show: próximas fechas calculadas con la hora de Buenos Aires. */
'use strict';

function proximasNoches(cantidad = 6) {
  const { iso, minutos } = ahoraEnBuenosAires();
  const [anio, mes, dia] = iso.split('-').map(Number);
  const fechas = [];
  for (let i = 0; fechas.length < cantidad && i < 60; i++) {
    const fecha = new Date(Date.UTC(anio, mes - 1, dia + i));
    if (!SHOW.dias.includes(fecha.getUTCDay())) continue;
    if (i === 0 && minutos >= aMinutos(SHOW.hora)) continue;
    fechas.push(fecha);
  }
  return fechas;
}

function iniciarNoches() {
  const lista = document.getElementById('noches-lista');
  const eventos = document.getElementById('noches-evento');
  const fechas = proximasNoches();

  const pintar = () => {
    const formato = new Intl.DateTimeFormat(idioma(), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    lista.replaceChildren(...fechas.map((fecha) => {
      const iso = fecha.toISOString().slice(0, 10);
      const texto = formato.format(fecha);
      return h('li', { class: 'noche' },
        h('span', { class: 'noche-fecha' }, texto.charAt(0).toUpperCase() + texto.slice(1)),
        h('span', { class: 'noche-hora' }, t('noc.desde', { h: SHOW.hora })),
        h('a', { class: 'lk', href: `${PAGINAS.reservar}?fecha=${iso}&hora=${SHOW.hora}` },
          h('span', {}, t('noc.reservar')), icono('flecha')));
    }));
    /* El mensaje va en español: lo lee el personal. */
    eventos.href = urlWhatsApp(TEXTOS.es['noc.ev.msg']);
  };

  document.addEventListener('fredy:idioma', pintar);
  pintar();
}

document.addEventListener('fredy:listo', iniciarNoches);
