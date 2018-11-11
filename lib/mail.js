import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class Mailer {
	constructor() {
		if (!Mailer.instance) {
			Mailer.instance = this;
			this.init();
		}

		return Mailer.instance;
	}

	init() {
		this.transporter = nodemailer.createTransport({
			host: process.env.MAILER_HOST,
			port: process.env.MAILER_PORT,
			secure: false,
			ignoreTLS: true
		});

		this.transporter.verify((error, success) => {
			if (error) {
				console.log(error);
			} else {
				console.log("Server is ready to take our messages");
			}
		});
	}

	send(to, subject, text, html) {
		const mailOptions = {
			from: '"<admin@projectFour.com>',
			to,
			subject,
			text,
			html
		};

		this.transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
			return console.log("Message sent: %s", info.messageId);
		});
	}
}

const instance = new Mailer();
Object.freeze(instance);
export default instance;
