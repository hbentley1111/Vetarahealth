/* Inline stroke-SVG icon set (from the original prototype) */
const I = (n, s = 18) => {
  const p = {
    paw:'<ellipse cx="7.2" cy="8.5" rx="1.8" ry="2.4"/><ellipse cx="12" cy="6.8" rx="1.8" ry="2.4"/><ellipse cx="16.8" cy="8.5" rx="1.8" ry="2.4"/><path d="M12 11.5c-2.8 0-5.2 2.2-5.2 4.6 0 1.5 1.2 2.4 2.6 2.4 1 0 1.8-.5 2.6-.5s1.6.5 2.6.5c1.4 0 2.6-.9 2.6-2.4 0-2.4-2.4-4.6-5.2-4.6z"/>',
    shield:'<path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z"/><path d="m9.2 11.8 2 2 3.6-4"/>',
    bolt:'<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
    qr:'<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5z"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-8M21 20H3"/>',
    coin:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.5 9.8c0-1 1.1-1.8 2.5-1.8s2.5.8 2.5 1.8c0 2.4-5 1.6-5 4 0 1 1.1 1.8 2.5 1.8s2.5-.8 2.5-1.8"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    pin:'<path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    star:'<path d="m12 3.5 2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/>',
    starF:'<path fill="currentColor" stroke="none" d="m12 3.5 2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/>',
    grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    file:'<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    steth:'<path d="M5 3v6a5 5 0 0 0 10 0V3"/><path d="M10 14v3a5 5 0 0 0 10 0v-1"/><circle cx="20" cy="14" r="2"/>',
    users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.6c2.3.4 4 2.1 4 4.4"/>',
    heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    bell:'<path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.5 20a1.8 1.8 0 0 0 3 0"/>',
    check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x:'<path d="m6 6 12 12M18 6 6 18"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    cal:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    syringe:'<path d="m18 2 4 4M19.5 4.5 8 16l-4 1 1-4L16.5 1.5"/><path d="m12 7 4 4"/>',
    doc:'<path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M9.5 8h5M9.5 12h5M9.5 16h3"/>',
    spark:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    back:'<path d="m14 6-6 6 6 6"/>',
    out:'<path d="M14 5h5v5M19 5l-8 8"/><path d="M19 14v5H5V5h5"/>',
    pill:'<rect x="3.5" y="9.5" width="17" height="7" rx="3.5" transform="rotate(-40 12 13)"/><path d="m9 9 5.5 5.5"/>',
    trash:'<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/><path d="M10 11v5M14 11v5"/>'
  }[n];
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
};
const stars = (n, s = 13) => {
  let h = '<span class="stars">';
  for (let i = 1; i <= 5; i++) h += `<span class="${i <= Math.round(n) ? '' : 'off'}">${I(i <= Math.round(n) ? 'starF' : 'star', s)}</span>`;
  return h + '</span>';
};
