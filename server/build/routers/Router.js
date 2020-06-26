"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Router = /** @class */ (function () {
    function Router(db, app) {
        this.db = db;
        this.app = app;
    }
    Router.prototype.routeError = function (res, code, e) {
        if (typeof e == "string") {
            res.status(code).send(e);
        }
        else {
            res.sendStatus(code);
            console.log(e);
        }
    };
    return Router;
}());
exports.default = Router;
