exports.sharedColumns = {
    'SampleId': {
        'limsField': 'SampleId',
        'data': 'sampleId',
        'columnHeader': 'IGO ID',
        'readOnly': 'true',
        'type': 'numeric',
    },
    'RecordId': {
        'limsField': 'RecordId',
        'data': 'recordId',
        'columnHeader': 'Record ID',
        'readOnly': 'true',
    },
    'OtherSampleId': {
        'limsField': 'OtherSampleId',
        'data': 'otherSampleId',
        'columnHeader': 'Sample Name',
        'readOnly': 'true',
        'renderer': 'html',
    },
    'UserSampleID': {
        'limsField': 'UserSampleID',
        'data': 'userSampleID',
        'columnHeader': 'UserSampleID',
        'readOnly': 'true',
    },
    'ConcentrationUnits': {
        'limsField': 'ConcentrationUnits',
        'data': 'concentrationUnits',
        'columnHeader': 'ConcentrationUnits',
        'readOnly': 'true',
    },
    'Preservation': {
        'limsField': 'Preservation',
        'data': 'preservation',
        'columnHeader': 'Preservation',
        'readOnly': 'true',
    },
    'Recipe': {
        'limsField': 'Recipe',
        'data': 'recipe',
        'columnHeader': 'Recipe',
        'readOnly': 'true',
    },
    'IgoQcRecommendation': {
        'limsField': 'IgoQcRecommendation',
        'data': 'igoQcRecommendation',
        'columnHeader': 'IGO Recommendation',
        'readOnly': 'true',
        'renderer': 'html',
    },
    'Comments': {
        'limsField': 'Comments',
        'data': 'comments',
        'columnHeader': 'IGO Comments',
        'readOnly': 'true',
    },
    'DateCreated': {
        'limsField': 'DateCreated',
        'data': 'dateCreated',
        'columnHeader': 'Date Created',
        'readOnly': 'true',
    },
    'Concentration': {
        'limsField': 'Concentration',
        'data': 'concentration',
        'columnHeader': 'Concentration',
        'readOnly': 'true',
    },
    'Volume': {
        'limsField': 'Volume',
        'data': 'volume',
        'columnHeader': 'Volume (uL)',
        'readOnly': 'true',
    },
    'TotalMass': {
        'limsField': 'TotalMass',
        'data': 'totalMass',
        'columnHeader': 'Total Mass',
        'readOnly': 'true',
    },
};

exports.dnaColumns = {
    'Din': {
        'limsField': 'Din',
        'data': 'din',
        'columnHeader': 'DIN',
        'readOnly': 'true',
    },
    'HumanPercentage': {
        'limsField': 'HumanPercentage',
        'data': 'humanPercentage',
        'columnHeader': 'Human %',
        'readOnly': 'true',
    },
    'TumorOrNormal': {
        'limsField': 'TumorOrNormal',
        'data': 'tumorOrNormal',
        'columnHeader': 'Tumor/Normal',
        'readOnly': 'true',
    },
    'SpecimenType': {
        'limsField': 'SpecimenType',
        'data': 'specimenType',
        'columnHeader': 'CMO Sample Type',
        'readOnly': 'true',
    },
    'InvestigatorDecision': {
        'limsField': 'InvestigatorDecision',
        'data': 'investigatorDecision',
        'columnHeader': 'Investigator Decision',
        'readOnly': 'true',
        'type': 'autocomplete',
        'strict': 'true',
        'allowInvalid': 'false',
        'trimDropdown': 'false',
        'picklistName': 'InvestigatorDecisionCustomers',
    },
    'SourceSampleId': {
        'limsField': 'SourceSampleId',
        'data': 'sourceSampleId',
        'columnHeader': 'Source Sample ID',
        'readOnly': 'true',
    },
    'A260230': {
        'limsField': 'A260230',
        'data': 'A260230',
        'columnHeader': '260/230',
        'readOnly': 'true',
    },
    'A260280': {
        'limsField': 'A260280',
        'data': 'A260280',
        'columnHeader': '260/280',
        'readOnly': 'true',
    }
};

