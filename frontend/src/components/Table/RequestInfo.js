import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ErrorIcon from '@material-ui/icons/Error';

const useStyles = makeStyles((theme) => ({
  container: {
    gridArea: 'request',
  },
  details: {
    width: 450,
    lineHeight: 2,
    display: 'grid',
    gridTemplateAreas: '\'a\' ',
  },
}));

export default function RequestInfo(props) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Typography variant="h5">
        <strong> QC Results for {props.request.requestId}</strong>
      </Typography>
      <div className={classes.details}>
        <div>
          <div>
            <strong>Lab Head:</strong> {props.request.labHeadName}
          </div>
          <div>
            <strong>Investigator:</strong> {props.request.investigatorName}
          </div>
          <div className='icon-key'>
            <ErrorIcon color="secondary" fontSize="small"/> indicates a decision is needed
          </div>
        </div>
      </div>
    </div>
  );
}
