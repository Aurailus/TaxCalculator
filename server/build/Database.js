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
var crypto_1 = __importDefault(require("crypto"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var mongodb_1 = require("mongodb");
var Database = /** @class */ (function () {
    function Database() {
        this.client = null;
        this.db = null;
    }
    Database.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, dbName, calc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = 'mongodb://localhost:3001';
                        dbName = 'taxcalc';
                        this.client = new mongodb_1.MongoClient(url, { useUnifiedTopology: true });
                        return [4 /*yield*/, this.client.connect()];
                    case 1:
                        _a.sent();
                        console.log("Successfully connected to MongoDB");
                        this.db = this.client.db(dbName);
                        // // Temp: Delete all users.
                        return [4 /*yield*/, this.db.collection('accounts').deleteMany({})];
                    case 2:
                        // // Temp: Delete all users.
                        _a.sent();
                        return [4 /*yield*/, this.db.collection('calculators').deleteMany({})];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.createAccount("powellriver", "Powell River", "")];
                    case 4:
                        _a.sent();
                        calc = {
                            identifier: "powellriver",
                            city: "Powell River",
                            title: "Powell River",
                            year: 2020,
                            theme: {
                                showTitle: false,
                                hasHeader: true,
                                headerTheme: "navy",
                                accentTheme: "navy",
                                backgroundTheme: "dark"
                            },
                            taxes: [{
                                    name: "Municipal",
                                    values: { current: 5.5558, previous: 5.12287 }
                                }, {
                                    name: "District",
                                    values: { current: 0.7412, previous: 0.6829 }
                                }, {
                                    name: "Hospital",
                                    values: { current: 0.1543, previous: 0.1331 },
                                }, {
                                    name: "Finance",
                                    values: { current: 0.0002, previous: 0.0002 }
                                }, {
                                    name: "Assessment",
                                    values: { current: 0.0426, previous: 0.037 }
                                }, {
                                    name: "School",
                                    values: { current: 2.0678, previous: 2.0561 }
                                }],
                            fees: [{
                                    name: "Vacant",
                                    values: { current: 50, previous: 87 },
                                    requiresOccupancyState: false
                                }, {
                                    name: "Occupied",
                                    values: { current: 180, previous: 250 },
                                    requiresOccupancyState: true
                                }, {
                                    name: "Utility",
                                    values: { current: 518, previous: 518 },
                                    requiresOccupancyState: true
                                }, {
                                    name: "Frontage",
                                    values: { current: 349, previous: 349 }
                                }],
                            grants: [{
                                    name: "None",
                                    value: 0
                                }, {
                                    name: "Basic Homeowner Grant",
                                    value: 770,
                                }, {
                                    name: "65+ or Disabled Grant",
                                    value: 1045
                                }],
                            defaultGrant: 1,
                            insights: {
                                increase: 3.2,
                                currentAvg: 354309,
                                previousAvg: 344487
                            }
                        };
                        return [4 /*yield*/, this.db.collection('calculators').insertOne(calc)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Get Calculator data from the database using
    * a subdomain as an identifier.
    *
    * @param {string} subdomain - The calculator identifier.
    */
    Database.prototype.getCalculator = function (subdomain) {
        return __awaiter(this, void 0, void 0, function () {
            var calculators, calculatorObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        calculators = this.db.collection('calculators');
                        return [4 /*yield*/, calculators.findOne({ identifier: subdomain })];
                    case 1:
                        calculatorObj = _a.sent();
                        if (!calculatorObj)
                            throw "This calculator does not exist.";
                        return [2 /*return*/, calculatorObj];
                }
            });
        });
    };
    /**
    * Get a User database object from a user identifier.
    * Throws if the user doesn't exist.
    *
    * @param {string} identifier - The user identifier.
    */
    Database.prototype.getAccount = function (identifier) {
        return __awaiter(this, void 0, void 0, function () {
            var accounts, accountObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accounts = this.db.collection('accounts');
                        return [4 /*yield*/, accounts.findOne({ identifier: identifier })];
                    case 1:
                        accountObj = _a.sent();
                        if (!accountObj)
                            throw "This user no longer exists.";
                        return [2 /*return*/, accountObj];
                }
            });
        });
    };
    /**
    * Create a user in the database from a user string, a name, and a password.
    * Throws if another user with the same user string already exists.
    *
    * @param {string} identifier - The user identifier in the form of a subdomain.
    * @param {string} name - A username that the user will be referred to as.
    * @param {string} password - A password for the user account.
    */
    Database.prototype.createAccount = function (identifier, name, password) {
        return __awaiter(this, void 0, void 0, function () {
            var accounts, pass;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accounts = this.db.collection('accounts');
                        return [4 /*yield*/, accounts.findOne({ identifier: identifier })];
                    case 1:
                        if ((_a.sent()) != null)
                            throw "A user with this email address already exists.";
                        return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
                    case 2:
                        pass = _a.sent();
                        return [4 /*yield*/, accounts.insertOne({ name: name, identifier: identifier, pass: pass })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Creates and returns an authentication token for a user using a username / password pair.
    * Throws if the username and password do not refer to a valid user.
    *
    * @param {string} sub - The subdomain the request was called on.
    * @param {string} name - The username that was provided.
    * @param {string} password - An unhashed password.
    */
    Database.prototype.getAuthToken = function (sub, name, password) {
        return __awaiter(this, void 0, void 0, function () {
            var accounts, accountObj, _a, buffer, token, tokens, tkn;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accounts = this.db.collection('accounts');
                        return [4 /*yield*/, accounts.findOne({ identifier: sub, name: name })];
                    case 1:
                        accountObj = _b.sent();
                        _a = !accountObj;
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, bcrypt_1.default.compare(password, accountObj.pass)];
                    case 2:
                        _a = !(_b.sent());
                        _b.label = 3;
                    case 3:
                        if (_a)
                            throw "Incorrect username or password.";
                        return [4 /*yield*/, crypto_1.default.randomBytes(48)];
                    case 4:
                        buffer = _b.sent();
                        token = buffer.toString('hex');
                        tokens = this.db.collection('tokens');
                        tkn = { identifier: accountObj.identifier, token: token, expires: (Date.now() / 1000) + 60 * 60 * 24 * 3 };
                        return [4 /*yield*/, tokens.insertOne(tkn)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, token];
                }
            });
        });
    };
    /**
    * Returns the user identifier that a token points to when provided with a
    * token string or a network request containing a 'tkn' cookie.
    * Throws if the token doesn't exist.
    *
    * @param {string | request} token - The token to authenticate.
    */
    Database.prototype.authUser = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var inst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof token !== "string") {
                            if (!token.cookies || !token.cookies.tkn || typeof token.cookies.tkn != "string")
                                throw "Auth token is no longer valid, please reload the page.";
                            token = token.cookies.tkn;
                        }
                        return [4 /*yield*/, this.pruneTokens()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.collection('tokens').findOne({ token: token })];
                    case 2:
                        inst = _a.sent();
                        if (!inst)
                            throw "Auth token is no longer valid, please reload the page.";
                        return [2 /*return*/, inst.identifier];
                }
            });
        });
    };
    /**
    * Prune authentication tokens that are past their expiry date.
    */
    Database.prototype.pruneTokens = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokens = this.db.collection('tokens');
                        return [4 /*yield*/, tokens.deleteMany({ expires: { $lt: (Date.now() / 1000) } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Sanitize a name for use as an identifier, and return that value.
    * Throws if the passed in value isn't a string, or identifier generated is empty.
    *
    * @param {string} name - The name to be sanitized.
    */
    Database.prototype.sanitizeName = function (name) {
        if (typeof name != "string" || name.length < 1)
            throw "Name must not be empty.";
        var sanitized = name.toLowerCase().replace(/[ -]/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        if (sanitized.length == 0)
            throw "Name must include at least one alphanumeric character.";
        return sanitized;
    };
    return Database;
}());
exports.default = Database;
