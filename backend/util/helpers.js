const constants = require('../constants');
const db = require('../models');
const Decisions = db.decisions;
const CommentRelations = db.commentRelations;


exports.buildTableHTML = (tableType, samples, constantColumnFeatures, order, decisionSamples) => {
    const responseColumnFeatures = [];
    const responseHeaders = [];
    const responseSamples = [];

    // leave empty reports empty
    if (!samples || samples.length === 0) {
        return {};
    }

    let exampleSample = samples[0];
    const sampleUnits = exampleSample['concentrationUnits'] ? exampleSample['concentrationUnits'].toLowerCase() : '';

    order.forEach(constantOrderedColumn => {
        if (constantOrderedColumn in constantColumnFeatures) {

            // account for special columns like unitless measurements
            if (constantOrderedColumn === 'Concentration') {
                const concentrationColumn = constantColumnFeatures[constantOrderedColumn];
                const columnName = constantColumnFeatures[constantOrderedColumn]['columnHeader'];

                // if column name already includes units, don't add again
                concentrationColumn['columnHeader'] = columnName.toLowerCase().includes(sampleUnits) ?
                    columnName : (
                        `${constantColumnFeatures[constantOrderedColumn]['columnHeader']} (${exampleSample['concentrationUnits']})`
                    );

                responseColumnFeatures.push(concentrationColumn);

            } else if (constantOrderedColumn === 'TotalMass') {
                const massColumn = constantColumnFeatures[constantOrderedColumn];
                const columnName = constantColumnFeatures[constantOrderedColumn]['columnHeader'];
                
                if (sampleUnits === 'ng/ul') {
                    // if column name already includes units, don't add again
                    massColumn['columnHeader'] = columnName.toLowerCase().includes('(ng)') ? columnName : (
                        `${constantColumnFeatures[constantOrderedColumn]['columnHeader']} (ng)`
                    );
                }
                if (sampleUnits === 'nm') {
                    // if column name already includes units, don't add again
                    massColumn['columnHeader'] = columnName.toLowerCase().includes('(fmole)') ? columnName : (
                        `${constantColumnFeatures[constantOrderedColumn]['columnHeader']} (fmole)`
                    );
                }

                responseColumnFeatures.push(massColumn);
            } else {
                responseColumnFeatures.push(constantColumnFeatures[constantOrderedColumn]);
            }
        }
    });

    // go through samples to format for FE and handsontable
    samples.forEach(sample => {
        const responseSample = {};

        // samples can be selected to be hidden in LIMS
        if (sample['hideFromSampleQC'] === false || !sample['hideFromSampleQC']) {

            if (tableType === 'attachments') {
                const downloadUrl = process.env.LIMS_API_ROOT.split('https://')[1];
                responseSample['action'] = (
                    `<div record-id=${sample['recordId'].toString()} file-name=${sample['fileName'].toString()} class="download-icon">
                    <a href="https://${process.env.LIMS_USER}:${process.env.LIMS_PW}@${downloadUrl}/getAttachmentFile?recordId=${sample['recordId'].toString()}" download>
                    <i class="material-icons">cloud_download</i>
                    </a>
                    </div>`
                );
            }

            for (let dataField of Object.keys(sample)) {
                const formattedDataField = dataField.charAt(0).toUpperCase() + dataField.slice(1);
                let sampleFieldValue = sample[dataField];
                const measurements = [
                    'concentration',
                    'totalMass',
                    'rin',
                    'din',
                    'dV200',
                    'humanPercentage',
                    'cqN1',
                    'cqN2',
                    'cqRP'
                ];

                if (order.includes(formattedDataField)) {
                    if (dataField === 'otherSampleId' && sampleFieldValue.includes(',')) {
                        sampleFieldValue = sampleFieldValue.replaceAll(',', ', ');
                        responseSample[dataField] = sampleFieldValue.replaceAll('-', '&#8209;');

                    } else if (dataField === 'igoQcRecommendation') {
                        const recommendation = sampleFieldValue;
                        responseSample[dataField] = (`<div class=${recommendation.toLowerCase()}>${recommendation}</div>`);

                    } else if (measurements.includes(dataField)) {
                    // round measurements to 1 decimal
                        if (sampleFieldValue || sampleFieldValue === 0.0) {
                            const roundedNumString = Number(sampleFieldValue).toFixed(1);
                            const roundedNum = parseFloat(roundedNumString);
                            responseSample[dataField] = roundedNum;
                        } else {
                            responseSample[dataField] = sampleFieldValue;
                        }
                    
                    } else if (dataField === 'volume' || dataField === 'avgSize') {
                        if (sampleFieldValue) {
                            const roundedNumString = Number(sampleFieldValue).toFixed(0);
                            const roundedNum = parseFloat(roundedNumString);
                            responseSample[dataField] = roundedNum;
                        } else {
                            responseSample[dataField] = sampleFieldValue;
                        }

                    } else if (dataField === 'action') {
                        responseSample[dataField] = (
                            '<div class ="download-icon"><i class="material-icons">cloud_download</i></div>'
                        );

                    } else if (dataField === 'sampleStatus') {
                        responseSample[dataField] = `<div class='pathology-status'>${sampleFieldValue}</div>`;
                    }
                    // non-empty lims decisions overwrite investigator decisions for non-submitted decisions
                    else if (dataField === 'investigatorDecision') {
                        if (dataField in sample && sampleFieldValue) {
                            responseSample[dataField] = sampleFieldValue;
                        } else {
                            if (decisionSamples && decisionSamples.length > 0) {
                                for (let i = 0; i < decisionSamples.length; i++) {
                                    const decidedSample = decisionSamples[i];
                                    if ((sample['recordId'] === decidedSample['recordId']) && 'investigatorDecision' in decidedSample) {
                                        // decidedSample['investigatorDecision'] = sampleFieldValue;
                                        responseSample[dataField] = decidedSample['investigatorDecision'];
                                    }
                                }
                            } else {
                                responseSample[dataField] = null;
                            }
                        }
                    } else {
                        responseSample[dataField] = sampleFieldValue;
                    }
                }
            }
            responseSamples.push(responseSample);
        }
    });

    responseColumnFeatures.forEach(column => {
        responseHeaders.push(column['columnHeader']);
    });

    if (responseSamples.length > 0) {
        return {
            data: responseSamples,
            columnFeatures: responseColumnFeatures,
            columnHeaders: responseHeaders
        };
    } else {
        return {};
    }
};

