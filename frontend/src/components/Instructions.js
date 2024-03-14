import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ReactPlayer from 'react-player';
import mov from './Sample-qc.mov';

const styles = (theme) => ({
  container: {
    width: '80vw',
    height: '80vh',
    margin: '5% auto',
  },
  iframe: {
    width: '80%',
    height: '100%',
    position: 'relative',
    left: '10%',
  },
  'instructional-video-container': {
    'margin-bottom': '20px',
    position: 'relative',
    width: '100%',
    height: '80vh',
  },
  'instructional-video': {
    margin: 'auto',
    width: '80%',
    height: '80%',
  },
  'instructions-header': {
    'font-size': '1.65rem',
    'padding-bottom': '.3rem',
    'border-bottom': '1px solid #eaecef',
  },
});

const Instructions = ({ role, classes }) => (
  <div className={classes.container}>
    <h1 className={classes['instructions-header']}>Sample QC Instructions</h1>

    {role === 'lab_member' ? (
      <iframe
        title="IGO-Member-CheatSheet"
        className={classes.iframe}
        allowFullScreen
        frameBorder="0"
        src="https://www.lucidchart.com/documents/embeddedchart/f1fcc586-50bc-4239-8ca8-96cd54833ffa"
        id="MERilBZKM5U~"
      />
    ) : (
      <React.Fragment>
        <div className={classes['instructional-video-container']}>
          <h2>Instructional Video</h2>
          <p>
            Please watch the video below to introduce yourself to the Sample QC
            Site
          </p>
          <div className={classes['instructional-video']}>
            <ReactPlayer url={mov} width="100%" height="100%" controls={true} />
          </div>
        </div>
        <h2>Documentation</h2>
        <p>
          Below is the latest documentation available for the Sample QC Site
        </p>
        <iframe
          title="Investigator-Member-CheatSheet"
          className={classes.iframe}
          allowFullScreen
          frameBorder="0"
          src="https://www.lucidchart.com/documents/embeddedchart/9f9aca27-2f94-453f-89a3-4b90c2a5e68b"
          id=".q6i6VmMzlMS"
        />
      </React.Fragment>
    )}
  </div>
);

Instructions.propTypes = {
  classes: PropTypes.object.isRequired,
  role: PropTypes.string.isRequired,
};

export default withStyles(styles)(Instructions);