exports.rnaColumns = {
    'Rin': {
        'limsField': 'Rin',
        'data': 'rin',
        'columnHeader': 'RIN',
        'readOnly': 'true',
    },
    'Rqn': {
        'limsField': 'Rqn',
        'data': 'rqn',
        'columnHeader': 'RQN',
        'readOnly': 'true',
    },
    'DV200': {
        'limsField': 'DV200',
        'data': 'dV200',
        'columnHeader': 'DV200',
        'readOnly': 'true',
    },
    'InvestigatorDecision': {
        'limsField': 'InvestigatorDecision',
        'data': 'investigatorDecision',
        'columnHeader': 'Investigator Decision',
        'readOnly': 'true',
        'type': 'autocomplete',
        'strict': 'true',
        'allowInvalid': 'false',
        'trimDropdown': 'false',
        'picklistName': 'InvestigatorDecisionCustomers',
    },
    'SourceSampleId': {
        'limsField': 'SourceSampleId',
        'data': 'sourceSampleId',
        'columnHeader': 'Source Sample ID',
        'readOnly': 'true',
    },
    'A260230': {
        'limsField': 'A260230',
        'data': 'A260230',
        'columnHeader': '260/230',
        'readOnly': 'true',
    },
    'A260280': {
        'limsField': 'A260280',
        'data': 'A260280',
        'columnHeader': '260/280',
        'readOnly': 'true',
    }
};

exports.libraryColumns = {
    'AvgSize': {
        'limsField': 'AvgSize',
        'data': 'avgSize',
        'columnHeader': 'Average Size (bp)',
        'readOnly': 'true',
    },
    'TumorOrNormal': {
        'limsField': 'TumorOrNormal',
        'data': 'tumorOrNormal',
        'columnHeader': 'Tumor/Normal',
        'readOnly': 'true',
    },
    'InvestigatorDecision': {
        'limsField': 'InvestigatorDecision',
        'data': 'investigatorDecision',
        'columnHeader': 'Investigator Decision',
        'readOnly': 'true',
        'type': 'autocomplete',
        'strict': 'true',
        'allowInvalid': 'false',
        'trimDropdown': 'false',
        'picklistName': 'InvestigatorDecisionCustomers',
    },
    'SourceSampleId': {
        'limsField': 'SourceSampleId',
        'data': 'sourceSampleId',
        'columnHeader': 'Source Sample ID',
        'readOnly': 'true',
    },
    'NumOfReads': {
        'limsField': 'NumOfReads',
        'data': 'numOfReads',
        'columnHeader': 'Number of Reads',
        'readOnly': 'true',
    }
};

exports.poolColumns = {
    'AvgSize': {
        'limsField': 'AvgSize',
        'data': 'avgSize',
        'columnHeader': 'Average Size (bp)',
        'readOnly': 'true',
    },
    'TumorOrNormal': {
        'limsField': 'TumorOrNormal',
        'data': 'tumorOrNormal',
        'columnHeader': 'Tumor/Normal',
        'readOnly': 'true',
    },
    'InvestigatorDecision': {
        'limsField': 'InvestigatorDecision',
        'data': 'investigatorDecision',
        'columnHeader': 'Investigator Decision',
        'readOnly': 'true',
        'type': 'autocomplete',
        'strict': 'true',
        'allowInvalid': 'false',
        'trimDropdown': 'false',
        'picklistName': 'InvestigatorDecisionCustomers',
    },
    'NumOfReads': {
        'limsField': 'NumOfReads',
        'data': 'numOfReads',
        'columnHeader': 'Number of Reads',
        'readOnly': 'true',
    }
};

exports.pathologyColumns = {
    'SampleId': {
        'limsField': 'SampleId',
        'data': 'sampleId',
        'columnHeader': 'IGO ID',
        'readOnly': 'true',
    },
    'RecordId': {
        'limsField': 'RecordId',
        'data': 'recordId',
        'columnHeader': 'Record ID',
        'readOnly': 'true',
    },
    'OtherSampleId': {
        'limsField': 'OtherSampleId',
        'data': 'otherSampleId',
        'columnHeader': 'Sample Name',
        'readOnly': 'true',
    },
    //  'UserSampleID': 'altId': {'limsField': 'AltId', 'data': 'altId', 'columnHeader': 'AltId','readOnly':'true',},
    'SampleStatus': {
        'limsField': 'SampleStatus',
        'data': 'sampleStatus',
        'columnHeader': 'QC Status',
        'readOnly': 'true',
        'renderer': 'html',
    },
};

