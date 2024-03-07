import React, { useEffect } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Comment from './Comment';

const styles = (theme) => ({
  container: {
    textAlign: 'center',
    gridArea: 'history',
    width: '100%',
    padding: '1em'
  },
});

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
          date={comment.date_created.replace('T', ' ').replace('Z', '')}
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
