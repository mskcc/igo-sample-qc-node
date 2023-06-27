import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reportActions } from '../../actions';
import { withLocalize } from 'react-localize-redux';
import { Config } from '../../secret_config.js';

import { Sidebar } from '../../components';

export class SidebarContainer extends Component {
  handleSearch = (requestId) => {
    this.props.handleSearch(requestId.toUpperCase().trim());
  };

  render() {
    return (
      <React.Fragment>
        <Sidebar
          pattern={Config.REQUEST_PATTERN}
          handleSubmit={this.handleSearch}
          showInfoPanel={
            this.props.report.tables &&
            Object.keys(this.props.report.tables).length > 0 &&
            (this.props.user.role === 'lab_member' ||
              Object.keys(this.props.comments).length > 0)
          }
          report={this.props.report}
          comments={this.props.comments}
          reportClick={this.props.reportClick}
          role={this.props.user.role}
        />
      </React.Fragment>
    );
  }
}

SidebarContainer.defaultProps = {};

const mapStateToProps = (state) => ({
  report: state.report,
  user: state.user,
  comments: state.communication.comments,
});

export default withLocalize(
  connect(mapStateToProps, {
    ...reportActions,
  })(SidebarContainer)
);
