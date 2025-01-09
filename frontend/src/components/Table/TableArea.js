import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Tooltip,
  Box,
  Typography,
  Zoom,
} from '@material-ui/core';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import ErrorIcon from '@material-ui/icons/Error';
import SpeakerNotesOffIcon from '@material-ui/icons/SpeakerNotesOff';
import Table from './Table';
import RequestInfo from './RequestInfo';
import 'handsontable/dist/handsontable.full.css';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: '2em',
    paddingLeft: '2em',
    textAlign: 'left',
    gridArea: 'table',
    display: 'grid',
    gridTemplateAreas: "'toolbar' 'reports'",
    gridRowGap: '1em',
    gridColumnGap: '2em',
    overflow: 'scroll',
    // backgroundColor: 'rgba(0, 148, 144, .08)',
    borderTop: '2px solid darkgray',
  },

  table: {
    gridArea: 'table',
  },
  toolbar: {
    display: 'grid',
    gridTemplateAreas: "'request submit-btn save-btn download-btn'",
    width: 'fit-content',
    gridColumnGap: '1em',
  },
  submitBtn: {
    gridArea: 'submit-btn',
    width: 'fit-content',
    height: '4em',
    alignSelf: 'center',
  },
  saveBtn: {
    gridArea: 'save-btn',
    width: 'fit-content',
    height: '4em',
    alignSelf: 'center',
    backgroundColor: '#8fc7e8',
  },
  downloadtBtn: {
    gridArea: 'download-btn',
    width: 'fit-content',
    height: '4em',
    alignSelf: 'center',
  },
  decisions: {
    paddingBottom: '11px',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={children.length}>{children}</Box>
    </Typography>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TableArea(props) {
  const classes = useStyles();
  // make sure active tab is on currentReport after page refresh
  // let index = 0;

  let index = Object.keys(props.report.tables).indexOf(
    props.report.reportShown
  );

  // const [value, setValue] = React.useState(index);

  function handleChange(event, newValue) {
    // setValue(newValue);
    // console.log(newValue)
    props.updateReportShown(Object.keys(props.report.tables)[newValue]);
  }

  function handleReportDownload(index) {
    props.handleReportDownload(Object.keys(props.report.tables)[index]);
  }
  console.log(props.report);
  const isInvestigatorPrepped = props.report.request.requestName === 'Investigator Prepared Libraries' ||
            props.report.request.requestName === 'Investigator Prepared Pools';

  const requestString = props?.report?.request?.request || "";
  if (requestString.includes("ATAC") || requestString.includes("SingleCell") || requestString === 'OGM') {
    shouldDisplayCellInfo = true;
  }
  //const shouldDisplayCellInfo = props.report.request.requestName === 'OGM' || props.report.request.request.includes("ATAC") || props.report.request.requestName.includes("SingleCell");

  return (
    <div className={classes.container}>
      <div className={classes.toolbar}>
        <RequestInfo request={props.report.request} />
        {props.isNormalReport && (
          <React.Fragment>
            {props.role === 'lab_member' ? (
              <Card>
                {' '}
                <CardContent className='lab-card-content'>
                  <Typography
                    color="textSecondary"
                    // gutterBottom
                  >
                    Lab members must submit decisions in LIMS.
                    <br></br>
                    <br></br>
                    <SpeakerNotesOffIcon color="primary" fontSize="small"/> indicates report has not been sent
                  </Typography>
                </CardContent>
              </Card>
            ) : props.report.tables[props.report.reportShown].isCmoPmProject &&
              props.role !== 'cmo_pm' ? (
              <Card>
                {' '}
                <CardContent className={classes.decisions}>
                  <Typography
                    color="textSecondary"
                    // gutterBottom
                  >
                    Only CMO Project Managers can submit decisions for this
                    report.
                  </Typography>
                </CardContent>
              </Card>
            ) : props.report.tables[props.report.reportShown].readOnly ? (
              <Card>
                {' '}
                <CardContent className={classes.decisions}>
                  <Typography
                    color="textSecondary"
                    // gutterBottom
                  >
                    Decisions have been submitted.
                  </Typography>
                  <Typography variant="body1">
                    To make any changes, please reach out <br /> to IGO at
                    <a href="mailto:zzPDL_IGO_Staff@mskcc.org">
                      {' '}
                      zzPDL_IGO_Staff@mskcc.org
                    </a>
                    .
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              props.isNormalReport && (
                <React.Fragment>
                  <Button
                    onClick={props.handleSubmit}
                    variant="contained"
                    color="primary"
                    className={classes.submitBtn}
                  >
                    Submit to IGO
                  </Button>
                  <Tooltip
                    arrow="true"
                    TransitionComponent={Zoom}
                    title="Save decisions to submit at a later date"
                    aria-label="add"
                  >
                    <Button
                      onClick={props.handleSave}
                      variant="contained"
                      color="primary"
                      className={classes.saveBtn}
                    >
                      Save
                    </Button>
                  </Tooltip>
                </React.Fragment>
              )
            )}
            <Button
              onClick={handleReportDownload}
              variant="contained"
              color="secondary"
              className={classes.downloadtBtn}
              startIcon={<CloudDownloadIcon />}
            >
              {Object.keys(props.report.tables)[index]}
            </Button>
          </React.Fragment>
        )}{' '}
      </div>
      <div className={classes.report}>
        <Tabs
          value={index}
          onChange={handleChange}
          aria-label="table tabs"
        >
          {Object.keys(props.report.tables).map((report, index) => (
            (props.role === 'lab_member' && report !== 'Attachments' && !props.reportsWithComments.includes(report) ? 
              <Tab key={report} icon={<SpeakerNotesOffIcon color="primary"/>} label={report} {...a11yProps(index)} />
            : props.report.tables[report].readOnly !== true && report !== 'Attachments' && report !== 'Pathology Report' ? 
              <Tab key={report} icon={<ErrorIcon color="secondary"/>} label={report} {...a11yProps(index)} />
            : 
              <Tab key={report} label={report} {...a11yProps(index)} />
            )
            
          ))}
        </Tabs>

        {Object.keys(props.report.tables).map((report, mapIndex) => (
          <TabPanel key={report} value={index} index={index}>
            {index === mapIndex && (
              <Table
                // handleAttachmentDownload={props.handleAttachmentDownload}
                registerChange={props.registerChange}
                role={props.role}
                data={props.report.tables[report]}
                investigatorPrepped={isInvestigatorPrepped}
                cellInfo={shouldDisplayCellInfo}
              />
            )}
          </TabPanel>
        ))}
      </div>
    </div>
  );
}
