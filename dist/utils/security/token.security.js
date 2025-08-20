"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodedToken = exports.signatureTypeEnum = exports.tokenTypeEnum = exports.getSignature = exports.verifyToken = exports.generateToken = void 0;
exports.generateLoginToken = generateLoginToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
const db_service_js_1 = require("../../DB/db.service.js");
const User_model_js_1 = __importDefault(require("../../DB/models/User.model.js"));
const enums_js_1 = require("../enums.js");
const error_response_js_1 = require("../response/error.response.js");
const generateToken = async ({ payload = '', signature = process.env.ACCESS_TOKEN_USER_SIGNATURE, option = { expiresIn: Number(process.env.ACCESS_EXPIRES) }, } = {}) => {
    return jsonwebtoken_1.default.sign(payload, signature, option);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token = '', signature = process.env.ACCESS_TOKEN_USER_SIGNATURE, } = {}) => {
    return jsonwebtoken_1.default.verify(token, signature);
};
exports.verifyToken = verifyToken;
const getSignature = async ({ signatureLevel = exports.signatureTypeEnum.Bearer, } = {}) => {
    const signature = {};
    switch (signatureLevel) {
        case exports.signatureTypeEnum.System:
            signature.accessSignature = process.env.ACCESS_TOKEN_SYSTEM_SIGNATURE;
            signature.refreshSignature = process.env.REFRESH_TOKEN_SYSTEM_SIGNATURE;
            break;
        default:
            signature.accessSignature = process.env.ACCESS_TOKEN_USER_SIGNATURE;
            signature.refreshSignature = process.env.REFRESH_TOKEN_USER_SIGNATURE;
            break;
    }
    return signature;
};
exports.getSignature = getSignature;
exports.tokenTypeEnum = {
    access: 'access',
    refresh: 'refresh',
};
exports.signatureTypeEnum = {
    Bearer: 'Bearer',
    System: 'System',
};
const decodedToken = async ({ authorization = '', next, tokenType = exports.tokenTypeEnum.access, }) => {
    const [bearer, token] = authorization?.split(' ') || [];
    if (!token || !bearer) {
        throw new error_response_js_1.BadError('missing token parts');
    }
    if (!Object.values(exports.signatureTypeEnum).includes(bearer)) {
        throw new error_response_js_1.BadError('Invalid bearer type');
    }
    const signature = await (0, exports.getSignature)({
        signatureLevel: bearer,
    });
    const decoded = (await (0, exports.verifyToken)({
        token,
        signature: tokenType === 'access'
            ? signature.accessSignature
            : signature.refreshSignature,
    }));
    if (!decoded?._id) {
        return next(new Error('In-valid token'));
    }
    const user = await (0, db_service_js_1.findById)({ model: User_model_js_1.default, id: decoded._id });
    if (!user) {
        throw new error_response_js_1.BadError('Not register account');
    }
    if (!user.freezeBy &&
        user?.changeCredentialsTime?.getTime() > (decoded.iat ?? 0) * 1000) {
        throw new error_response_js_1.BadError('In-valid login credentials ');
    }
    return { user, decoded };
};
exports.decodedToken = decodedToken;
async function generateLoginToken(user) {
    const signature = await (0, exports.getSignature)({
        signatureLevel: user.role != enums_js_1.roleEnum.User
            ? exports.signatureTypeEnum.System
            : exports.signatureTypeEnum.Bearer,
    });
    const jwtid = (0, nanoid_1.nanoid)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user?._id },
        signature: signature.accessSignature,
        option: { expiresIn: Number(process.env.ACCESS_EXPIRES), jwtid },
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user?._id },
        signature: signature.refreshSignature,
        option: { expiresIn: Number(process.env.REFRESH_EXPIRES), jwtid },
    });
    return { access_token, refresh_token };
}
