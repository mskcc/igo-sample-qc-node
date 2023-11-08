const mysql = require('mysql');
const { loggers } = require('winston');
const logger = loggers.get('logger');

const mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: '0rangeP0tat03',
    database: 'dev_sample_qc'
};

var pool = mysql.createPool(mysqlConfig);

module.exports.connect = function () {
    return new Promise((resolve) => {
        pool.on('connection', function (connection) {
            connection.on('error', function (err) {
                logger.error('MySQL error event', err);
            });
            connection.on('close', function (err) {
                logger.warn('MySQL close event', err);
            });
        });
        resolve();
    });
};

async function executeQuery (query) {
    logger.debug('query: ', query);
    return new Promise((resolve, reject) => {
        try{
            pool.query(query, (e, r, f) => {
                if(e){
                    reject(e);
                }
                else{
                    logger.debug(r,f);
                    resolve(r[0]);
                }
            });
        }
        catch(ex){
            reject(ex);
        }
    });  
}

async function execSP(spName, params){
    return new Promise((resolve, reject) => {
        try{
            var paramPlaceHolder = '';
            if(params && params.length){
                for(var i = 0; i < params.length; i++){
                    paramPlaceHolder += '?,';
                }
            }
            if(paramPlaceHolder.length){
                paramPlaceHolder = paramPlaceHolder.slice(0, -1);
            }
            logger.debug('final SP call', `CALL ${spName}(${params})`);
            pool.query(`CALL ${spName}(${paramPlaceHolder})`, params, (e, r) => {
                if(e){
                    reject(e);
                }
                else{
                    resolve(r[0]);
                }
            });
        }
        catch(ex){
            reject(ex);
        }
    });
}

module.exports.executeQuery = executeQuery;
module.exports.execSP = execSP;
