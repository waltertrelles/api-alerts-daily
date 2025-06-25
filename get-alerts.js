const axios = require('axios');
const fs = require('fs');

// ✅ Cargar variables desde entorno (GitHub Secrets)
const CLIENT_ID = process.env.LOCATION_CLIENT_ID;
const CLIENT_SECRET = process.env.LOCATION_CLIENT_SECRET;
const AUDIENCE = process.env.LOCATION_AUDIENCE;

// 🌐 Paso 1: Obtener token desde Auth0
async function obtenerToken() {
  const url = 'https://location-world.auth0.com/oauth/token';
  const datos = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    audience: AUDIENCE,
    grant_type: 'client_credentials'
  };

  const respuesta = await axios.post(url, datos, {
    headers: { 'Content-Type': 'application/json' }
  });

  return respuesta.data.access_token;
}

// 🌐 Paso 2: Consultar Customer API
async function obtenerAlertas(token) {
  const url = 'https://customer-api.location-world.com/YPF/CruceroDelNorte/alerts'; // <- cambiar si es necesario

  const respuesta = await axios.post(url, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return respuesta.data;
}

// 🧾 Paso 3: Guardar resultado como CSV
function guardarComoCSV(datos) {
  const filas = datos.map(d => Object.values(d).join(';')).join('\n');
  const encabezado = Object.keys(datos[0]).join(';');
  fs.writeFileSync('resultados-alertas.csv', encabezado + '\n' + filas);
}

// 🔁 Ejecución total
(async () => {
  try {
    const token = await obtenerToken();
    const datos = await obtenerAlertas(token);
    guardarComoCSV(datos);
    console.log('✅ Alertas guardadas en resultados-alertas.csv');
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
})();
