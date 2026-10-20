const request = require('supertest');
const crearApp = require('../src/app');

const reservaValida = { cancha: 2, fecha: '2026-10-20', hora: 21, nombre: 'Gianluca' };

// Antes de cada test se crea una app nueva, sin reservas: cada test arranca limpio.
let app;
beforeEach(() => {
    app = crearApp();
});

describe('GET /health', () => {
    test('responde 200 con status ok', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok', version: 'dev' });
    });
});

describe('GET /metrics', () => {
    test('expone las métricas HTTP en formato Prometheus', async () => {
        await request(app).get('/health');

        const res = await request(app).get('/metrics');

        expect(res.status).toBe(200);
        expect(res.text).toContain('http_request_duration_seconds');
        expect(res.text).toContain('route="/health"');
    });
});

describe('GET /', () => {
    test('redirige a la documentación de Swagger', async () => {
        const res = await request(app).get('/');

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/api-docs');
    });
});

describe('GET /api-docs', () => {
    test('sirve la documentación de Swagger', async () => {
        const res = await request(app).get('/api-docs/');

        expect(res.status).toBe(200);
        expect(res.text).toContain('swagger');
    });
});

describe('POST /reservas', () => {
    test('crea una reserva válida y devuelve 201', async () => {
        const res = await request(app).post('/reservas').send(reservaValida);

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id: 1, ...reservaValida });
    });

    test('devuelve 409 si la cancha ya está reservada en ese horario', async () => {
        await request(app).post('/reservas').send(reservaValida);

        const res = await request(app).post('/reservas').send(reservaValida);

        expect(res.status).toBe(409);
    });

    test('permite reservar otra cancha en el mismo horario', async () => {
        await request(app).post('/reservas').send(reservaValida);

        const res = await request(app).post('/reservas').send({ ...reservaValida, cancha: 3 });

        expect(res.status).toBe(201);
    });

    test('devuelve 400 si la hora está fuera del horario', async () => {
        const res = await request(app).post('/reservas').send({ ...reservaValida, hora: 25 });

        expect(res.status).toBe(400);
    });

    test('devuelve 400 si la cancha no existe', async () => {
        const res = await request(app).post('/reservas').send({ ...reservaValida, cancha: 7 });

        expect(res.status).toBe(400);
    });

    test('devuelve 400 si falta el nombre', async () => {
        const res = await request(app).post('/reservas').send({ ...reservaValida, nombre: '' });

        expect(res.status).toBe(400);
    });

    test('devuelve 400 si no se envía cuerpo', async () => {
        const res = await request(app).post('/reservas');

        expect(res.status).toBe(400);
    });
});

describe('GET /reservas/:id', () => {
    test('devuelve la reserva si existe', async () => {
        await request(app).post('/reservas').send(reservaValida);

        const res = await request(app).get('/reservas/1');

        expect(res.status).toBe(200);
        expect(res.body.nombre).toBe('Gianluca');
    });

    test('devuelve 404 si no existe', async () => {
        const res = await request(app).get('/reservas/99');

        expect(res.status).toBe(404);
    });
});

describe('DELETE /reservas/:id', () => {
    test('cancela la reserva y después ya no existe', async () => {
        await request(app).post('/reservas').send(reservaValida);

        const borrado = await request(app).delete('/reservas/1');
        const consulta = await request(app).get('/reservas/1');

        expect(borrado.status).toBe(204);
        expect(consulta.status).toBe(404);
    });

    test('devuelve 404 si la reserva no existe', async () => {
        const res = await request(app).delete('/reservas/99');

        expect(res.status).toBe(404);
    });
});