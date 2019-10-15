import React from 'react';
import './App.css';

import { withStyles } from '@material-ui/core/styles';

import openSocket from 'socket.io-client';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import AuthForm from './containers/Auth';
import Main from './containers/Main';

const socket = openSocket('http://157.245.87.115:8000');

const styles = theme => ({
  root: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#503ab7',
  }
})

class App extends React.Component {

  componentDidMount() {
    console.log(this.props.history)
  }

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root}>
        <Router>
          <Route path="/" exact render={(props) => <AuthForm {...props} socket={socket} />} />
          <Route path="/:room" exact render={(props) => <Main {...props} socket={socket} />} />
        </Router>
      </div>
    );
  }
  
}

export default withStyles(styles)(App);
