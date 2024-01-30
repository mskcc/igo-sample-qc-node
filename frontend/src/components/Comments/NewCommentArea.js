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
    minHeight: '100%',
    width: '100%',
    // marginBottom: "1em"
  },
  buttons: {
    display: 'grid',
    minHeight: '50%',
  },
}));

export default function NewCommentArea(props) {
  const classes = useStyles();
  const [values, setValues] = React.useState({
    radioSelect: false,
  });

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const addComment = (report) => {
    props.addComment(values.comment);
  };

  const addCommentToAllReports = (report) => {
    props.addCommentToAllReports(values.comment);
  };

  return (
    <div className={classes.container}>
      <TextField
        id="new-comment-field"
        label="New Comment"
        multiline
        rows="5"
        placeholder="Your Comment"
        onChange={handleChange('comment')}
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
              disabled={values.comment ? false : true}
              className={classes.button}
            >
              Reply to {props.currentReportShown}
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={addCommentToAllReports}
              color="secondary"
              disabled={values.comment ? false : true}
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
            disabled={values.comment ? false : true}
            className={classes.singleButton}
          >
            Reply to {props.currentReportShown}
          </Button>
        )}
      </span>
    </div>
  );
}
