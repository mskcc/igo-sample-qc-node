import React from 'react';
import { connect } from 'react-redux';
import { commonActions } from '../actions';
import { Redirect } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Message } from '../components';

class ErrorPage extends React.Component {
  render() {
    if (!this.props.error) {
      return <Redirect to="/" />;
    }
    return (
      <React.Fragment>
        {this.props.message && <Message msg={this.props.message} />}

        {this.props.loading && <CircularProgress color="secondary" size={24} />}
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => ({
  ...state.common,
});
const mapDispatchToProps = {
  ...commonActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(ErrorPage);
