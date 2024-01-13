const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/ui/index.html');
});

let messages = [];

wss.on('connection', (ws, req) => {
    const ipAddress = req.connection.remoteAddress;

    // Используем регулярное выражение для извлечения чистого IPv4 адреса
    const ipv4Address = ipAddress.replace(/^.*:/, '');

    if (messages.length !== 0) {
        // Отправляем предыдущие сообщения клиенту
        ws.send(JSON.stringify(messages.map(msg => `[${msg.ip}]: ${msg.text}`)));
    }

    // Обработчик входящих сообщений от клиента
    ws.on('message', (message) => {
        message = message.toString();
        
        // Сохраняем сообщение в массив с информацией об IP-адресе
        const userMessage = { ip: ipv4Address, text: message };
        messages.push(userMessage);

        // Отправляем сообщение всем подключенным клиентам
        broadcast(userMessage);
    });
});

server.listen(5000, () => {
    console.log('Сервер запущен на порту 5000');
});

function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`[${message.ip}]: ${message.text}`);
        }
    });
}
