import React from 'react';
import { connect } from 'react-redux';
import { userActions } from '../actions';
import { Redirect } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

class Logout extends React.Component {
  componentDidMount() {
    this.props.logout();
    return this.props.history.push('login');
  }

  render() {
    if (!this.props.loading && !this.props.loggedIn) {
      return <Redirect to="/login" />;
    }
    return (
      this.props.loading && <CircularProgress color="secondary" size={24} />
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
  common: state.common,
});
const mapDispatchToProps = {
  ...userActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
