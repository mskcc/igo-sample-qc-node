import React, { Component } from 'react';

import { withLocalize } from 'react-localize-redux';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { reportActions } from '../../actions';

import CommentContainer from './CommentContainer';
import TableContainer from './TableContainer';
import image from '../../igo.png';

export class ReportContainer extends Component {
  componentDidMount() {
    const { requestId } = this.props.match.params;
    if (requestId) {
      this.props.getRequest(requestId.toUpperCase());
    } else {
      this.props.clearRequest();
    }
  }
  render() {
    return (
      <React.Fragment>
        <div className="content">
          {this.props.report.loaded && (
            <React.Fragment>
              <TableContainer />
              <CommentContainer />
            </React.Fragment>
          )}
          {!this.props.report.loaded && (
            <div className='flex-container'>
              <img src={image} alt='IGO' className='background-image-homepage'/>
            </div>
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

export default withRouter(withLocalize(
  connect(mapStateToProps, {
    ...reportActions,
  })(ReportContainer)
));
