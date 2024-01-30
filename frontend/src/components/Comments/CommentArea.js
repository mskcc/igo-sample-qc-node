import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CommentBox from './CommentBox';
import NewCommentArea from './NewCommentArea';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  container: {
    textAlign: 'center',
    gridArea: 'comments',
    display: 'grid',
    height: '100%',
    gridTemplateAreas: '"history" "new-comment"',
    gridTemplateRows: '80% 20%',
    marginTop: '25px',
    marginBottom: '45px',
    paddingRight: '10%',
    paddingLeft: '10%',
  },
});

const CommentArea = ({
  comments,
  currentReportShown,
  numOfReports,
  currentUser,
  addComment,
  addCommentToAllReports,
  classes,
}) => (
  <div className={classes.container}>
    <Typography variant="h5">
      <strong>Report Comments</strong>
    </Typography>
    <NewCommentArea
      numOfReports={numOfReports}
      currentReportShown={currentReportShown}
      addComment={addComment}
      addCommentToAllReports={addCommentToAllReports}
    />
    <CommentBox comments={comments} currentUser={currentUser} />
  </div>
);

CommentArea.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CommentArea);
