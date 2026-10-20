const crearApp = require('./app');
const log = require('./logger');

const PORT = process.env.PORT || 3000;

const servidor = crearApp().listen(PORT, () => {
    log('info', 'API escuchando', { port: Number(PORT), version: process.env.APP_VERSION || 'dev' });
});

//docker y render piden cerrar la app con ctrl c. se dejan de aceptar conexiones nuevas, se terminan las que estan en curso y recien ahi se sale.
function apagar(senal) {
    log('info', 'cerrando el servidor', { signal: senal });
    servidor.close(() => {
        process.exit(0);
    });
}

process.on('SIGTERM', apagar);
process.on('SIGINT', apagar);