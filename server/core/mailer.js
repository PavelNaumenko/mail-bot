import { getMailList, createTransport } from '../../config-services/gmail';
import EventEmitter from 'events';
import fs from 'fs';
import request from 'request';

class Mailer {

	sender: string;
	emailTransporter: Object;
	interval: number;
	events: Object;
	attachLimit: Object;

	init(options) {

		this.sender = options.sender;
		this.interval = options.interval;
		this.events = new EventEmitter;
		this.attachLimit = options.attachLimit;

		switch (options.driver) {

			case 'gmail':
				createTransport()
					.then((emailTransporter) => {

						this.emailTransporter = emailTransporter;

					})
					.catch((err) => {

						console.log(err);

					});
				break;

			default:
				console.log('Incorrect driver!');

		}

	}

	configureMessage(options) {

		(options.attachments) ? options.attachments = this.parseAttachments(options.attachments) : true;

		const mailOptions = {
			attachments: options.attachments,
			from: options.sender || this.sender,
			to: options.to,
			subject: options.subject || '',
			html: options.message || ''
		};

		return mailOptions;

	}

	send(options) {

		this.isValidAttachments(options.attachments)
			.then(() => {

				let timeout = this.setTimeout(+options.date);

				setTimeout(() => {

					this.emailTransporter.sendMail(this.configureMessage(options), (error) => {

						(error) ? this.events.emit('error', error) : this.events.emit('success');

					});

				}, timeout);

			})
			.catch(() => {

				this.events.emit('error', 'Incorrect Attachment');

			});


	}

	setTimeout(dateSend) {

		const dateNow = Date.now();
		
		if (dateSend > dateNow) {

			return dateSend - dateNow;

		} else {

			return 0;
			
		}

	}

	parseAttachments(attachments) {

		return attachments.map((attach) => {

			switch (attach.type)  {

				case 'text':

					return this.parceTextAttach(attach);

				case 'url':

					return this.parceUrlAttach(attach);

				case 'file':

					return this.parceFileAttach(attach);

				default:

					console.log('Unresolved type');

			}

		});

	}

	start() {
		
		return setInterval(() => {

			let arr = getMailList();
			
			arr.forEach((i) => {

				this.events.emit('message', i);
				
			});
			
		}, this.interval);

	}

	stop(timerId) {

		clearInterval(timerId);

	}

	logMail(mail) {
			
		console.log(mail);

	}

	sendMailAfter(options) {

		const date = new Date();

		let d = {

			year: date.getFullYear(),
			month: date.getMonth(),
			date: date.getDate(),
			hours: date.getHours(),
			minutes: date.getMinutes(),
			seconds: date.getSeconds()

		};

		d[options.param] += options.value;

		return new Date(d.year, d.month, d.date, d.hours, d.minutes, d.seconds);

	}

	isValidAttachments(attachments) {

		return new Promise((resolve, reject) => {

			let arr = [];

			attachments.forEach((attach) => {

				switch (attach.type) {

					case 'text':

						this.isValidTextAttach(attach) ? arr.push(true) : arr.push(false);
						break;

					case 'file':

						this.isValidFileAttach(attach) ? arr.push(true) : arr.push(false);
						break;

					case 'url':

						this.isValidUrlAttach(attach).then(() => {

							arr.push(true);

						}).catch(() => {

							arr.push(false);

						});

						break;

					default:

						console.log('Incorrect type');
						reject();

				}

			});

			let timerId = setInterval(() => {

				if (arr.length == attachments.length) {

					arr.forEach((a) => {

						if (!(a)) {

							reject();

						}

					});

					resolve();
					clearInterval(timerId);

				}

			}, 2);

		});

	}

	getFormat(str) {

		let arr = str.split('.');

		return arr[arr.length - 1];

	}

	isValidTextAttach(attach) {

		const format = this.getFormat(attach.name);
		let maxSize = this.attachLimit[format];

		if (!maxSize) return false;
		
		return Buffer.byteLength(attach.attach, 'utf8');

	}

	isValidFileAttach(attach) {

		let format;

		attach.name ? format = this.getFormat(attach.name) : format = this.getFormat(attach.attach);

		let maxSize = this.attachLimit[format];

		if (!maxSize) return false;

		const stats = fs.statSync(attach.attach);

		return stats['size'] < maxSize;

	}

	isValidUrlAttach(attach) {

		return new Promise((resolve, reject) => {

			const format = this.getFormat(attach.name);
			let maxSize = this.attachLimit[format];

			if (!maxSize) reject();

			let length = 0;

			let res = request({ url: attach.attach });

			res.on('data', (data) => {

				length += data.length;

				if (length > maxSize) {
					
					reject();
					
					res.abort(); // Abort the response (close and cleanup the stream)

				}

			});

			res.on('end', () => {
				
				resolve();

			});

		});

	}

	parceTextAttach(attach) {

		return {

			filename: attach.name,
			content: attach.attach

		};

	}

	parceFileAttach(attach) {

		let params = {

			filename: attach.name,
			path: attach.attach

		};

		if (!(attach.name)) delete params.filename;

		return params;

	}

	parceUrlAttach(attach) {

		return {

			filename: attach.name,
			path: attach.attach

		};

	}

}

export default new Mailer();
