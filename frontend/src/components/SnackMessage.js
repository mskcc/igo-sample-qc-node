// Non-disruptive message at the bottom of any page. Used for messaged like
// - single validation error
// - expired token error

import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';

import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

const styles = (theme) => ({
  close: {
    padding: 0,
    top: 0,
    right: 0,
    position: 'absolute',
  },
  success: {
    backgroundColor: theme.palette.primary.light,
    fontSize: '1em',
    fontWeight: 'bold',
  },
  error: {
    backgroundColor: theme.palette.error.dark,
    fontSize: '1em',

    fontWeight: 'bold',
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
    fontSize: '1em',
    fontWeight: 'bold',
  },
  warning: {
    fontSize: '1em',
    fontWeight: 'bold',
    backgroundColor: theme.palette.secondary.dark,
  },
});

class SnackMessage extends React.Component {
  state = {
    open: true,
  };

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ open: false });
    this.props.handleClose();
  };
  componentDidMount() {
    this.setState({ open: true });
  }

  render() {
    const { message, classes, variant } = this.props;
    return (
      <Snackbar
        open={this.state.open}
        // autoHideDuration={6000}
        onClose={this.handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
          className: variant ? classes[variant] : classes.info,
        }}
        message={<span id="message-id">{message}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={this.handleClose}
          >
            <Icon>close</Icon>
          </IconButton>,
        ]}
      />
    );
  }
}

SnackMessage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SnackMessage);
