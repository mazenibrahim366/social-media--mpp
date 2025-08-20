import EventEmitter from "node:events"

import { emailTemplate } from "../Email/email.template"
import { sendEmail } from "../Email/send.email"
export const emailEvent = new EventEmitter()
  emailEvent.on("sendConfirmEmail", async ([email, subject, otp]) => {

await sendEmail({ to: email, subject: subject, html: await emailTemplate(otp)||otp })


})