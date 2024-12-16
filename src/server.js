const express = require('express');
const path = require('path');
const open = require('open');

const app = express();
let server;

function startVisualizationServer(data) {
    return new Promise((resolve) => {
        app.use(express.static(path.join(__dirname, 'public')));

        app.get('/data', (req, res) => {
            res.json(data);
        });

        server = app.listen(3000, async () => {
            console.log('Server running at https://hbar.onrender.com');
            await open('https://hbar.onrender.com');
            resolve();
        });
    });
}

module.exports = { startVisualizationServer };