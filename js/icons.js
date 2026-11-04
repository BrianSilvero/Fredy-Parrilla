/* Íconos, banderas, espátula y cartel: SVG propios, sin bibliotecas externas.
   Son constantes del sitio: nunca se les concatenan datos de usuarios. */
'use strict';

const T = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

const ICONOS = {
  flecha: `<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" ${T}><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  flechaIzq: `<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" ${T}><path d="M15 5l-7 7 7 7"/></svg>`,
  flechaDer: `<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" ${T}><path d="M9 5l7 7-7 7"/></svg>`,
  chevron: `<svg width="12" height="12" viewBox="0 0 24 24" stroke-width="2.2" ${T}><path d="M6 9l6 6 6-6"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="3" ${T}><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  pausa: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`,
  play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z"/></svg>`,
  cerrar: `<svg width="20" height="20" viewBox="0 0 24 24" stroke-width="2" ${T}><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  tacho: `<svg width="18" height="18" viewBox="0 0 24 24" stroke-width="1.7" ${T}><path d="M4.5 6.5h15M9.5 6.5V4.500h5v2M6.500 6.500l.9 13.500h9.200l.9-13.500M10 10.500v6M14 10.500v6"/></svg>`,
  mas: `<svg width="18" height="18" viewBox="0 0 24 24" stroke-width="2" ${T}><path d="M12 5v14M5 12h14"/></svg>`,
  menos: `<svg width="18" height="18" viewBox="0 0 24 24" stroke-width="2" ${T}><path d="M5 12h14"/></svg>`,
  telefono: `<svg width="22" height="22" viewBox="0 0 24 24" stroke-width="1.7" ${T}><path d="M6.6 3.5h2.7l1.5 4.2-2 1.5a11.5 11.5 0 0 0 5.5 5.5l1.5-2 4.2 1.5v2.7a2 2 0 0 1-2.2 2C10.300 18.700 5.300 13.700 4.600 5.700a2 2 0 0 1 2-2.200z"/></svg>`,
  whatsapp: `<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1.6" ${T}><path d="M4.5 19.500l1.200-3.600A8 8 0 1 1 8.400 18.600z"/><path d="M9 9.500c.3 2.200 2.300 4.400 5 5l1-1.200-1.600-.9-.7.6c-.9-.4-1.700-1.200-2.100-2.100l.6-.7-.9-1.600z"/></svg>`,
  instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E4405F" stroke-width="1.6" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.300" cy="6.700" r=".9" fill="#E4405F" stroke="none"/></svg>`,
  facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1877F2" stroke-width="1.6" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M13.500 21v-7h2.400l.4-2.800h-2.800V9.600c0-.8.3-1.400 1.400-1.400h1.500V5.700a17 17 0 0 0-2.200-.1c-2.200 0-3.600 1.300-3.600 3.700v1.900H8.200V14h2.400v7"/></svg>`,
  ubicacion: `<svg width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" ${T}><path d="M12 21.500s-7-6.300-7-11.700a7 7 0 0 1 14 0c0 5.400-7 11.700-7 11.700z"/><circle cx="12" cy="9.800" r="2.400"/></svg>`,
  reloj: `<svg width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" ${T}><circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/></svg>`,
  calendario: `<svg width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" ${T}><rect x="3.500" y="5" width="17" height="15.500" rx="2.500"/><path d="M3.500 10h17M8 3v4M16 3v4"/></svg>`,
  luna: `<svg width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" ${T}><path d="M20 14.500A8.500 8.500 0 1 1 9.500 4a6.800 6.800 0 0 0 10.500 10.500z"/></svg>`,
  copa: `<svg width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" ${T}><path d="M8 3h8l-.5 5.200a3.500 3.500 0 0 1-7 0z"/><path d="M8.300 6.300h7.400"/><path d="M12 11.700V20M8.500 20.500h7"/></svg>`,
  /* Micrófono de mano estilo recital (a color, inclinado) con dos ondas doradas (clase "onda")
     que el CSS hace latir. Se dibuja derecho y se inclina 45° con rotate. */
  microfono: `<svg width="30" height="24" viewBox="0 0 30 24" aria-hidden="true" focusable="false" stroke-linejoin="round">
    <g transform="rotate(45 12 12)" stroke="#1A1714">
      <path d="M9.200 12.200H14.800L13.500 21H10.500Z" fill="#DCDADF" stroke-width="1"/>
      <rect x="10.200" y="20.600" width="3.600" height="1.800" rx=".5" fill="#EDEBEF" stroke-width="1"/>
      <rect x="10.800" y="13.500" width="2.400" height="1.400" rx=".3" fill="#F2879A" stroke-width=".6"/>
      <rect x="10.800" y="15.300" width="2.400" height="1.400" rx=".3" fill="#8FE3D4" stroke-width=".6"/>
      <rect x="8.800" y="10.600" width="6.400" height="1.800" rx=".6" fill="#9A97A0" stroke-width="1"/>
      <circle cx="12" cy="6" r="4.800" fill="#BDBAC2" stroke-width="1"/>
      <rect x="6.900" y="6.900" width="10.200" height="1.700" rx=".85" fill="#8FE3D4" stroke-width=".8"/>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.600" stroke-linecap="round">
      <path class="onda onda-1" d="M22.600 5.200a4.200 4.200 0 0 1 0 5.400"/>
      <path class="onda onda-2" d="M25.400 3a7.600 7.600 0 0 1 0 9.800"/>
    </g></svg>`,
  sol: `<svg width="28" height="28" viewBox="0 0 32 32" stroke-width="1.5" ${T}><circle cx="16" cy="16" r="5.500"/><path d="M16 3.500v3M16 25.500v3M3.500 16h3M25.500 16h3M7.200 7.200l2.100 2.100M22.700 22.700l2.100 2.100M7.200 24.800l2.100-2.100M22.700 9.300l2.100-2.100"/></svg>`,
  bolsaFuego: `<svg width="28" height="28" viewBox="0 0 32 32" stroke-width="1.5" ${T}><path d="M7 11h18l-1.600 16H8.600z"/><path d="M12 11V9a4 4 0 0 1 8 0v2"/><path d="M14.200 20.500c.5-1 1.400-1.500 1.400-2.700.8.6 1.500 1.500 1.500 2.700a1.450 1.450 0 0 1-2.900 0z"/></svg>`,
  brindis: `<svg width="28" height="28" viewBox="0 0 32 32" stroke-width="1.5" ${T}><path d="M6.500 8.500l6 1.600-1.500 6a3.100 3.100 0 0 1-6-1.600z"/><path d="M8.200 16.600l-1.500 6.200M4.500 22.200l4.400 1.200"/><path d="M25.500 8.500l-6 1.600 1.500 6a3.100 3.100 0 0 0 6-1.600z"/><path d="M23.800 16.600l1.500 6.200M27.500 22.200l-4.400 1.200"/><path d="M16 3v3M13.500 4.500l1.200 1.200M18.500 4.500l-1.200 1.200"/></svg>`,
  libro: `<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" ${T}><path d="M12 6.500C10 5 7.500 4.500 4 4.500v14c3.500 0 6 .5 8 2 2-1.500 4.500-2 8-2v-14c-3.500 0-6 .5-8 2z"/><path d="M12 6.500v14"/></svg>`,
  pergamino: `<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" ${T}><path d="M7 3.500h11a2 2 0 0 1 2 2V7h-4M7 3.500a2 2 0 0 0-2 2V17M16 7v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2h9v2a2 2 0 0 0 2 2M9 8h3.500M9 11.500h3.500"/></svg>`,
  charla: `<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" ${T}><path d="M4.500 19.500l1.200-3.600A8 8 0 1 1 8.400 18.600z"/><path d="M8.800 12h.01M12.300 12h.01M15.800 12h.01" stroke-width="2.200"/></svg>`,
  bolsa: `<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" ${T}><path d="M5 8.500h14l-1.200 12H6.200z"/><path d="M9 8.500V7a3 3 0 0 1 6 0v1.500"/></svg>`,
  huella: `<svg width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" ${T}><path d="M8.500 20c-2 0-3-1.500-2.300-3.200.8-2 3-4.300 5.800-4.300s5 2.300 5.800 4.300c.7 1.700-.3 3.200-2.300 3.200-1.300 0-2.200-.7-3.500-.7s-2.200.7-3.500.7z"/><ellipse cx="5.500" cy="10.500" rx="1.600" ry="2.200"/><ellipse cx="9.500" cy="6.500" rx="1.600" ry="2.300"/><ellipse cx="14.500" cy="6.500" rx="1.600" ry="2.300"/><ellipse cx="18.500" cy="10.500" rx="1.600" ry="2.200"/></svg>`,
  accesible: `<svg width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" ${T}><circle cx="11" cy="4.500" r="1.800"/><path d="M11 8v6h5l2.500 5"/><path d="M11 10.500h4.500"/><path d="M8.300 12.300a5 5 0 1 0 6.900 6.300"/></svg>`,
};

