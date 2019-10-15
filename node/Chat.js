export class User {
    constructor(name, roomId, socketId, peerId) {
        this.name = name;
        this.roomId = roomId;
        this.socketId = socketId;
        this.peerId = peerId;
        this.UUID = this.getUUID();
    }

    getUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c, r) => ('x' == c ? (r = Math.random() * 16 | 0) : (r & 0x3 | 0x8)).toString(16));
    }
}

export class Room {
    constructor(owner, id) {
        // this.userOne = userOne;

        // messages = {
        //     user: [{
        //         time : timestamp,
        //         message : message,
        //     }, ...]
        // }
        this.id = id;
        this.owner = owner;
        this.messages = {
            [owner.name]: []
        };
        this.users = [];
        this.users.push(owner);
        this.peers = [];
    }

    addMessage(text, name) {
        this.messages[name].push({
            time: Date.now(),
            text: text
        })
    }
    
    addToRoom(user) {
        this.users.push(user);
        this.messages[user.name] = [];
    }

    addPeer(peer) {
        this.peers.push(peer);
        console.log(this.peers)
    }

    getPeers() {
        return this.peers;
    }

    getUsers() {
        return this.users;
    }

    getMessages() {
        return this.messages;
    }

    deleteUser(socketId) {
        this.users.forEach(user => {
            if (user.socketId == socketId) {
                delete this.users[this.users.indexOf(user)];
            }
        })
    }
}

export class Controller {
    constructor() {
        this.users = {};
        this.rooms = {};
        this.usernames = [];
    }

    getUnique() {
        return `R${(~~(Math.random() * 1e8)).toString(16)}`;
    }

    addChatRoom(owner, id) {
        this.rooms[id] = new Room(owner, id);
    }

    addToChatRoom(id, user) {
        this.rooms[id].addToRoom(user);
    }

    addUser(user) {
        // console.log(user)
        let id = user.roomId;

        if (this.usernames.includes(user.name)) {
            return {error: 'Пользователь с таким именем уже существует'}
        }

        if (!id) {
            id = this.getUnique();
            user.roomId = id
            this.addChatRoom(user, id)
        } else {
            if (this.rooms[user.roomId]) {
                this.rooms[user.roomId].addToRoom(user);
            } else {
                this.addChatRoom(user, user.roomId);
                // console.log('custom room', user);
                // console.log('custom room', this.rooms);
                this.rooms[user.roomId].addToRoom(user)
            }
        }
        this.users[user.UUID] = user;
        this.usernames.push(user.name);
        return id
    }

    getAllUsers() {
        return this.users
    }

    getUsersInRoom(id) {
        return this.rooms[id].getUsers() || [];
    }

    handleMessage(message, roomId, name) {
        this.rooms[roomId].addMessage(message, name);
    }

    getMessagesInRoom(id) {
        return this.rooms[id].getMessages();
    }

    addPeerToRoom(roomId, peerId) {
        this.rooms[roomId].addPeer(peerId);
    }

    getPeersFromRoom(id) {
        console.log(this.rooms, id)
        return this.rooms[id].getPeers();
    }

    deleteUserFromRoom(socketId) {
        let room;
        Object.keys(this.users).forEach(key => {
            if (this.users[key].socketId == socketId) {
                room = this.users[key].roomId;
                this.rooms[room].deleteUser(socketId);
            }
                
        })
        return room;
        
    }
}