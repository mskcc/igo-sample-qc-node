// import { Config } from "../secret_config.js";

export const fillReportTables = (reportList) => {
  let tables = {};
  let dnaReport = reportList.dnaReportSamples;
  let rnaReport = reportList.rnaReportSamples;
  let libraryReport = reportList.libraryReportSamples;
  let poolReport = reportList.poolReportSamples;
  let pathologyReport = reportList.pathologyReportSamples;
  let attachments = reportList.attachments;

  if (dnaReport && dnaReport.data) {
    dnaReport.data = sortBySampleId(dnaReport.data);

    tables['DNA Report'] = dnaReport;
  }
  if (rnaReport && rnaReport.data) {
    rnaReport.data = sortBySampleId(rnaReport.data);
    tables['RNA Report'] = rnaReport;
  }
  if (libraryReport && libraryReport.data) {
    libraryReport.data = sortBySampleId(libraryReport.data);
    tables['Library Report'] = libraryReport;
  }
  if (poolReport && poolReport.data) {
    poolReport.data = sortBySampleId(poolReport.data);
    tables['Pool Report'] = poolReport;
  }
  if (pathologyReport && pathologyReport.data) {
    pathologyReport.data = sortBySampleId(pathologyReport.data);
    tables['Pathology Report'] = pathologyReport;
  }

  if (attachments && attachments.data) {
    tables['Attachments'] = attachments;
  }

  return tables;
};

export const setTableReadOnlyAfterDecisions = (
  tables,
  currentReport,
  state
) => {
  if (
    currentReport === 'DNA Report' ||
    currentReport === 'RNA Report' ||
    currentReport === 'Pool Report' ||
    currentReport === 'Library Report'
  ) {
    for (let feature in tables[currentReport].columnFeatures) {
      if (
        tables[currentReport].columnFeatures[feature].limsField ===
        'InvestigatorDecision'
      ) {
        tables[currentReport].columnFeatures[feature].readOnly = state;
        tables[currentReport].readOnly = state;
        break;
      }
    }
  }

  return tables;
};

//  checks wether investigator made decisions for each sample
//  defaults to true and returns false as soon as it finds an empty value
export const allDecisionsMade = (tables, currentReport) => {
  let result = true;
  // for (let table in tables) {
  // decisions only need to be made for these three tables
  if (
    currentReport === 'DNA Report' ||
    currentReport === 'RNA Report' ||
    currentReport === 'Pool Report' ||
    currentReport === 'Library Report'
  ) {
    for (var j = 0; j < tables[currentReport].data.length; j++) {
      if (
        tables[currentReport].data[j].investigatorDecision != null &&
        tables[currentReport].data[j].investigatorDecision !== ''
      ) {
        result = true;
        continue;
      } else {
        return false;
      }
    }
  }
  return result;
};

// checks to make sure Investigator decision is only one of two options in the dropdown - NOT manually typed in
export const validateDecisions = (tables, currentReport) => {
  let result = true;
  if (
    currentReport === 'DNA Report' ||
    currentReport === 'RNA Report' ||
    currentReport === 'Pool Report' ||
    currentReport === 'Library Report'
  ) {
    for (var j = 0; j < tables[currentReport].data.length; j++) {
      if (
        tables[currentReport].data[j].investigatorDecision === 'Continue processing' ||
        tables[currentReport].data[j].investigatorDecision === 'Stop processing at this time' ||
        tables[currentReport].data[j].investigatorDecision === 'Already moved forward by IGO' ||
        tables[currentReport].data[j].investigatorDecision === 'Discarded' ||
        tables[currentReport].data[j].investigatorDecision === 'N/A- QC only request' ||
        tables[currentReport].data[j].investigatorDecision === 'Request closed by IGO' ||
        tables[currentReport].data[j].investigatorDecision === 'Submit new iLab request' ||
        tables[currentReport].data[j].investigatorDecision === 'Pending Fingerprinting' ||
        tables[currentReport].data[j].investigatorDecision === 'Pending Human Content Assay'
      ) {
        result = true;
        continue;
      } else {
        return false;
      }
    }
  }
  return result;
};

