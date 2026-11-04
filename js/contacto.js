/* Lógica de Contacto: mapa, evento por WhatsApp y preguntas frecuentes. */
'use strict';

function iniciarContacto() {
  const lugarFaq = document.getElementById('faq');
  const evento = document.getElementById('contacto-evento');
  const mapa = document.getElementById('mapa');

  mapa.src = NEGOCIO.mapaEmbed;
  evento.href = urlWhatsApp(TEXTOS.es['noc.ev.msg']);

  const pintar = () => {
    mapa.title = t('a11y.mapa');
    lugarFaq.replaceChildren(...FAQ.map((item) => h('details', { class: 'faq' },
      h('summary', {}, h('span', {}, tr(item.q)), icono('chevron')),
      h('p', {}, tr(item.a)))));
  };

  document.addEventListener('fredy:idioma', pintar);
  pintar();
}

document.addEventListener('fredy:listo', iniciarContacto);
