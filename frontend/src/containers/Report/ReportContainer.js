import React, { Component } from 'react';

import { withLocalize } from 'react-localize-redux';
import { connect } from 'react-redux';
import { reportActions } from '../../actions';

import CommentContainer from './CommentContainer';
import TableContainer from './TableContainer';
import image from '../../igo.png';
import { useParams } from 'react-router-dom';

export class ReportContainer extends Component {
  componentDidMount() {
    const { requestId } = useParams();
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
              {/* <CommentContainer /> */}
              <TableContainer />
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

export default withLocalize(
  connect(mapStateToProps, {
    ...reportActions,
  })(ReportContainer)
);
