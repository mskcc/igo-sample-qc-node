import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      backgroundColor: 'white',
      borderRadius: '12px',
      minWidth: '400px',
      maxWidth: '500px',
    },
  },
  dialogTitle: {
    backgroundColor: 'var(--mskcc-light-green)',
    color: 'white',
    padding: '20px 24px',
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: '12px 12px 0 0',
  },
  dialogContent: {
    padding: '24px',
    backgroundColor: 'white',
    textAlign: 'center',
  },
  dialogActions: {
    padding: '16px 24px',
    backgroundColor: 'var(--material-gray)',
    borderTop: '1px solid #e0e0e0',
    justifyContent: 'center',
    borderRadius: '0 0 12px 12px',
  },
  successIcon: {
    fontSize: '48px',
    color: 'var(--mskcc-light-green)',
    marginBottom: '16px',
  },
  messageText: {
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '16px',
    color: 'var(--mskcc-dark-blue)',
  },
  button: {
    backgroundColor: 'var(--mskcc-blue)',
    color: 'white',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '6px',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'var(--mskcc-dark-blue)',
    },
  },
}));

export default function QcSentPopup({ open, onClose, userRole }) {
  const classes = useStyles();

  // Only show popup for lab members
  if (userRole !== 'lab_member') {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>
        QC Notification Sent Successfully!
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <CheckCircleIcon className={classes.successIcon} />
          <Typography className={classes.messageText}>
            The initial QC notification has been sent to all recipients. 
            <br />
            <br />
            <strong>Note:</strong> If new samples are added to this project later, 
            you can use the "Generate Text Options" button below to send a 
            standardized re-QC notification message.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button 
          onClick={onClose} 
          className={classes.button}
          variant="contained"
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
