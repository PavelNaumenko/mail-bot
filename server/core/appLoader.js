/* @flow */

import path from 'path';
import http from 'http';
import config from 'config';
import PrettyError from 'pretty-error';

const mode = process.env.NODE_ENV;

export default class App {

	server: Object;

	constructor(options: Object) {

		const app = options.express();

		this.server = {

			...options,
			app

		};

	}

	/**
	 * Start and listen server
	 */

	connectToDB() {

		this.server.mongoose.connect(config[mode].DB_URL, () => {

			console.log('//        Connected to API db        //');

		});

	}

	/**
	 * Start and listen server
	 */

	start() {

		const server = http.createServer(this.server.app);

		server.listen(config[mode].PORT, () => {

			console.log(`// ${config[mode].APP_NAME} API running at :${config[mode].PORT} port //`);

		});

	}

	/**
	 * Require public dir files
	 */

	publicDirectory() {

		this.server.app.use(this.server.express.static(path.join(__dirname, '../../view')));

		this.server.app.get('/', (req, res) => {

			res.sendFile(path.join(__dirname, '../../view'));

		});

	}

	/**
	 * Connecting node dependencies to app
	 */

	settings() {

		this.server.app.use(this.server.bodyParser.json({ limit: '50mb' }));
		this.server.app.use(this.server.bodyParser.urlencoded({ limit: '50mb', extended: true }));

	}

	/**
	 * Access headers to server
	 */

	cors() {

		this.server.app.all('/*', (req, res, next) => {

			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
			res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');

			next(new Error('some'));

		});

	}

	/**
	 * Node error handler
	 */

	stableServer() {

		const pe = new PrettyError();
		pe.skipNodeFiles();
		pe.skipPackage('express');

		process.on('uncaughtException', (err) => {

			console.log(pe.render(err.message));

		});

	}
	
}
