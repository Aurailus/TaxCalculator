import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { MongoClient, Db } from 'mongodb';
import { UploadedFile } from 'express-fileupload';

import * as DB from './DBStructs'

export default class Database {
	client: MongoClient | null = null;
	db: Db | null = null;

	async init() {
		const url = 'mongodb://localhost:3001';
		const dbName = 'taxcalc';
		this.client = new MongoClient(url, { useUnifiedTopology: true });

		await this.client.connect();
		console.log("Successfully connected to MongoDB");

		this.db = this.client.db(dbName);
	}

	/**
	* Get Calculator data from the database using
	* a subdomain as an identifier.
	*
	* @param {string} subdomain - The calculator identifier.
	*/

	async getCalculator(subdomain: string): Promise<DB.Calculator> {
		const calculators = this.db!.collection('calculators');
		const calculatorObj: DB.Calculator | null = await calculators.findOne({identifier: subdomain});
		if (!calculatorObj) throw "This calculator does not exist.";

		return calculatorObj;
	}

	/**
	* Updates a calculator using with specified data.
	*
	* @param {string} subdomain - The calculator identifier.
	* @param {any} data - The Update object.
	*/

	async updateCalculator(subdomain: string, update: any) {
		const calculators = this.db!.collection('calculators');
		await calculators.updateOne({identifier: subdomain}, update);
	}

	/**
	* Sets a header image to a file.
	* Throws if the file is somehow invalid.
	*
	* @param {string} subdomain - The calculator identifier.
	* @param {UploadedFile} file - The image file.
	*/

	async setHeader(subdomain: string, file: UploadedFile) {
		const accountObj = await this.getAccount(subdomain);

		if (file.mimetype != "image/png" && file.mimetype != "image/jpeg") 
			throw "Uploaded file must be a PNG or JPEG file.";

		if (file.size > 2 * 1024 * 1024 || file.truncated) 
			throw "Uploaded file must be < 2MB.";

		let ext = file.mimetype == "image/png" ? ".png" : ".jpg";
		await file.mv(path.join(__dirname, "/../public/headers/" + subdomain + ext));

		await this.db!.collection('calculators').updateOne(
			{identifier: subdomain}, {$set: { "theme.hasHeader": ext }});
	}

	/**
	* Removes a header from an account.
	*
	* @param {string} subdomain - The calculator identifier.
	*/

	async unlinkHeader(subdomain: string) {
		await this.db!.collection('calculators').updateOne(
			{identifier: subdomain}, {$set: { "theme.hasHeader": "" }});
	}

	/**
	* Get a User database object from a user identifier.
	* Throws if the user doesn't exist.
	*
	* @param {string} identifier - The user identifier.
	*/

	async getAccount(identifier: string): Promise<DB.Account> {
		const accounts = this.db!.collection('accounts');
		const accountObj: DB.Account | null = await accounts.findOne({identifier: identifier});
		if (!accountObj) throw "This user no longer exists.";

		return accountObj;
	}


	/**
	* Create a user in the database from a user string, a name, and a password.
	* Throws if another user with the same user string already exists.
	*
	* @param {string} identifier - The user identifier in the form of a subdomain.
	* @param {string} name - A username that the user will be referred to as.
	* @param {string} password - A password for the user account.
	*/

	async createAccount(identifier: string, name: string, password: string) {
		const accounts = this.db!.collection('accounts');
		if (await accounts.findOne({identifier: identifier}) != null) throw "A user with this email address already exists.";

		let pass = await bcrypt.hash(password, 10);
		await accounts.insertOne({ name: name, identifier: identifier, pass: pass });

		let calc: DB.Calculator = {
			identifier: identifier,
			city: name,
			title: name,
			year: 2020,

			theme: {
				showTitle: true,
				hasHeader: "",
				headerTheme: "navy",
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
		}
		await this.db!.collection('calculators').insertOne(calc);
	}


	/**
	* Changes an account's password to the one specified.
	*
	* @param {string} identifier - The identifier. 
	* @param {string} password - The new password. 
	*/

	async updatePassword(identifier: string, password: string) {
		const accounts = this.db!.collection('accounts');
		let pass = await bcrypt.hash(password, 10);
		await accounts.updateOne({ identifier: identifier }, { $set: { pass: pass }});
	}


	/**
	* Deletes an account.
	*
	* @param {string} identifier - The account to delete.
	*/

	async deleteAccount(identifier: string) {
		const accounts = this.db!.collection('accounts');
		await accounts.deleteOne({ identifier: identifier });
	}


	/**
	* Lists all of the accounts
	*/

	async listAccounts() {
		const accounts = this.db!.collection('accounts');
		return (await accounts.find({}).toArray()).map((a: DB.Account) => a.identifier);
	}


	/**
	* Creates and returns an authentication token for a user using a username / password pair.
	* Throws if the username and password do not refer to a valid user.
	*
	* @param {string} sub - The subdomain the request was called on.
	* @param {string} name - The username that was provided.
	* @param {string} password - An unhashed password.
	*/

	async getAuthToken(sub: string, name: string, password: string): Promise<string> {
		const accounts = this.db!.collection('accounts');
		const accountObj: DB.Account | null = await accounts.findOne({identifier: sub, name: name});

		if (!accountObj || !await bcrypt.compare(password, accountObj.pass)) throw "Incorrect username or password.";

		const buffer = await crypto.randomBytes(48);
		const token = buffer.toString('hex');

		const tokens = this.db!.collection('tokens');
		const tkn = {identifier: accountObj.identifier, token: token, expires: (Date.now() / 1000) + 60 * 60 * 24 * 3};
		await tokens.insertOne(tkn);

		return token;
	}


	/**
	* Returns the user identifier that a token points to when provided with a
	* token string or a network request containing a 'tkn' cookie.
	* Throws if the token doesn't exist.
	*
	* @param {string | request} token - The token to authenticate.
	*/

	async authUser(token: string | any): Promise<string> {
		if (typeof token !== "string") {
			if (!token.cookies || !token.cookies.tkn || typeof token.cookies.tkn != "string") 
				throw "Auth token is no longer valid, please reload the page.";
			token = token.cookies.tkn;
		}

		await this.pruneTokens();
		let inst: DB.AuthToken | null = await this.db!.collection('tokens').findOne({token: token});
		if (!inst) throw "Auth token is no longer valid, please reload the page.";
		
		return inst.identifier;
	}


	/**
	* Prune authentication tokens that are past their expiry date.
	*/

	private async pruneTokens() {
		const tokens = this.db!.collection('tokens');
		await tokens.deleteMany({expires: {$lt: (Date.now() / 1000)}});
	}


	/**
	* Sanitize a name for use as an identifier, and return that value.
	* Throws if the passed in value isn't a string, or identifier generated is empty.
	*
	* @param {string} name - The name to be sanitized.
	*/

	sanitizeName(name: string) {
		if (typeof name != "string" || name.length < 1) throw "Name must not be empty.";
		const sanitized = name.toLowerCase().replace(/[ -]/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
		if (sanitized.length == 0) throw "Name must include at least one alphanumeric character.";
		return sanitized;
	}
}
