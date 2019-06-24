import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';

const styles = {
    dashBoardCard: {
        padding: '4mm',
    },
    dashBoardCardImage: {
        objectFit: 'contain',
        width: '150px'
    }
};

class Dashboard extends Component {
    constructor(props) {
        super();

        this.App = props.App;

        this.state = {

        };
    }

    render() {
        return(
            <Fragment>
                <Grid
                    container
                    spacing={16}
                    direction="row"
                    justify="space-evenly"
                    alignItems="flex-start">

                    <Grid item xs>
                        <Card style={styles.dashBoardCard}>
                            <CardContent>
                                <CardActionArea onClick={() => {
                                    this.props.history.push('/users');
                                }}>
                                    <Typography variant="h5" component="h2" gutterBottom>
                                        Users
                                    </Typography>
                                </CardActionArea>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs>
                        <Card style={styles.dashBoardCard}>
                            <CardContent>
                                <Typography variant="h5" component="h2" gutterBottom>
                                    Valter services
                                </Typography>
                                <CardActionArea onClick={() => {
                                    this.props.history.push('/valter-services');
                                }}>
                                    <CardMedia style={styles.dashBoardCardImage}
                                        component="img"
                                        alt="Valter avatar"
                                        height="150"
                                        image="/assets/images/valter/valter-avatar-150w.png"
                                        title="Valter"
                                    />
                                </CardActionArea>
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>
            </Fragment>
        );
    }
}
export default withRouter(Dashboard);