exports.attachmentColumns = {
    'FileName': {
        'limsField': 'FilePath',
        'data': 'fileName',
        'columnHeader': 'File Name',
        'readOnly': 'true',
    },
    'Action': {
        'data': 'action',
        'columnHeader': 'Action',
        'renderer': 'html',
        'readOnly': 'true',
    },
    'RecordId': {
        'limsField': 'RecordId',
        'data': 'recordId',
        'columnHeader': 'Record ID',
        'readOnly': 'true',
    },
};

// last column is always RecordId. Needed to set investigator decision efficiently
exports.dnaOrder = [
    'OtherSampleId',
    'Recipe',
    'IgoQcRecommendation',
    'Comments',
    'InvestigatorDecision',
    'SampleId',
    'Concentration',
    'Volume',
    'TotalMass',
    'Din',
    'SpecimenType',
    'HumanPercentage',
    'TumorOrNormal',
    'Preservation',
    'SourceSampleId',
    'A260230',
    'A260280',
    'RecordId',
];

exports.rnaOrder = [
    'OtherSampleId',
    'Recipe',
    'IgoQcRecommendation',
    'Comments',
    'InvestigatorDecision',
    'SampleId',
    'Concentration',
    'Volume',
    'TotalMass',
    'Rin',
    'DV200',
    'Preservation',
    'Rqn',
    'SourceSampleId',
    'A260230',
    'A260280',
    'RecordId',
];

exports.libraryOrder = [
    'OtherSampleId',
    'Recipe',
    'IgoQcRecommendation',
    'Comments',
    'InvestigatorDecision',
    'SampleId',
    'AvgSize',
    'Concentration',
    'Volume',
    'TotalMass',
    'TumorOrNormal',
    'SourceSampleId',
    'NumOfReads',
    'RecordId',
];

exports.poolOrder = [
    'OtherSampleId',
    'Recipe',
    'IgoQcRecommendation',
    'Comments',
    'InvestigatorDecision',
    'SampleId',
    'AvgSize',
    'Concentration',
    'Volume',
    'TotalMass',
    'TumorOrNormal',
    'NumOfReads',
    'RecordId',
];

exports.pathologyOrder = ['OtherSampleId', 'SampleStatus', 'SampleId', 'RecordId'];

exports.attachmentOrder = ['FileName', 'Action', 'RecordId'];


exports.pending_order = [
    'Request',
    'First notification',
    // 'Most recent notification',
    'Report',
    'Author',
    // 'Lab Notifications',
    // 'PM Notifications',
    // 'User Replies',
    'Recipients',
    'Show',
];

exports.user_pending_order = [
    'Request',
    'First notification',
    // 'Most recent notification',
    'Report',
    'Show',
];

exports.user_training_string = 'Unfamiliar with this new process for sharing QC results? Watch our 5 minute <a href="https://igo.mskcc.org/sample-qc/instructions">how-to video</a>.';

exports.PM_EMAIL_LIST = 'skicmopm';

exports.emailConfig = {
    notificationSender: 'igoski@mskcc.org',
    cmoPmEmail: 'skicmopm@mskcc.org',
    devSubject: '[SampleQC Beta-Test]',
    subject: '[IGO SampleQC]',
    footer: `<br><a style="color:#f29934; font-weight:bold;" href="https://genomics.mskcc.org">Integrated Genomics Operation</a><br><a href="https://www.mskcc.org">Memorial Sloan Kettering Cancer Center</a><br>T 646.888.3765<br>Follow us on <a href="https://www.instagram.com/genomics212/?hl=en">Instagram</a> and <a href="https://twitter.com/genomics212?lang=en">Twitter</a>!<br><br><br>${this.user_training_string}`,
};