exports.buildPendingList = (pendings, isUser) => {
    const responsePendings = [];
    for (let pending of pendings) {
        // console.log(pending.dataValues.request_id);
        const responsePending = {};
        responsePending['request_id'] = pending.request_id;
        responsePending['date'] = pending.createdAt.toLocaleString();

        responsePending['most_recent_date'] = pending.createdAt.toLocaleString();

        // TODO FIX LAST CHILD DATE BEFORE DEPLOY
        // if (pending.children() && pending.children().length > 0) {
        //     responsePending['most_recent_date'] = pending.children[-1].createdAt.toLocaleString();
        // } else {
        //     responsePending['most_recent_date'] = pending.createdAt.toLocaleString();
        // }

        responsePending['report'] = pending.report;
        responsePending['show'] = `<span pending-id='${pending.request_id}' class ='show-icon'><i class='material-icons'>forward</i></span>`;

        // show additional fields for lab_member and project_manager roles
        if (!isUser) {
            responsePending['author'] = pending.author;
            responsePending['recipients'] = `<div class='recipients-col'>${pending.recipients.replaceAll(',', '\n')}</div>`;
            responsePending['lab_notifications'] = 0;
            responsePending['pm_notifications'] = 0;
            responsePending['user_replies'] = 0;
    
            // TODO - PROPERLY QUERY FOR COMMENT COUNT BEFORE DEPLOYMENT
            // const comments = pending.children();
            // for (let comment in comments) {
            //     if (comment.author.role === 'lab_member') {
            //         responsePending['lab_notifications'] += 1;
            //     }
            //     if (comment.author.role === 'project_manager') {
            //         responsePending['pm_notifications'] += 1;
            //     }
            //     if (comment.author.role === 'user') {
            //         responsePending['user_replies'] += 1;
            //     }
            // }
        }

        responsePendings.push(responsePending);
    }

    const columnFeatures = isUser ? [
        {data: 'request_id', readOnly: true},
        {data: 'date', readOnly: true},
        {data: 'most_recent_date', readOnly: true},
        {data: 'report', readOnly: true},
        {data: 'show', readOnly: true, renderer: 'html'},
    ] : [
        {data: 'request_id', readOnly: true},
        {data: 'date', readOnly: true},
        {data: 'most_recent_date', readOnly: true},
        {data: 'report', readOnly: true},
        {data: 'author', readOnly: true},
        {data: 'lab_notifications', readOnly: true},
        {data: 'pm_notifications', readOnly: true},
        {data: 'user_replies', readOnly: true},
        {data: 'recipients', readOnly: true, renderer: 'html'},
        {data: 'show', readOnly: true, renderer: 'html'},
    ];

    return {
        data: responsePendings,
        columnFeatures: columnFeatures,
        columnHeaders: isUser ? constants.user_pending_order : constants.pending_order
    };
};

