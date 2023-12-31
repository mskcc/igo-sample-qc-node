import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

const useStyles = makeStyles((theme) => ({
  container: {
    textAlign: 'left',
    gridArea: 'infoPanel',
    minHeight: '15vh',
    width: '95%',
    paddingTop: '.5em',
    paddingLeft: '.5em',
    paddingBottom: '.5em',
    display: 'grid',
    gridTemplate: '',
    justifyItems: 'left',
  },
  report: {
    cursor: 'pointer',
  },
  done: {
    fontWeight: 'bold',
    color: '#a6ce39',
  },
  waiting: {
    fontWeight: 'bold',
    color: '#df4602',
  },
  align: {
    verticalAlign: 'sub',
    fontSize: '20px !important',
    marginRight: '-5px',
  },
}));

export default function InfoPanel(props) {
  const classes = useStyles();

  // showInfoPanel={
  //   this.props.report.tables &&
  //   Object.keys(this.props.report.tables).length > 0 &&
  //   (this.props.user.role === 'lab_member' ||
  //     Object.keys(this.props.comments).length > 0)
  // }

  return (
    <Paper className={classes.container}>
      <Typography component="div">
        QC Reports in this request:
        <br />
        <br />
        {Object.keys(props.report.tables)
          .filter((e) => {
            return (
              e.includes('Report') &&
              (props.comments[e] || props.role === 'lab_member')
            );
          })
          .map((e) => (
            <div
              className={classes.report}
              key={e}
              onClick={(event) => props.reportClick(e)}
            >
              <ArrowRightIcon className={classes.align} /> {e} -{' '}
              {Object.keys(props.report.tables)
                .filter((e) => props.report.tables[e].readOnly)
                .includes(e) ? (
                <span className={classes.done}>
                  Decisions submitted or not needed
                </span>
              ) : !props.comments[e] ? (
                <span className={classes.waiting}>Report not sent</span>
              ) : (
                <span className={classes.waiting}>Waiting for decision</span>
              )}
            </div>
          ))}
      </Typography>
    </Paper>
  );
}

// const mapStateToProps = (state) => ({
//   report: state.report,
//   user: state.user,
//   comments: state.communication.comments,
// });

// export default withLocalize(
//   connect(mapStateToProps, {
//     ...reportActions,
//   })(SidebarContainer)
// );
