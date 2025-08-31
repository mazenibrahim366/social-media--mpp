"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = require("express-rate-limit");
const helmet_1 = __importDefault(require("helmet"));
const node_path_1 = require("node:path");
const connection_db_1 = __importDefault(require("./DB/connection.db"));
const auth_controller_1 = __importDefault(require("./modules/auth/auth.controller"));
const user_controller_1 = __importDefault(require("./modules/user/user.controller"));
const error_response_1 = require("./utils/response/error.response");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)('./config/.env.development') });
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = process.env.PORT || 5000;
    const limiter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 15 * 60 * 1000,
        limit: 100,
        standardHeaders: 'draft-8',
        message: { error: 'too many request please try again later ' },
        legacyHeaders: false,
        ipv6Subnet: 56,
    });
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use(limiter);
    await (0, connection_db_1.default)();
    app.use(express_1.default.json());
    app.get('/', (req, res) => res.json({
        message: `welcome to ${process.env.APPLICATION_NAME} backend landing page `,
    }));
    app.use('/auth', auth_controller_1.default);
    app.use('/users', user_controller_1.default);
    app.use(error_response_1.globalErrorHandling);
    app.all('{/*dummy}', (req, res) => res.status(404).json({ message: 'In-valid app router' }));
    app.listen(port, () => console.log(`Server is running on port => ${port}!`));
};
exports.default = bootstrap;
