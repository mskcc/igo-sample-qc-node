import React, { Component } from 'react';

import { withLocalize } from 'react-localize-redux';
import { connect } from 'react-redux';
import { reportActions } from '../../actions';

import CommentContainer from './CommentContainer';
import TableContainer from './TableContainer';
import SidebarContainer from './SidebarContainer';

export class ReportContainer extends Component {
  componentDidMount() {
    const { requestId } = this.props.match.params;
    // let requestIdParam = requestId
    if (requestId) {
      this.props.getRequest(requestId.toUpperCase());
    } else {
      this.props.clearRequest();
    }
  }
  handleSearch = (requestId) => {
    this.props.history.push('/request/' + requestId);
    this.props.getRequest(requestId);
  };
  render() {
    return (
      <React.Fragment>
        <div className="content">
          <SidebarContainer handleSearch={this.handleSearch} />
          {this.props.report.loaded && (
            <React.Fragment>
              <CommentContainer />
              <TableContainer />
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}

ReportContainer.defaultProps = {};

const mapStateToProps = (state) => ({
  common: state.common,
  user: state.user,
  report: state.report,
});

export default withLocalize(
  connect(mapStateToProps, {
    ...reportActions,
  })(ReportContainer)
);
