const nodemailer = require('nodemailer');
const { logger } = require('./winston');
const { emailConfig } = require('../constants');

const ENVIRONMENT = process.env.ENV;
const devRecipients = [
    'delbels@mskcc.org',
    'mirhajf@mskcc.org',
    'patelo2@mskcc.org'
];

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    port: 25,
    host: 'localhost',
    tls: {
        rejectUnauthorized: false,
    },
    //secure: process.env.EMAIL_SMTP_SECURE, // lack of ssl commented this. You can uncomment it.
    // auth: {
    // 	user: process.env.EMAIL_SMTP_USERNAME,
    // 	pass: process.env.EMAIL_SMTP_PASSWORD
    // }
});

exports.sendInitialNotification = function(recipients, requestId, report, author, isDecided, isPathologyReport, isCmoPmProject) {
    const reportType = report.split(' ')[0];
    const actionNotNeeded = isDecided || isPathologyReport || isCmoPmProject;
    const actionText = actionNotNeeded ? '' : ', Pending further action';
    let email;
    let contentBody;

    if (isCmoPmProject) {
        contentBody = `Hello,<br><br>IGO has completed ${reportType} QC on project ${requestId}. <br><br>You can view the results at <a href="https://igo.mskcc.org/sample-qc/">igo.mskcc.org/sample-qc/</a> and search your request ID in the search box. Your Project Manager will be handling any QC related decisions and questions.<br><br>Thank you,<br><br><span style='color:#f29934; font-weight:bold;'>${author.full_name}</span><br>${author.title}`;
    } else {
        contentBody = `Hello,<br><br>IGO has completed ${reportType} QC on project ${requestId}. <br><br>Please proceed to <a href="https://igo.mskcc.org/sample-qc/">igo.mskcc.org/sample-qc/</a> and search your request ID in the search box to ask any questions, download related documents, and to indicate which sample(s) should continue with processing.<br><br>Thank you,<br><br><span style='color:#f29934; font-weight:bold;'>${author.full_name}</span><br>${author.title}`;
    }

    // dev testing
    if (ENVIRONMENT === 'development') {
        contentBody = contentBody + `<br><br>In production, this email would have been sent to: ${recipients}<br><br>`;
        email = {
            subject: `${emailConfig.devSubject} ${requestId} ${reportType} QC results available${actionText}`,
            content: contentBody,
            footer: emailConfig.footer,
            mailTo: devRecipients.join(',')
        };
    } else {
        email = {
            subject: `${emailConfig.subject} ${requestId} ${reportType} QC results available${actionText}`,
            content: contentBody,
            footer: emailConfig.footer,
            mailTo: recipients
        };
    }

    logger.info(`Initial email ${email} sent to recipients.`);
    transporter
        .sendMail({
            from: emailConfig.notificationSender,
            to: email.mailTo,
            subject: email.subject,
            html: email.content + email.footer,
        })
        // .then((result) => console.log(result))
        .catch((error) => console.log(error));
};

exports.sendNotification = function(recipients, comment, requestId, report, author) {
    const reportType = report.split(' ')[0];
    let contentBody = `Hello,<br><br>The following comment has been added to ${reportType} QC on project ${requestId} by ${author.full_name}.<br><br>'${comment}'<br><br>Please proceed to <a href="https://igo.mskcc.org/sample-qc/">igo.mskcc.org/sample-qc/</a> and search your request ID in the search box if you would like to reply.<br><br>Thank you,`;
    let email;

    if (ENVIRONMENT === 'development') {
        contentBody = contentBody + `<br><br>In production, this email would have been sent to: ${recipients}<br><br>`;
        email = {
            subject: `${emailConfig.devSubject} ${requestId} New Comment`,
            content: contentBody,
            footer: emailConfig.footer,
            mailTo: devRecipients.join(',')
        };
    } else {
        email = {
            subject: `${emailConfig.subject} ${requestId} New Comment`,
            content: contentBody,
            footer: emailConfig.footer,
            mailTo: recipients
        };
    }

    logger.info(`Comment email ${email} sent to recipients.`);
    transporter
        .sendMail({
            from: emailConfig.notificationSender,
            to: email.mailTo,
            subject: email.subject,
            html: email.content + email.footer,
        })
        // .then((result) => console.log(result))
        .catch((error) => console.log(error));
};

exports.sendDecisionNotification = function(decision, decisionUser, recipients) {
    let contentBody = `Hello,<br><br>Decisions have been submitted for project ${decision.request_id} by ${decisionUser}.<br><br><span style="font-weight:bold;"> To make any changes to the decisions, please reach out to IGO at zzPDL_IGO_Staff@mskcc.org.</span><br>You can find the project at <a href="https://igo.mskcc.org/sample-qc/request/${decision.request_id}">igo.mskcc.org/sample-qc/request/${decision.request_id}</a>.<br><br>Thank you,`;
    let email;

    if (ENVIRONMENT === 'development') {
        contentBody = contentBody + `<br><br>In production, this email would have been sent to: ${recipients}<br><br>`;
        email = {
            subject: `${emailConfig.devSubject} ${decision.request_id} Decisions Submitted for ${decision.report}`,
            content: contentBody,
            footer: emailConfig.footer,
            mailTo: devRecipients.join(',')
        };
    } else {
        email = {
            subject: `${emailConfig.subject} ${decision.request_id} Decisions Submitted for ${decision.report}`,
            content: contentBody,
            footer: emailConfig.footer,
            mailTo: recipients
        };
    }

    logger.info(`Decision email ${email} sent to recipients.`);
    transporter
        .sendMail({
            from: emailConfig.notificationSender,
            to: email.mailTo,
            subject: email.subject,
            html: email.content + email.footer,
        })
        // .then((result) => console.log(result))
        .catch((error) => console.log(error));
};

exports.sendStopProcessingNotification = function (decision, decisionUser, recipients) {
    let contentBody = `Hello,<br><br>For project ${decision.request_id} Stop Processing decision(s) have been submitted by ${decisionUser}.<br><br><span style="font-weight:bold;"> This is to notify you to check if the iLab proper charges for these samples are present.</span><br>You can find the project at <a href="https://igo.mskcc.org/sample-qc/request/${decision.request_id}">igo.mskcc.org/sample-qc/request/${decision.request_id}</a>.<br><br>Thank you,`;
    let email;

    if (ENVIRONMENT === 'development') {
        contentBody = contentBody + `<br><br>In production, this email would have been sent to: ${recipients}<br><br>`;
        email = {
            subject: `${emailConfig.devSubject} ${decision.request_id} Stop Processing Decision(s) Submitted for ${decision.report}`,
            content: contentBody,
            footer: emailConfig.footer,
            mailTo: devRecipients.join(',')
        };
    } else {
        email = {
            subject: `${emailConfig.subject} ${decision.request_id} Stop Processing Decision(s) Submitted for ${decision.report}`,
            content: contentBody,
            footer: emailConfig.footer,
            mailTo: recipients
        };
    }

    logger.info(`Stop processing email ${email} sent to recipients.`);
    transporter
        .sendMail({
            from: emailConfig.notificationSender,
            to: email.mailTo,
            subject: email.subject,
            html: email.content + email.footer,
        })
        // .then((result) => console.log(result))
        .catch((error) => console.log(error));
};
