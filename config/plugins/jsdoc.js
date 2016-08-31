import { sh } from './tools';
import colors from 'colors';

async function generateDocumentation() {


	await sh('rm -rf documentation');
	await sh('jsdoc -c config/jsdoc.config.json');

	console.log( colors.green( '#########################################' ) );
	console.log( colors.green( '> Documentation generated sueccesfull.' ) );
	console.log( colors.green( '#########################################' ) );

};

generateDocumentation();