import chai from 'chai';
import mailer from '../../server/core/mailer';
import { addMail } from '../../config-services/gmail';
import mongoose from 'mongoose';
import MailModel from '../../server/shemas/mail';
import now from 'performance-now';

let assert = chai.assert;
let expect = chai.expect;
let should = chai.should();

describe('mailer', () => {

	const textAttachment = {

		name: 'text.txt',
		attach: 'Hello',
		type: 'text'

	};

	const fileAttachment = {

		name: 'text.txt',
		attach: '/Users/Superuser/Documents/Projects/mail-bot/server/attachments/text.txt',
		type: 'file'

	};

	const fileAttachment2 = {

		attach: '/Users/Superuser/Documents/Projects/mail-bot/server/attachments/text.txt',
		type: 'file'

	};

	const urlAttachment = {

		name: 'jpeg-home.jpg',
		attach: 'https://jpeg.org/images/jpeg-home.jpg',
		type: 'url'

	};

	const invalidTextAttachment = {

		name: 'text.txt',
		attach: 'Hello, world!',
		type: 'text'

	};

	const invalidTextAttachment2 = {

		name: 'text.odt',
		attach: 'Hello!',
		type: 'text'

	};

	const invalidFileAttachment = {

		name: 'text.txt',
		attach: '/Users/Superuser/Documents/Projects/mail-bot/server/attachments/invalidText',
		type: 'file'

	};

	const invalidFileAttachment2 = {

		name: 'text.odt',
		attach: '/Users/Superuser/Documents/Projects/mail-bot/server/attachments/incorrectFormat.odt',
		type: 'file'

	};

	const invalidFileAttachment3 = {

		name: 'text.txt',
		attach: '/Users/Superuser/Documents/incorrectFormat.odt',
		type: 'file'

	};

	const invalidUrlAttachment = {

		name: 'picture.jpeg',
		attach: 'https://interactivemediasw.files.wordpress.com/2013/03/jpg.jpg',
		type: 'url'

	};
	
	const invalidUrlAttachment2 = {

		name: 'picture.jpeg',
		attach: 'https://static.pexels.com/photos/96918/pexels-photo-96918.jpeg',
		type: 'url'

	};

	const invalidUrlAttachment3 = {

		name: 'picture.jpeg',
		attach: 'https://static.pexels.com/photos.jpeg',
		type: 'url'

	};

	before((done) => {

		mongoose.connect('mongodb://localhost/messageBot', (err) => {

			if (err) {

				done(err);
				console.log(`Error:  + ${err}`);

			} else {

				done();
				console.log('We are connect to DB');

			}

		});
		
		mailer.init({

			sender: 'Test Bot <bot@85.143.223.226>',
			driver: 'gmail',
			interval: 2000,
			attachLimit: {

				txt: 10,
				jpg: 100000

			}

		});

	});

	describe('#configureMessage()', () => {

		let options = {

			subject: 'Some subject',
			message: 'Some message',
			to: ['pnaumenko95@gmail.com'],
			attachments: [
				{

					name: 'picture.jpeg',
					attach: 'https://static.pexels.com/photos/96918/pexels-photo-96918.jpeg',
					type: 'url'

				}
			],
			date: Date.now()

		};

		it('should return object with mail options', (done) => {

			expect(mailer.configureMessage(options)).to.be.an('object')
				.and.to.have.all.keys('attachments', 'from', 'to', 'subject', 'html');

			done();

		});

		it('should return object with empty subject', (done) => {

			delete options.subject;

			expect(mailer.configureMessage(options)).to.have.property('subject', '');

			options.subject = 'Some subject';

			done();

		});

		it('should return object with empty message', (done) => {

			delete options.message;

			expect(mailer.configureMessage(options)).to.have.property('html', '');

			options.message = 'Some message';

			done();

		});

		it('should return other sender than sender in init', (done) => {

			options.sender = 'mymailer@gmail.com';

			expect(mailer.configureMessage(options)).to.have.property('from', 'mymailer@gmail.com');

			options.sender = 'Test Bot <bot@85.143.223.226>';

			done();

		});

	});

	describe('#setTimeout()', () => {

		it('should return inequality between send data and now data', (done) => {

			let dataSend = Date.now() + 5000;

			expect(5000 - mailer.setTimeout(dataSend)).to.be.below(5);

			done();

		});

		it('should return 0', (done) => {

			let dataSend = Date.now();

			expect(mailer.setTimeout(dataSend)).to.equal(0);

			done();

		});

	});
	
	describe('#parseAttachments()', () => {

		it('should return array of parsed attachments', (done) => {

			let attachments = [textAttachment, fileAttachment, fileAttachment2, urlAttachment];

			expect(mailer.parseAttachments(attachments)).to.be.an('array')
				.and.to.have.lengthOf(4);

			done();

		});

	});

	describe('#start()', () => {

		it('should return a numeric identifier of timer', (done) => {

			const timerId = mailer.start();

			expect(timerId).to.be.an('object');

			clearTimeout(timerId);

			done();

		});

	});

	describe('#parceMails()', () => {

		let mails = [];

		before((done) => {

			const mail = {

				envelope: {

					to: 'to@gmail.com',
					from: 'from@gmail.com'

				},
				messageId: 'someId'

			};

			addMail(mail)
				.then((data) => {

					mails.push(data);
					done();

				})
				.catch((err) => {

					done(err);

				});

		});

		it('should emit message', (done) => {

			let mail;

			mailer.parseMails(mails);

			mailer.events.on('message', (data) => {

				mail = data;

			});

			setTimeout(() => {

				expect(mail).to.be.an('object')
                    .and.to.have.property('messageId', 'someId');
				done();
			
			}, 1000);
			
		});

		it('should change status of message to old', (done) => {

			let status;

			mailer.parseMails(mails);

			mailer.events.on('message', (mail) => {

				status = mail.old;

			});

			setTimeout(() => {

				expect(status).to.be.true;
				done();

			}, 1000);

		});

		after((done) => {
			
			MailModel.findOneAndRemove({ messageId: 'someId' }, (err, doc) => {

				(err) ? done(err) : done();

			});
			
		});

	});
	
	describe('#setSendedData()', () => {
		
		it('should return changed data', (done) => {

			let sendedData = new Date(2016, 8, 7);

			const options = {

				year: sendedData.getFullYear(),
				month: sendedData.getMonth(),
				days: sendedData.getDate(),
				hours: sendedData.getHours(),
				minutes: sendedData.getMinutes(),
				seconds: sendedData.getSeconds()

			};

			expect(+mailer.setSendedData(options)).to.be.equal(+sendedData);

			done();

		});

		it('should return current data', (done) => {

			let data = new Date();

			expect(+mailer.setSendedData() - data).to.be.below(5);

			done();

		});

	});

	describe('#isValidAttachments()', () => {

		let attachments = [textAttachment, fileAttachment, fileAttachment2, urlAttachment];

		it('should return true after valid attachments', (done) => {

			mailer.isValidAttachments(attachments)
				.then(() => {

					done();

				})
				.catch((err) => {

					done(err);

				});

		});

		it('should return false after text attachment that exceed the allowed size', (done) => {

			attachments.push(invalidTextAttachment);

			mailer.isValidAttachments(attachments)
				.then(() => {

					done('expect that returned false');

				})
				.catch(() => {

					done();

				});

		});

		it('should return false after text attachment that have incorrect format', (done) => {

			attachments[5] = invalidTextAttachment2;

			mailer.isValidAttachments(attachments)
				.then(() => {

					done('expect that returned false');

				})
				.catch(() => {

					done();

				});

		});

		it('should return false after file attachment that exceed the allowed size', (done) => {

			attachments[5] = invalidFileAttachment;

			mailer.isValidAttachments(attachments)
				.then(() => {

					done('expect that returned false');

				})
				.catch(() => {

					done();

				});

		});

		it('should return false after file attachment that have incorrect format', (done) => {

			attachments[5] = invalidFileAttachment2;

			mailer.isValidAttachments(attachments)
				.then(() => {

					done('expect that returned false');

				})
				.catch(() => {

					done();

				});

		});

		it('should return false after file attachment that have incorrect path', (done) => {

			attachments[5] = invalidFileAttachment3;

			mailer.isValidAttachments(attachments)
				.then(() => {

					done('expect that returned false');

				})
				.catch(() => {

					done();

				});

		});

		it('should return false after url attachment that exceed the allowed size', (done) => {

			attachments[5] = invalidUrlAttachment;

			mailer.isValidAttachments(attachments)
				.then(() => {

					done('expect that returned false');

				})
				.catch(() => {

					done();

				});

		});

		it('should return false after url attachment that have incorrect format', (done) => {

			attachments[5] = invalidUrlAttachment2;

			mailer.isValidAttachments(attachments)
				.then(() => {

					done('expect that returned false');

				})
				.catch(() => {

					done();

				});

		});

		it('should return false after url attachment that have incorrect url', (done) => {

			attachments[5] = invalidUrlAttachment3;

			mailer.isValidAttachments(attachments)
				.then(() => {

					done('expect that returned false');

				})
				.catch(() => {

					done();

				});

		});

	});

	describe('#getFormat()', () => {

		it('should return txt', (done) => {

			let str = 'text.txt';

			expect(mailer.getFormat(str)).to.be.equal('txt');

			done();

		});

		it('should return txt', (done) => {

			let str = 'some.named.file.txt';

			expect(mailer.getFormat(str)).to.be.equal('txt');

			done();

		});

		it('should be undefined', (done) => {

			let str = 'abc';

			expect(mailer.getFormat(str)).to.be.undefined;

			done();

		});

	});
	
	describe('#parseTextAttach()', () => {

		it('should return object', (done) => {

			let object = mailer.parceTextAttach(textAttachment);

			expect(object).to.be.an('object')
				.and.to.have.all.keys('filename', 'content');

			done();

		});
		
	});

	describe('#parseFileAttach()', () => {

		it('should return object', (done) => {

			let object = mailer.parceFileAttach(fileAttachment);

			expect(object).to.be.an('object')
				.and.to.have.all.keys('filename', 'path');

			done();

		});

	});

	describe('#parseUrlAttach()', () => {

		it('should return object', (done) => {

			let object = mailer.parceUrlAttach(urlAttachment);

			expect(object).to.be.an('object')
				.and.to.have.all.keys('filename', 'path');

			done();

		});

	});

	describe('send()', () => {

		it('should send a message', (done) => {

			mailer.send({

				subject: 'test',
				message: 'test',
				to: ['pnaumenko95@gmail.com'],
				attachments: [textAttachment],
				date: Date.now()

			});

			mailer.events.on('success', () => {

				done();

			});

			mailer.events.on('error', (err) => {

				done(err);

			});


		});

		it('should not send a message with incorrect attachments', (done) => {

			mailer.events.removeAllListeners('error');
			mailer.events.removeAllListeners('success');

			mailer.send({

				subject: 'test',
				message: 'test',
				to: ['pnaumenko95@gmail.com'],
				attachments: [invalidTextAttachment],
				date: Date.now()

			});

			mailer.events.on('success', () => {

				done('expect that mail not send');

			});

			mailer.events.on('error', () => {

				done();

			});

		});

		it('should send a message after 7 seconds', (done) => {

			mailer.events.removeAllListeners('error');
			mailer.events.removeAllListeners('success');

			let dateNow = new Date();

			let options = { seconds: dateNow.getSeconds() + 7 };

			let start = now();

			mailer.send({

				subject: 'test',
				message: 'test',
				to: ['pnaumenko95@gmail.com'],
				attachments: null,
				date: mailer.setSendedData(options)

			});

			mailer.events.on('error', (err) => {

				done(err);

			});

			mailer.events.on('success', () => {

				let finish = now();

				expect(finish - start).to.be.within(6000, 8500);

				done();

			});

		});


	});

});
