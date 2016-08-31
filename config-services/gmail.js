import config from 'config';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import xoauth2 from 'xoauth2';
import MailModel from '../server/shemas/mail';

let getToken = () => {

	return new Promise((resolve, reject) => {

		fetch('https://www.googleapis.com/oauth2/v3/token', {
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			method: 'POST',
			body: `client_secret=${config.authMail.clientSecret}&grant_type=refresh_token&refresh_token=${config.authMail.refreshToken}&client_id=${config.authMail.clientId}`
		}).then((res) => {

			res.json().then((body) => {

				(body.access_token) ? resolve(body.access_token) : reject('empty access token');

			});

		});

	});

};

export let getMailList = () => {

	return new Promise((resolve, reject) => {

		MailModel.find({ old: false }, (err, data) => {
			
			(err) ? reject(err) : resolve(data);

		});

	});

};

export let createTransport = () => {

	return new Promise((resolve, reject) => {

		getToken().then((accessToken) => {

			resolve(nodemailer.createTransport({
				service: config.authMail.service,
				auth: {
					xoauth2: xoauth2.createXOAuth2Generator({
						user: config.authMail.user,
						clientId: config.authMail.clientId,
						clientSecret: config.authMail.clientSecret,
						refreshToken: config.authMail.refreshToken,
						accessToken
					})
				}
			}));

		}).catch((error) => {

			reject(error);

		});
		
	});

};

export let addMail = (options) => {

	return new Promise((resolve, reject) => {

		MailModel.create(options, (err, data) => {

			(err) ? reject(err) : resolve(data);

		});

	});
	
};

export let makeMailReaded = (criteria) => {
	
	MailModel.findOneAndUpdate(criteria, { old: true }, (err) => {
		
		if (err) console.log(err);

	});

};
