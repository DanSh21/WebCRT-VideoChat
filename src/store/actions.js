export const GET_AUTH = 'GET_AUTH';
export const GET_AUTH_ERROR = 'GET_AUTH_ERROR';
export const CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR';
export const FETCH_MESSAGES = 'MESSAGES_GET';
export const FETCH_MESSAGE_SEND = 'MESSAGES_SEND';
export const MESSAGES_GET_NEW = 'MESSAGES_GET_NEW';
export const FETCH_USERS = 'FETCH_USERS';
export const SET_ROOM = 'SET_ROOM';
export const FETCH_PEERS = 'FETCH_PEERS';
export const FETCH_USER_PEER = 'FETCH_USER_PEER';

export function fetchAuth(name, room, UUID) {
    return {
        type: GET_AUTH,
        name: name,
        room: room,
        UUID: UUID
    }
}

export function fetchAuthError(error) {
    return {
        type: GET_AUTH_ERROR,
        error: error
    }
}

export function fetchClearAuthError() {
    return {
        type: CLEAR_AUTH_ERROR
    }
}

export function setRoom(room) {
    return {
        type: SET_ROOM,
        room: room,
    }
}

export function fetchMessages(data) {
    return {
        type: FETCH_MESSAGES,
        messages: data
    }
}

export function fetchMessagesSend() {
    return {
        type: FETCH_MESSAGE_SEND
    }
}

export function fetchMessagesGetNew() {
    return {
        type: MESSAGES_GET_NEW
    }
}

export function fetchUsers(users) {
    return {
        type: FETCH_USERS,
        users: users
    }
}

export function fetchPeers(data) {
    return {
        type: FETCH_PEERS,
        peers: data
    }
}

export function fetchUserPeer(data) {
    return {
        type: FETCH_USER_PEER,
        userPeer: data
    }
}

export function getAuth(data) {
    return dispatch => {
        console.log(data);
        if (data.error) {
            dispatch(fetchAuthError(data.error));
        }
        dispatch(fetchAuth(data.name, data.roomId, data.UUID));
    }
}

export function clearAuthError() {
    return dispatch => {
        dispatch(fetchClearAuthError())
    }
}

export function getRoom(room){
    return dispatch => {
        dispatch(setRoom(room))
    }
}

export function getMessages(messages, user) {
    return dispatch => {
        dispatch(fetchMessages(messages));
    }
}

export function getUsers(data) {
    return dispatch => {
        console.log('DATA', data);
        dispatch(fetchUsers(data));
    }
}

export function sendMessage(message) {
    return dispatch => {
        dispatch(fetchMessages(message));
    }
}

export function setPeers(data) {
    return dispatch => {
        console.log('PEER', data)
        dispatch(fetchPeers(data))
    }
}

export function setUserPeer(data) {
    return dispatch => {
        dispatch(fetchUserPeer(data))
    }
}