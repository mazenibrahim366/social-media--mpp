"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
const app_controller_1 = __importDefault(require("./app.controller"));
const nanoid_1 = require("nanoid");
(0, console_1.log)((0, nanoid_1.nanoid)());
(0, app_controller_1.default)();
