import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CommentBox from './CommentBox';
import NewCommentArea from './NewCommentArea';

const styles = (theme) => ({
  container: {
    textAlign: 'center',
    gridArea: 'comments',
    overflowX: 'hidden',
    overflowY: 'scroll',
    display: 'grid',
    height: '50vh',
    gridTemplateAreas: '"history" "new-comment"',
    gridTemplateRows: '80% 20%',
    // borderBottom: "2px solid rgba(0, 0, 0, 0.23)",
    // borderLeft: "2px solid rgba(0, 0, 0, 0.23)",
    // borderRight: "2px solid rgba(0, 0, 0, 0.23)",
    // borderRadius: "4px"
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
