import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/Button';

import SendIcon from '@material-ui/icons/Send';
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import DesktopAccessDisabledIcon from '@material-ui/icons/DesktopAccessDisabled';

import User from '../components/User';
import Message from '../components/Message';
import Video from '../components/Video';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sendMessage, getMessages, getUsers, setRoom, setUserPeer, setPeers } from '../store/actions';

function compare(a, b) {
    if (a.time < b.time) {
        return -1;
    }
    if (a.time > b.time) {
        return 1;
    }
    return 0;
}

const styles = theme => ({
    root: {
        display: 'flex',
        width: '100%',
    },
    chatWindow: {
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '30%',
    },
    chatHeader: {
        display: 'flex',
        maxWidth: '100%',
        height: 64,
        backgroundColor: '#303F9F',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        color: '#fff',
    },
    chatContent: {
        display: 'flex',
        height: '100%',
    },
    title: {
        width: '100%'
    },
    videoBlock: {
        display: 'flex',
        flexFlow: 'row wrap',
        flexBasis: '70%',
        justifyContent: 'center',
        overflowY: 'auto',
        // alignItems: 'center',
        padding: '0 10px',
    },
    video: {
        display: 'flex',
        flexBasis: 'content',
        marginTop: 50,
        marginRight: 20,
    },
    selfVideo: {
        display: 'flex',
        position: 'absolute',
        flexBasis: 'content',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        bottom: 10,
        right: 10,
    },
    videoContainer: {
        maxHeight: '100%',
    },
    users: {
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '30%',
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    chat: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexBasis: '70%',
        maxWidth: '100%',
        padding: 10,
    },
    messages: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        flexGrow: 1,
        overflowY: 'auto',
        maxHeight: '100%',
        maxWidth: '100%',
    },
    form: {
        display: 'flex',
        flexDirection: 'row',
    },
    textField: {
        display: 'flex',
        width: '90%',
        paddingRight: 10,
    },
    button: {
        display: 'flex',
        alignSelf: 'flex-end',
    }
})

class Chat extends React.Component {
    constructor(props) {
        super(props)

        // max videos 20
        this.state = {
            videos: [],
            selfVideo: '',
        };

        this.peerConnectionConfig = {
            'iceServers': [
                { 'urls': 'stun:stun.services.mozilla.com' },
                { 'urls': 'stun:stun.l.google.com:19302' },
            ]
        };
        this.connections = {};

        this.handleSend = this.handleSend.bind(this);
        this.handleChangeMessage = this.handleChangeMessage.bind(this);
        this.startCapturing = this.startCapturing.bind(this);
        this.stopCapturing = this.stopCapturing.bind(this);
        this.addVideo = this.addVideo.bind(this);
        this.deleteVideo = this.deleteVideo.bind(this);
        this.stopCapturing = this.stopCapturing.bind(this);
    }

