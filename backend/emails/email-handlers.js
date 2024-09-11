import { mailtrapClient, sender } from "../lib/mail-trap.js";
import {
	createCommentNotificationEmailTemplate,
	createConnectionAcceptedEmailTemplate,
	createWelcomeEmailTemplate,
} from "./email-templates.js";

export const sendWelcomeEmail = async (email, name, profileUrl) => {
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Welcome to UnLinked",
			html: createWelcomeEmailTemplate(name, profileUrl),
			category: "welcome",
		});

		console.log("Welcome Email sent succesffully", response);
	} catch (error) {
		throw error;
	}
};
