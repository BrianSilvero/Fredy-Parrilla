/* ÚNICO archivo de datos: negocio, horarios, carta, precios y preguntas frecuentes.
   Cambiar un precio o un horario no toca el diseño ni la lógica.
   Más adelante estos datos vienen del panel de gestión.

   Reglas de la carta:
   - El NOMBRE del plato no se traduce: conserva la identidad argentina.
   - La DESCRIPCIÓN y las CATEGORÍAS sí se traducen a los 4 idiomas.
   - o() = texto que sale del menú en PDF o del prototipo aprobado.
   - d() = texto redactado para la web: lo confirma Fredy (ver PENDIENTES.md).
   - Sin descripción (null) = no sabemos qué lleva: mejor no inventarlo. */
'use strict';

const NEGOCIO = {
  nombre: 'Fredy Parrilla Restaurant',
  zona: 'Puerto Madero',
  direccion: 'Av. Alicia Moreau de Justo 1798',
  barrio: 'Puerto Madero, CABA',
  whatsapp: '5491125278442',
  whatsappTexto: '+54 9 11 2527-8442',
  telefono: '+5491125278442',
  instagram: 'https://www.instagram.com/fredyrestaurantparrilla/',
  facebook: 'https://www.facebook.com/fredyrestaurantparrilla/',
  mapaLlegar: 'https://www.google.com/maps/dir/?api=1&destination=Av.%20Alicia%20Moreau%20de%20Justo%201798%2C%20Puerto%20Madero%2C%20Buenos%20Aires',
  mapaFicha: 'https://www.google.com/maps/search/?api=1&query=Fredy%20Parrilla%20Restaurant%20Av.%20Alicia%20Moreau%20de%20Justo%201798',
  mapaEmbed: 'https://www.google.com/maps?q=Av.%20Alicia%20Moreau%20de%20Justo%201798%2C%20Puerto%20Madero%2C%20Buenos%20Aires&output=embed',
  zonaHoraria: 'America/Argentina/Buenos_Aires',
  horario: { abre: '10:00', cierra: '02:00' },
  cubierto: 4000,
  desde: 2010,
};

const IDIOMAS = [
  { id: 'es', nombre: 'Español', region: 'Argentina', bandera: 'ar' },
  { id: 'en', nombre: 'English', region: 'International', bandera: 'us' },
  { id: 'pt', nombre: 'Português', region: 'Brasil', bandera: 'br' },
  { id: 'fr', nombre: 'Français', region: 'France', bandera: 'fr' },
];

/* Noches de show: días de la semana (0 = domingo … 6 = sábado). */
const SHOW = {
  dias: [4, 5, 6],
  hora: '22:00',
  generos: ['tango', 'folclore', 'melodicos', 'cumbia', 'cuarteto'],
};

/* Turnos sugeridos del formulario de reservas (a confirmar con Fredy). */
const TURNOS = {
  mediodia: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'],
  noche: ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'],
};

const tx = (es, en, pt, fr) => ({ es, en, pt, fr });
const o = (es, en, pt, fr) => ({ es, en, pt, fr, origen: 'menu' });
const d = (es, en, pt, fr) => ({ es, en, pt, fr, origen: 'revisar' });

const CATEGORIAS = [
  { id: 'menus', nombre: tx('Menús y tablas', 'Set menus & platters', 'Menus e tábuas', 'Menus et planches') },
  { id: 'entradas', nombre: tx('Entradas', 'Starters', 'Entradas', 'Entrées') },
  { id: 'achuras', nombre: tx('Achuras', 'Achuras (offal cuts)', 'Achuras (miúdos)', 'Achuras (abats)'), corto: tx('Achuras', 'Achuras', 'Achuras', 'Achuras') },
  { id: 'parrilla', nombre: tx('Nuestra parrilla', 'From our grill', 'Nossa parrilla', 'Notre grill'), corto: tx('Parrilla', 'Grill', 'Parrilla', 'Grill') },
  { id: 'cocina', nombre: tx('Nuestra cocina especial', 'Our special kitchen', 'Nossa cozinha especial', 'Notre cuisine spéciale'), corto: tx('Cocina especial', 'Specials', 'Especiais', 'Spécialités') },
  { id: 'minutas', nombre: tx('Minutas y guarniciones', 'Quick dishes & sides', 'Pratos rápidos e acompanhamentos', 'Plats rapides et garnitures'), corto: tx('Minutas', 'Sides', 'Acompanhamentos', 'Garnitures') },
  { id: 'pastas', nombre: tx('Pastas artesanales', 'Handmade pasta', 'Massas artesanais', 'Pâtes artisanales'), corto: tx('Pastas', 'Pasta', 'Massas', 'Pâtes') },
  { id: 'salsas', nombre: tx('Salsas', 'Sauces', 'Molhos', 'Sauces') },
  { id: 'ensaladas', nombre: tx('Ensaladas', 'Salads', 'Saladas', 'Salades') },
  { id: 'postres', nombre: tx('Postres y helados', 'Desserts & ice cream', 'Sobremesas e sorvetes', 'Desserts et glaces'), corto: tx('Postres', 'Desserts', 'Sobremesas', 'Desserts') },
  { id: 'bodega', nombre: tx('Bodega y bebidas', 'Wine cellar & drinks', 'Adega e bebidas', 'Cave et boissons'), corto: tx('Bodega', 'Wines', 'Adega', 'Cave') },
];

