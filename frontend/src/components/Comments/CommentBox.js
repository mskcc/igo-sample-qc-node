import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Comment from './Comment';
import moment from 'moment-timezone'; // Import moment-timezone
 
const styles = (theme) => ({
  container: {
    textAlign: 'center',
    gridArea: 'history',
    width: '100%',
    padding: '1em'
  },
});
 
const convertUTCtoEST = (utcDate) => {
  if (!utcDate) return "";
  // Convert UTC timestamp to EST
  return moment.utc(utcDate).tz("America/New_York").format("YYYY-MM-DD hh:mm A");
};
 
const CommentBox = ({ comments, currentUser, classes }) => {
  useEffect(() => {
    var box = document.getElementById('comment-box');
    box.scrollTop = box.scrollHeight;
  });
  return (
    <div id="comment-box" className={classes.container}>
     {comments.map((comment, i) => (
        <Comment
          author={comment.username}
          title={comment.title}
          fullName={comment.full_name}
         comment={comment.comment}
         date={convertUTCtoEST(comment.date_created)}  // Updated to convert to EST
         alignment={currentUser === comment.username ? 'right' : 'left'}
          id={`item_${i + 1}`}
          key={i}
        />
      ))}
    </div>
  );
};
 
CommentBox.propTypes = {
  classes: PropTypes.object.isRequired,
};
 
export default withStyles(styles)(CommentBox);
 