# Mail-bot

## Usage

```
import mailer from '../../server/core/mailer';
```

## Init

```
mailer.init({

	sender: 'Test Bot <bot@85.143.223.226>',
	driver: 'gmail',
	interval: 2000,
	attachLimit: {

		txt: 1000,
		jpeg: 20000000

	}

});

```

Possible options values:

  * **sender** _(Required)_ String - set field 'from' for sended emails
  * **driver** _(Required)_ String - name of email driver
  * **interval** _(Required)_ String - set interval time for sync with email service for parse list of mails
  * **attachLimit** _(Required)_ Object - set allowed types and their max size

## Start server

  Start server and watch for new emails.

```
let timerId = mailer.start();
```

## Stop server

  Stop server and unwatch for new emails.

```
mailer.stop(timerId);
```

## Listen for new messages

```
mailer.on('message', (mail) => {

	console.log(mail);

});
```

## Send email

```
mailer.send(
  {
    subject: 'some subject',
    message: 'some message',
    to: ['pnaumenko95@gmail.com'],
    attachments:
    [{

        name: 'picture.jpeg',
        attach: 'https://static.pexels.com/photos/96918/pexels-photo-96918.jpeg',
        type: 'url'
        
    }],
    date: Date.now()

	});
```

Possible options values:

  * **subject** _(Required)_ String - email subject
  * **message** _(Required)_ String - email message
  * **to** _(Required)_ String or Array<String> - email recipient or list of recipients
  * **attachments** _(Optional)_ Array - email attachments
  * **date** _(Required)_ Date(UTC) - date for delayed sending email
  * **sender** _(Optional)_ String - update field 'from' for sended emails

## sendMailAfter

  Add your count to type that you want to set.

```
date: mailer.sendMailAfter({ param: 'seconds', value: 7 });
```

Possible param values:

  * **year**
  * **month**
  * **date**
  * **hours**
  * **minutes**
  * **seconds**
