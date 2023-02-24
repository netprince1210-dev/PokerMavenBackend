const Mail = require('../models/Mail');
const User = require('../models/User');
const msg = require('../const/message');
const Validator = require('../helpers/validation');
const path = require('path');

const mailController = {
    compose: async (req, res) => {
        try {
            const { to, subject, message } = req.body;
            const from = req.user.email;
            const to_user = await User.find({ username: { $in: to.split(',') } });
            if (Validator.isEmpty(to_user)) {
                return res.json({ success: false, msg: 'Not exist user or user email' });
            }

            const file_paths = [];
            if (Validator.isEmpty(to) ||
                Validator.isEmpty(message)
            ) {
                return res.json({ success: false, msg: 'Fill out form' });
            }

            if (req.files !== null) {
                const { files } = req.files;
                if (files.length === undefined) {
                    const ext = files.name.substring(files.name.length - 4, files.name.length);
                    const filename = files.name.substring(0, files.name.length - 4) + "-" + new Date().getTime() + ext;
                    files.mv(path.join(__dirname, '../public/mail/' + filename));
                    file_paths.push(filename);
                } else {
                    for (var i = 0; i < files.length; i++) {
                        const ext = files[i].name.substring(files[i].name.length - 4, files[i].name.length);
                        const filename = files[i].name.substring(0, files[i].name.length - 4) + "-" + new Date().getTime() + '-' + i + ext;
                        files[i].mv(path.join(__dirname, '../public/mail/' + filename));
                        file_paths.push(filename);
                    }
                }
            }
            for (var i = 0; i < to_user.length; i++) {
                const newMail = Mail({
                    from,
                    to: to_user[i].email,
                    subject,
                    message,
                    files: file_paths
                });
                const save = await newMail.save();
            }
            return res.json({ success: true, msg: 'Sent successfully!' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    inbox: async (req, res) => {
        try {
            const { page, pageSize, order } = req.query;
            const to_user = req.user.email;
            const total = await Mail
                .aggregate([
                    {
                        $match: {
                            to: to_user,
                            type: 'usual',
                            to_is_deleted: false
                        }
                    },
                    {
                        $project: {
                            to: "$to",
                            from: "$from",
                            message: "$message",
                            subject: "$subject",
                            createdAt: "$createdAt",
                            files: "$files",
                        }
                    },
                    {
                        $group: {
                            _id: "$to",
                            mail: {
                                $push: {
                                    "from": "$from",
                                    "to": "$to",
                                    "message": "$message",
                                    "subject": "$subject",
                                    "createdAt": "$createdAt",
                                    "files": "$files",
                                }
                            },
                            count: { $sum: 1 },
                        }
                    },
                    {
                        $count: "to"
                    }
                ])

            var mailList = [];
            if (total.length > 0 && total[0].to > 0) {
                mailList = await Mail
                    .aggregate([
                        {
                            $match: {
                                to: to_user,
                                to_is_deleted: false,
                                type: 'usual'
                            }
                        },
                        {
                            $sort: { 'createdAt': parseInt(order) }
                        },
                        {
                            $lookup: {
                                'from': 'users',
                                'localField': 'from',
                                'foreignField': 'email',
                                'as': 'from_user'
                            }
                        },
                        {
                            $unwind: "$from_user"
                        },
                        {
                            $project: {
                                to: "$to",
                                from: "$from",
                                message: "$message",
                                subject: "$subject",
                                createdAt: "$createdAt",
                                files: "$files",
                                is_read: "$is_read",
                                from_user: "$from_user"
                            }
                        },
                        {
                            $group: {
                                _id: "$to",
                                mail: {
                                    $push: {
                                        "from": "$from",
                                        "to": "$to",
                                        "message": "$message",
                                        "subject": "$subject",
                                        "createdAt": "$createdAt",
                                        "files": "$files",
                                        "is_read": "$is_read",
                                        "from_user": {
                                            username: "$from_user.username",
                                            avatar: "$from_user.profile.avatar",
                                            id: "$from_user._id"
                                        },
                                    }
                                },
                                from_user: {
                                    $addToSet: {
                                        username: "$from_user.username",
                                        id: "$from_user._id",
                                        avatar: "$from_user.profile.avatar"
                                    }
                                },
                                is_read: {
                                    $push: "$is_read"
                                },
                                count: { $sum: 1 },
                            }
                        },
                        {
                            $project: {
                                _id: "$_id",
                                inbox: "$mail",
                                count: "$count",
                                from_user: "$from_user",
                                is_read: { $allElementsTrue: ["$is_read"] }
                            }
                        },
                        {
                            $unwind: "$from_user"
                        },
                        {
                            $skip: (parseInt(page) - 1) * parseInt(pageSize)
                        },
                        {
                            $limit: parseInt(pageSize)
                        }
                    ]);
                if (mailList.length == 0) {
                    mailList = await Mail
                    .aggregate([
                        {
                            $match: {
                                to: to_user,
                                to_is_deleted: false,
                                type: 'usual'
                            }
                        },
                        {
                            $sort: { 'createdAt': parseInt(order) }
                        },
                        {
                            $lookup: {
                                'from': 'users',
                                'localField': 'from',
                                'foreignField': 'email',
                                'as': 'from_user'
                            }
                        },
                        {
                            $unwind: "$from_user"
                        },
                        {
                            $project: {
                                to: "$to",
                                from: "$from",
                                message: "$message",
                                subject: "$subject",
                                createdAt: "$createdAt",
                                files: "$files",
                                is_read: "$is_read",
                                from_user: "$from_user"
                            }
                        },
                        {
                            $group: {
                                _id: "$to",
                                mail: {
                                    $push: {
                                        "from": "$from",
                                        "to": "$to",
                                        "message": "$message",
                                        "subject": "$subject",
                                        "createdAt": "$createdAt",
                                        "files": "$files",
                                        "is_read": "$is_read",
                                        "from_user": {
                                            username: "$from_user.username",
                                            avatar: "$from_user.profile.avatar",
                                            id: "$from_user._id"
                                        },
                                    }
                                },
                                from_user: {
                                    $addToSet: {
                                        username: "$from_user.username",
                                        id: "$from_user._id",
                                        avatar: "$from_user.profile.avatar"
                                    }
                                },
                                is_read: {
                                    $push: "$is_read"
                                },
                                count: { $sum: 1 },
                            }
                        },
                        {
                            $project: {
                                _id: "$_id",
                                inbox: "$mail",
                                count: "$count",
                                from_user: "$from_user",
                                is_read: { $allElementsTrue: ["$is_read"] }
                            }
                        },
                        {
                            $unwind: "$from_user"
                        },
                        {
                            $skip: (parseInt(page) - 2) * parseInt(pageSize)
                        },
                        {
                            $limit: parseInt(pageSize)
                        }
                    ]);
                }
                return res.json({ success: true, total: total[0].to, data: mailList });
            } else {
                return res.json({ success: true, total: 0, data: [] });
            }
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    sent: async (req, res) => {
        try {
            const { page, pageSize, order } = req.query;
            const from_email = req.user.email;
            const total = await Mail
                .aggregate([
                    {
                        $match: {
                            from: from_email,
                            from_is_deleted: false,
                            type: 'usual'
                        }
                    },
                    {
                        $project: {
                            from: "$from",
                            message: "$message",
                            subject: "$subject",
                            createdAt: "$createdAt",
                            files: "$files",
                            to: "$to"
                        }
                    },
                    {
                        $group: {
                            _id: "$to",
                            mail: {
                                $push: {
                                    "from": "$from",
                                    "to": "$to",
                                    "message": "$message",
                                    "subject": "$subject",
                                    "createdAt": "$createdAt",
                                    "files": "$files"
                                }
                            },
                            count: { $sum: 1 },
                        }
                    },
                    {
                        $count: "to"
                    }
                ]);

            var mailList = [];
            if (total[0].to > 0) {
                mailList = await Mail
                    .aggregate([
                        {
                            $match: {
                                from: from_email,
                                from_is_deleted: false,
                                type: 'usual'
                            }
                        },
                        {
                            $sort: { 'createdAt': parseInt(order) }
                        },
                        {
                            $lookup: {
                                'from': 'users',
                                'localField': 'to',
                                'foreignField': 'email',
                                'as': 'to_user'
                            }
                        },
                        {
                            $unwind: "$to_user"
                        },
                        {
                            $project: {
                                to_user: "$to_user",
                                to: "$to",
                                from: "$from",
                                message: "$message",
                                subject: "$subject",
                                createdAt: "$createdAt",
                                files: "$files"
                            }
                        },
                        {
                            $group: {
                                _id: "$to",
                                to_user: {
                                    $addToSet: {
                                        username: "$to_user.username",
                                        id: "$to_user._id",
                                        avatar: "$to_user.profile.avatar"
                                    }
                                },
                                sent: {
                                    $push: {
                                        "from": "$from",
                                        "to": "$to",
                                        "to_user": {
                                            username: "$to_user.username",
                                            avatar: "$to_user.profile.avatar",
                                            id: "$to_user._id"
                                        },
                                        "message": "$message",
                                        "subject": "$subject",
                                        "createdAt": "$createdAt",
                                        "files": "$files"
                                    }
                                },
                                count: { $sum: 1 },
                            }
                        },
                        {
                            $unwind: "$to_user"
                        },
                        {
                            $skip: (parseInt(page) - 1) * parseInt(pageSize)
                        },
                        {
                            $limit: parseInt(pageSize)
                        }
                    ]);
                if (mailList.length == 0) {
                    mailList = await Mail
                    .aggregate([
                        {
                            $match: {
                                from: from_email,
                                from_is_deleted: false,
                                type: 'usual'
                            }
                        },
                        {
                            $sort: { 'createdAt': parseInt(order) }
                        },
                        {
                            $lookup: {
                                'from': 'users',
                                'localField': 'to',
                                'foreignField': 'email',
                                'as': 'to_user'
                            }
                        },
                        {
                            $unwind: "$to_user"
                        },
                        {
                            $project: {
                                to_user: "$to_user",
                                to: "$to",
                                from: "$from",
                                message: "$message",
                                subject: "$subject",
                                createdAt: "$createdAt",
                                files: "$files"
                            }
                        },
                        {
                            $group: {
                                _id: "$to",
                                to_user: {
                                    $addToSet: {
                                        username: "$to_user.username",
                                        id: "$to_user._id",
                                        avatar: "$to_user.profile.avatar"
                                    }
                                },
                                sent: {
                                    $push: {
                                        "from": "$from",
                                        "to": "$to",
                                        "to_user": {
                                            username: "$to_user.username",
                                            avatar: "$to_user.profile.avatar",
                                            id: "$to_user._id"
                                        },
                                        "message": "$message",
                                        "subject": "$subject",
                                        "createdAt": "$createdAt",
                                        "files": "$files"
                                    }
                                },
                                count: { $sum: 1 },
                            }
                        },
                        {
                            $unwind: "$to_user"
                        },
                        {
                            $skip: (parseInt(page) - 2) * parseInt(pageSize)
                        },
                        {
                            $limit: parseInt(pageSize)
                        }
                    ]);
                }
                return res.json({ success: true, total: total[0].to, data: mailList });
            } else {
                return res.json({ success: true, total: 0, data: [] });
            }
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    update: async (req, res) => {
        try {
            const _id = req.body.mailId;
            const actionType = req.body.action;
            const is_read = req.body.is_read;
            if (Validator.isEmpty(_id) ||
                Validator.isEmpty(actionType)
            ) {
                return res.json({ success: false, msg: 'Bad request' });
            }
            var update = null;
            var message = '';
            if (actionType === 'delete') {
                if (is_read) // inbox
                {
                    update = await Mail.updateMany({ from: { $in: _id }, to: req.user.email }, { to_is_deleted: true });
                } else // sent
                {
                    update = await Mail.updateMany({ to: { $in: _id }, from: req.user.email }, { from_is_deleted: true });
                }

                message = 'You have just deleted the email';
            } else if (actionType === 'mark') {
                const { is_read } = req.body;
                update = await Mail.updateMany({ from: { $in: _id }, to: req.user.email }, { is_read });
                if (is_read)
                    message = 'You have just read the email';
                else message = 'You have just unread the email';
            }

            if (update.modifiedCount > 0)
                return res.json({ success: true, msg: message });
            else return res.json({ success: false, msg: 'Something went wrong' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    invite: async (req, res) => {
        try {
            const { email, message } = req.body;
            const from = req.user.email;

            const newInvite = new Mail({
                from,
                to: email,
                message,
                type: 'invite'
            });

            const save = newInvite.save();
            /**
             * Must add Mailer function.
             */
            if (save) {
                return res.json({ success: true, msg: 'Invite sent successfully!' });
            } else return res.json({ success: false, msg: 'Something went wrong' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    pending: async (req, res) => {
        try {
            const from = req.user.email;
            const { page, pageSize } = req.query;
            let total = await Mail.find({
                from,
                type: "invite",
                from_is_deleted: false,
            }).countDocuments();
            if (total>0) {
                let pending = await Mail.find({
                    from,
                    type: "invite",
                    from_is_deleted: false,
                }).sort({ createdAt: -1 }).skip((parseInt(page) - 1) * parseInt(pageSize)).limit(parseInt(pageSize));
                if (pending.length == 0) {
                    pending = await Mail.find({
                        from,
                        type: "invite",
                        from_is_deleted: false,
                    }).sort({ createdAt: -1 }).skip((parseInt(page) - 2) * parseInt(pageSize)).limit(parseInt(pageSize));
                }
                return res.json({ success: true, pending, total });
            } else return res.json({ success: true, pending: [], total: 0})
            
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    resendInvite: async (req, res) => {
        try {

        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    }
}

module.exports = mailController;