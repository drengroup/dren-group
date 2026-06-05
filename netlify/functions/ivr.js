// Dren Group — bilingual phone-tree IVR (voice). One number routes all products.
// State carried via ?step / ?lang query params. Recordings save to Twilio Console.
const BASE = '/.netlify/functions/ivr';
const PRODUCTS = {
  '1': { es: 'JurisRD',     en: 'JurisRD' },
  '2': { es: 'Cuadrato',    en: 'Cuadrato' },
  '3': { es: 'TADR, Travel Agency D R', en: 'TADR, Travel Agency D R' },
  '4': { es: 'Scuba D R',   en: 'Scuba D R' },
  '5': { es: 'Dren Group',  en: 'Dren Group' },
  '6': { es: 'Vythally',    en: 'Vythally' },
  '7': { es: 'O2 Tribe',    en: 'O2 Tribe' },
};
exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const form = new URLSearchParams(event.body || '');
  const digits = form.get('Digits') || '';
  const step = q.step || 'welcome';
  const xml = (inner) => ({ statusCode: 200, headers: { 'Content-Type': 'text/xml' },
    body: `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>` });
  const es = (t) => `<Say voice="Polly.Lupe" language="es-MX">${t}</Say>`;
  const en = (t) => `<Say voice="Polly.Joanna" language="en-US">${t}</Say>`;

  if (step === 'welcome') {
    return xml(
      `<Gather numDigits="1" action="${BASE}?step=menu" method="POST" timeout="6">` +
        es('Gracias por llamar a Dren Group. Para español, oprima 1.') +
        en('For English, press 2.') +
      `</Gather>` +
      `<Redirect method="POST">${BASE}?step=welcome</Redirect>`
    );
  }

  if (step === 'menu') {
    const lang = q.lang || (digits === '2' ? 'en' : 'es');
    const say = lang === 'en' ? en : es;
    const menu = lang === 'en'
      ? 'For JurisRD, press 1. For Cuadrato, press 2. For TADR, press 3. For Scuba D R, press 4. For Dren Group, press 5. For Vythally, press 6. For O2 Tribe, press 7.'
      : 'Para JurisRD, oprima 1. Para Cuadrato, oprima 2. Para TADR, oprima 3. Para Scuba D R, oprima 4. Para Dren Group, oprima 5. Para Vythally, oprima 6. Para O2 Tribe, oprima 7.';
    return xml(
      `<Gather numDigits="1" action="${BASE}?step=route&amp;lang=${lang}" method="POST" timeout="7">` +
        say(menu) +
      `</Gather>` +
      `<Redirect method="POST">${BASE}?step=menu&amp;lang=${lang}</Redirect>`
    );
  }

  if (step === 'route') {
    const lang = q.lang === 'en' ? 'en' : 'es';
    const say = lang === 'en' ? en : es;
    const prod = PRODUCTS[digits];
    if (!prod) {
      return xml(say(lang === 'en' ? 'Sorry, invalid option.' : 'Opción inválida.') +
        `<Redirect method="POST">${BASE}?step=menu&amp;lang=${lang}</Redirect>`);
    }
    const name = prod[lang];
    const greet = lang === 'en'
      ? `Thanks for calling about ${name}. Please leave your name, number, and a brief message after the tone, and our team will get back to you.`
      : `Gracias por llamar sobre ${name}. Por favor deje su nombre, número y un mensaje breve después del tono, y nuestro equipo le devolverá la llamada.`;
    const bye = lang === 'en' ? 'Thank you. Goodbye.' : 'Gracias. Hasta luego.';
    return xml(
      say(greet) +
      `<Record maxLength="120" playBeep="true" transcribe="true" trim="trim-silence"/>` +
      say(bye) + `<Hangup/>`
    );
  }
  return xml(`<Redirect method="POST">${BASE}?step=welcome</Redirect>`);
};
