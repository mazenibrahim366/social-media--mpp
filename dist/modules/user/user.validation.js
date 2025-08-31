"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = void 0;
const zod_1 = __importDefault(require("zod"));
const enums_1 = require("../../utils/enums");
exports.logout = {
    body: zod_1.default
        .strictObject({
        flag: zod_1.default.enum(enums_1.logoutEnum).default(enums_1.logoutEnum.signout),
    })
};
