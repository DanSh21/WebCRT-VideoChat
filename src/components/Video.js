import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    root: {

    },
    video: {
        display: 'flex',
        width: '100%',
        marginTop: 50,
        marginRight: 20,
    },
    selfVideo: {
        display: 'flex',
        position: 'absolute',
        height: 250,
        width: 'auto',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        bottom: 10,
        right: 20,
    },
    name: {
        padding: 5,
    }
})

class Video extends React.Component {
    constructor(props) {
        super(props)

        this.video = React.createRef();

        this.setRef = this.setRef.bind(this);
    }

    componentDidMount() {
        this.video.srcObject = this.props.stream;
        this.video.play();
    }

    setRef(ref) {
        this.video = ref;
    }

    render() {
        const { classes, id, self, name } = this.props;
        return (
            <>
                {self ?
                    <Paper className={classes.root}>
                        <video ref={this.setRef} id={id} autoPlay className={classes.video} />
                        <Typography className={classes.name}>
                            {name}
                        </Typography>
                    </Paper>
                    :
                    <video ref={this.setRef} id={id} autoPlay className={classes.selfVideo} />
                }
            </>
            
        )
    }
}

export default withStyles(styles)(Video);