"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const token_security_js_1 = require("../utils/security/token.security.js");
const authentication = ({ tokenType = token_security_js_1.tokenTypeEnum.access } = {}) => {
    return async (req, res, next) => {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return next(new Error("Authorization header missing"));
        }
        const result = await (0, token_security_js_1.decodedToken)({ authorization, next, tokenType });
        if (!result) {
            return next(new Error("Invalid token"));
        }
        const { user, decoded } = result;
        req.decoded = decoded;
        req.user = user;
        return next();
    };
};
exports.authentication = authentication;
