import React, { Component } from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';

import { connect } from 'react-redux';
import { reportActions, userActions } from '../actions';

import { withLocalize } from 'react-localize-redux';

import LoadingOverlay from 'react-loading-overlay';

import { Header, SnackMessage, Instructions } from '../components';

import PendingContainer from './Report/PendingContainer';
import ReportContainer from './Report/ReportContainer';

import ErrorPage from './ErrorPage';

import { Config } from '../secret_config.js';

function PrivateRoute({ component: Component, data, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
          <Component {...data} {...props} />
      }
    />
  );
}

class Root extends Component {
  constructor(props) {
    super(props);

    // basic init of localization component
    this.props.initialize({
      languages: [{ name: 'English', code: 'en' }],
      options: {
        renderToStaticMarkup,
        renderInnerHtml: false,
        defaultLanguage: 'en',
      },
    });
  }

  componentDidMount() {
    const { username, fetchUser } = this.props;
    if (!username) {
      fetchUser();
    }
    document.addEventListener('keydown', this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false);
  }

  handleMsgClose = () => {
    this.props.resetMessage();
  };

  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.props.resetMessage();
    }
  };

  render() {
    return (
        <Router basename={Config.BASENAME}>
          <div>
            <LoadingOverlay
              active={this.props.common.loading}
              spinner
              text={
                this.props.common.loadingMessage || 'Loading your content...'
              }
            >
              <div className="app">
                <Header
                  className="header"
                  role={this.props.user.role}
                  getRequest={this.props.getRequest}
                />
                {this.props.common.serverError ? (
                  <ErrorPage />
                ) : (
                  <React.Fragment>
                    <PrivateRoute
                      path="/pending"
                      component={PendingContainer}
                    />

                    <PrivateRoute
                      // exact
                      path="/request/:requestId"
                      component={ReportContainer}
                    />
                    <PrivateRoute
                      exact
                      path="/"
                      component={ReportContainer}
                    />

                    <PrivateRoute
                      data={{ role: this.props.user.role }}
                      exact
                      path="/instructions"
                      component={Instructions}
                    />
                  </React.Fragment>
                )}
                {this.props.common.message &&
                this.props.common.message.length > 0 ? (
                  <span>
                    <SnackMessage
                      open
                      type={this.props.error ? 'error' : 'info'}
                      message={this.props.common.message}
                      handleClose={this.handleMsgClose}
                    />
                  </span>
                ) : null}
              </div>
            </LoadingOverlay>
          </div>
        </Router>
    );
  }
}

const mapStateToProps = (state) => ({
  common: state.common,
  user: state.user,
  report: state.report,
});
const mapDispatchToProps = {
  ...userActions,
  ...reportActions
};

export default withLocalize(connect(mapStateToProps, mapDispatchToProps)(Root));

