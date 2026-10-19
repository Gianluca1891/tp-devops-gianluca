const crearApp = require('./app');

const PORT = process.env.PORT || 3000;

const servidor = crearApp().listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
});

//docker y render piden cerrar la app con ctrl c. se dejan de aceptar conexiones nuevas, se terminan las que estan en curso y recien ahi se sale.
function apagar(senal) {
    console.log(`Recibida ${senal}, cerrando el servidor...`);
    servidor.close(() => {
        process.exit(0);
    });
}

process.on('SIGTERM', apagar);
process.on('SIGINT', apagar);