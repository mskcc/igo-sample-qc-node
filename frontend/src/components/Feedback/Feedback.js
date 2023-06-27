import React, { useState } from 'react';
import MuiButton from '@material-ui/core/Button/Button';
import {
  FormControlLabel,
  TextField,
  Paper,
  Checkbox,
  FormLabel,
  FormControl,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
// import PropTypes from "prop-types";
// import {MODAL_ERROR, MODAL_UPDATE} from "../../resources/constants";

export const MODAL_ERROR = 'MODAL_ERROR';
export const MODAL_UPDATE = 'MODAL_UPDATE';
export const MODAL_SUCCESS = 'MODAL_SUCCESS';

const useStyles = makeStyles((theme) => ({
  container: {
    zIndex: '99999',
    width: '30vw',
    padding: '1em',
    display: 'grid',
    position: 'absolute',
    top: '64px',
    right: '0',
    color: 'black',
    backgroundColor: '#eceff1',
    border: '2px solid #eceff1',
    borderRadius: '10px',

    // gridTemplateColumns: "50% 50%",

    alignItems: 'start',
    justifyItems: 'start',
    paddingBottom: theme.spacing(2),
  },
  formControl: { margin: theme.spacing(2), marginLeft: 0, minWidth: '170px' },
  input: { float: 'right' },
  label: {
    textAlign: 'left',
  },
}));

const Feedback = (props) => {
  const classes = useStyles();

  const [feedbackType, setFeedbackType] = useState('featureRequest');
  const [feedbackBody, setFeedbackBody] = useState('');
  const [feedbackSubject, setFeedbackSubject] = useState('');

  const sendEmail = () => {
    console.log(props);
    props.submitFeedback(feedbackBody, feedbackSubject, feedbackType);
    props.handleShow();
  };

  const getHelpText = () => {
    if (feedbackType === 'bug') {
      return 'What were you doing? What did you expect to happen? What actually happened? Please be as specific as you can.';
    } else {
      return 'What would you like added? Is this something that is necessary or simply helpful?';
    }
  };

  return (
    <Paper className={classes.container}>
      <FormControl component="fieldset">
        <FormLabel component="legend">What type of feedback?</FormLabel>

        <FormControlLabel
          control={
            <Checkbox
              value="featureRequest"
              onChange={() => setFeedbackType('featureRequest')}
              checked={feedbackType === 'featureRequest'}
            />
          }
          label="Feature Request"
        />
        <FormControlLabel
          control={
            <Checkbox
              value="bug"
              onChange={() => setFeedbackType('bug')}
              checked={feedbackType === 'bug'}
            />
          }
          label="Bug Report"
        />
      </FormControl>

      <br />
      <TextField
        id="feedback-subject"
        label="Feedback Subject"
        className={classes.formControl}
        value={feedbackSubject}
        onChange={(evt) => setFeedbackSubject(evt.target.value)}
        margin="normal"
      />

      <br />
      <TextField
        id="feedback-description"
        label="Decription"
        helperText={getHelpText()}
        multiline
        // rows="4"
        className={classes.textField}
        margin="normal"
        value={feedbackBody}
        onChange={(evt) => setFeedbackBody(evt.target.value)}
      />

      <MuiButton
        variant="contained"
        onClick={sendEmail}
        disabled={feedbackBody === '' || feedbackSubject === ''}
        size={'small'}
        color="primary"
      >
        Send
      </MuiButton>
    </Paper>
  );
};

export default Feedback;
