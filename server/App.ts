import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import Express from "express";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import userAgent from 'express-useragent';
import fileUpload from 'express-fileupload';

import Database from "./Database";
import CalcRouter from "./routers/CalcRouter";
import AdminRouter from "./routers/AdminRouter";

export default class App {
	private httpPort: number = 80;
	private httpsPort: number = 443;

	private app: Express.Application = Express();

	private db: Database = new Database();
	private calcRouter: CalcRouter = new CalcRouter(this.db, this.app);
	private adminRouter: AdminRouter = new AdminRouter(this.db, this.app);

	constructor() {
		this.app.use(cookieParser());
		this.app.use(bodyParser.json());
		this.app.use(userAgent.express());
		this.app.use(bodyParser.urlencoded({extended: true}));
		this.app.use(fileUpload({limits: {fileSize: 2 * 1024 * 1024}, useTempFiles: true, tempFileDir: '/tmp/'}));
		this.app.set('view engine', 'pug');

		let priv: string, cert: string;
		let enableHTTPS = true;
		try {
			priv = fs.readFileSync('cert/cert.key', 'utf8');
			cert = fs.readFileSync('cert/cert.crt', 'utf8');
		}
		catch (e) {
			console.log("Failed to get keys, disabling HTTPS.", e);
			enableHTTPS = false;
		}

		this.db.init().then(async () => {
			this.calcRouter.init();
			this.adminRouter.init();
			this.app.get('/', (req, res) => res.render('home'));
			this.app.use('/public', Express.static(path.join(__dirname, "/../public")));

			if (enableHTTPS) {
				const httpServer = http.createServer((req, res) => {
			    res.writeHead(301, { "Location": "https://" + req.headers['host']!
			    	.replace(this.httpPort.toString(), this.httpsPort.toString()) + req.url });
			    res.end();
				});
				const httpsServer = https.createServer({key: priv, cert: cert}, this.app);

				httpServer.listen(this.httpPort, () => console.log(`Listening on ${this.httpPort}.`));
				if (enableHTTPS) httpsServer.listen(this.httpsPort, () => console.log(`Listening on ${this.httpsPort}.`));
			}
			else {
				const httpServer = http.createServer(this.app);
				httpServer.listen(this.httpPort, () => console.log(`Listening on ${this.httpPort}.`));
			}
		});
	}
}
