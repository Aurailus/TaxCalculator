import Express from "express";
const subdomain = require('express-subdomain');

import Router from "./Router"
import Database from "../Database";

export default class CalcRouter extends Router {
	constructor(db: Database, app: Express.Application) {
		super(db, app);
	}

	init() {
		let router = Express.Router();
		this.app.use(subdomain('*', router));
		
		router.get('/', async (req, res, next) => {
			if ((req.useragent || {}).browser == "IE" && (req.useragent || {}).version != "11.0") return res.render('unsupported');	
			if (!req.subdomains || req.subdomains.length != 1) return next();
			
			try {
				let sub = req.subdomains[0];
				let calc = await this.db.getCalculator(sub);

				res.render('calculator', {calc: calc});
			}
			catch (e) {
				res.render('error');
			}
		});

	}
}
