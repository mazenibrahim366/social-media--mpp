"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerEnum = exports.roleEnum = exports.genderEnum = exports.logoutEnum = exports.tokenTypeEnum = exports.signatureTypeEnum = void 0;
exports.signatureTypeEnum = { system: 'System', bearer: 'Bearer' };
exports.tokenTypeEnum = { access: 'access', refresh: 'refresh' };
exports.logoutEnum = {
    signoutFromAllDevice: 'signoutFromAllDevice',
    signout: 'signout',
    stayLoggedIn: 'stayLoggedIn',
};
exports.genderEnum = { male: 'male', female: 'female' };
exports.roleEnum = { User: 'User', Admin: 'Admin' };
exports.providerEnum = { system: "system", google: "google" };