// returns true if user is associated with request as recipient
// returns false if request has no inital comment OR user is not associated
exports.isUserAuthorizedForRequest = (commentRelationsForRequest, user) => {
    let isAuthorized = false;
    if (commentRelationsForRequest && commentRelationsForRequest.length > 0) {
        const username = user.username.toLowerCase();
        for (let i = 0; i < commentRelationsForRequest.length; i++) {
            const relationData = commentRelationsForRequest[i].dataValues;

            //username listed specifically
            if (relationData.recipients.toLowerCase().includes(username) ||
                relationData.author.toLowerCase() === username) {

                isAuthorized = true;
                break;
            }

            // user is PM and skicmopm recipient (PMs do not use zzPDLs for this to be able to communicate with outside investigators)
            if (relationData.recipients.toLowerCase().includes(constants.PM_EMAIL_LIST) && user.role === 'cmo_pm') {
                isAuthorized = true;
                break;
            }

            // one of user's groups listed
            const recipientArray = relationData.recipients.split(',');
            let isInUserGroup = false;
            for (let j = 0; j < recipientArray.length; j++) {
                const recipName = recipientArray[i].replace('@mskcc.org', '').toLowerCase();
                if (user.groups.toLowerCase().includes(recipName)) {
                    isInUserGroup = true;
                    break;
                }
            }
            if (isInUserGroup) {
                isAuthorized = true;
                break;
            }

            // SKI email and username - do we need this anymore?
            if (relationData.recipients.includes('ski.mskcc.org')) {
                const skiName = username.charAt(-1) + '-' + username.substring(0, username.length - 1);
                if (relationData.recipients.toLowerCase().includes(skiName) ||
                    relationData.author.toLowerCase().includes(skiName)) {

                    isAuthorized = true;
                    break;
                }
            }
        }
        return isAuthorized;
    }
};

exports.getCommentRelationsForRequest = (requestId) => {
    CommentRelations.findAll({
        where: {
            request_id: requestId
        }
    }).then(responseData => {
        return responseData;
    }).catch(error => {
        console.log(`error getting comment relations ${error}`);
        return;
    });
};

exports.getDecisionsForRequest = (requestId) => {
    Decisions.findAll({
        where: {
            request_id: requestId,
            is_submitted: false
        }
    }).then(responseData => {
        return responseData;
    }).catch(error => {
        console.log(`error getting decisions ${error}`);
        return;
    });
};

exports.isDecisionMade = (reportData) => {
    for (let i = 0; i < reportData.length; i++) {
        const reportObj = reportData[i];
        const hasDecision = reportObj.investigatorDecision && reportObj.investigatorDecision !== '';
        if (!hasDecision && reportObj.hideFromSampleQC !== true) {
            return false;
        }
    }
    return true;
};

exports.mergeColumns = (columnObject1, columnObject2) => {
    var res = Object.assign({}, columnObject1, columnObject2);
    return res;
};
