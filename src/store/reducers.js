import { GET_AUTH, FETCH_USERS, FETCH_MESSAGES, SET_ROOM, FETCH_PEERS, FETCH_USER_PEER, GET_AUTH_ERROR, CLEAR_AUTH_ERROR } from './actions'

export const initialState = {
    authPending: false,
    users: [],
}

export function chat(state = initialState, action) {
    // console.log(action)
    switch (action.type) {
        case GET_AUTH:
            return {
                ...state,
                name: action.name,
                room: action.room,
                UUID: action.UUID
            }
        case GET_AUTH_ERROR:
            return {
                ...state,
                authError: action.error
            }
        case CLEAR_AUTH_ERROR:
            return {
                ...state,
                authError: undefined
            }
        case FETCH_USERS:
            return {
                ...state,
                users: action.users
            }
        case FETCH_MESSAGES:
            return {
                ...state,
                messages: action.messages
            }
        case SET_ROOM:
            return {
                ...state,
                room: action.room
            }
        case FETCH_PEERS:
            return {
                ...state,
                peers: action.peers
            }
        case FETCH_USER_PEER:
            return {
                ...state,
                userPeer: action.userPeer
            }
        default: 
            return state;
    }
}