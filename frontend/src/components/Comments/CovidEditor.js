import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  Button,
  FormControlLabel,
  Typography,
  TextField,
  Checkbox,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    width: '95%',
    gridArea: 'editor',
    gridTemplateColumns: '50% 50%',
    gridTemplateAreas: "'preview '' button'",
    alignItems: 'start',
    justifyItems: 'start',
    paddingBottom: theme.spacing(2),
  },
  editorForm: {
    height: '100%',
    borderRight: '2px solid lightgray',
    gridArea: 'editorForm',
  },
  materialInput: { minWidth: '170px' },
  preview: {
    gridArea: 'preview',
    marginLeft: theme.spacing(3),
  },
  highlight: { backgroundColor: '#8fc7e8' },
  green: {
    backgroundColor: '#a6ce39',
  },
  yellow: {
    backgroundColor: '#ffc20e',
  },
  red: {
    backgroundColor: '#b1132d',
    color: 'white',
  },
  formControl: { margin: theme.spacing(2), marginLeft: 0, minWidth: '170px' },
  input: { float: 'right' },
  select: { float: 'right' },
  button: {
    borderTop: '2px solid lightgray',
    marginTop: '2em',
    paddingTop: '1em',
    width: '100%',
    textAlign: 'center',
    gridArea: 'button',
  },
  section: { marginLeft: '2em', maxWidth: '80%' },
  sectionHeader: {
    fontWeight: 700,
    fontSize: '1.1em',
    display: 'flex',
    alignItems: 'center',
  },
}));

export default function CovidEditor(props) {
  const classes = useStyles();
  const commentEl = useRef(null);
    

  
  const handleInitialComment = () => {
    props.handleInitialComment(commentEl.current.textContent, undefined);
  };

  return (
    <div className={classes.container}>
      <div className={classes.preview}>
        <Typography variant="h5" component="h3">
          Preview
        </Typography>
        <div ref={commentEl}>
          <br />
          Hello,
          <br />
          IGO has completed COVID19 qPCR on Project {props.request.requestId}.
          <br />
          Please see the reports and documents below for the results.
          <br />
          <br />
          Please reply here if you have any questions or comments.
          <br />
        </div>
      </div>

      <div className={classes.button}>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleInitialComment}
          disabled={props.recipientsBeingEdited === true}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
