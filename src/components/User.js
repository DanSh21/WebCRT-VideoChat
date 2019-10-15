import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        padding: 10,
        maxHeight: 40,
        width: '100%',
    },
    avatar: {
        display: 'flex',
        backgroundColor: red[400],
    },
    name: {
        display: 'flex',
        marginLeft: 10, 
        verticalAlign: 'middle',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
    }
}));

export default function User(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Avatar aria-label="recipe" className={classes.avatar}>
                {props.name.charAt(0).toUpperCase()}
            </Avatar>
            <div className={classes.name}>
                {props.name}
            </div>
        </div>
    );
}