const services = require('../services/services');

//TODO set up user authorization logic

// exports.userIsAuthorized = (user, requestId) => {
//     if (user.role === 'lab_member') {
//         return true;
//     } else if ()
// };

export const buildTableHTML = (tableType, samples, constantColumnFeatures, order, decisions) => {
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
