import React, { Component } from 'react';

import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';

import { connect } from 'react-redux';
import { commonActions, userActions } from '../actions';

// import { LocalizeProvider, withLocalize } from "react-localize-redux";
import { withLocalize } from 'react-localize-redux';
import enTranslations from '../translations/en.json';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import LoadingOverlay from 'react-loading-overlay';

import { Header, SnackMessage, Instructions } from '../components';

import PendingContainer from './Report/PendingContainer';
import ReportContainer from './Report/ReportContainer';

import Login from './Login';
import Logout from './Logout';
import ErrorPage from './ErrorPage';

import { Config } from '../secret_config.js';

function PrivateRoute({ component: Component, loggedIn, data, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        loggedIn === true ? (
          <Component {...data} {...props} />
        ) : (
          <Redirect to={{ pathname: '/login' }} />
        )
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
      translation: enTranslations,
      options: {
        renderToStaticMarkup,
        renderInnerHtml: false,
        defaultLanguage: 'en',
      },
    });
  }

  componentDidMount() {
    //   // making sure BE and FE versions match - shows info message if not
    // this.props.checkVersion();
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
      <MuiThemeProvider theme={theme}>
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
                  loggedIn={this.props.user.loggedIn}
                  role={this.props.user.role}
                  submitFeedback={this.props.submitFeedback}
                />
                {this.props.common.serverError ? (
                  <ErrorPage />
                ) : this.props.user.loggedIn ? (
                  <React.Fragment>
                    <PrivateRoute
                      loggedIn={this.props.user.loggedIn}
                      path="/logout"
                      component={Logout}
                    />

                    <PrivateRoute
                      loggedIn={this.props.user.loggedIn}
                      path="/pending"
                      component={PendingContainer}
                    />

                    <PrivateRoute
                      loggedIn={this.props.user.loggedIn}
                      // exact
                      path="/request/:requestId?"
                      component={ReportContainer}
                    />
                    <PrivateRoute
                      loggedIn={this.props.user.loggedIn}
                      exact
                      path="/"
                      component={ReportContainer}
                    />

                    <PrivateRoute
                      loggedIn={this.props.user.loggedIn}
                      data={{ role: this.props.user.role }}
                      exact
                      path="/instructions"
                      component={Instructions}
                    />

                    <Route path="/login" component={Login} />
                  </React.Fragment>
                ) : (
                  <Login />
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
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  common: state.common,
  user: state.user,
  report: state.report,
});
const mapDispatchToProps = {
  ...commonActions,
  ...userActions,
};

export default withLocalize(connect(mapStateToProps, mapDispatchToProps)(Root));

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      logo: '#319ae8',
      light: '#8FC7E8',
      main: '#007CBA',
      dark: '#006098',
    },
    secondary: {
      light: '#F6C65B',
      main: '#DF4602',
      dark: '#C24D00',
    },

    textSecondary: '#e0e0e0',
  },
});
