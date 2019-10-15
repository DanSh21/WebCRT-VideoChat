import React from 'react';
import Peer from 'peerjs';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getAuth, setUserPeer, setPeers, clearAuthError } from '../store/actions';

const styles = theme => ({
    root: {
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
        selfAlign: 'flex-end',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        // justifyContent: 'center',
        padding: '20px 50px',
    },
    field: {
        alignSelf: 'center',
    },
    button: {
        marginTop: 20,
        margin: '0 auto',
    }
})

class AuthForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            name: ''
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleAuth = this.handleAuth.bind(this);
    }

    componentDidMount() {
        const { getAuth, socket, name, room } = this.props;
        if (name) {
            this.props.history.push(`/${room}`);
        }

        socket.on('sendAuth', data => {
            if (data) {
                getAuth(data);
            }
        })
        
    }

    componentDidUpdate() {
        const { name, room, authError } = this.props;

        if (name && room) {
            this.props.history.push(`/${room}`);
        }

        if (authError !== this.state.authError) {
            this.setState({ authError })
        }
    }

    handleAuth() {
        const { socket } = this.props;
        const roomId = this.props.room;
        socket.emit('auth', this.state.name, roomId);
    }

    handleChange(event) {
        console.log(this.state)

        this.setState({ [event.target.id]: event.target.value, authError: undefined })

    }

    render() {
        const classes = this.props.classes
        const { room } = this.props;
        console.log(this.state);
        return (
            <div className={classes.root}>
                <Paper className={classes.form}>
                    <h1>WebRTC chat</h1>
                    {room && <h4>Connect to room: { room }</h4> }
                        <TextField
                            id="name"
                            label="Name"
                            className={classes.field}
                            value={this.state.name}
                            onChange={this.handleChange}
                            error={this.props.authError}
                            helperText={this.state.authError}
                        />
                        <Button variant='contained' color='primary' className={classes.button} onClick={this.handleAuth}>
                            Enter chat
                        </Button>
                </Paper>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    messages: state.chat.messages,
    name: state.chat.name,
    room: state.chat.room,
    authError: state.chat.authError,
})

const mapDispatchToProps = dispatch => bindActionCreators({
    getAuth: getAuth
}, dispatch)

export default compose(
    withStyles(styles, {
        name: 'AuthForm',
    }),
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
)(AuthForm);