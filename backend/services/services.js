const https = require('https');
const axios = require('axios');
const qs = require('qs');
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
    httpsAgent: agent
};

const formatData = function (resp) {
    const data = resp.data || [];
    return data;
};
const info = (url) => logger.info(`Successfully retrieved response from ${url}`);
const errorlog = (url, error) => logger.error(`${url} : ${error}`);

exports.getRequestSamples = (requestId) => {
    const url = `${LIMS_URL}/api/getRequestSamples?request=${requestId}`;
    logger.info(`Sending request to ${url}`);
    return axios
        .get(url, {auth: {...LIMS_AUTH}, ...axiosConfig})
        .then((resp) => {
            if (resp.data && resp.data[0] && resp.data[0].includes('ERROR')) {
                errorlog(url, resp.data[0]);
                return [];
            }
            info(url);
            return resp;
        })
        .catch((error) => {
            errorlog(url, error);
            throw error;
        })
        .then((resp) => {
            return formatData(resp);
        });
};

exports.getQcReportSamples = (requestId, samples) => {
    const url = `${LIMS_URL}/getQcReportSamples?request=${requestId}&samples=${samples}`;
    logger.info(`Sending request to ${url}`);
    return axios
        .get(
            url,
            {
                auth: { ...LIMS_AUTH },
                ...axiosConfig,
            }
        )
        .then((resp) => {
            info(url);
            return resp;
        })
        .catch((error) => {
            errorlog(url, error);
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

exports.getPicklist = () => {
    const url = `${LIMS_URL}/getPickListValues?list=InvestigatorDecisionCustomers`;
    logger.info(`Sending request to ${url}`);
    return axios
        .get(url, {
            auth: { ...LIMS_AUTH },
            ...axiosConfig,
        })
        .then((resp) => {
            if (resp.data && resp.data[0] && resp.data[0].includes('ERROR')) {
                errorlog(url, resp.data[0]);
                return [];
            }
            info(url);
            return resp;
        })
        .catch((error) => {
            errorlog(url, error);
            throw error;
        })
        .then((resp) => {
            return formatData(resp);
        });
};

exports.setQCInvestigatorDecision = (decisionsData) => {
    // console.log(JSON.stringify(decisionsData));
    const url = `${LIMS_URL}/setInvestigatorDecision`;
    // const options = {
    //     method: 'POST',
    //     headers: { 'content-type': 'application/x-www-form-urlencoded' },
    //     auth: { ...LIMS_AUTH },
    //     httpsAgent: agent,
    //     data: qs.stringify(decisionsData),
    //     url,
    //   };
    let headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };
    logger.info(`Sending request to ${url}`);
    return axios
        .post(
            url,
            {},
            {
                auth: { ...LIMS_AUTH },
                httpsAgent: agent,
                headers: { 'content-type': 'application/json', Accept: 'application/json' },
                params: {decisionsData},
            }
        )
        .then((resp) => {
            info(url);
            return resp;
        })
        .catch((error) => {
            errorlog(url, error);
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

exports.getPendingRequests = () => {
    const url = `${LIMS_URL}/getInvestigatorDecisionBlank`;
    logger.info(`Sending request to ${url}`);
    return axios
        .get(url, {
            auth: { ...LIMS_AUTH },
            ...axiosConfig,
        })
        .then((resp) => {
            if (resp.data && resp.data[0] && resp.data[0].includes('ERROR')) {
                errorlog(url, resp.data[0]);
                return [];
            }
            info(url);
            return resp;
        })
        .catch((error) => {
            errorlog(url, error);
            throw error;
        })
        .then((resp) => {
            return formatData(resp);
        });
};