const SUBGRUPOS = [
  { id: 'malbec', nombre: tx('Vinos tintos · Malbec', 'Red wines · Malbec', 'Vinhos tintos · Malbec', 'Vins rouges · Malbec') },
  { id: 'tintos', nombre: tx('Cabernet, Merlot y Syrah', 'Cabernet, Merlot & Syrah', 'Cabernet, Merlot e Syrah', 'Cabernet, Merlot et Syrah') },
  { id: 'especiales', nombre: tx('Vinos especiales', 'Special wines', 'Vinhos especiais', 'Vins d’exception') },
  { id: 'blancos', nombre: tx('Vinos blancos y otras uvas', 'White wines & other grapes', 'Vinhos brancos e outras uvas', 'Vins blancs et autres cépages') },
  { id: 'espumantes', nombre: tx('Champagne y espumantes', 'Champagne & sparkling wines', 'Champagne e espumantes', 'Champagne et vins effervescents') },
  { id: 'cervezas', nombre: tx('Cervezas y bebidas', 'Beers & soft drinks', 'Cervejas e bebidas', 'Bières et boissons') },
  { id: 'tragos', nombre: tx('Tragos y whiskies', 'Cocktails & whiskies', 'Drinques e uísques', 'Cocktails et whiskies') },
  { id: 'cafeteria', nombre: tx('Cafetería', 'Coffee & more', 'Cafeteria', 'Cafés et plus') },
];

const slug = (texto) => texto
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

/* Cada fila: [nombre, precio, descripción, extras] */
const grupo = (categoria, filas, subgrupo) => filas.map(([nombre, precio, descripcion = null, extras = {}]) => ({
  id: slug(`${subgrupo || categoria} ${nombre}`),
  categoria,
  subgrupo: subgrupo || null,
  nombre,
  descripcion,
  precio,
  disponible: true,
  destacado: false,
  ...extras,
}));

