import React, { Component } from 'react';
import { Config } from '../../secret_config.js';

import Swal from 'sweetalert2';

import { withLocalize } from 'react-localize-redux';
import { connect } from 'react-redux';
import { communicationActions } from '../../actions';
import {
  cleanAndFilterRecipients,
  allIntialCommentsSent,
} from '../../actions/helpers';

import { CommentArea, CommentEditorArea } from '../../components/Comments';

export class CommentContainer extends Component {

  componentDidMount() {
    this.props.getComments();
  }

  handleInitialComment = (comment, values) => {
    let reportString = '';
    var filteredReports = [];
    var isCmoPmProject = false;

    if (values) {
      var keys = Object.keys(values);
      // array of all selected reports
      filteredReports = keys.filter(function (key) {
        return values[key] && key.includes('Report');
      });
      reportString = Object.values(filteredReports).join(', ');
    }
    let recipients = cleanAndFilterRecipients(this.props.recipients);
    if ('QcAccessEmails' in this.props.recipients) {
      if (
        this.props.recipients.QcAccessEmails.toLowerCase() ===
        Config.CMO_PM_EMAIL
      ) {
        console.log('cmo pm only project!');
        isCmoPmProject = true;
      }
    }
    let recipientString = recipients.join();
    if (recipientString.includes('FIELD NOT')) {
      Swal.fire({
        title: 'Invalid email addresses',
        text: 'Please check the recipient email addresses for validity.',
        type: 'warning',
        loading: false,
        animation: false,
        confirmButtonColor: '#df4602',
        confirmButtonText: 'Go back to edit',
      });
      return;
    }

    let commentString = comment.replace(/\./gi, '.<br> ');
    commentString = commentString.replace(/,IGO/gi, ',<br>IGO');
    // commentString = commentString.replace(
    //   /Please reply here if you have any questions or comments./gi,
    //   "Please visit https://igo.mskcc.org/sample-qc to ask any questions or submit your decisions.  "
    // );
    if (
      recipientString.includes('.edu') ||
      recipientString.includes('@gmail') ||
      recipientString.includes('.com') ||
      (recipients.length === 1 && recipients[0] === "zzPDL_IGO_Staff@mskcc.org")
    ) {
      Swal.fire({
        title: 'Email Address Review',
        html:
          'It looks like the recipients contain non-MSK email addresses or IGO_Staff is listed as the only recipient. Please make sure at least on investigator or lab member has a valid address. If not, please send a report email rather than using the QC website as none of the recipients will be able to access this site.',
        type: 'warning',
        showCancelButton: true,
        animation: false,
        confirmButtonColor: '#007cba',
        cancelButtonColor: '#df4602',
        confirmButtonText: 'Continue to Review',
        cancelButtonText: 'Back to Edit',
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: 'Review',
            html:
              "<div class='swal-comment-review'> <strong>Add to:</strong>" +
              reportString +
              '<br><strong>Send to:</strong><br>' +
              recipientString +
              '<br><strong>Content:</strong><br>' +
              ' </div>',
            footer: isCmoPmProject
              ? 'Since the only QcAccessEmail found is "skicmopm@mskcc.org", this QC decision will be editable by admins and CMO PMs only. Lab Head and PI will still receive all communication.'
              : '',
            input: 'textarea',
            inputValue: commentString.replace(/<br>/gi, '\n'),
            type: 'warning',
            showCancelButton: true,
            animation: false,
            confirmButtonColor: '#007cba',
            cancelButtonColor: '#df4602',
            confirmButtonText: 'Send Notification',
            cancelButtonText: 'Back to Edit',
          }).then((result) => {
            if (result.value) {
              return this.props.addInitialComment(
                result.value.replace(/\n/gi, '<br>'),
                filteredReports,
                recipients,
                isCmoPmProject
              );
            } else {
              return true;
            }
          });
        } else {
          return true;
        }
      });
    } else {
      Swal.fire({
        title: 'Review',
        html:
          "<div class='swal-comment-review'> <strong>Add to:</strong>" +
          reportString +
          '<br><strong>Send to:</strong><br>' +
          recipientString +
          '<br><strong>Content:</strong><br>' +
          ' </div>',
        footer: isCmoPmProject
          ? 'Since the only QcAccessEmail found is "skicmopm@mskcc.org", this QC decision will be editable by admins and CMO PMs only. Lab Head and PI will still receive all communication.'
          : '',
        input: 'textarea',
        inputValue: commentString.replace(/<br>/gi, '\n'),
        type: 'warning',
        showCancelButton: true,
        animation: false,
        confirmButtonColor: '#007cba',
        cancelButtonColor: '#df4602',
        confirmButtonText: 'Send Notification',
        cancelButtonText: 'Back to Edit',
      }).then((result) => {
        if (result.value) {
          return this.props.addInitialComment(
            result.value.replace(/\n/gi, '<br>'),
            filteredReports,
            recipients,
            isCmoPmProject
          );
        } else {
          return true;
        }
      });
    }
  };

  addCommentToAllReports = (comment) => {
    if (this.isValid(comment)) {
      let reportsWithComments = Object.keys(this.props.comments);
      let reportsPresent = Object.keys(this.props.report.tables);
      if (allIntialCommentsSent(reportsWithComments, reportsPresent)) {
        this.props.addCommentToAllReports(
          comment.replace(/\n/gi, '<br>'),
          Object.keys(this.props.report.tables)
        );
      } else {
        Swal.fire({
          title: 'Not all intial comments sent.',
          text:
            'You can only comment on all reports at once if IGO has sent out ' +
            'intial notifications for every report present in this request.',
          type: 'info',
          animation: false,
          confirmButtonColor: '#007cba',
          confirmButtonText: 'Dismiss',
        });
      }
    } else {
      this.showMrnError();
    }
  };

  addComment = (comment) => {
    if (this.isValid(comment)) {
      this.props.addComment(
        comment.replace(/\n/gi, '<br>'),
        this.props.report.reportShown
      );
    } else {
      this.showMrnError();
    }
  };

  isValid = (comment) => {
    var r = /(\s[1-9]{8}\s|.*[1-9]{8}$|^[1-9]{8}\s.*)/g;

    var matches = comment.match(r);
    if (matches) {
      return false;
    }
    // r = /^\d{8}$/g;

    // matches = comment.match(r);
    // if (matches) {
    //   return false;
    // }
    return true;
  };

  showMrnError = () => {
    Swal.fire({
      title: 'Comment Invalid',
      text:
        'We detected an 8 digit number in your comment. Please delete any MRNs or other PHI and re-submit.' +
        'This webapp is not PHI secure and submitting PHI would violate MSK policy.',

      type: 'warning',
      animation: false,
      confirmButtonColor: '#007cba',
      confirmButtonText: 'Dismiss',
    });
  };

  handleRecipientSubmit = (recipients) => {
    this.props.setRecipients(recipients);
  };

  render() {
    return (
      <React.Fragment>
        {this.props.report.reportShown &&
        this.props.comments &&
        this.props.report.reportShown.includes('Report') &&
        this.props.comments[this.props.report.reportShown] &&
        this.props.comments[this.props.report.reportShown].comments.length >
          0 ? (
            <CommentArea
              currentReportShown={this.props.report.reportShown}
              numOfReports={
                Object.keys(this.props.report.tables).filter((commentReport) =>
                  commentReport.includes('Report')
                ).length
              }
              comments={
                this.props.comments[this.props.report.reportShown].comments
              }
              currentUser={this.props.user.username}
              addComment={this.addComment}
              addCommentToAllReports={this.addCommentToAllReports}
            />
        ) : (
          this.props.report.reportShown &&
          this.props.report.reportShown.includes('Report') &&
          this.props.report.tables && (
            <div className='commentSection'>

              <CommentEditorArea
                recipe={
                  this.props.report.tables[this.props.report.reportShown].data[0]
                    .recipe
                }
                currentReportShown={this.props.report.reportShown}
                addInitialComment={this.addInitialComment}
                handleInitialComment={this.handleInitialComment}
                request={this.props.report.request}
                recipients={this.props.recipients}
                tables={this.props.report.tables}
                comments={this.props.comments}
                handleRecipientSubmit={this.handleRecipientSubmit}
              />
            </div>
          )

        )}
      </React.Fragment>
    );
  }
}

CommentContainer.defaultProps = {
  comments: {},
  recipients: {},
};

const mapStateToProps = (state) => ({
  comments: state.communication.comments,
  communication: state.communication,
  report: state.report,
  recipients: state.communication.recipients,
  user: state.user,
});

export default withLocalize(
  connect(mapStateToProps, {
    // ...uploadGridActions,
    ...communicationActions,
  })(CommentContainer)
);
