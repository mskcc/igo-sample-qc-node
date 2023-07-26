const https = require('https');
import axios from 'axios';
const { logger } = require('../util/winston');

const LIMS_AUTH = {
    username: process.env.LIMS_USER,
    password: process.env.LIMS_PW,
};
const LIMS_URL = process.env.LIMS_API_ROOT;

// LIMS is authorized. Avoids certificate verification & "unable to verify the first certificate in nodejs" errors
const agent = new https.Agent({
    rejectUnauthorized: false,
});
const axiosConfig = {
    httpsAgent: agent,
};

const formatData = function (resp) {
    const data = resp.data || [];
    return data;
};
const info = (url) => logger.info(`Successfully retrieved response from ${url}`);
const errorlog = (url) => logger.error(url);

exports.getRequestSamples = (requestId) => {
    const url = `${LIMS_URL}/api/getRequestSamples?request=${requestId}`;
    logger.info(`Sending request to ${url}`);
    return axios
        .get(url, {auth: {...LIMS_AUTH}, ...axiosConfig})
        .then((resp) => {
            if (resp.data && resp.data[0] && resp.data[0].includes('ERROR')) {
                errorlog(url);
                return [];
            }
            info(url);
            return resp;
        })
        .catch((error) => {
            errorlog(url);
            throw error;
        })
        .then((resp) => {
            return formatData(resp);
        });
};

exports.getQcReportSamples = (requestData) => {
    const url = `${LIMS_URL}/getQcReportSamples`;
    logger.info(`Sending request to ${url}`);
    return axios
        .post(
            url,
            {},
            {
                auth: { ...LIMS_AUTH },
                params: { requestData },
                ...axiosConfig,
            }
        )
        .then((resp) => {
            info(url);
            return resp;
        })
        .catch((error) => {
            errorlog(url);
            if (error.response) {
                throw error.response.data;
            } else {
                throw error;
            }
        })
        .then((resp) => {
            return formatData(resp);
        });
};

exports.getPicklist = (listName) => {
    const url = `${LIMS_URL}/getPickListValues?list=${listName}`;
    logger.info(`Sending request to ${url}`);
    return axios
        .get(url, {
            auth: { ...LIMS_AUTH },
            ...axiosConfig,
        })
        .then((resp) => {
            if (resp.data && resp.data[0] && resp.data[0].includes('ERROR')) {
                errorlog(url);
                return [];
            }
            info(url);
            return resp;
        })
        .catch((error) => {
            errorlog(url);
            throw error;
        })
        .then((resp) => {
            return formatData(resp);
        });
};

exports.setQCInvestigatorDecision = (decisionsData) => {
    const url = `${LIMS_URL}/setInvestigatorDecision`;
    logger.info(`Sending request to ${url}`);
    return axios
        .post(
            url,
            {},
            {
                auth: { ...LIMS_AUTH },
                params: { decisionsData },
                ...axiosConfig,
            }
        )
        .then((resp) => {
            info(url);
            return resp;
        })
        .catch((error) => {
            errorlog(url);
            if (error.response) {
                throw error.response.data;
            } else {
                throw error;
            }
        })
        .then((resp) => {
            return formatData(resp);
        });
};
