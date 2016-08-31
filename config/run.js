const START = process.argv.includes('--start');
const PROD = process.argv.includes('--prod');

import { sh } from './plugins/bash';

if (START) {

	/**
	 * Create pm2 event
	 */

	process.env.NODE_ENV = 'development';

	sh('npm run server');

} else if (PROD) {

	/**
	 * Create pm2 event
	 */

	process.env.NODE_ENV = 'production';

	sh('npm run server');

}