const PLATOS = [
  ...grupo('menus', [
    ['Menú 2 personas', 99000, o(
      'Empanada o bastoncitos de muzzarella, bife de chorizo de 400 g con papas, flan o budín, y vino o bebida sin alcohol.',
      'Empanada or mozzarella sticks, 400 g bife de chorizo with potatoes, flan or bread pudding, and wine or a non-alcoholic drink.',
      'Empanada ou palitos de muçarela, bife de chorizo de 400 g com batatas, flan ou pudim de pão, e vinho ou bebida sem álcool.',
      'Empanada ou bâtonnets de mozzarella, bife de chorizo de 400 g avec pommes de terre, flan ou pudding de pain, et vin ou boisson sans alcool.')],
    ['Super Tabla Fredy (2P)', 89000, o(
      'Bife de chorizo, asado especial, picaña, mollejas, chorizo, provoletas y papas fritas a caballo.',
      'Bife de chorizo, special asado, picaña, sweetbreads, chorizo, provoletas and fries topped with eggs.',
      'Bife de chorizo, asado especial, picanha, mollejas, chorizo, provoletas e batatas fritas com ovos.',
      'Bife de chorizo, asado spécial, picaña, ris de veau, chorizo, provoletas et frites aux œufs.')],
    ['Tabla Fredy (4 personas)', 178000, o(
      'Bife de chorizo, asado especial, picaña, mollejas, chorizo, provoletas y papas a caballo.',
      'Bife de chorizo, special asado, picaña, sweetbreads, chorizo, provoletas and potatoes topped with eggs.',
      'Bife de chorizo, asado especial, picanha, mollejas, chorizo, provoletas e batatas com ovos.',
      'Bife de chorizo, asado spécial, picaña, ris de veau, chorizo, provoletas et pommes de terre aux œufs.')],
  ]),

  ...grupo('entradas', [
    ['Empanadas de lomo a cuchillo', 4000, o('Fritas, con lomo cortado a cuchillo.', 'Fried, with hand-cut tenderloin.', 'Fritas, com filé cortado à faca.', 'Frites, au filet coupé au couteau.')],
    ['Sopa del día', 8900, d('La sopa casera que preparamos hoy.', 'Today’s homemade soup.', 'A sopa caseira de hoje.', 'La soupe maison du jour.')],
    ['Provoleta Grillada', 12900, d('Queso provolone a la parrilla, dorado por fuera y fundido por dentro.', 'Grilled provolone cheese, golden outside and melted inside.', 'Queijo provolone na parrilla, dourado por fora e derretido por dentro.', 'Provolone grillé, doré dehors et fondant dedans.')],
    ['Milanesa de muzzarella', 15990, o('Con salsa y albahaca.', 'With sauce and basil.', 'Com molho e manjericão.', 'Avec sauce et basilic.')],
    ['Provoleta Fredy', 19800, o('Provoleta con rúcula, tomates secos y morrones, para compartir.', 'Provoleta with arugula, sun-dried tomatoes and bell peppers, to share.', 'Provoleta com rúcula, tomates secos e pimentões, para compartilhar.', 'Provoleta à la roquette, tomates séchées et poivrons, à partager.'), { destacado: true, nombreCorto: 'Provoleta Fredy' }],
    ['Rabas', 22800, d('Anillos de calamar rebozados y fritos.', 'Battered and fried squid rings.', 'Anéis de lula empanados e fritos.', 'Anneaux de calamar frits.')],
    ['Mollejitas al verdeo', 32500, o('Mollejitas con salsa de verdeo.', 'Sweetbreads with spring onion sauce.', 'Mollejas com molho de cebolinha.', 'Ris de veau, sauce à l’oignon vert.'), { destacado: true, nombreCorto: 'Mollejitas al verdeo' }],
  ]),

  ...grupo('achuras', [
    ['Morcilla Bombón', 3000, d('Morcilla pequeña, a la parrilla.', 'Small blood sausage, grilled.', 'Morcela pequena, na parrilla.', 'Petit boudin noir grillé.')],
    ['Chorizo', 4000, d('Chorizo a la parrilla.', 'Grilled Argentine sausage.', 'Linguiça argentina na parrilla.', 'Saucisse argentine grillée.')],
    ['Chorizo de Puro Cerdo', 6000, d('Chorizo de cerdo a la parrilla.', 'Grilled pork sausage.', 'Linguiça de porco na parrilla.', 'Saucisse de porc grillée.')],
    ['Chinchulines de Ternera', 14900, d('Chinchulines de ternera, crocantes a la parrilla.', 'Veal chitterlings, crisp from the grill.', 'Chinchulines de vitela, crocantes na parrilla.', 'Chinchulines de veau, croustillants au grill.')],
    ['Chorizo o Morcilla', 14000, d('A la parrilla. Elegí chorizo o morcilla.', 'Grilled. Choose sausage or blood sausage.', 'Na parrilla. Escolha linguiça ou morcela.', 'Au grill. Au choix : saucisse ou boudin noir.'), { sinTacc: true }],
    ['Riñón a la Provenzal', 22900, d('Riñón con ajo y perejil.', 'Kidney with garlic and parsley.', 'Rim com alho e salsinha.', 'Rognon à l’ail et au persil.')],
    ['Mollejas de Corazón', 30000, d('Mollejas de corazón a la parrilla.', 'Grilled heart sweetbreads.', 'Mollejas de coração na parrilla.', 'Ris de veau de cœur grillés.')],
  ]),

  ...grupo('parrilla', [
    ['Bondiola Grillada', 26500, d('Bondiola de cerdo a la parrilla.', 'Grilled pork neck.', 'Copa-lombo suína na parrilla.', 'Échine de porc grillée.')],
    ['Asado de Tira Banderita', 26890, o('El clásico de la parrilla argentina, corte banderita.', 'The classic of the Argentine grill, banderita cut.', 'O clássico da parrilla argentina, corte banderita.', 'Le classique du grill argentin, coupe banderita.'), { destacado: true, nombreCorto: 'Asado de tira banderita' }],
    ['Vacío del Fino', 29870, d('Vacío a la parrilla, uno de los cortes más argentinos.', 'Grilled vacío, one of Argentina’s signature cuts.', 'Vacío na parrilla, um dos cortes mais argentinos.', 'Vacío grillé, l’une des coupes les plus argentines.')],
    ['Bife de Chorizo (400 gr)', 32000, o('Porción abundante de 400 g, a la brasa.', 'Generous 400 g portion, cooked over embers.', 'Porção generosa de 400 g, na brasa.', 'Portion généreuse de 400 g, à la braise.'), { destacado: true, nombreCorto: 'Bife de chorizo', peso: '400 g' }],
    ['Ojo de Bife (400 gr)', 32000, d('Ojo de bife de 400 g, a la parrilla.', '400 g ribeye, grilled.', 'Ojo de bife de 400 g, na parrilla.', 'Entrecôte de 400 g, grillée.')],
    ['Picaña', 33900, o('Corte jugoso, a la brasa.', 'Juicy cut, cooked over embers.', 'Corte suculento, na brasa.', 'Coupe juteuse, à la braise.'), { destacado: true, nombreCorto: 'Picaña' }],
    ['Entraña', 34980, d('Entraña a la parrilla.', 'Grilled skirt steak.', 'Fraldinha na parrilla.', 'Hampe grillée.')],
    ['Lomo (300 gr)', 36000, d('Lomo de 300 g, a la parrilla.', '300 g tenderloin, grilled.', 'Filé mignon de 300 g, na parrilla.', 'Filet de bœuf de 300 g, grillé.')],
    ['Bife Especial (700 gr)', 56000, d('Corte especial de 700 g, a la parrilla.', 'Special 700 g cut, grilled.', 'Corte especial de 700 g, na parrilla.', 'Coupe spéciale de 700 g, grillée.')],
    ['Bife Mariposa (700 gr)', 56000, d('Bife de 700 g abierto en mariposa, a la parrilla.', '700 g butterfly-cut steak, grilled.', 'Bife de 700 g aberto em borboleta, na parrilla.', 'Pièce de 700 g ouverte en papillon, grillée.')],
    ['Tomahawk', 59000, d('Bife con hueso largo, a la parrilla.', 'Long-bone steak, grilled.', 'Bife com osso longo, na parrilla.', 'Côte à l’os long, grillée.')],
    ['Medallón de Lomo (600 gr)', 72000, d('Medallón de lomo de 600 g, a la parrilla.', '600 g tenderloin medallion, grilled.', 'Medalhão de filé mignon de 600 g, na parrilla.', 'Médaillon de filet de 600 g, grillé.')],
  ]),

  ...grupo('cocina', [
    ['Arroz a la Valenciana / Pastel de Papa', 18000, d('Dos clásicos caseros: elegí arroz a la valenciana o pastel de papa.', 'Two home-style classics: Valencian-style rice or potato and meat pie.', 'Dois clássicos caseiros: arroz à valenciana ou escondidinho de batata.', 'Deux classiques maison : riz à la valencienne ou hachis parmentier.')],
    ['Milanesa de Calabaza a la Suiza', 18000, d('Milanesa de calabaza con salsa cremosa gratinada.', 'Breaded squash cutlet with a gratinated creamy sauce.', 'Milanesa de abóbora com molho cremoso gratinado.', 'Escalope de courge panée, sauce crémeuse gratinée.')],
    ['Ribs de Cerdo BBQ c/Papas Española', 27980, d('Costillas de cerdo con salsa BBQ y papas a la española.', 'Pork ribs with BBQ sauce and Spanish-style potatoes.', 'Costelinha de porco com molho barbecue e batatas à espanhola.', 'Travers de porc sauce barbecue et pommes de terre à l’espagnole.')],
    ['Brochette Mixto c/Papas / Matambrito Cerdo', 29800, d('Elegí brochette mixto con papas o matambrito de cerdo.', 'Choose a mixed skewer with potatoes or pork matambrito.', 'Escolha espetinho misto com batatas ou matambrito suíno.', 'Au choix : brochette mixte avec pommes de terre ou matambrito de porc.')],
    ['Trucha Grillada c/Vegetales Salteados', 29878, d('Trucha a la plancha con vegetales salteados.', 'Grilled trout with sautéed vegetables.', 'Truta grelhada com legumes salteados.', 'Truite grillée et légumes sautés.')],
    ['Risotto Fungi', 32000, d('Risotto con hongos.', 'Mushroom risotto.', 'Risoto de cogumelos.', 'Risotto aux champignons.')],
    ['Gambas al Ajillo c/Papas Española', 32900, d('Gambas salteadas con ajo y papas a la española.', 'Garlic prawns with Spanish-style potatoes.', 'Camarões ao alho com batatas à espanhola.', 'Gambas à l’ail et pommes de terre à l’espagnole.')],
    ['Asado Especial c/Vegetales Gratinados', 33900, d('Asado especial con vegetales gratinados.', 'Special asado with vegetables au gratin.', 'Asado especial com legumes gratinados.', 'Asado spécial et légumes gratinés.')],
    ['Salmón Grillado c/Timbal de Arroz', 33900, d('Salmón grillado con timbal de arroz.', 'Grilled salmon with a rice timbale.', 'Salmão grelhado com timbale de arroz.', 'Saumon grillé et timbale de riz.')],
    ['Bife Campestre', 36900],
    ['Salmón c/Veg. Salteados y P. Provenzal', 37900, d('Salmón con vegetales salteados y papas a la provenzal.', 'Salmon with sautéed vegetables and garlic-parsley potatoes.', 'Salmão com legumes salteados e batatas à provençal.', 'Saumon, légumes sautés et pommes de terre à la provençale.')],
    ['Lomo (1000g) Pimienta Negra c/Papas Crema', 132000, d('Lomo de 1 kg a la pimienta negra con papas a la crema.', '1 kg tenderloin with black pepper and creamed potatoes.', 'Filé mignon de 1 kg à pimenta-do-reino com batatas ao creme.', 'Filet de 1 kg au poivre noir et pommes de terre à la crème.')],
  ]),

  ...grupo('minutas', [
    ['Suprema Grillada', 11900, d('Pechuga de pollo a la plancha.', 'Grilled chicken breast.', 'Peito de frango grelhado.', 'Blanc de poulet grillé.')],
    ['Milanesa de Ternera', 12800, d('Milanesa de ternera, un clásico argentino.', 'Breaded veal cutlet, an Argentine classic.', 'Milanesa de vitela, um clássico argentino.', 'Escalope de veau panée, un classique argentin.')],
    ['Ave Deshuesada al Verdeo w/Noisette', 18980, d('Ave deshuesada con salsa de verdeo y papas noisette.', 'Boneless chicken with spring onion sauce and noisette potatoes.', 'Frango desossado com molho de cebolinha e batatas noisette.', 'Volaille désossée, sauce à l’oignon vert et pommes noisette.')],
    ['Puré (Papas / Calabaza / Mixto)', 8900, d('Puré de papas, de calabaza o mixto.', 'Mashed potatoes, squash or mixed.', 'Purê de batatas, abóbora ou misto.', 'Purée de pommes de terre, de courge ou mixte.')],
    ['Papas a la Española / Arroz', 8900, d('Guarnición: papas a la española o arroz.', 'Side: Spanish-style potatoes or rice.', 'Acompanhamento: batatas à espanhola ou arroz.', 'Garniture : pommes de terre à l’espagnole ou riz.')],
    ['Papas Noisette', 9990, d('Papas noisette doradas.', 'Golden noisette potatoes.', 'Batatas noisette douradas.', 'Pommes noisette dorées.')],
    ['Papas Fritas a la Provenzal', 10900, d('Papas fritas con ajo y perejil.', 'Fries with garlic and parsley.', 'Batatas fritas com alho e salsinha.', 'Frites à l’ail et au persil.')],
  ]),

  ...grupo('pastas', [
    ['Ñoquis de Papa / Tallarines', 13900, d('Pasta artesanal: ñoquis de papa o tallarines.', 'Handmade pasta: potato gnocchi or tagliatelle.', 'Massa artesanal: nhoque de batata ou talharim.', 'Pâtes artisanales : gnocchis de pomme de terre ou tagliatelles.')],
    ['Tallarines / Tirabuzón', 13900, d('Elegí tallarines o tirabuzón.', 'Choose tagliatelle or fusilli.', 'Escolha talharim ou parafuso.', 'Au choix : tagliatelles ou fusilli.'), { sinTacc: true }],
    ['Sorrentinos J&Q / Capresse / Ravioles', 15900, d('Pasta rellena: sorrentinos de jamón y queso, capresse o ravioles.', 'Filled pasta: ham and cheese sorrentinos, caprese or ravioli.', 'Massa recheada: sorrentinos de presunto e queijo, caprese ou ravióli.', 'Pâtes farcies : sorrentinos jambon-fromage, caprese ou ravioles.')],
    ['Canelones de Verdura', 16500, d('Canelones rellenos de verdura.', 'Vegetable-filled cannelloni.', 'Canelones recheados de verdura.', 'Cannellonis farcis aux légumes verts.')],
    ['Tallarines de Tinta de Calamar', 16900, d('Tallarines negros con tinta de calamar.', 'Black tagliatelle made with squid ink.', 'Talharim negro com tinta de lula.', 'Tagliatelles noires à l’encre de seiche.')],
    ['Agnelotti de Bondioli', 18900, d('Agnelotti rellenos de bondiola.', 'Agnolotti filled with pork neck.', 'Agnelotti recheados de copa-lombo.', 'Agnolotti farcis à l’échine de porc.')],
    ['Raviolón de Cordero / Salmón', 19900, d('Raviolón relleno de cordero o de salmón.', 'Large ravioli filled with lamb or salmon.', 'Raviolão recheado de cordeiro ou salmão.', 'Grand raviole à l’agneau ou au saumon.')],
  ]),

  ...grupo('salsas', [
    ['Fileto / Blanca / Mixta Rosa', 5000, d('Para acompañar tu pasta.', 'To go with your pasta.', 'Para acompanhar sua massa.', 'Pour accompagner vos pâtes.')],
    ['Pesto / Crema', 5500, d('Para acompañar tu pasta.', 'To go with your pasta.', 'Para acompanhar sua massa.', 'Pour accompagner vos pâtes.')],
    ['Crema de Camarón / Jamón / Calamares / 4 Quesos / Bolognesa', 6000, d('Salsas especiales para tu pasta.', 'Special sauces for your pasta.', 'Molhos especiais para sua massa.', 'Sauces spéciales pour vos pâtes.')],
  ]),

  ...grupo('ensaladas', [
    ['Tradicional', 12000, o('Lechuga, tomate, zanahoria, huevo y rúcula.', 'Lettuce, tomato, carrot, egg and arugula.', 'Alface, tomate, cenoura, ovo e rúcula.', 'Laitue, tomate, carotte, œuf et roquette.')],
    ['Rúcula y Parmesano / Caesar', 12000, d('Elegí rúcula con parmesano o ensalada Caesar.', 'Choose arugula with parmesan or Caesar salad.', 'Escolha rúcula com parmesão ou salada Caesar.', 'Au choix : roquette et parmesan ou salade César.')],
    ['Ensalada Mixta', 12800, d('Ensalada mixta de la casa.', 'House mixed salad.', 'Salada mista da casa.', 'Salade mixte de la maison.')],
    ['Ensalada Moni Mo', 15900],
  ]),

  ...grupo('postres', [
    ['Flan Casero / Budín de Pan Artesanal', 10900, d('Elegí flan casero o budín de pan artesanal.', 'Choose homemade flan or handmade bread pudding.', 'Escolha flan caseiro ou pudim de pão artesanal.', 'Au choix : flan maison ou pudding de pain artisanal.')],
    ['Helados (Suizo, Almendrado, Crema, Choc)', 11000, d('Helados: suizo, almendrado, crema o chocolate.', 'Ice cream: Swiss, almond, cream or chocolate.', 'Sorvetes: suíço, amêndoas, creme ou chocolate.', 'Glaces : suisse, amandes, crème ou chocolat.')],
    ['Lemon Champ', 14000, d('Postre helado de limón con champagne.', 'Frozen lemon dessert with champagne.', 'Sobremesa gelada de limão com champanhe.', 'Dessert glacé au citron et au champagne.')],
    ['Queso y Dulce', 15000, d('Queso con dulce, el postre más argentino.', 'Cheese with fruit paste, Argentina’s classic dessert.', 'Queijo com doce, a sobremesa mais argentina.', 'Fromage et pâte de fruits, le dessert argentin par excellence.')],
    ['Crumble de Manzana c/Helado', 16949, d('Crumble tibio de manzana con helado.', 'Warm apple crumble with ice cream.', 'Crumble morno de maçã com sorvete.', 'Crumble tiède aux pommes et glace.')],
    ['Tiramisú Argentino', 17800, d('Tiramisú con un toque argentino.', 'Tiramisu with an Argentine touch.', 'Tiramisù com um toque argentino.', 'Tiramisu à la touche argentine.')],
    ['Volcán de Choc / Brownie c/Helado', 19900, d('Volcán de chocolate o brownie, con helado.', 'Chocolate lava cake or brownie, with ice cream.', 'Vulcão de chocolate ou brownie, com sorvete.', 'Fondant au chocolat ou brownie, avec glace.')],
  ]),

  ...grupo('bodega', [
    ['Hormiga Negra', 17500], ['Alma Mora', 18680], ['Intocables', 21880], ['Finca La Linda', 22789],
    ['Los Álamos / Nieto Senetiner', 22800], ['Fond de Cave', 23796], ['Saint Felicien', 27856], ['Trumpeter', 27880],
    ['Animal Natural Vine Yards', 29300], ['Nicasia', 29490], ['Luigi Bosca', 32800], ['Pequeñas Producciones', 38780],
    ['Anaia Gran Malbec', 39000], ['El Enemigo', 39300], ['Alma Negra', 39500], ['Rutini', 39890],
    ['José Zuccardi', 42650], ['DV Catena', 43900], ['Angélica Zapata', 58670],
  ], 'malbec'),
  ...grupo('bodega', [
    ['Los Álamos (Cabernet)', 21500], ['Salentein (Cabernet)', 22900], ['Finca La Linda (Cabernet)', 24880],
    ['Nieto Senetiner (Cabernet)', 26800], ['Nieto Senetiner (Merlot)', 32800], ['Saint Felicien (Cabernet)', 33479],
    ['Luigi Bosca (Cabernet)', 35846], ['Luigi Bosca (Syrah)', 36890], ['Luigi Bosca (Merlot)', 37864],
    ['DV Catena (Cabernet)', 37900], ['Zuccardi (Syrah)', 37960], ['Anaia Gran Savinón Cabernet', 39000],
  ], 'tintos'),
  ...grupo('bodega', [
    ['Presidente', 68900], ['Chañarmuyo', 78000], ['Gran Enemigo', 85800], ['Gran Enemigo Corte', 89500], ['Judas', 99000],
  ], 'especiales'),
  ...grupo('bodega', [
    ['Copa de Vino Chardonnay', 7000], ['Cosecha Tardía Norton', 16500], ['Santa Julia Chenin / Alma Mora', 18900],
    ['Los Álamos Chardonnay', 21500], ['Nieto Senetiner Chardonnay', 22800], ['Trumpeter Chardonnay', 27800],
    ['Saint Felicien Chardonnay', 29750], ['Luigi Bosca Chard / Sauv. Blanc', 29900], ['Rutini Sauvignon Blanc', 37490],
    ['Rutini Chardonnay', 39800], ['DV Catena Chardonnay', 42890], ['Anaia Gran Viognier', 45000],
  ], 'blancos'),
  ...grupo('bodega', [
    ['Sidra Saenz Briones 1888', 12000], ['Norton Cosecha Especial Extra Brut', 24000], ['Navarro Correa Extra Brut', 27000],
    ['Nieto Senetiner Extra Brut', 37900], ['Chandon Extra Brut', 37800], ['Chandon Brut Nature', 43760],
    ['Baron B Extra Brut', 55000], ['Baron B Brut Nature', 65000],
  ], 'espumantes'),
  ...grupo('bodega', [
    ['Agua Mineral / Saborizada', 4000], ['Gaseosas', 5000], ['Quilmes Tirada Clásica', 6500],
    ['Quilmes / Andes / Corona Porrón', 6600], ['Quilmes Clásica / Doble Malta (1L)', 8500],
    ['Budweiser (1L) / Andes Origen (1L)', 8900], ['Stella Artois / Patagonia / Corona 710', 11000],
  ], 'cervezas'),
  ...grupo('bodega', [
    ['Gancia / Fernet / Aperol / Negroni / Cuba Libre', 8900, null, { precioHasta: 9900 }],
    ['Whisky Nacional / Chivas Regal', 14000, null, { precioHasta: 15000 }],
    ['JW Etiqueta Roja / Negra', 19000, null, { precioHasta: 20000 }],
    ['Johnnie Walker Blue Label', 55000],
  ], 'tragos'),
  ...grupo('bodega', [
    ['Café / Americano / Doble', 5000, null, { precioHasta: 7000 }],
    ['Limonada / Jugo Naranja / Licuado', 5900, null, { precioHasta: 8900 }],
    ['Café c/Leche + Pastafrola', 9900],
    ['Café c/Leche + Tostado J&Q Pan Árabe', 14000],
  ], 'cafeteria'),
];

