"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_1 = __importDefault(require("../../DB/models/User.model"));
const user_repository_1 = require("../../DB/repository/user.repository");
const Token_model_1 = __importDefault(require("../../DB/models/Token.model"));
const token_repository_1 = require("../../DB/repository/token.repository");
const enums_1 = require("../../utils/enums");
const success_response_1 = require("../../utils/response/success.response");
const encryption_security_1 = require("../../utils/security/encryption.security");
const token_security_1 = require("../../utils/security/token.security");
class UserService {
    UserModel = new user_repository_1.UserRepository(User_model_1.default);
    TokenModel = new token_repository_1.TokenRepository(Token_model_1.default);
    constructor() { }
    profile = async (req, res) => {
        const user = await this.UserModel.findById({ id: req.user?._id, select: ' -phone' });
        const decryptedPhone = await (0, encryption_security_1.decryptEncryption)({
            cipherText: req.user?.phone,
        });
        user.phone = decryptedPhone;
        return (0, success_response_1.successResponse)({
            res,
            status: 201,
            data: { user },
        });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        let status = 200;
        switch (flag) {
            case enums_1.logoutEnum.signoutFromAllDevice:
                await this.UserModel.updateOne({
                    filter: { _id: req.decoded?._id },
                    data: { changeCredentialsTime: new Date() },
                });
                break;
            default:
                await (0, token_security_1.createRevokeToken)({ req });
                status = 201;
                break;
        }
        console.log(this.TokenModel);
        return (0, success_response_1.successResponse)({ res, status });
    };
    refreshToken = async (req, res) => {
        const data = await (0, token_security_1.generateLoginToken)(req.user);
        await (0, token_security_1.createRevokeToken)({ req });
        return (0, success_response_1.successResponse)({ res, status: 200, data });
    };
}
exports.default = new UserService();
