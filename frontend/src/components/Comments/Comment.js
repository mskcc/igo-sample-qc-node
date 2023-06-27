import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

const styles = (theme) => ({
  // current user's comments
  right: {
    float: 'right',
    textAlign: 'left',
    clear: 'both',
    marginBottom: '.5em',
    marginTop: '.5em',
    ...theme.mixins.gutters(),
    backgroundColor: 'rgba(0, 148, 144, .2)',
    maxWidth: '70%',
    minWidth: '30%',

    margin: '0 auto',
  },
  left: {
    float: 'left',
    textAlign: 'left',
    clear: 'both',
    marginBottom: '.5em',
    marginTop: '.5em',
    ...theme.mixins.gutters(),
    backgroundColor: 'rgba(246, 198, 91, .2)',
    maxWidth: '70%',
    minWidth: '30%',
    margin: '0 auto',
  },
  author: {
    fontSize: '.8em',
    textAlign: 'left',
    marginTop: '.4em',
    marginBottom: '.6em',
  },
  date: {
    fontSize: '.8em',
    textAlign: 'right',
    marginBottom: '.4em',
    marginTop: '.6em',
  },
});

const Comment = ({
  id,
  author,
  title,
  fullName,
  comment,
  date,
  alignment,
  classes,
}) => (
  <div id={id}>
    <Paper className={classes[alignment]}>
      <div className={classes.author}>
        {' '}
        {author}, {fullName}, {title}
      </div>

      <div dangerouslySetInnerHTML={{ __html: comment }} />
      <div className={classes.date}> {date}</div>
    </Paper>
  </div>
);

Comment.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Comment);
