const services = require('../services/services');
const constants = require('../constants');
const db = require('../models');
const Decisions = db.decisions;
const CommentRelations = db.commentRelations;

//TODO set up user authorization logic

// exports.userIsAuthorized = (user, requestId) => {
//     if (user.role === 'lab_member') {
//         return true;
//     } else if ()
// };

exports.buildTableHTML = (tableType, samples, constantColumnFeatures, order, decisions) => {
    const responseColumnFeatures = [];
    const responseHeaders = [];
    const responseSamples = [];

    // leave empty reports empty
    if (!samples || samples.length === 0) {
        return {};
    }

    let exampleSample;
    for (let sample in samples) {
        if ('hideFromSampleQC' in sample && sample['hideFromSampleQC'] === false) {
            exampleSample = sample;
            break;
        } else {
            exampleSample = samples[0];
        }
    }

    for (let constantOrderedColumn in order) {
        if (constantOrderedColumn in constantColumnFeatures) {

            // account for special columns like dropdowns or unitless measurments
            if ('picklistName' in constantColumnFeatures[constantOrderedColumn]) {
                constantColumnFeatures[constantOrderedColumn]['source'] = services.getPicklist(
                    constantColumnFeatures[constantOrderedColumn]['picklistName']
                );
                responseColumnFeatures.push(constantColumnFeatures[constantOrderedColumn]);

            } else if (constantOrderedColumn === 'Concentration') {
                const concentrationColumn = constantColumnFeatures[constantOrderedColumn];
                concentrationColumn['columnHeader'] = (
                    `${constantColumnFeatures[constantOrderedColumn]['columnHeader']} (${exampleSample['concentrationUnits']})`
                );
                responseColumnFeatures.push(concentrationColumn);

            } else if (constantOrderedColumn === 'TotalMass') {
                const massColumn = constantColumnFeatures[constantOrderedColumn];
                if (exampleSample['concentrationUnits'].toLowerCase() === 'ng/ul') {
                    massColumn['columnHeader'] = (
                        `${constantColumnFeatures[constantOrderedColumn]['columnHeader']} (ng)`
                    );
                }
                if (exampleSample['concentrationUnits'].toLowerCase() === 'nm') {
                    massColumn['columnHeader'] = (
                        `${constantColumnFeatures[constantOrderedColumn]['columnHeader']} (fmole)`
                    );
                }

                responseColumnFeatures.push(massColumn);
            } else {
                responseColumnFeatures.push(constantColumnFeatures[constantOrderedColumn]);
            }
        }
    }

    // go through samples to format for FE and handsontable
    for (let sample in samples) {
        const responseSample = {};

        // samples can be selected to be hidden in LIMS
        if ('hideFromSampleQC' in sample && sample['hideFromSampleQC'] === true) {
            continue;
        }

        if (tableType === 'attachments') {
            responseSample['action'] = (
                '<div record-id=\''
                + sample['recordId'].toString()
                + '\' file-name=\''
                + sample['fileName'].toString()
                + '\' class =\'download-icon\'><i class=%s>%s</i></div>'
                % ('material-icons', 'cloud_download')
            );
        }

        for (let dataField in sample) {
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

            if (formattedDataField in order) {
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
                        if (decisions && decisions.length > 0) {
                            for (let decisionRecord in decisions) {
                                console.log(`decisionRecord: ${decisionRecord}`);
                                for (let decision in decisionRecord.decisions) {
                                    for (let decidedSample in decision['samples']) {
                                        if ((sample['recordId'] === decidedSample['recordId']) && 'investigatorDecision' in decidedSample) {
                                            decidedSample['investigatorDecision'] = sampleFieldValue;

                                            //db.session.commit()

                                            responseSample[dataField] = decidedSample['investigatorDecision'];
                                        }
                                    }
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

    for (let column in responseColumnFeatures) {
        responseHeaders.push(column['columnHeader']);
    }

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
exports.isUserAuthorizedForRequest = (requestId, user) => {
    let isAuthorized = false;
    CommentRelations.findAll({
        where: {
            request_id: requestId
        }
    }).then((commentRelationsForRequest) => {
        if (commentRelationsForRequest.length > 0) {
            const username = user.username.toLowerCase();
            for (let relation of commentRelationsForRequest) {
                //username listed specifically
                if (relation.recipients.toLowerCase().includes(username) ||
                    relation.author.toLowerCase() === username) {

                    isAuthorized = true;
                    break;
                }

                // user is PM and skicmopm recipient (PMs do not use zzPDLs for this to be able to communicate with outside investigators)
                if (relation.recipients.toLowerCase().includes(constants.PM_EMAIL_LIST) && user.role === 'cmo_pm') {
                    isAuthorized = true;
                    break;
                }

                // one of user's groups listed
                const recipientArray = relation.recipients.split(',');
                for (let recip of recipientArray) {
                    const recipName = recip.replace('@mskcc.org', '').toLowerCase();
                    if (user.groups.toLowerCase().includes(recipName)) {
                        isAuthorized = true;
                        break;
                    }
                }

                // SKI email and username - do we need this anymore?
                if (relation.recipients.includes('ski.mskcc.org')) {
                    const skiName = username.charAt(-1) + '-' + username.substring(0, username.length - 1);
                    if (relation.recipients.toLowerCase().includes(skiName) ||
                        relation.author.toLowerCase().includes(skiName)) {

                        isAuthorized = true;
                        break;
                    }
                }
            }
            return isAuthorized;
        }
    });
};

exports.getDecisionsForRequest = (requestId) => {
    return Decisions.findAll({
        where: {
            request_id: requestId,
            is_submitted: false
        }
    });
};

exports.isDecisionMade = (reportData) => {
    for (let field of reportData) {
        if (!field.investigatorDecision && field.hideFromSampleQC !== true) {
            return false;
        }
        return true;
    }
};

exports.mergeColumns = (columnObject1, columnObject2) => {
    var res = Object.assign({}, columnObject1, columnObject2);
    return res;
};
