import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button, TextField } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '70% 30%',
    height: '100%',
    width: '100%',
    alignItems: 'end',
    gap: '1%',
  },
  textField: {
    width: '100%',
    margin: 0,
    backgroundColor: 'white',
  },
  button: {
    // float: "right",
    minHeight: '132px',
    width: '50%',
    // marginBottom: "1em"
  },
  singleButton: {
    // float: "right",
    width: '100%',
    height: '132px',
    // marginBottom: "1em"
  },
  buttons: {
    display: 'grid',
    height: '100%',
  },
}));

export default function NewCommentArea(props) {
  const classes = useStyles();

  const comment = props.commentValue ?? '';

  const handleChange = (event) => {
    props.onCommentChange(event.target.value);
  };

  const addComment = () => {
    props.addComment(comment);
  };

  const addCommentToAllReports = () => {
    props.addCommentToAllReports(comment);
  };

  return (
    <div className={classes.container}>
      <TextField
        id="new-comment-field"
        label="New Comment"
        multiline
        rows="5"
        placeholder="Your Comment"
        value={comment}
        onChange={handleChange}
        className={classes.textField}
        margin="normal"
        variant="outlined"
      />
      <span className={classes.buttons}>
        {props.numOfReports > 1 ? (
          <span>
            <Button
              variant="contained"
              size="small"
              onClick={addComment}
              color="primary"
              disabled={!comment.trim()}
              className={classes.button}
            >
              Reply to {props.currentReportShown}
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={addCommentToAllReports}
              color="secondary"
              disabled={!comment.trim()}
              className={classes.button}
            >
              Reply to all reports
            </Button>
          </span>
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={addComment}
            color="primary"
            disabled={!comment.trim()}
            className={classes.singleButton}
          >
            Reply to {props.currentReportShown}
          </Button>
        )}
      </span>
    </div>
  );
}