    componentDidMount() {
        const { getMessages, socket, getUsers, name, setRoom, setPeers, setUserPeer } = this.props;
        const roomId = this.props.match.params.room;

        if (!name && !roomId) {
            this.props.history.push('/')
            return
        }

        if (!name && roomId) {
            setRoom(roomId)
            this.props.history.push('/')
            return
        }

        socket.emit('getMessages', roomId);
        socket.emit('getUsers', roomId);

        socket.on('MessagesData', data => {
            getMessages(data);
        })

        socket.on('getUsers', data => {
            getUsers(data);
        })

        socket.on('userDisconnect', id => {
            this.deleteVideo(id);
        })

        let gotMessageFromServer = (fromId, message) => {
            var signal = JSON.parse(message)

            if (fromId != socket.id) {
                if (signal.sdp) {
                    this.connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                        if (signal.sdp.type == 'offer') {
                            this.connections[fromId].createAnswer().then(description => {
                                this.connections[fromId].setLocalDescription(description).then(() => {
                                    socket.emit('signal', fromId, JSON.stringify({ 'sdp': this.connections[fromId].localDescription }));
                                }).catch(e => console.log(e));
                            }).catch(e => console.log(e));
                        }
                    }).catch(e => console.log(e));
                }

                if (signal.ice) {
                    this.connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
                }
            }
        }

        socket.on('signal', gotMessageFromServer);

        socket.on('user-joined', (id, count, clients) => {
            clients.forEach((socketListId) => {
                if (!this.connections[socketListId]) {
                    this.connections[socketListId] = new RTCPeerConnection(this.peerConnectionConfig);    
                    this.connections[socketListId].onicecandidate = event => {
                        if (event.candidate != null) {
                            socket.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }

                    this.connections[socketListId].onaddstream = event => {
                        this.addVideo(event.stream, socketListId);
                    }

                    if (this.state.stream)
                        this.connections[socketListId].addStream(this.state.stream);
                }
            });

            if (count >= 1) {
                this.connections[id].createOffer().then(description => {
                    this.connections[id].setLocalDescription(description).then(() => {
                        socket.emit('signal', id, JSON.stringify({ 'sdp': this.connections[id].localDescription }));
                    }).catch(e => console.log(e));
                });
            }
        });

        socket.emit('user-joined', roomId);
    }

    startScreenCapture() {
        if (navigator.getDisplayMedia) {
            return navigator.getDisplayMedia({ video: true, audio: true });
        } else if (navigator.mediaDevices.getDisplayMedia) {
            return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        } else {
            return navigator.mediaDevices.getUserMedia({ video: { mediaSource: 'screen' }, audio: true });
        }
    }

    addVideo(stream = this.state.stream, id = 'video:id') {
        const { users } = this.props;
        let height = stream.getVideoTracks()[0].getSettings().height;
        let width = stream.getVideoTracks()[0].getSettings().width;
        let videos = this.state.videos;

        let property = users.find(obj => {
            return obj.socketId === id
        })

        videos[id] = <Video self id={id} height={height} width={width} stream={stream} name={property.name}/>
        Object.keys(videos).forEach((key) => (videos[key] == null) && delete videos[key]);
        this.setState({ videos })
    }

    deleteVideo(id) {
        let videos = this.state.videos;
        videos[id] = undefined;
        Object.keys(videos).forEach((key) => (videos[key] == null) && delete videos[key]);
        this.setState({ videos });
    }

    addSelfVideo(stream = this.state.stream, id = 'video:id') {
        // console.log(stream, id);
        let height = stream.getVideoTracks()[0].getSettings().height;
        let width = stream.getVideoTracks()[0].getSettings().width;
        let selfVideo = <Video id={id} height={height} width={width} stream={stream}/>
        this.setState({ selfVideo })
    }

    async startCapturing() {
        const { socket, room } = this.props;

        let stream = await this.startScreenCapture();
        console.log(stream);
        this.addSelfVideo(stream, 'selfVideo');
        this.setState({ stream })
        socket.emit('user-joined', room);
        Object.keys(this.connections).forEach( key => {
            this.connections[key].addStream(stream);
        })
    }

    stopCapturing() {
        // console.log('Stop video', this.state);
        const { stream } = this.state;
        const { socket, room } = this.props;

        stream.getTracks().forEach(track => track.stop());
        socket.emit('userStopStream', room)

        this.setState({
            mediaRecorder: null,
            stream,
            selfVideo: null,
        })

    }

    handleSend() {
        const { room, name, socket } = this.props;
        socket.emit('sendMessage', this.state.message, room, name);
        this.setState({ message: '' })
    }

    handleChangeMessage(event) {
        this.setState({ message: event.target.value })
    }

    render() {
        const classes = this.props.classes
        const messagesData = this.props.messages;
        const { users, name } = this.props;
        const roomId = this.props.match.params.room;

        let messages = [];

        for(let author in messagesData) {
            if (author == name) {
                messagesData[author].map(message => {
                    messages.push({ time: message.time, author: author, text: message.text, self: true })
                })
            } else {
                messagesData[author].map(message => {
                    messages.push({ time: message.time, author: author, text: message.text, self: false })
                })
            }
        }

        messages.sort( compare );
        return (
            <div className={classes.root}>
                <Paper className={classes.chatWindow}>
                    <div className={classes.chatHeader}>
                        <h1>CHAT ROOM: {roomId}</h1>
                    </div>
                    <div className={classes.chatContent}>
                        <div className={classes.users}>
                            {users.map(user => {
                                return <User name={user.name} key={user.name}/>
                            })
                            }
                        </div>
                        <Divider orientation='vertical' />
                        <div className={classes.chat}>
                            <div className={classes.tooltip}>
                                <IconButton onClick={this.startCapturing}>
                                    <DesktopWindowsIcon />
                                </IconButton>
                                <IconButton onClick={this.stopCapturing}>
                                    <DesktopAccessDisabledIcon />
                                </IconButton>
                            </div>
                            <div className={classes.messages}>
                                {messages.map(message => {
                                    let time = new Date(message.time).toLocaleString('ru', {
                                        hour: 'numeric',
                                        minute: 'numeric',
                                    });
                                    return <Message self={message.self} name={message.author} text={message.text} time={time} key={message.key}/> 
                                })}
                            </div>
                            <Divider />
                            <div className={classes.form}>
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="Message"
                                    multiline
                                    rowsMax="5"
                                    className={classes.textField}
                                    margin="normal"
                                    value={this.state.message}
                                    onChange={this.handleChangeMessage}
                                />
                                <IconButton className={classes.button} onClick={this.handleSend}>
                                    <SendIcon />
                                </IconButton>
                            </div>
                        </div>
                    </div>
                    
                </Paper>
                <div className={classes.videoBlock}>
                    { this.state.selfVideo }
                    <Grid container spacing={2} className={classes.videoContainer}>
                        {this.state.videos.map(video => {
                            // console.log(this.state.videos.length);
                            if (this.state.videos.length < 4) {
                                return <Grid item xs={12 / this.state.videos.length}>{video}</Grid>
                            }
                            return <Grid item xs={3}>{video}</Grid>
                        })}
                        {Object.keys(this.state.videos).map(key => {
                            console.log(this.state.videos);
                            if (Object.keys(this.state.videos).length < 4) {
                                return <Grid item xs={12 / Object.keys(this.state.videos).length}>{this.state.videos[key]}</Grid>
                            }
                            return <Grid item xs={3}>{this.state.videos[key]}</Grid>
                        })}
                    </Grid>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    messages: state.chat.messages,
    users: state.chat.users,
    name: state.chat.name,
    room: state.chat.room,
    UUID: state.chat.UUID,
    peers: state.chat.peers,
    userPeer: state.chat.userPeer,
})

const mapDispatchToProps = dispatch => bindActionCreators({
    sendMessage: sendMessage,
    getMessages: getMessages,
    getUsers: getUsers,
    setRoom: setRoom,
    setUserPeer: setUserPeer,
    setPeers: setPeers,
}, dispatch)

export default compose(
    withStyles(styles, {
        name: 'Chat',
    }),
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
)(Chat);
