const Contact = require('../models/Contact');
const msg = require('../const/message');
const Validator = require('../helpers/validation');

const contactController = {
    create: async (req, res) => {
        try {
            const { firstName, lastName, email, usertype, subject, messageContent } = req.body;

            if (Validator.isEmpty(firstName)        ||
                Validator.isEmpty(lastName)         ||
                Validator.isEmpty(email)            ||
                Validator.isEmpty(messageContent)   ||
                Validator.isEmpty(usertype)
            ) {
                return res.json({ success: false, msg: 'Fill out form' });
            }
            const newContact = new Contact({
                user: {
                    firstname: firstName,
                    lastname: lastName,
                    email,
                    usertype
                },
                content: {
                    message: messageContent,
                    subject
                }
            });
            const save = newContact.save();
            if (save) {
                return res.json({ success: true, msg: 'Sent successfully!'});
            } else return res.json({ success: false, msg: ''});
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    }
}

module.exports = contactController;