import React, { useRef, useState, useEffect } from 'react';
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
    gridTemplateAreas: "'editorForm preview''button button'",
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

export default function CommentEditor(props) {
  const classes = useStyles();
  const commentEl = useRef(null);
  const [values, setValues] = React.useState({
    'DNA Report': false,
    'RNA Report': false,
    'Library Report': false,
    salutation: '',
    addressee: props.request.investigatorName.split(' ')[0] || '',
    downstreamProcess:
      props.currentReportShown === 'Library Report' ||
      props.currentReportShown === 'Pool Report'
        ? 'sequencing'
        : props.recipe,
    service: '',
    pass: false,
    try: false,
    fail: false,
    rnaChecked: false,
    valid: false,
    movingForward: false,
    confirmationRequested: false,
    sequencingRequested: false,
    suboptimalQuantity: false,
    sizeSelection: false,
    suggestSizeSelection: false,
    samplesDiscardedText: false,
    pickupInstructionsText: false,
    cmoProcessingDecisionsText: false,
    reQcMessage: false,
    reQcUrgency: false
  });
  const [commentArray, setCommentArray] = useState([]);

  useEffect(() => {
    for (const key in values) {
      // array to order text by order options are clicked
      if (!values[key] && commentArray.includes(key)) {
        const newOrder = commentArray.filter(item => item !== key);
        setCommentArray(newOrder);
      } else if (values[key] && !commentArray.includes(key)) {
        const newOrder = commentArray.concat([key]);
        setCommentArray(newOrder);
      }
    }
  }, [values]);

  const handleChange = (name) => (event) => {
    if (event.target.value !== 'default') {
      setValues({
        ...values,
        [name]: event.target.value,
      });
    }
  };

  const handleCheckbox = (name) => (event) => {
    setValues({ ...values, [name]: !values[name] });
  };

  const handleInitialComment = () => {
    props.handleInitialComment(commentEl.current.textContent, values);
  };

  const showCMOCheckbox = () => {
    const isCMOproject = 
      props.recipients.InvestigatorEmail.includes('skicmopm@mskcc.org') ||
      props.recipients.LabHeadEmail.includes('skicmopm@mskcc.org') ||
      (props.recipients.OtherContactEmails && props.recipients.OtherContactEmails.includes('skicmopm@mskcc.org'));
      return isCMOproject && values.downstreamProcess === 'WholeExomeSequencing';
  };

  const renderPreviewText = (chosenOptionsArray = []) => {
    return chosenOptionsArray.map(checkedValue => (
      <div>
        {checkedValue === 'pass' &&
            !values.try &&
            !values.fail &&
            (values.movingForward ? (
              <span>
                All of the samples in this project{' '}
                <span className={classes.green}>pass</span> IGO’s QC
                specifications for {values.downstreamProcess} and are moving
                forward.
              </span>
            ) : (
              <span>
                All of the samples in this project{' '}
                <span className={classes.green}>pass</span> IGO’s QC
                specifications for {values.downstreamProcess}.
              </span>
            ))}
          {checkedValue === 'pass' && (values.try || values.fail) && (
            <span>
              Some of the samples in this project{' '}
              <span className={classes.green}>pass</span> IGO’s QC
              specifications for {values.downstreamProcess}.
            </span>
          )}
          {checkedValue === 'try' &&
            ((values['Library Report'] || values['Pool Report']) &&
            !values['DNA Report'] &&
            !values['RNA Report'] ? (
              <span>
                <br />
                Samples highlighted in{' '}
                <span className={classes.yellow}>yellow</span> fall just below
                our quantitative and/or qualitative standards; however, we can
                still move forward and see how the samples perform at the
                sequencing level.
              </span>
            ) : (
              <span>
                <br />
                Samples highlighted in{' '}
                <span className={classes.yellow}>yellow</span> fall just below
                our quantitative and/or qualitative standards for{' '}
                {values.downstreamProcess}; however, we can still try to prepare
                libraries.
                {values.rnaChecked && (
                  <span>
                    <br />
                    Please note that if you decide to move forward with samples
                    containing suboptimal quantities, we will need to normalize
                    ALL samples to the lowest starting amount.
                  </span>
                )}
              </span>
            ))}
          {checkedValue === 'fail' && (
            <span>
              <br />
              Samples highlighted in <span className={classes.red}>
                red
              </span>{' '}
              fail our quantitative and/or qualitative standards for{' '}
              {values.downstreamProcess}. IGO recommends these samples be
              removed from processing.
            </span>
          )}
          <br />
        {checkedValue === 'onHold' && (
          <span>
            <br />
            IGO will put this project on hold until decisions are submitted for all samples in the grid above.
          </span>
        )}
        {checkedValue === 'confirmationRequested' && (
          <span>
            {' '}
            <br />
            Please confirm that the samples look as expected in order to
            continue to sequencing.
          </span>
        )}{' '}
        {checkedValue === 'sequencingRequested' && (
          <span>
            {' '}
            <br />
            To proceed with sequencing, please submit a new iLab request and email the Service ID number to our Sample and Project Management team at igosampleprojmgmt@mskcc.org.
          </span>
        )}
        {checkedValue === 'samplesDiscardedText' && (
          <span>
            {' '}
            <br />
            Your samples will now be discarded.
          </span>
        )}
        {checkedValue === 'pickupInstructionsText' && (
          <span>
            {' '}
            <br />
            When you're ready to pick up your samples, please contact our Sample and Project Management Team at igosampleprojmgmt@mskcc.org.
          </span>
        )}
        {checkedValue === 'cmoProcessingDecisionsText' && (
          <span>
            {' '}
            <br />
            Please note that processing decisions should be submitted by the CMO PM team.
          </span>
        )}
        {checkedValue === 'cmoDecisionsNote' && (
          <span>
            {' '}
            <br />
            Please note, the QC decisions for this project will be made by the 
            CMO project Management team. Please contact skicmopm@mskcc.org if you 
            have any questions.
          </span>
        )}
        {checkedValue === 'unevenLibrary' && (
          <span>
            {' '}
            <br />
            Please note that because the library profiles are not even, the
            sequencing results may be unbalanced when sequenced together.
          </span>
        )}{' '}
        {checkedValue === 'sizeSelection' && (
          <span>
            {' '}
            <br />
            These samples have adapters and/or fragments over 1kb that could
            affect the sequencing balance across the project. 
          </span>
        )}
        {checkedValue === 'suggestSizeSelection' && (
          <span>
            {' '}
            <br />
            We suggest these samples undergo a size selection, which is not a 
            service IGO provides. If you would like to pick up the samples for 
            size selection, please reply below and we will provide additional 
            instructions.
          </span>
        )}
        {checkedValue === 'reQcMessage' && (
          <span>
            {' '}
            <br />
            Your sample(s) have been re-QC'd. Please see the updated QC results in the grid above.
          </span>
        )}
        {checkedValue === 'reQcUrgency' && (
          <span>
            {' '}
            <br />
            Please submit your processing decisions at your earliest convenience to ensure your samples are included in this week's queue. Delays in submission may result in your samples being held until the following week.
          </span>
        )}
      </div>
    ));
  };

  return (
    <div className={classes.container}>
      <div className={classes.editorForm}>
        <div>
          {Object.keys(props.tables).length > 0 && !props.isReQc && (
            <React.Fragment>
              <div className={classes.sectionHeader}>
                <i className="material-icons">keyboard_arrow_right</i> Which
                report should this comment be added to?
              </div>
              <div className={classes.section}>
                {Object.keys(props.tables).map((report, index) => {
                  if (
                    report.includes('Report') &&
                    !props.comments[report]
                  ) {
                    return (
                      <span key={report}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              // checked={values.report}
                              onChange={handleCheckbox(report)}
                              // value={report}
                            />
                          }
                          label={report}
                        />
                      </span>
                    );
                  } else return null;
                })}
              </div>
            </React.Fragment>
          )}
          <form>
            {!props.isReQc && (
              <React.Fragment>
                <div className={classes.sectionHeader}>
                  <i className="material-icons">keyboard_arrow_right</i> Fill in the
                  blanks:{' '}
                </div>
                <div className={classes.section}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="salutation-simple">Salutation</InputLabel>
                    <Select
                      value={values.salutation}
                      onChange={handleChange('salutation')}
                      inputProps={{
                        name: 'salutation',
                        id: 'salutation-simple',
                      }}
                    >
                      <MenuItem value="Morning">Morning</MenuItem>
                      <MenuItem value="Afternoon">Afternoon</MenuItem>
                      <MenuItem value="Evening">Evening</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    id="addressee-simple"
                    label="Addressee"
                    value={values.addressee}
                    className={classes.formControl}
                    onChange={handleChange('addressee')}
                    margin="normal"
                  />
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="servicePerformed-simple">
                      Service Performed
                    </InputLabel>
                    <Select
                      value={values.service}
                      onChange={handleChange('service')}
                      inputProps={{
                        name: 'servicePerformed',
                        id: 'servicePerformed-simple',
                      }}
                    >
                      <MenuItem value="10x cDNA preparation">
                        10x cDNA preparation
                      </MenuItem>
                      <MenuItem value="Extraction">Extraction</MenuItem>
                      <MenuItem value="DNA QC">DNA QC</MenuItem>
                      <MenuItem value="cDNA QC">cDNA QC</MenuItem>
                      <MenuItem value="Library Prep">Library Prep</MenuItem>
                      <MenuItem value="Library QC">Library QC</MenuItem>
                      <MenuItem value="Pool QC">Pool QC</MenuItem>
                      <MenuItem value="RNA QC">RNA QC</MenuItem>
                      <MenuItem value="Pathology">Pathology</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    id="downstreamProcess-simple"
                    label="Downstream Process"
                    className={classes.formControl}
                    onChange={handleChange('downstreamProcess')}
                    margin="normal"
                    value={values.downstreamProcess}
                  />
                  <br />
                </div>
                <div className={classes.sectionHeader}>
                  <i className="material-icons">keyboard_arrow_right</i> Select all
                  QC statuses present in this report/project:
                </div>
                <div className={classes.section}>
                  <FormControlLabel
                    control={
                      <Checkbox onChange={handleCheckbox('pass')} value="pass" />
                    }
                    label={'pass'}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox onChange={handleCheckbox('try')} value="try" />
                    }
                    label={'try'}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox onChange={handleCheckbox('fail')} value="fail" />
                    }
                    label={'fail'}
                  />
                </div>
                {values.try && (
                  <div className={classes.section}>
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="rnaChecked-simple">
                        RNA application?
                      </InputLabel>
                      <Select
                        value={values.rnaChecked}
                        onChange={handleCheckbox('rnaChecked')}
                        inputProps={{
                          name: 'rnaChecked',
                          id: 'rnaChecked-simple',
                        }}
                      >
                        <MenuItem value="default" />
                        <MenuItem value="true">yes</MenuItem>
                        <MenuItem value="false">no</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                )}
                <br />
              </React.Fragment>
            )}

            {props.isReQc ? (
              <React.Fragment>
                <div className={classes.sectionHeader}>
                  <i className="material-icons">keyboard_arrow_right</i> Re-QC Notification Options:
                </div>
                <div className={classes.section}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={handleCheckbox('reQcMessage')}
                        checked={values.reQcMessage}
                      />
                    }
                    label={
                      'Your sample(s) have been re-QC\'d. Please see the updated QC results in the grid above.'
                    }
                  />
                  <br/>
                  <br/>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={handleCheckbox('reQcUrgency')}
                        checked={values.reQcUrgency}
                      />
                    }
                    label={
                      'Please submit your processing decisions at your earliest convenience to ensure your samples are included in this week\'s queue. Delays in submission may result in your samples being held until the following week.'
                    }
                  />
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className={classes.sectionHeader}>
                  <i className="material-icons">keyboard_arrow_right</i> Add
                  additional Instructions:
                </div>
                <div className={classes.section}>
                  {values.pass && !values.try && !values.fail && (
                    <FormControlLabel
                      control={
                        <Checkbox onChange={handleCheckbox('movingForward')} />
                      }
                      label='Add: "All samples pass for XYZ and are moving forward."'
                    />
                  )}
                  <FormControlLabel
                    control={<Checkbox onChange={handleCheckbox('onHold')} />}
                    label="IGO will put this project on hold until decisions are submitted for all samples in the grid above."
                  />
                  <br/>
                  <br/>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={handleCheckbox('confirmationRequested')}
                      />
                    }
                    label={
                      'Please confirm that the samples look as expected in order to continue to sequencing.'
                    }
                  />
                  <br/>
                  <br/>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={handleCheckbox('sequencingRequested')}
                      />
                    }
                    label={
                      'To proceed with sequencing, please submit a new iLab request and email the Service ID number to our Sample and Project Management team at igosampleprojmgmt@mskcc.org.'
                    }
                  />
                  <br/>
                  <br/>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={handleCheckbox('samplesDiscardedText')}
                      />
                    }
                    label={
                      'Your samples will now be discarded.'
                    }
                  />
                  <br/>
                  <br/>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={handleCheckbox('pickupInstructionsText')}
                      />
                    }
                    label={
                      'When you\'re ready to pick up your samples, please contact our Sample and Project Management Team at igosampleprojmgmt@mskcc.org.'
                    }
                  />
                  <br/>
                  <br/>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={handleCheckbox('cmoProcessingDecisionsText')}
                      />
                    }
                    label={
                      'Please note that processing decisions should be submitted by the CMO PM team.'
                    }
                  />
                  <br/>
                  <br/>
                  {(showCMOCheckbox()) && (<FormControlLabel
                    control={
                      <Checkbox
                        onChange={handleCheckbox('cmoDecisionsNote')}
                      />
                    }
                    label={
                      'Please note, the QC decisions for this project will be made by the CMO project Management team. Please contact skicmopm@mskcc.org if you have any questions.'
                    }
                  />)}
                  <br/>
                  <br/>
                  {(values['Library Report'] || values['Pool Report']) && (
                    <React.Fragment>
                      <FormControlLabel
                        control={
                          <Checkbox onChange={handleCheckbox('unevenLibrary')} />
                        }
                        label={
                          ' Please note that because the library profiles are not even, the sequencing results may be unbalanced when sequenced together.'
                        }
                      />
                      <br/>
                      <br/>
                      <FormControlLabel
                        control={
                          <Checkbox onChange={handleCheckbox('sizeSelection')} />
                        }
                        label={
                          ' These samples have adapters and/or fragments over 1kb that could affect the sequencing balance across the project. '
                        }
                      />
                      <br/>
                      <br/>
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={handleCheckbox('suggestSizeSelection')}
                          />
                        }
                        label={
                          ' We suggest these samples undergo a size selection, which is not a service IGO provides. If you would like to pick up the samples for size selection, please reply below and we will provide additional instructions.'
                        }
                      />
                    </React.Fragment>
                  )}
                </div>
              </React.Fragment>
            )}
          </form>
        </div>
      </div>
      <div className={classes.preview}>
        <Typography variant="h5" component="h3">
          Preview
        </Typography>
        <div ref={commentEl}>
          <br />
          {props.isReQc ? (
            <span>
              Your sample(s) have been re-QC'd. Please see the updated QC results in the grid above.
              Please submit your processing decisions at your earliest convenience to ensure your samples are included in this week's queue. Delays in submission may result in your samples being held until the following week.
              <br />
              <br />
            </span>
          ) : (
            <span>
              Good{' '}
              {values.salutation || (
                <span className={classes.highlight}>...</span>
              )}{' '}
              {values.addressee || <span className={classes.highlight}>...</span>}
              ,
              <br />
              IGO has completed{' '}
              {values.service || <span className={classes.highlight}>...</span>} on
              Project {props.request.requestId}.
              <br />
              Please see the reports and documents above for the results.
              <br />
              <br />
            </span>
          )}
          
          {renderPreviewText(commentArray)}
          
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
          disabled={
            props.isReQc ? false : (
              ((values['DNA Report'] ||
                values['RNA Report'] ||
                values['Pathology Report'] ||
                values['Pool Report'] ||
                values['Library Report']) &&
                values.salutation !== '' &&
                values.addressee !== '' &&
                values.downstreamProcess !== '' &&
                values.service !== '') === false ||
              props.recipientsBeingEdited === true
            )
          }
        >
          {props.isReQc ? 'Generate Comment' : 'Continue to Review'}
        </Button>
      </div>
    </div>
  );
}