const BANDERAS = {
  ar: { vb: '0 0 9 6', svg: '<rect width="9" height="6" fill="#74ACDF"/><rect y="2" width="9" height="2" fill="#FFFFFF"/><circle cx="4.500" cy="3" r="0.620" fill="#F6B40E"/>' },
  us: { vb: '0 0 19 13', svg: '<rect width="19" height="13" fill="#FFFFFF"/><rect width="19" height="1" fill="#B22234"/><rect y="2" width="19" height="1" fill="#B22234"/><rect y="4" width="19" height="1" fill="#B22234"/><rect y="6" width="19" height="1" fill="#B22234"/><rect y="8" width="19" height="1" fill="#B22234"/><rect y="10" width="19" height="1" fill="#B22234"/><rect y="12" width="19" height="1" fill="#B22234"/><rect width="7.600" height="7" fill="#3C3B6E"/>' },
  br: { vb: '0 0 20 14', svg: '<rect width="20" height="14" fill="#009C3B"/><polygon points="1.800,7 10,1.300 18.200,7 10,12.700" fill="#FFDF00"/><circle cx="10" cy="7" r="3.400" fill="#002776"/>' },
  fr: { vb: '0 0 3 2', svg: '<rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#FFFFFF"/><rect x="2" width="1" height="2" fill="#EF4135"/>' },
};

