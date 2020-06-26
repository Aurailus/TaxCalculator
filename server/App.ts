import path from "path";
import http from "http";
import Express from "express";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import userAgent from 'express-useragent';
import fileUpload from 'express-fileupload';

import Database from "./Database";
import CalcRouter from "./routers/CalcRouter";
import AdminRouter from "./routers/AdminRouter";

export default class App {
	private port: number = 3000;

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

		this.db.init().then(async () => {
			this.calcRouter.init();
			this.adminRouter.init();
			this.app.get('/', (req, res) => res.render('home'));
			this.app.use('/public', Express.static(path.join(__dirname, "/../public")));

			const server = http.createServer(this.app);
			server.listen(this.port, () => console.log(`Listening on ${this.port}.`));
		});
	}
}