/* Orden del carrusel del Inicio, como en el prototipo aprobado. */
const ORDEN_DESTACADOS = ['Bife de Chorizo (400 gr)', 'Asado de Tira Banderita', 'Picaña', 'Mollejitas al verdeo', 'Provoleta Fredy'];

/* "Nuestros platos" del Inicio: fotos reales que mandó Fredy, sin precio.
   El nombre describe lo que se ve en la foto; si Fredy lo corrige, se cambia acá. */
const NUESTROS_PLATOS = [
  {
    foto: 'img/platos/bife-reduccion.jpg', cat: 'parrilla',
    nombre: tx('Corte a la parrilla con reducción', 'Grilled cut with reduction', 'Corte na grelha com redução', 'Pièce grillée et sa réduction'),
    desc: tx('Marcado a la brasa y servido con un toque de reducción.', 'Seared over the embers and served with a touch of reduction.', 'Marcado na brasa e servido com um toque de redução.', 'Saisie sur la braise et servie avec une touche de réduction.'),
  },
  {
    foto: 'img/platos/bife-papas.jpg', cat: 'parrilla',
    nombre: tx('Bife con papas fritas', 'Steak with french fries', 'Bife com batatas fritas', 'Steak et frites'),
    desc: tx('Un clásico de la parrilla, con papas fritas al costado.', 'A grill classic, with french fries on the side.', 'Um clássico da parrilla, com batatas fritas.', 'Un classique de la grillade, avec des frites.'),
  },
  {
    foto: 'img/platos/bife-grillado.jpg', cat: 'parrilla',
    nombre: tx('Bife grillado con salsa', 'Grilled steak with sauce', 'Bife grelhado com molho', 'Steak grillé et sa sauce'),
    desc: tx('Con hojas verdes y tiras de morrón.', 'With greens and strips of red pepper.', 'Com folhas verdes e tiras de pimentão.', 'Avec de la salade et des lanières de poivron.'),
  },
  {
    foto: 'img/platos/ensalada-peras.jpg', cat: 'ensaladas',
    nombre: tx('Ensalada de rúcula, peras grilladas y queso azul', 'Arugula salad with grilled pears and blue cheese', 'Salada de rúcula, peras grelhadas e queijo azul', 'Salade de roquette, poires grillées et bleu'),
    desc: tx('Con tomates cherry.', 'With cherry tomatoes.', 'Com tomates-cereja.', 'Avec des tomates cerises.'),
  },
  {
    foto: 'img/platos/ensalada-cesar.jpg', cat: 'ensaladas',
    nombre: tx('Ensalada César', 'Caesar salad', 'Salada Caesar', 'Salade César'),
    desc: tx('Pollo grillado, croutons, queso en hebras y aderezo.', 'Grilled chicken, croutons, shaved cheese and dressing.', 'Frango grelhado, croutons, queijo ralado e molho.', 'Poulet grillé, croûtons, copeaux de fromage et sauce.'),
  },
  {
    foto: 'img/platos/volcan-chocolate.jpg', cat: 'postres',
    nombre: tx('Volcán de chocolate con helado', 'Chocolate lava cake with ice cream', 'Vulcão de chocolate com sorvete', 'Moelleux au chocolat et glace'),
    desc: tx('Con helado de crema y caramelo hilado.', 'With vanilla ice cream and spun caramel.', 'Com sorvete de creme e caramelo fiado.', 'Avec glace vanille et caramel filé.'),
  },
  {
    foto: 'img/platos/flan.jpg', cat: 'postres',
    nombre: tx('Flan con dulce de leche', 'Flan with dulce de leche', 'Pudim com doce de leite', 'Flan au dulce de leche'),
    desc: tx('El postre de siempre, con caramelo.', 'The classic dessert, with caramel.', 'A sobremesa de sempre, com caramelo.', 'Le dessert de toujours, au caramel.'),
  },
];