/* Espátula de parrillero: paleta de acero con ranuras y mango de algarrobo. */
const ESPATULA = `<svg class="espatula" width="46" height="150" viewBox="0 0 46 150" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="espA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#737B82"/><stop offset=".3" stop-color="#CDD2D5"/><stop offset=".5" stop-color="#ECEFF0"/><stop offset=".75" stop-color="#A1A8AE"/><stop offset="1" stop-color="#7E868C"/></linearGradient>
    <linearGradient id="espM" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A4022"/><stop offset=".3" stop-color="#8D4D2B"/><stop offset=".65" stop-color="#4F2511"/><stop offset="1" stop-color="#2E1407"/></linearGradient>
  </defs>
  <path d="M6 4a3 3 0 0 1 3-3h28a3 3 0 0 1 3 3v50a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="url(#espA)"/>
  <rect x="13" y="12" width="4" height="34" rx="2" fill="#171512"/>
  <rect x="21" y="12" width="4" height="34" rx="2" fill="#171512"/>
  <rect x="29" y="12" width="4" height="34" rx="2" fill="#171512"/>
  <path d="M20 58h6l-1 22h-4z" fill="url(#espA)"/>
  <rect x="17" y="78" width="12" height="70" rx="6" fill="url(#espM)"/>
  <circle cx="23" cy="90" r="1.700" fill="#B8924D"/><circle cx="23" cy="134" r="1.700" fill="#B8924D"/>
</svg>`;

const svgCartelTenedor = (u) => `<svg class="fz-cubierto fz-fork" aria-hidden="true" focusable="false" width="14" height="52" viewBox="0 0 14 52">
<defs>
<linearGradient id="fzM${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9CED2"/><stop offset=".3" stop-color="#ECEFF1"/><stop offset=".7" stop-color="#9AA1A7"/><stop offset="1" stop-color="#767E85"/></linearGradient>
<linearGradient id="fzW${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A4022"/><stop offset=".22" stop-color="#8D4D2B"/><stop offset=".6" stop-color="#4F2511"/><stop offset="1" stop-color="#2E1407"/></linearGradient>
<linearGradient id="fzS${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7D858B"/><stop offset=".35" stop-color="#D9DDE0"/><stop offset="1" stop-color="#6B737A"/></linearGradient>
</defs>
<path d="M4 1.500V11Q4 16 7 16Q10 16 10 11V1.500" fill="none" stroke="url(#fzM${u})" stroke-width="1.700" stroke-linecap="round"/>
<path d="M7 16V23" stroke="#A3AAB0" stroke-width="2.200" stroke-linecap="round"/>
<rect x="4.200" y="22" width="5.600" height="4" rx="1.200" fill="url(#fzS${u})"/>
<rect x="3.800" y="25.500" width="6.400" height="26" rx="3.200" fill="url(#fzW${u})"/>
<path d="M5.600 28V49" stroke="#FFDCB4" stroke-opacity=".2" stroke-width=".6"/>
<circle cx="7" cy="31" r=".95" fill="#B8924D"/><circle cx="7" cy="45" r=".95" fill="#B8924D"/>
</svg>`;

const svgCartelCuchillo = (u) => `<svg class="fz-cubierto fz-knife" aria-hidden="true" focusable="false" width="14" height="54" viewBox="0 0 14 54">
<defs><linearGradient id="fzB${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#737B82"/><stop offset=".3" stop-color="#CDD2D5"/><stop offset=".45" stop-color="#ECEFF0"/><stop offset=".72" stop-color="#A1A8AE"/><stop offset="1" stop-color="#7E868C"/></linearGradient></defs>
<path d="M5.200 27V3Q5.200 1 6.600 1.600Q10.800 6.500 10.600 16L10.200 27Z" fill="url(#fzB${u})"/>
<path d="M6 4V26" stroke="#FFFFFF" stroke-opacity=".55" stroke-width=".6"/>
<rect x="4.600" y="26.500" width="6.400" height="3.500" rx="1" fill="url(#fzS${u})"/>
<rect x="4.400" y="29.500" width="6.800" height="24" rx="3.400" fill="url(#fzW${u})"/>
<path d="M6.200 32V48" stroke="#FFDCB4" stroke-opacity=".2" stroke-width=".6"/>
<circle cx="7.800" cy="34" r=".95" fill="#B8924D"/><circle cx="7.800" cy="43" r=".95" fill="#B8924D"/>
</svg>`;

