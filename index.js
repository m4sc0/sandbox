const express = require('express');
const path = require('node:path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('http://45.77.143.109/sandbox');
});

app.get('/sorting-algo', (req, res) => {
    res.sendFile('/sorting-algo');
});

app.get('/recursive-tree', (req, res) => {
    res.sendFile('/recursive-tree');
});

app.get('/pathfinder', (req, res) => {
    res.sendFile('/pathfinder');
});

app.get('/laserstream', (req, res) => {
    res.sendFile('/laserstream');
})

app.listen(4001, () => {
    console.log('Sandbox listening on port 4001');
})