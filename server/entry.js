/* @flow */
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import appLoader from './core/appLoader';

import mailer from './core/mailer';

const app = new appLoader({

	bodyParser,
	mongoose,
	express
	
});

app.stableServer();
app.connectToDB();
app.cors();
app.settings();
app.publicDirectory();

mailer.init({

	sender: 'Test Bot <bot@85.143.223.226>',
	driver: 'gmail',
	interval: 2000,
	attachLimit: {

		txt: 1000,
		jpeg: 20000000

	}

});

mailer.events.on('message', (mail) => {
	
	console.log(mail);
	
});

// let timerId = mailer.start();

// setTimeout(() => {
//
// 	mailer.stop(timerId);
//
// }, 10000);

mailer.events.on('error', (err) => {

	console.log(`Mail not send: ${err}`);

});

mailer.events.on('success', () => {

	console.log('Mail send');

});

const subject = 'Test';
const message = 'some mail';

// setTimeout(() => {
//
// 	mailer.send(
// 		{
// 			subject,
// 			message,
// 			to: ['pnaumenko95@gmail.com'],
// 			attachments: [
// 				{
//
// 					name: 'picture.jpeg',
// 					attach: 'https://static.pexels.com/photos/96918/pexels-photo-96918.jpeg',
// 					type: 'url'
//
// 				}],
// 			date: Date.now()
//
// 		});
//
// }, 5000);

app.start();

