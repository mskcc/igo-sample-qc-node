import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import CommentEditor from './CommentEditor';

const useStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: 'var(--mskcc-blue)',
    color: 'white',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '4px',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'var(--mskcc-dark-blue)',
    },
    '&:disabled': {
      backgroundColor: 'var(--mskcc-light-gray)',
      color: 'var(--mskcc-dark-gray)',
    },
  },
  dialog: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    '& .MuiDialog-paper': {
      backgroundColor: 'white',
      borderRadius: '8px',
    },
  },
  dialogTitle: {
    backgroundColor: 'var(--mskcc-blue)',
    color: 'white',
    padding: '16px 24px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  dialogContent: {
    padding: '24px',
    backgroundColor: 'white',
  },
  dialogActions: {
    padding: '16px 24px',
    backgroundColor: 'var(--material-gray)',
    borderTop: '1px solid #e0e0e0',
  },
  cancelButton: {
    backgroundColor: 'var(--mskcc-orange)',
    color: 'white',
    '&:hover': {
      backgroundColor: 'var(--mskcc-dark-orange)',
    },
  },
}));

export default function GenerateTextOptions(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleGenerateText = (comment, values) => {
    // Call the parent's handler with the generated text
    props.onGenerateText(comment, values);
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        className={classes.button}
        onClick={handleOpen}
        disabled={props.disabled}
      >
        Generate Text Options
      </Button>
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        className={classes.dialog}
        fullWidth
      >
        <DialogTitle className={classes.dialogTitle}>
          Generate Re-QC Comment
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <CommentEditor
            recipe={
              props.tables[props.currentReportShown]?.data?.[0]?.recipe || ''
            }
            currentReportShown={props.currentReportShown}
            request={props.request}
            recipients={props.recipients}
            tables={props.tables}
            comments={props.comments}
            recipientsBeingEdited={false}
            handleInitialComment={handleGenerateText}
            isReQc={true}
          />
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button 
            onClick={handleClose} 
            className={classes.cancelButton}
            variant="contained"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
