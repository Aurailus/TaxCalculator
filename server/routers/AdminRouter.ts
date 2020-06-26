import Express from "express";
import { UploadedFile } from 'express-fileupload';
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

				if (sub != user) throw "Username doesn't match subdomain";

				
				let calc = await this.db.getCalculator(sub);
				res.render('admin/config', {calc: calc});
			}
			catch (e) {
				res.redirect('/admin');
			}
		});

		router.post('/admin/config', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";
				await this.db.updateCalculator(user, {
					$set: req.body
				})

				res.sendStatus(200);
			}
			catch (e) {
				this.routeError(res, 403, e);
			}
		});
		
		router.get('/admin/theme', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";
				
				let calc = await this.db.getCalculator(sub);
				res.render('admin/theme', {calc: calc});
			}
			catch (e) {
				res.redirect('/admin');
			}
		});

		router.post('/admin/theme', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";

				if (!req.body || typeof req.body.headerTheme != "string" || 
					typeof req.body.backgroundTheme != "string" || typeof req.body.title != "string") 
						throw "Missing required paramenters.";

				await this.db.updateCalculator(user, {
					$set: {
						title: req.body.title,
						theme: {
							headerTheme: req.body.headerTheme,
							backgroundTheme: req.body.backgroundTheme,
							hasTitle: !!req.body.hasTitle,
							hasHeader: req.body.hasHeader
						}
					}
				})

				res.redirect('/admin/theme');
			}
			catch (e) {
				this.routeError(res, 403, e);
			}
		});
		
		router.get('/admin/image/upload', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";

				res.render('admin/upload');
			}
			catch (e) {
				res.redirect('/admin');
			}
		});
		
		router.post('/admin/image/upload', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";

				if (!req.files || !req.files.image) throw "No files were specified.";
				if (Array.isArray(req.files.image)) throw "Multiplie files were sent in one request.";
				const file: UploadedFile = req.files.image;

				await this.db.setHeader(user, file);
				res.redirect('/admin/theme');
			}
			catch (e) {
				console.log(e);
				if (typeof e == "string") 
					res.render('admin/upload', {err: e.toString()});
				else res.render('admin/upload');
			}
		});
		
		router.get('/admin/image/delete', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";

				await this.db.unlinkHeader(user);
				res.redirect('/admin/theme');
			}
			catch (e) {
				if (typeof e == "string") 
					res.render('admin/upload', {err: e.toString()});
				else res.render('admin/upload');
			}
		});

		router.get('/admin/support', async (req, res, next) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";

				res.render('admin/support');
			}
			catch (e) {
				res.render('support');
			}
		});
		

		router.get('/admin', async (req, res) => {
			if ((req.useragent || {}).browser == "IE" && (req.useragent || {}).version != "11.0") return res.render('unsupported');	

			try {
				if (!req.subdomains || req.subdomains.length != 1) return res.redirect('/');
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";
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
		});
		
		router.get('/admin/super', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";
				if (user != "aurailus") throw "Not superuser";

				res.render('admin/super', {accts: await this.db.listAccounts()});
			}
			catch (e) {
				res.redirect('/admin');
			}
		});
		
		router.post('/admin/super', async (req, res) => {
			try {
				if (!req.subdomains || req.subdomains.length != 1) throw "Missing subdomain";
				let sub = req.subdomains[0];
				let user = await this.db.authUser(req);
				if (sub != user) throw "Username doesn't match subdomain";
				if (user != "aurailus") throw "Not superuser";

				if (req.body.action == "create_account")
					await this.db.createAccount(req.body.subdomain, req.body.username, req.body.password);

				if (req.body.action == "change_password")
					await this.db.updatePassword(req.body.subdomain, req.body.password);

				if (req.body.action == "delete_account")
					await this.db.deleteAccount(req.body.subdomain);

				res.redirect('/admin/super');
			}
			catch (e) {
				res.redirect('/admin');
			}
		});
	}
}
