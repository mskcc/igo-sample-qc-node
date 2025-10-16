import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
} from '@material-ui/core';

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
    '& .MuiDialog-paper': {
      backgroundColor: 'white',
      borderRadius: '12px',
      minWidth: '500px',
      maxWidth: '600px',
    },
  },
  dialogTitle: {
    backgroundColor: 'var(--mskcc-blue)',
    color: 'white',
    padding: '20px 24px',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: '12px 12px 0 0',
  },
  dialogContent: {
    padding: '24px',
    backgroundColor: 'white',
  },
  dialogActions: {
    padding: '16px 24px',
    backgroundColor: 'var(--material-gray)',
    borderTop: '1px solid #e0e0e0',
    justifyContent: 'center',
    borderRadius: '0 0 12px 12px',
  },
  checkboxContainer: {
    marginBottom: '16px',
  },
  checkboxLabel: {
    fontSize: '14px',
    lineHeight: '1.4',
  },
  generateButton: {
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
  cancelButton: {
    backgroundColor: 'var(--mskcc-orange)',
    color: 'white',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '6px',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'var(--mskcc-dark-orange)',
    },
  },
}));

export default function GenerateTextOptions(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    reQcMessage: false,
    reQcUrgency: false,
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOptions({
      reQcMessage: false,
      reQcUrgency: false,
    });
  };

  const handleCheckboxChange = (option) => (event) => {
    setSelectedOptions({
      ...selectedOptions,
      [option]: event.target.checked,
    });
  };

  const handleGenerateComment = () => {
    let commentText = '';
    
    if (selectedOptions.reQcMessage) {
      commentText += 'Your sample(s) have been re-QC\'d. Please see the updated QC results in the grid above.\n\n';
    }
    
    if (selectedOptions.reQcUrgency) {
      commentText += 'Please submit your processing decisions at your earliest convenience to ensure your samples are included in this week\'s queue. Delays in submission may result in your samples being held until the following week.\n\n';
    }
    
    commentText += 'Please reply here if you have any questions or comments.';
    
    // Call the parent's handler with the generated text
    props.onGenerateText(commentText);
    handleClose();
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        className={classes.button}
        onClick={handleOpen}
        disabled={props.disabled}
      >
            GENERATE TEXT OPTIONS
      </Button>
      
      <Dialog
        open={open}
        onClose={handleClose}
        className={classes.dialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className={classes.dialogTitle}>
          Generate Re-QC Comment
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography variant="body1" style={{ marginBottom: '20px', fontWeight: 'bold' }}>
            Select the message options you want to include:
          </Typography>
          
          <Box className={classes.checkboxContainer}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions.reQcMessage}
                  onChange={handleCheckboxChange('reQcMessage')}
                  color="primary"
                />
              }
              label={
                <Typography className={classes.checkboxLabel}>
                  Your sample(s) have been re-QC'd. Please see the updated QC results in the grid above.
                </Typography>
              }
            />
          </Box>
          
          <Box className={classes.checkboxContainer}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions.reQcUrgency}
                  onChange={handleCheckboxChange('reQcUrgency')}
                  color="primary"
                />
              }
              label={
                <Typography className={classes.checkboxLabel}>
                  Please submit your processing decisions at your earliest convenience to ensure your samples are included in this week's queue. Delays in submission may result in your samples being held until the following week.
                </Typography>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button 
            onClick={handleClose} 
            className={classes.cancelButton}
            variant="contained"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateComment}
            className={classes.generateButton}
            variant="contained"
            disabled={!selectedOptions.reQcMessage && !selectedOptions.reQcUrgency}
          >
            Generate & Send Comment
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
