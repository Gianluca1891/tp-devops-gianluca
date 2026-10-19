const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi');

const CANCHAS = [1, 2,3];
const HORA_DE_APERTURA = 10;
const HORA_DE_CIERRE = 22;

const VERSION = process.env.APP_VERSION || 'dev'; //variable de entorno para actualizar version en ui de swagger

function validarReserva({cancha, fecha, hora, nombre}){
    
    if(!CANCHAS.includes(cancha)){
        return 'La cancha debe ser 1, 2 o 3';
    }

    if(typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return 'La fecha debe tener el formato AAAA-MM-DD';
    }

    if(!Number.isInteger(hora) || hora < HORA_DE_APERTURA || hora > HORA_DE_CIERRE){
        return `La hora debe ser un entero entre ${HORA_DE_APERTURA} y ${HORA_DE_CIERRE}`;
    }

    if(typeof nombre !== 'string' || nombre.trim() === ''){
        return 'Un nombre es obligatorio';
    }

    return null;
}


function crearApp(){

    const app = express();
    app.use(express.json());
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

    //los datos van a vivir en memoria.
    const reservas = [];
    let proximoId = 1;

    app.get('/', (req, res) => {
        res.redirect('/api-docs');
    });

    app.get('/health', (req, res) => {
        res.json({ status: 'ok', version: VERSION });
    });

    app.get('/reservas', (req, res) => {
        res.json(reservas);
    });

    app.get('/reservas/:id', (req, res) =>{
        const reserva = reservas.find((r) => r.id === Number(req.params.id));
        if (!reserva) {
            return res.status(404).json({error: 'Reserva no encontrada'});
        }
        res.json(reserva);
    });


    app.post('/reservas', (req, res) => {
        const datos = req.body ?? {}; /*si alguien manda un POST sin cuerpo, req.body es undefined. El ?? lo reemplaza por un objeto vacío, y la validación devuelve un 400 en lugar de que la app explote con un 500. */

        const error = validarReserva(datos);
        if(error){
            return res.status(400).json({error});
        }

        const ocupada = reservas.some( (r) => r.cancha === datos.cancha && r.fecha === datos.fecha && r.hora === datos.hora);

        if(ocupada){
            return res.status(409).json({error: 'La cancha ese dia a esa hora ya fue alquilada'});
        }

        const reserva = {
            id: proximoId++,
            cancha: datos.cancha,
            fecha: datos.fecha,
            hora: datos.hora,
            nombre: datos.nombre.trim(),
        };

        reservas.push(reserva);
        res.status(201).json(reserva);
    });

    app.delete('/reservas/:id', (req, res) => {
        const indice = reservas.findIndex((r) => r.id === Number(req.params.id));
        if(indice === -1){
            return res.status(404).json({error: 'Reserva con ese ID no encontrado'});
        }

        reservas.splice(indice, 1);
        res.status(204).end();
    });

    return app;
}

module.exports = crearApp;