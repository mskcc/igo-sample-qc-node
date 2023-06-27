import React, { Component } from 'react';
import Swal from 'sweetalert2';
import { withLocalize } from 'react-localize-redux';
import { connect } from 'react-redux';
import { reportActions } from '../../actions';
import { allDecisionsMade } from '../../actions/helpers';
import { validateDecisions } from '../../actions/helpers';

import { TableArea } from '../../components/Table';

export class TableContainer extends Component {
  componentDidMount() {
    if (this.props.requestIdParam) {
      this.props.getQcReports(this.props.requestIdParam);
    } else if (this.props.report.request.samples && !this.props.report.tables) {
      this.props.getQcReports(this.props.report.request.requestId);
    }
  }
  updateReportShown = (report) => {
    if (this.props.report.request.samples) {
      this.props.updateReportShown(report);
    }
  };

  handleInvestigatorSubmit = () => {
    if (
      !allDecisionsMade(this.props.report.tables, this.props.report.reportShown)
    ) {
      Swal.fire({
        title: 'Not all Decisions made.',
        text:
          'Please make a decision for each sample in this report before you submit to IGO.',

        type: 'info',
        animation: false,
        confirmButtonColor: '#007cba',
        confirmButtonText: 'Dismiss',
      });
    } else if (
      !validateDecisions(this.props.report.tables, this.props.report.reportShown)
    ) {
      Swal.fire({
        title: 'Decisions are not valid.',
        text:
          'Please make a decision from the pre-selected dropdown list for each sample. Do not manually type your decision into the table.',

        type: 'info',
        animation: false,
        confirmButtonColor: '#007cba',
        confirmButtonText: 'Dismiss',
      });
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text:
          'These decisions are considered final and cannot be changed on this website after you submit.' +
          ' If you need to change them later on, please send an email to zzPDL_IGO_Staff@mskcc.org.',

        type: 'warning',
        showCancelButton: true,
        animation: false,
        confirmButtonColor: '#007cba',
        cancelButtonColor: '#df4602',
        confirmButtonText: 'Submit Decisions',
        cancelButtonText: 'Back to Edit',
      }).then((result) => {
        if (result.value) {
          return this.props.submitInvestigatorDecision();
        } else {
          return true;
        }
      });
    }
  };
  handlePartialDecision = () => {
    this.props.savePartialDecision();
  };
  manuallyAddDecision = () => {
    this.props.manuallyAddDecision();
  };

  registerChange = () => {
    this.props.registerChange();
  };
  handleAttachmentDownload = (recordId, fileName) => {
    this.props.downloadAttachment(recordId, fileName);
  };

  handleReportDownload = (report) => {
    this.props.downloadReport(
      this.props.report.reportShown,
      this.props.report.request
    );
  };

  render() {
    const { report } = this.props;
    const isReport = report.reportShown
      ? report.reportShown.includes('Report')
      : false;
    const isCovidReport = report.reportShown
      ? report.reportShown.includes('COVID')
      : false;
      const isPathologyReport = report.reportShown
      ? report.reportShown.includes('Pathology')
      : false;
    const isNormalReport = isReport && !isCovidReport && !isPathologyReport;

    return (
      <React.Fragment>
        {this.props.report.tables && (
          <TableArea
            report={report}
            isReport={isReport}
            isNormalReport={isNormalReport}
            isCovidReport={isCovidReport}
            role={this.props.user.role}
            username={this.props.user.username}
            updateReportShown={this.updateReportShown}
            handleSubmit={this.handleInvestigatorSubmit}
            manuallyAddDecision={this.manuallyAddDecision}
            handleSave={this.handlePartialDecision}
            registerChange={this.registerChange}
            handleAttachmentDownload={this.handleAttachmentDownload}
            handleReportDownload={this.handleReportDownload}
          />
        )}
      </React.Fragment>
    );
  }
}

TableContainer.defaultProps = {};

const mapStateToProps = (state) => ({ report: state.report, user: state.user });

export default withLocalize(
  connect(mapStateToProps, {
    ...reportActions,
  })(TableContainer)
);
