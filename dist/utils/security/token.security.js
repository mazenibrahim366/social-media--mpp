"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodedToken = exports.getSignature = exports.verifyToken = exports.generateToken = void 0;
exports.generateLoginToken = generateLoginToken;
exports.createRevokeToken = createRevokeToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const nanoid_1 = require("nanoid");
const Token_model_js_1 = __importDefault(require("../../DB/models/Token.model.js"));
const User_model_js_1 = __importDefault(require("../../DB/models/User.model.js"));
const database_repository_js_1 = require("../../DB/repository/database.repository.js");
const enums_js_1 = require("../enums.js");
const error_response_js_1 = require("../response/error.response.js");
const UserModel = new database_repository_js_1.DatabaseRepository(User_model_js_1.default);
const TokenModel = new database_repository_js_1.DatabaseRepository(Token_model_js_1.default);
const generateToken = async ({ payload = '', signature = process.env.ACCESS_TOKEN_USER_SIGNATURE, option = { expiresIn: Number(process.env.ACCESS_EXPIRES) }, } = {}) => {
    return jsonwebtoken_1.default.sign(payload, signature, option);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token = '', signature = process.env.ACCESS_TOKEN_USER_SIGNATURE, } = {}) => {
    return jsonwebtoken_1.default.verify(token, signature);
};
exports.verifyToken = verifyToken;
const getSignature = async ({ signatureLevel = enums_js_1.signatureTypeEnum.bearer, } = {}) => {
    const signature = {};
    switch (signatureLevel) {
        case enums_js_1.signatureTypeEnum.system:
            signature.accessSignature = process.env
                .ACCESS_TOKEN_SYSTEM_SIGNATURE;
            signature.refreshSignature = process.env
                .REFRESH_TOKEN_SYSTEM_SIGNATURE;
            break;
        default:
            signature.accessSignature = process.env
                .ACCESS_TOKEN_USER_SIGNATURE;
            signature.refreshSignature = process.env
                .REFRESH_TOKEN_USER_SIGNATURE;
            break;
    }
    return signature;
};
exports.getSignature = getSignature;
const decodedToken = async ({ authorization = '', tokenType = enums_js_1.tokenTypeEnum.access, }) => {
    const [bearer, token] = authorization?.split(' ') || [];
    if (!token || !bearer) {
        throw new error_response_js_1.BadError('missing token parts');
    }
    if (!Object.values(enums_js_1.signatureTypeEnum).includes(bearer)) {
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
    if (decoded.jti &&
        (await TokenModel.findOne({ filter: { jti: decoded.jti } }))) {
        throw new error_response_js_1.BadError('In-valid login credentials ');
    }
    if (!decoded?._id) {
        throw new error_response_js_1.BadError('In-valid token');
    }
    const user = await UserModel.findById({ id: decoded._id });
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
            ? enums_js_1.signatureTypeEnum.system
            : enums_js_1.signatureTypeEnum.bearer,
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
async function createRevokeToken({ req, }) {
    await TokenModel.create({
        data: [
            {
                jti: req.decoded?.jti,
                userId: new mongoose_1.default.Types.ObjectId(req.decoded?._id),
                expiresIn: req.decoded?.iat + Number(process.env.REFRESH_EXPIRES),
            },
        ],
    });
    return true;
}
