// Describe la API para que Swagger UI la muestre en /api-docs.
const VERSION = process.env.APP_VERSION || 'dev';
const openapi = {
    openapi: '3.0.3',
    info: {
        title: 'API de reservas de canchas',
        version: VERSION,
        description: 'TP Integrador DevOps - Reservas de canchas de fútbol 5',
    },
    paths: {
        '/': {
            get: {
                summary: 'Redirige a esta documentación',
                responses: {
                    302: { description: 'Redirección a /api-docs' },
                },
            },
        },
        '/health': {
            get: {
                summary: 'Estado de la API',
                responses: {
                    200: { description: 'La API está funcionando' },
                },
            },
        },
        '/metrics': {
                get: {
                    summary: 'Métricas en formato Prometheus (las lee Grafana)',
                    description: 'Requiere el header Authorization: Bearer <METRICS_TOKEN>.',
                    responses: {
                        200: { description: 'Métricas de la API en texto plano' },
                        401: { description: 'Falta el token o es incorrecto' },
                    },
                },
        },
        '/reservas': {
            get: {
                summary: 'Listar todas las reservas',
                responses: {
                    200: { description: 'Lista de reservas' },
                },
            },
            post: {
                summary: 'Crear una reserva',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/NuevaReserva' },
                        },
                    },
                },
                responses: {
                    201: { description: 'Reserva creada' },
                    400: { description: 'Datos inválidos' },
                    409: { description: 'La cancha ya está reservada en ese horario' },
                },
            },
        },
        '/reservas/{id}': {
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            get: {
                summary: 'Obtener una reserva',
                responses: {
                    200: { description: 'La reserva' },
                    404: { description: 'No existe una reserva con ese id' },
                },
            },
            delete: {
                summary: 'Cancelar una reserva',
                responses: {
                    204: { description: 'Reserva cancelada' },
                    404: { description: 'No existe una reserva con ese id' },
                },
            },
        },
    },
    components: {
        schemas: {
            NuevaReserva: {
                type: 'object',
                required: ['cancha', 'fecha', 'hora', 'nombre'],
                properties: {
                    cancha: { type: 'integer', minimum: 1, maximum: 3, example: 2 },
                    fecha: { type: 'string', example: '2026-10-20' },
                    hora: { type: 'integer', minimum: 10, maximum: 22, example: 21 },
                    nombre: { type: 'string', example: 'Gianluca' },
                },
            },
        },
    },
};

module.exports = openapi;