const SVG_CARTEL_VETAS = `<svg class="fz-vetas" aria-hidden="true" focusable="false" width="128" height="50" viewBox="0 0 128 50" preserveAspectRatio="none">
<g fill="none" stroke="#3C1405" stroke-opacity=".26" stroke-width=".6"><path d="M-2 4.500C30 3 62 8 130 4"/><path d="M-2 9.500C24 11.500 70 7.500 130 10.500"/><path d="M-2 15C38 13 80 18 130 14"/><path d="M-2 21C30 23 60 19 84 21.500C96 23 108 19.500 130 21"/><path d="M-2 27.500C40 25.500 84 30 130 26.500"/><path d="M-2 33C30 35.500 92 30.500 104 34C110 36.500 116 32.500 130 34"/><path d="M-2 39.500C45 37.500 86 42 130 39"/><path d="M-2 45.500C35 47 80 43.500 130 46"/></g>
<g fill="none" stroke="#FFCEA0" stroke-opacity=".11" stroke-width="1.100"><path d="M-2 7C34 5.500 70 10 130 7"/><path d="M-2 18C36 16.500 80 21 130 17.500"/><path d="M-2 30.500C40 32.500 82 28.500 130 30.500"/><path d="M-2 42.500C30 41 76 45 130 42"/></g>
<ellipse cx="112" cy="35" rx="4.400" ry="1.800" fill="none" stroke="#371204" stroke-opacity=".34" stroke-width=".5"/><ellipse cx="112" cy="35" rx="1.700" ry=".75" fill="#2D0E03" fill-opacity=".4"/>
<g fill="#190802" fill-opacity=".28"><ellipse cx="4" cy="44" rx="6" ry="4"/><ellipse cx="124" cy="5" rx="5" ry="3.500"/><ellipse cx="63" cy="49.500" rx="14" ry="1.600"/></g>
</svg>`;

const SVG_CARTEL_HERRAJE = `<svg class="fz-herraje" aria-hidden="true" focusable="false" width="172" height="26" viewBox="0 0 172 26">
<rect x="83" y="0" width="6" height="6" rx="1" fill="#262321" stroke="#0F0E0D" stroke-width=".3"/><circle cx="86" cy="3" r=".8" fill="#57514D"/>
<path d="M30 3H142" stroke="#1F1C1A" stroke-width="2.200" stroke-linecap="round"/><path d="M31 2.300H141" stroke="#FFF0E1" stroke-opacity=".18" stroke-width=".5"/>
<path d="M30 3C26.500 3 25.500 6.500 27.800 7.600C29.600 8.400 30.800 6.400 29.400 5.600" fill="none" stroke="#1F1C1A" stroke-width="1.400" stroke-linecap="round"/>
<path d="M142 3C145.500 3 146.500 6.500 144.200 7.600C142.400 8.400 141.200 6.400 142.600 5.600" fill="none" stroke="#1F1C1A" stroke-width="1.400" stroke-linecap="round"/>
<g fill="none" stroke="#35312E" stroke-width=".85"><ellipse cx="36" cy="6.200" rx="1.300" ry="2.200"/><ellipse cx="36" cy="11.700" rx="1.300" ry="2.200"/><ellipse cx="36" cy="17.200" rx="1.300" ry="2.200"/><ellipse cx="136" cy="6.200" rx="1.300" ry="2.200"/><ellipse cx="136" cy="11.700" rx="1.300" ry="2.200"/><ellipse cx="136" cy="17.200" rx="1.300" ry="2.200"/></g>
<g fill="#2B2826"><rect x="35.550" y="7.300" width=".9" height="3.400" rx=".45"/><rect x="35.550" y="12.800" width=".9" height="3.400" rx=".45"/><rect x="135.550" y="7.300" width=".9" height="3.400" rx=".45"/><rect x="135.550" y="12.800" width=".9" height="3.400" rx=".45"/></g>
<rect x="32.500" y="18.500" width="7" height="5" rx="1" fill="#262321" stroke="#0F0E0D" stroke-width=".3"/><rect x="132.500" y="18.500" width="7" height="5" rx="1" fill="#262321" stroke="#0F0E0D" stroke-width=".3"/>
<circle cx="36" cy="19.600" r="1.100" fill="none" stroke="#35312E" stroke-width=".8"/><circle cx="136" cy="19.600" r="1.100" fill="none" stroke="#35312E" stroke-width=".8"/>
</svg>`;
