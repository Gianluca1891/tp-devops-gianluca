const crearApp = require('./app');

const PORT = process.env.PORT || 3000;

crearApp().listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
});