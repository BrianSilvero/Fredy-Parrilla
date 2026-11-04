/* Lógica del formulario de reservas. Por ahora la reserva sale por WhatsApp. */
'use strict';

function iniciarReservas() {
  const formulario = document.getElementById('form-reserva');
  const exito = document.getElementById('reserva-ok');
  const reabrir = document.getElementById('reserva-reabrir');
  const otra = document.getElementById('reserva-otra');
  const { fecha, hora, personas, zona, nombre, nota } = formulario.elements;
  const hoy = ahoraEnBuenosAires().iso;
  const MAX_NOMBRE = 80;
  const MAX_NOTA = 300;

  fecha.min = hoy;

  const pintarOpciones = () => {
    const horaElegida = hora.value;
    const personasElegidas = personas.value;
    const zonaElegida = zona.value;

    hora.replaceChildren(
      h('option', { value: '' }, t('form.elegir')),
      h('optgroup', { label: t('res.mediodia') }, TURNOS.mediodia.map((v) => h('option', { value: v }, v))),
      h('optgroup', { label: t('res.noche') }, TURNOS.noche.map((v) => h('option', { value: v }, v))));

    const cantidades = Array.from({ length: 12 }, (_, i) => i + 1);
    personas.replaceChildren(
      h('option', { value: '' }, t('form.elegir')),
      ...cantidades.map((n) => h('option', { value: String(n) }, n === 1 ? t('res.persona1') : t('res.personaN', { n }))),
      h('option', { value: 'mas' }, t('res.personaMas')));

    zona.replaceChildren(
      h('option', { value: '' }, t('form.elegir')),
      ...['salon', 'rio', 'vereda'].map((v) => h('option', { value: v }, t(`res.zona.${v}`))));

    hora.value = horaElegida;
    personas.value = personasElegidas;
    zona.value = zonaElegida;
  };

  const validar = () => {
    const errores = [
      [fecha, !fecha.value || fecha.value < hoy ? 'res.fecha.e' : ''],
      [hora, hora.value ? '' : 'res.turno.e'],
      [personas, personas.value ? '' : 'res.personas.e'],
      [nombre, nombre.value.trim() ? '' : 'res.nombre.e'],
    ];
    errores.forEach(([campo, error]) => marcarCampo(campo, error));
    const primero = errores.find(([, error]) => error);
    primero?.[0].focus();
    return !primero;
  };

  const armarMensaje = () => {
    const [anio, mes, dia] = fecha.value.split('-');
    return mensajeReserva({
      fecha: `${dia}/${mes}/${anio}`,
      hora: hora.value,
      personas: personas.value === 'mas' ? 'Más de 12' : personas.value,
      zona: zona.value ? t(`res.zona.${zona.value}`, {}, 'es') : '',
      nombre: nombre.value.trim().slice(0, MAX_NOMBRE),
      nota: nota.value.trim().slice(0, MAX_NOTA),
    });
  };

  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validar()) return;
    const url = urlWhatsApp(armarMensaje());
    reabrir.href = url;
    window.open(url, '_blank', 'noopener');
    formulario.hidden = true;
    exito.hidden = false;
    exito.querySelector('h2').focus();
  });

  otra.addEventListener('click', () => {
    formulario.reset();
    exito.hidden = true;
    formulario.hidden = false;
    fecha.focus();
  });

  [fecha, hora, personas, nombre].forEach((campo) => {
    campo.addEventListener('input', () => { if (campo.hasAttribute('aria-invalid')) marcarCampo(campo, ''); });
  });

  document.addEventListener('fredy:idioma', pintarOpciones);
  pintarOpciones();

  /* Llega desde Noches de show con la fecha ya elegida. */
  const parametros = new URLSearchParams(location.search);
  const fechaPedida = parametros.get('fecha');
  const horaPedida = parametros.get('hora');
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaPedida || '') && fechaPedida >= hoy) fecha.value = fechaPedida;
  if ([...TURNOS.mediodia, ...TURNOS.noche].includes(horaPedida)) hora.value = horaPedida;
}

document.addEventListener('fredy:listo', iniciarReservas);
