const client = require('prom-client');

//aca es donde se guardan todas las métricas de la app.
const registro = new client.Registry();

// Métricas estándar del proceso de Node: CPU, memoria, etc.
client.collectDefaultMetrics({ register: registro });

// Histograma de duración de las peticiones: de acá salen tráfico, latencia y errores.
const duracionPeticiones = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duración de las peticiones HTTP en segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
    registers: [registro],
});

module.exports = { registro, duracionPeticiones };