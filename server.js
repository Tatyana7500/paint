let express = require('express');
let app = express();
let fs = require('fs');
const port = process.env.PORT;
const server_port = process.env.YOUR_PORT || process.env.PORT || 8080;
const server_host = process.env.YOUR_HOST || '0.0.0.0';
let server = require('http').Server(app);
let io = require('socket.io').listen(app.listen(server_port, server_host));

app.use(express.static(__dirname + '/public'));

let clients = [];
let picturesValue = [];
let valueDataBase = "";

io.sockets.on('connection',  function (socket) {
    clients.push(socket);

    valueDataBase = fs.readFileSync("DataBase.json", "utf8");
    if (valueDataBase !== "") {
        picturesValue = valueDataBase.split(",");
        if (picturesValue) {
            for (let i = 0; i < picturesValue.length; i++) {
                socket.emit('data', picturesValue[i]);
            }
        }
    }

    socket.on('data', function (data) {
        if (valueDataBase !== "") {
            valueDataBase = valueDataBase.concat(",");
        }

        valueDataBase = valueDataBase.concat(data);
        fs.writeFileSync("DataBase.json", valueDataBase);

        for (let i = 0; i < clients.length; i++) {
            clients[i].emit('data', data);
        }
    });
});

io.sockets.on('disconnect', function (socket) {

    const index = clients.indexOf(socket);
    if (index > -1) {
        clients.splice(index, 1);
    }

    if (clients.length === 0) {
        fs.writeFileSync("DataBase.json", "");
    }
});