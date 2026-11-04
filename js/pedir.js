/* Página Mi pedido: muestra el mismo contenido que el carrito desplegable.
   Queda para quien llega por enlace directo o abre el pedido en otra pestaña. */
'use strict';

document.addEventListener('fredy:listo', () => {
  document.getElementById('pedido-pagina').append(crearPanelPedido().raiz);
});
