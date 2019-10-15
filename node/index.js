import express from 'express';
import cors from 'cors';
import http from 'http';
import socket from 'socket.io';

import { User, Room, Controller } from './Chat';

const ioPort = 8000;

const app = express();
app.use(cors());

const server = http.Server(app)
const io = socket(server);

server.listen(ioPort);
io.set('origins', 'localhost:3000');
console.log('socket.io listening on port ', ioPort);

const Chat = new Controller();
// app.listen(port, function () {
//     console.log('listen on ', port);
// });

io.on('connection', function (client) {
    console.log('a user connected');
    client.on('auth', (name, roomId) => {

        let user = new User(name, roomId, client.id)
        let result = Chat.addUser(user);

        if (typeof result == 'string') {

            client.emit('sendAuth', user)
            // client.emit('sendPeers', Chat.getPeersFromRoom(result));

            let users = Chat.getUsersInRoom(result);
            let usersData = [];
            let usersSockets = [];
            users.map(user => {
                usersData.push({
                    name: user.name,
                    socketId: user.socketId
                })
                usersSockets.push(user.socketId)
            })
            users.map(user => {
                io.to(user.socketId).emit('getUsers', usersData);
                client.emit("user-joined", client.id, io.engine.clientsCount, usersSockets);
            })
        } else {
            client.emit('sendAuth', result)
        }
        
    });

    client.on('getUsers', (roomId) => {
        let users = Chat.getUsersInRoom(roomId);
        let usersData = [];

        users.map(user => {
            usersData.push({
                name: user.name,
                socketId: user.socketId
            })
        })

        client.emit('getUsers', usersData);
    });

    client.on('getMessages', (roomId) => {
        client.emit('MessagesData', Chat.getMessagesInRoom(roomId));
    });

    client.on('sendMessage', (message, roomId, name) => {
        Chat.handleMessage(message, roomId, name);

        let users = Chat.getUsersInRoom(roomId);
        users.map(user => {
            io.to(user.socketId).emit('MessagesData', Chat.getMessagesInRoom(roomId));
        })
    });

    // client.on('sendSDP', (roomId, peerId) => {
    //     Chat.addPeerToRoom(roomId, peerId);
    //     console.log('PEERS', Chat.getPeersFromRoom(roomId));
    //     let users = Chat.getUsersInRoom(roomId);
    //     users.map(user => {
    //         io.to(user.socketId).emit('sendPeers', Chat.getPeersFromRoom(roomId));
    //     })
    // });

    client.on('user-joined', roomId => {
        let users = Chat.getUsersInRoom(roomId);
        let usersSockets = [];
        users.map(user => {
            usersSockets.push(user.socketId)
        })
        users.map(user => {
            io.to(user.socketId).emit("user-joined", client.id, io.engine.clientsCount, usersSockets);
        })
    });

    client.on('signal', (toId, message) => {
        console.log('SIGNAl', toId, message);
        io.to(toId).emit('signal', client.id, message);
    });

    client.on("message", data => {
        console.log('MESSAGE', client.id, data);
        io.sockets.emit("broadcast-message", client.id, data);
    })

    client.on('disconnect', () => {
        console.log('DISCONNECT', client.id);
        io.sockets.emit("userDisconnect", client.id);
        let roomId = Chat.deleteUserFromRoom(client.id);
        if (roomId) {
            let users = Chat.getUsersInRoom(roomId);
            console.log(roomId, users);
            let usersData = [];
            users.map(user => {
                if (user) {
                    usersData.push({
                        name: user.name,
                        socketId: user.socketId
                    })
                }
            })
            users.map(user => {
                io.to(user.socketId).emit("getUsers", usersData);
            })
        }
    })

    client.on('userStopStream', () => {
        io.sockets.emit("userDisconnect", client.id);
    })
});