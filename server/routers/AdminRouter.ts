import Express from "express";
const subdomain = require('express-subdomain');

import Router from "./Router"
import Database from "../Database";

export default class AdminRouter extends Router {
	constructor(db: Database, app: Express.Application) {
		super(db, app);
	}

	init() {
		let router = Express.Router();
		this.app.use(subdomain('*', router));
		
		router.get('/admin/config', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				let calc = await this.db.getCalculator(sub);
				res.render('admin/config', {calc: calc});
			}
			catch (e) {
				res.redirect('/admin');
			}
		})

		router.post('/admin/config', async (req, res) => {
			try {
				let user = await this.db.authUser(req);
				await this.db.updateCalculator(user, {
					$set: req.body
				})

				res.sendStatus(200);
			}
			catch (e) {
				this.routeError(res, 403, e);
			}
		})
		
		router.get('/admin/theme', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				let calc = await this.db.getCalculator(sub);
				res.render('admin/theme', {calc: calc});
			}
			catch (e) {
				res.redirect('/admin');
			}
		})

		router.post('/admin/theme', async (req, res) => {
			try {
				let user = await this.db.authUser(req);
				if (!req.body || typeof req.body.headerTheme != "string" || 
					typeof req.body.backgroundTheme != "string" || typeof req.body.title != "string") 
						throw "Missing required paramenters.";

				await this.db.updateCalculator(user, {
					$set: {
						title: req.body.title,
						theme: {
							headerTheme: req.body.headerTheme,
							backgroundTheme: req.body.backgroundTheme,
							hasTitle: !!req.body.hasTitle
						}
					}
				})

				res.redirect('/admin/theme');
			}
			catch (e) {
				this.routeError(res, 403, e);
			}
		})

		router.get('/admin', async (req, res) => {
			if ((req.useragent || {}).browser == "IE" && (req.useragent || {}).version != "11.0") return res.render('unsupported');	
			if (!req.subdomains || req.subdomains.length != 1) return res.redirect('/');

			try {
				let user = await this.db.authUser(req);
				res.redirect('/admin/config');
			}
			catch (e) {
				res.render('admin/login');
			}
		});

		router.post('/auth', async (req, res) => {
			try {
				const user = req.body.username;
				const pass = req.body.password;

				if (!req.subdomains || req.subdomains.length != 1)
					throw "Request was not performed on a valid subdomain.";
				const sub = req.subdomains[0];

				if (typeof user != "string" || typeof pass != "string")
					throw "Request is missing required parameters.";
				
				res.send(await this.db.getAuthToken(sub, user, pass));
			}
			catch (e) {
				this.routeError(res, 403, e);
			}
		})
	}
}
