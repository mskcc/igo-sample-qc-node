import React from 'react';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { Translate } from 'react-localize-redux';
import { Redirect } from 'react-router-dom';

import { userActions } from '../actions';

class Login extends React.Component {
  handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    this.props.login(data.get('username'), data.get('password'));
  };

  render() {
    const { submitting, pristine, classes } = this.props;
    if (!this.props.loading && this.props.loggedIn) {
      return <Redirect to="/" />;
    }
    return (
      <Translate>
        {({ translate }) => (
          <Paper elevation={1}>
            <form
              onSubmit={this.handleSubmit}
              id="login"
              className={classes.container}
            >
              <TextField
                id="username"
                name="username"
                required
                label="MSK Username"
                margin="normal"
                inputProps={{ autoFocus: true }}
              />
              <TextField
                id="password"
                name="password"
                required
                label="MSK Password"
                type="password"
                autoComplete="current-password"
                margin="normal"
              />

              <div className="row">
                <Button
                  type="submit"
                  form="login"
                  variant="contained"
                  color="secondary"
                  disabled={pristine || submitting}
                >
                  {submitting ? 'Logging in...' : 'Submit'}
                </Button>
              </div>

              <br />
              <br />
              <br />
              <Typography variant="h7" align="center">
                We highly recommend using Chrome for IGO web applications.
              </Typography>
            </form>
          </Paper>
        )}
      </Translate>
    );
  }
}

const mapStateToProps = (state) => ({
  loggedIn: state.user.loggedIn,
  loading: state.common.loading,
});
const mapDispatchToProps = {
  ...userActions,
};

const styles = (theme) => ({
  container: {
    padding: '2em 5em',

    display: 'grid',
    justifyItems: 'center',
    gridRowGap: '1em',
  },
});

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Login)
);
