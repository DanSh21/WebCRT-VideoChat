import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
    self: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '60%',
        marginTop: 10,
        backgroundColor: '#303F9F',
        color: '#fff',
        padding: 10,
        wordWrap: 'break-word',
        alignSelf: 'flex-end'
    },
    from: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '60%',
        marginTop: 10,
        backgroundColor: '#C5CAE9',
        color: '#000',
        padding: 10,
        wordWrap: 'break-word',
    },
    avatar: {
        display: 'flex',
        backgroundColor: red[400],
    },
    name: {
        display: 'flex',
        verticalAlign: 'top',
        flexDirection: 'column',
    },
    text: {
        maxWidth: 200,
    }
}));

export default function Message(props) {
    const classes = useStyles();

    return (
        <>
            { props.self ?
                <Paper className={classes.self}>
                    <Typography className={classes.name}>
                        {props.name + ' ' + props.time}
                    </Typography>
                    <Typography className={classes.text}> 
                        {props.text}
                    </Typography>
                </Paper>
                :
                <Paper className={classes.from}>
                    <Typography className={classes.name}>
                        {props.name + ' ' + props.time}
                    </Typography>
                    <Typography className={classes.text}>
                        {props.text}
                    </Typography>
                </Paper>
            }
        </>
        
    );
}