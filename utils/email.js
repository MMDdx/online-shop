const nodeMailer = require("nodemailer");
const pug= require("pug")
const htmlToText = require("html-to-text");
class Email {
    constructor(user, url) {
        this.user = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = process.env.EMAIL_FROM;
        this.to = user.email;
    }

    newTransport(){
        if (process.env.NODE_ENV === "development") {
            return nodeMailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORDD
                }
            });
        }




    }


    async send(template, subject){
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.htmlToText(html)
        };

        return await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        return await this.send("welcome", 'Welcome to the our Family');
    }

}

module.exports = Email;
