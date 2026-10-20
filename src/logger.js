//escribe un eventos por línea en formato JSON (logs estructurados).
function log(level, message, datos = {}) {
    //Jest define NODE_ENV=test: no ensuciamos la salida de los tests con logs.
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...datos,
    }));
}

module.exports = log;