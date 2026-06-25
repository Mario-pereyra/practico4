const net = require('net');

const port = 5433;
const host = '127.0.0.1';
const maxAttempts = 30;
const delay = 1000; // 1 segundo de espera entre intentos

let attempts = 0;

function checkConnection() {
  attempts++;
  console.log(`Verificando conexión con la base de datos en ${host}:${port} (Intento ${attempts}/${maxAttempts})...`);
  
  const client = new net.Socket();
  
  client.connect({ port, host }, () => {
    console.log('¡La base de datos está activa y aceptando conexiones!');
    client.destroy();
    process.exit(0);
  });
  
  client.on('error', () => {
    client.destroy();
    if (attempts >= maxAttempts) {
      console.error('No se pudo conectar a la base de datos a tiempo. Saliendo.');
      process.exit(1);
    }
    setTimeout(checkConnection, delay);
  });
}

checkConnection();