//  checks if data was delivered with readonly set for invDec
// determines wether creating an initial comment also triggers an entry to the decisions table
export const allDecisionsMadeInBackend = (columnFeatures, currentReport) => {
  let result = false;
  

  if (
    currentReport === 'DNA Report' ||
    currentReport === 'RNA Report' ||
    currentReport === 'Pool Report' ||
    currentReport === 'Library Report'
  ) {
    for (let index in columnFeatures) {
      if (columnFeatures[index].data === 'investigatorDecision') {
        return columnFeatures[index].readOnly;
      }
    }
  }
  return result;
};

// assemble decision object [{datatype:"report",samples: [{"RecordId" : recordId, "InvestigatorDecision": decision}]}]
export const generateDecisionSubmitData = (tables, currentReport) => {
  let submitData = [];
  // for (let table in tables) {
  let dataType = '';
  if (currentReport === 'DNA Report') {
    dataType = 'qcReportDna';
  }
  if (currentReport === 'RNA Report') {
    dataType = 'qcReportRna';
  }
  if (currentReport === 'Library Report' || currentReport === 'Pool Report') {
    dataType = 'qcReportLibrary';
  }
  // LIMS expects a JSON array because it is able to do multiple reports' decisions at once
  submitData[0] = { dataType: dataType, samples: [] };

  for (var j = 0; j < tables[currentReport].data.length; j++) {
    if (tables[currentReport].data[j].investigatorDecision) {
      submitData[0].samples.push({
        recordId: tables[currentReport].data[j].recordId,
        sampleId: tables[currentReport].data[j].sampleId,
        otherSampleId: tables[currentReport].data[j].otherSampleId,
        investigatorDecision:
          tables[currentReport].data[j].investigatorDecision,
      });
    }
  }
  // }
  return submitData;
};

export const cleanAndFilterRecipients = (stateRecipients) => {
  let recipients = Object.values(stateRecipients);
  //  clear out empty ones

  // split comma separated ones and filter out empty ones
  let filteredRecipients = [];
  for (var i = recipients.length - 1; i >= 0; i--) {
    if (recipients[i]) {
      let recipient = recipients[i].replace(/;/gi, ',');
      if (recipient.includes(',')) {
        filteredRecipients = filteredRecipients.concat(recipient.split(','));
      } else {
        filteredRecipients.push(recipient);
      }
    }
  }

  let uniqueRecipients = new Set(filteredRecipients);
  uniqueRecipients = Array.from(uniqueRecipients);
  return uniqueRecipients;
};

// determines wether all initial comments have been sent out, only then users
// can reply to all reports present
export const allIntialCommentsSent = (reportsWithComments, tablesPresent) => {
  // filter both objects for elements that have "report" in their name (attachments don't have comments)
  reportsWithComments = reportsWithComments.filter((commentReport) =>
    commentReport.includes('Report')
  );
  tablesPresent = tablesPresent.filter((tableReport) =>
    tableReport.includes('Report')
  );

  return reportsWithComments.length === tablesPresent.length;
};

// I take a value and try to return a value in which
// the numeric values have a standardized number of
// leading and trailing zeros. This *MAY* help makes
// an alphabetic sort seem more natural to the user's
// intent.
export const normalizeMixedDataValue = (value) => {
  var padding = '000000000000000';

  // Loop over all numeric values in the string and
  // replace them with a value of a fixed-width for
  // both leading (integer) and trailing (decimal)
  // padded zeroes.
  value = value.replace(/(\d+)((\.\d+)+)?/g, function (
    $0,
    integer,
    decimal,
    $3
  ) {
    // If this numeric value has "multiple"
    // decimal portions, then the complexity
    // is too high for this simple approach -
    // just return the padded integer.
    if (decimal !== $3) {
      return padding.slice(integer.length) + integer + decimal;
    }

    decimal = decimal || '.0';

    return (
      padding.slice(integer.length) +
      integer +
      decimal +
      padding.slice(decimal.length)
    );
  });

  return value;
};

const sortBySampleId = (data) => {
  data.sort(function (a, b) {
    // Normalize the file names with fixed-
    // width numeric data.
    var aMixed = normalizeMixedDataValue(a.sampleId);
    var bMixed = normalizeMixedDataValue(b.sampleId);

    return aMixed < bMixed ? -1 : 1;
  });
  return data;
};

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};
