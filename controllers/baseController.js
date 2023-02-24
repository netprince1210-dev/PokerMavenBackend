const Base = require('../models/Base');
const User = require('../models/User');
const Post = require('../models/Post');
const msg = require('../const/message');
const path = require('path');
const mongoose = require('mongoose');

const baseController = {
    getCategories: async (req, res) => {
        try {
            let categories = await Base.find({ type: 'category' });
            res.json({ success: true, categories })
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    getSubCategories: async (req, res) => {
        try {
            const { cid } = req.params;
            let subcategories = await Base.find({ type: 'subcategory', parent: mongoose.Types.ObjectId(cid) });
            res.json({ success: true, subcategories })
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    download: async (req, res) => {
        try {
            const fileName = req.params.file;
            const type = req.body.type;
            const directoryPath = path.join(__dirname, '../public/');

            res.download(directoryPath + type + "/" + fileName, (err) => {
                if (err) {
                    res.status(500).send({
                        message: "Could not download the file. " + err,
                    });
                }
            });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    getFollowers: async (req, res) => {
        try {
            const to = req.user.email;
            const from = await Post.aggregate([
                {
                    $match: { $or: [{ to: to, from: to }], type: "follow" }
                },
                {
                    '$lookup': {
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
                    '$group': {
                        '_id': '',
                        '@': {
                            '$push': '$from_user.username'
                        }
                    }
                }
            ]);
            if (from.length > 0) {
                return res.json({ success: true, followers: from });
            } else return res.json({ success: true, followers: { "@": [] } });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    }
}

module.exports = baseController;