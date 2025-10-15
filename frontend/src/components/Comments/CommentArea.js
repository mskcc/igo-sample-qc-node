import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CommentBox from './CommentBox';
import NewCommentArea from './NewCommentArea';
import GenerateTextOptions from './GenerateTextOptions';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  container: {
    textAlign: 'center',
    gridArea: 'comments',
    display: 'grid',
    height: '100%',
    gridTemplateAreas: '"history" "new-comment" "generate-text"',
    // gridTemplateRows: '80% 20%',
    marginTop: '25px',
    marginBottom: '45px',
    paddingRight: '10%',
    paddingLeft: '8%',
  },
  commentsTitle: {
    paddingLeft: '2em',
    marginTop: '1em'
  },
  generateTextContainer: {
    gridArea: 'generate-text',
    textAlign: 'center',
    marginTop: '1em',
    marginBottom: '1em',
    padding: '16px',
    backgroundColor: 'var(--material-gray)',
    borderRadius: '8px',
  }
});

const CommentArea = ({
  comments,
  currentReportShown,
  numOfReports,
  currentUser,
  addComment,
  addCommentToAllReports,
  isReQc,
  userRole,
  onGenerateText,
  request,
  recipients,
  tables,
  allComments,
  classes,
}) => (
  <div className={classes.commentsTitle}>
    <Typography variant="h5">
      <strong>Report Comments</strong>
    </Typography>
    <div className={classes.container}>
      <NewCommentArea
        numOfReports={numOfReports}
        currentReportShown={currentReportShown}
        addComment={addComment}
        addCommentToAllReports={addCommentToAllReports}
      />
      <CommentBox comments={comments} currentUser={currentUser} />
      {isReQc && userRole === 'lab_member' && (
        <div className={classes.generateTextContainer}>
          <Typography variant="body2" style={{ marginBottom: '12px', color: 'var(--mskcc-dark-blue)', fontWeight: 'bold' }}>
            Generate a standardized re-QC notification message
          </Typography>
          <GenerateTextOptions
            onGenerateText={onGenerateText}
            currentReportShown={currentReportShown}
            request={request}
            recipients={recipients}
            tables={tables}
            comments={allComments}
          />
        </div>
      )}
    </div>
  </div>
);

CommentArea.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CommentArea);
