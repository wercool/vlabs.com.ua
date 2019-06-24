import React, { Component, Fragment } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = {
    root: {
        width: '100%',
    },
};

class ValterServices extends Component {
    constructor(props) {
        super();

        this.App = props.App;

        this.state = {
            tuplesNum: undefined
        };

        this.getSLAMTuplesZipped = this.getSLAMTuplesZipped.bind(this);
    }

    componentDidMount() {
        this.getSLAMTuplesZipped();
    }

    getSLAMTuplesZipped() {
        this.getTuplesNumPromise = 
        this.App.VLabsRESTClientManager
        .ValterService
        .getTuplesNum()
        .then((tuplesNum) => {
            this.setState({
                tuplesNum: tuplesNum
            });
        });
    }

    render() {
        return(
            <Fragment>
                <List style={styles.root}>
                    <ListItem button onClick={ this.getSLAMTuplesZipped }>
                        <ListItemText primary={ "SLAM Learning tuples (" + this.state.tuplesNum + ") zipped" } />
                        {
                            this.state.tuplesNum === undefined ?
                                <CircularProgress variant="indeterminate" disableShrink size={24} thickness={4} />
                                : ''
                        }
                    </ListItem>
                </List>
            </Fragment>
        );
    }
}
export default ValterServices;