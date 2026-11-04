/* Se ejecuta antes de pintar la página, para que no aparezca un parpadeo:
   marca que hay JavaScript, aplica el idioma guardado y decide si va la intro. */
(function () {
  'use strict';
  var html = document.documentElement;
  var guardado = null;
  html.classList.add('js');
  try { guardado = JSON.parse(localStorage.getItem('fredy.idioma')); } catch (e) { guardado = null; }
  var valido = ['es', 'en', 'pt', 'fr'].indexOf(guardado) !== -1;
  if (valido) html.lang = guardado;

  var esInicio = !!document.currentScript && document.currentScript.hasAttribute('data-inicio');
  /* ?idioma abre la elección de idioma; ?intro repite la intro completa, desde el logo. */
  if (esInicio && (!valido || /[?&](idioma|intro)(=|&|$)/.test(location.search))) {
    html.classList.add('con-intro');
  }
})();