const FAQ = [
  {
    q: tx('¿Qué horario tienen?', 'What are your opening hours?', 'Qual é o horário?', 'Quels sont vos horaires ?'),
    a: tx('Abrimos todos los días, de 10:00 a 02:00 hs.', 'We are open every day, from 10:00 to 02:00.', 'Abrimos todos os dias, das 10:00 às 02:00.', 'Nous sommes ouverts tous les jours, de 10 h à 2 h.'),
  },
  {
    q: tx('¿Puedo ir con mi mascota?', 'Can I bring my pet?', 'Posso levar meu pet?', 'Puis-je venir avec mon animal ?'),
    a: tx('Sí, Fredy es pet friendly.', 'Yes, Fredy is pet friendly.', 'Sim, o Fredy é pet friendly.', 'Oui, Fredy accepte les animaux.'),
  },
  {
    q: tx('¿El local es accesible?', 'Is the restaurant accessible?', 'O restaurante é acessível?', 'Le restaurant est-il accessible ?'),
    a: tx('Sí, el local es accesible.', 'Yes, the restaurant is accessible.', 'Sim, o restaurante é acessível.', 'Oui, le restaurant est accessible.'),
  },
  {
    q: tx('¿Hacen delivery?', 'Do you deliver?', 'Vocês fazem entrega?', 'Livrez-vous à domicile ?'),
    a: tx('El delivery va por PedidosYa. Desde esta web podés hacer tu pedido para retirar en el local.', 'Delivery is available through PedidosYa. On this website you can place an order to pick up at the restaurant.', 'A entrega é feita pelo PedidosYa. Neste site você pode fazer seu pedido para retirar no restaurante.', 'La livraison passe par PedidosYa. Sur ce site, vous pouvez commander à emporter au restaurant.'),
  },
  {
    q: tx('¿Cómo pago mi pedido?', 'How do I pay for my order?', 'Como pago meu pedido?', 'Comment payer ma commande ?'),
    a: tx('En esta web no pagás nada. Te confirmamos el total y cómo pagar por WhatsApp.', 'You don’t pay anything on this website. We confirm the total and how to pay on WhatsApp.', 'Neste site você não paga nada. Confirmamos o total e a forma de pagamento pelo WhatsApp.', 'Vous ne payez rien sur ce site. Nous vous confirmons le total et le mode de paiement sur WhatsApp.'),
  },
  {
    q: tx('¿Hacen eventos?', 'Do you host events?', 'Vocês fazem eventos?', 'Organisez-vous des événements ?'),
    a: tx('Sí. Escribinos por WhatsApp y te contamos las opciones para tu festejo.', 'Yes. Message us on WhatsApp and we’ll tell you the options for your celebration.', 'Sim. Escreva pelo WhatsApp e contaremos as opções para sua comemoração.', 'Oui. Écrivez-nous sur WhatsApp et nous vous présenterons les options pour votre fête.'),
  },
];
