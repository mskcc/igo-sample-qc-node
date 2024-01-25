import axios from 'axios';
import { Config } from '../secret_config';

export const logout = (data) => {
    const url = `${Config.AUTH_URL}/api/auth/logout`;
    return axios
        .get(url)
        .then((resp) => {
            return resp;
        })
        .catch((error) => {
            throw error;
        })
        .then((resp) => {
            return resp;
        });
};

export const fetchUser = () => {
    const url = `${Config.AUTH_URL}/api/session/user`;
    return axios
        .get(url)
        .then((resp) => {
            return resp;
        })
        .catch((error) => {
            throw error;
        })
        .then((resp) => {
            return resp;
        });
};
