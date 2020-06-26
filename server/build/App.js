"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var http_1 = __importDefault(require("http"));
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var express_useragent_1 = __importDefault(require("express-useragent"));
var express_fileupload_1 = __importDefault(require("express-fileupload"));
var Database_1 = __importDefault(require("./Database"));
var CalcRouter_1 = __importDefault(require("./routers/CalcRouter"));
var AdminRouter_1 = __importDefault(require("./routers/AdminRouter"));
var App = /** @class */ (function () {
    function App() {
        var _this = this;
        this.port = 3000;
        this.app = express_1.default();
        this.db = new Database_1.default();
        this.calcRouter = new CalcRouter_1.default(this.db, this.app);
        this.adminRouter = new AdminRouter_1.default(this.db, this.app);
        this.app.use(cookie_parser_1.default());
        this.app.use(body_parser_1.default.json());
        this.app.use(express_useragent_1.default.express());
        this.app.use(body_parser_1.default.urlencoded({ extended: true }));
        this.app.use(express_fileupload_1.default({ limits: { fileSize: 2 * 1024 * 1024 }, useTempFiles: true, tempFileDir: '/tmp/' }));
        this.app.set('view engine', 'pug');
        this.db.init().then(function () { return __awaiter(_this, void 0, void 0, function () {
            var server;
            var _this = this;
            return __generator(this, function (_a) {
                this.calcRouter.init();
                this.adminRouter.init();
                this.app.get('/', function (req, res) { return res.render('home'); });
                this.app.use('/public', express_1.default.static(path_1.default.join(__dirname, "/../public")));
                server = http_1.default.createServer(this.app);
                server.listen(this.port, function () { return console.log("Listening on " + _this.port + "."); });
                return [2 /*return*/];
            });
        }); });
    }
    return App;
}());
exports.default = App;
