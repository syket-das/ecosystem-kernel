"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApiResponse = void 0;
const sendApiResponse = (res, code, data, message, errors = []) => {
    const response = {
        code,
        data,
        message,
        errors,
    };
    res.status(code).json(response);
};
exports.sendApiResponse = sendApiResponse;
