const User = require('../models/User');
const Post = require('../models/Post');
const msg = require('../const/message');
const Validator = require('../helpers/validation');
const path = require('path');
const { Action } = require('../helpers/socket');
const { default: mongoose } = require('mongoose');

const profileController = {
    edit: async (req, res) => {
        try {
            let { email } = req.user;
            if (Validator.isEmpty(req.body)) {
                return res.json({ success: false, msg: 'Bad request' });
            }

            let user = await User.findOne({ email });
            let update = await User.updateOne({ email }, { profile: { ...user.profile, ...req.body } });

            if (update.modifiedCount > 0) {
                return res.json({ success: true, msg: 'Edit profile successfully' });
            } else return res.json({ success: false, msg: 'Something went wrong' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    get: async (req, res) => {
        try {
            let { email } = req.user;
            let user = await User.findOne({ email });
            if (!Validator.isEmpty(user)) {
                return res.json({ success: true, data: user.profile });
            } else return res.json({ success: false, msg: 'There is no profile data' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    avatar: async (req, res) => {
        try {
            if (req.files.avatar !== null) {
                const { avatar } = req.files;
                const files = avatar;
                const ext = files.name.substring(files.name.length - 4, files.name.length);
                const filename = req.user.id + new Date().getTime() + '-' + ext;
                files.mv(path.join(__dirname, '../public/avatar/' + filename));
                let { email } = req.user;
                let user = await User.findOne({ email });
                let update = await User.updateOne({ email }, { profile: { ...user.profile, avatar: filename } });
                if (update.modifiedCount > 0) {
                    return res.json({ success: true, msg: 'Updated your avatar', avatar: filename });
                } else return res.json({ success: false, msg: 'Something went wrong' });
            }
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    activity: async (req, res) => {
        try {
            let { userid } = req.params;
            let { search, page } = req.query;

            let userProfile = await User.findOne({ _id: userid });
            if (!Validator.isEmpty(userProfile)) {
                let post = await Post.aggregate([

                    {
                        '$match': {
                            '$or': [
                                {
                                    'from': userProfile.email
                                }, {
                                    'to': userProfile.email
                                }
                            ]
                        }
                    }, {
                        '$lookup': {
                            'from': 'users',
                            'localField': 'from',
                            'foreignField': 'email',
                            'as': 'from_user'
                        }
                    }, {
                        '$lookup': {
                            'from': 'users',
                            'localField': 'to',
                            'foreignField': 'email',
                            'as': 'to_user'
                        }
                    }, {
                        '$unwind': '$from_user'
                    }, {
                        '$unwind': '$to_user'
                    }, {
                        '$addFields': {
                            'other_content': {
                                '$cond': {
                                    if: {
                                        $and: [
                                            {
                                                '$eq': [
                                                    '$from', userProfile.email
                                                ]
                                            }
                                        ]
                                    },
                                    then: {
                                        $concat: ["You", ' start following ', "$to_user.username"]
                                    },
                                    else: {
                                        $concat: ["$from_user.username", ' start following ', "you"]
                                    }
                                }
                            }
                        }
                    }, {
                        $project: {
                            from_user: {
                                username: "$from_user.username",
                                realname: "$from_user.realname",
                                avatar: "$from_user.profile.avatar",
                                _id: "$from_user._id"
                            },
                            to_user: {
                                username: "$to_user.username",
                                realname: "$to_user.realname",
                                avatar: "$to_user.profile.avatar",
                                _id: "$to_user._id"
                            },
                            content: "$content",
                            image: "$image",
                            createdAt: "$createdAt",
                            type: "$type",
                            other_content: "$other_content",
                            like: "$like"
                        }
                    },
                    {
                        $match: {
                            $or: [
                                { "from.username": new RegExp(search, 'i') },
                                { "to.username": new RegExp(search, 'i') },
                                { "content": new RegExp(search, 'i') }
                            ]
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $skip: ((parseInt(page) - 1) * 5)
                    },
                    {
                        $limit: 5
                    }
                ]);
                let image = await Post.aggregate([
                    {
                        $match: {
                            $or: [
                                {
                                    to: userProfile.email
                                },
                                {
                                    poster: userProfile.email
                                }
                            ]
                        }
                    },
                    {
                        '$project': {
                            'image': '$image'
                        }
                    }, {
                        '$unwind': '$image'
                    }, {
                        '$group': {
                            '_id': '',
                            'image': {
                                '$push': '$image'
                            }
                        }
                    }, {
                        '$unwind': '$image'
                    }, {
                        '$limit': 8
                    }, {
                        '$group': {
                            '_id': '',
                            'image': {
                                '$push': '$image'
                            }
                        }
                    }
                ]);
                const images = image.length > 0 ? image[0].image : [];
                return res.json({
                    success: true,
                    about: userProfile.profile?.about,
                    notification: userProfile.profile?.notification,
                    social: userProfile.profile?.social,
                    posts: post,
                    image: images,
                })
            } else return res.json({ success: false, msg: 'There is no profile' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    post: async (req, res) => {
        try {
            let { content, userid } = req.body;
            if (Validator.isEmpty(content) ||
                Validator.isEmpty(userid)
            ) {
                return res.json({ success: false, msg: 'Bad Request' });
            }

            const to_user = await User.findOne({ _id: userid });
            const file_paths = [];
            if (req.files !== null) {
                const { image } = req.files;
                const files = image;
                if (files.length === undefined) {
                    const ext = files.name.substring(files.name.length - 4, files.name.length);
                    const filename = req.user.id + new Date().getTime() + '-' + i + ext;
                    files.mv(path.join(__dirname, '../public/post/' + filename));
                    file_paths.push(filename);
                } else {
                    for (var i = 0; i < files.length; i++) {
                        const ext = files[i].name.substring(files[i].name.length - 4, files[i].name.length);
                        const filename = req.user.id + new Date().getTime() + '-' + i + ext;
                        files[i].mv(path.join(__dirname, '../public/post/' + filename));
                        file_paths.push(filename);
                    }
                }
            }
            const newPost = Post({
                from: req.user.email,
                to: to_user.email,
                content,
                image: file_paths,
                type: 'post'
            });

            const save = await newPost.save();
            Action.post(req.user, userid);
            if (save) {
                return res.json({ success: true, msg: 'Post successfully!' });
            } else return res.json({ success: false, msg: 'Something went wrong' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    getHeaderInfo: async (req, res) => {
        try {
            let { userid } = req.params;
            let userProfile = await User.findOne({ _id: userid });
            let follow = await Post.find({ to: userProfile.email, type: 'follow' }).countDocuments();
            let is_follow = false;
            if (follow > 0)
                is_follow = true;
            if (!Validator.isEmpty(userProfile)) {
                return res.json({
                    success: true, profile: {
                        avatar: userProfile.profile?.avatar,
                        favorites: 0,
                        followers: follow,
                        username: userProfile.username,
                        fullname: userProfile.realname.first + ' ' + userProfile.realname.last,
                        is_follow
                    }
                })
            } else return res.json({ success: false, msg: 'There is no profile' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    follow: async (req, res) => {
        try {
            const { userid } = req.params;
            const { email } = req.user;
            const user = await User.findOne({ _id: userid });
            if (Validator.isEmpty(user))
                return res.json({ success: false, msg: 'Bad Request' });
            const follow = await Post.find({ $or: [{ from: email, to: user.email }, { from: user.email, to: email }], type: 'follow' });
            if (!Validator.isEmpty(follow)) {
                for (var i = 0; i < follow.length; i++)
                    await Post.deleteOne({ _id: follow[i]._id });
                return res.json({ success: true, msg: 'You are not follow ' + user.realname.first + ' ' + user.realname.last });
            } else {
                Action.follow(req.user, userid);
                let toFollow = new Post({
                    from: email,
                    to: user.email,
                    type: 'follow'
                });
                await toFollow.save();
                let fromFollow = new Post({
                    to: email,
                    from: user.email,
                    type: 'follow'
                });
                await fromFollow.save();
                return res.json({ success: true, msg: 'You are following ' + user.realname.first + ' ' + user.realname.last });
            }
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    followers: async (req, res) => {
        try {
            let { userid } = req.params;

            let { page, search } = req.query;

            if (Validator.isEmpty(page))
                page = 0;
            let user = await User.findOne({ _id: userid });
            if (Validator.isEmpty(user))
                return res.json({ success: false, msg: 'Bad Request' });
            let cond = [];
            let followers = await Post.aggregate([
                {
                    $match: {
                        to: user.email,
                        type: 'follow'
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "from",
                        foreignField: "email",
                        as: "from_user"
                    }
                },
                {
                    $unwind: "$from_user"
                },
                {
                    $project: {
                        from: {
                            first_name: "$from_user.realname.first",
                            last_name: "$from_user.realname.last",
                            _id: "$from_user._id",
                            email: "$from",
                            avatar: "$from_user.profile.avatar",
                            username: "$from_user.username"
                        },
                        to: "$to",
                        accept: "$accept",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt"
                    }
                },
                {
                    $match: {
                        "from.username": new RegExp(search, 'i')
                    }
                },
                {
                    $skip: ((parseInt(page) - 1) * 5)
                },
                {
                    $limit: 5
                }
            ]);
            return res.json({ success: true, data: followers });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    unFollow: async (req, res) => {
        try {
            const { followid } = req.params;
            let accept = await Post.deleteOne({ _id: followid });

            if (accept.deletedCount > 0) {
                return res.json({ success: true, msg: 'Deleted Follow' });
            } else return res.json({ success: false, msg: 'Something went wrong' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    shootOut: async (req, res) => {
        try {
            const { userid } = req.params;
            let { page, search } = req.query;

            if (Validator.isEmpty(page))
                page = 0;
            const followers = await Post.aggregate([
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
                    '$lookup': {
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
                    $match: { "to_user._id": mongoose.Types.ObjectId(userid), type: "follow" }
                },
                {
                    '$group': {
                        '_id': '',
                        'follower': {
                            '$push': '$from_user._id'
                        }
                    }
                },
            ]);
            let follower = followers.length > 0 ? followers[0].follower : [];
            follower.push(mongoose.Types.ObjectId(userid));

            let shoot = await Post.aggregate([
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
                    '$lookup': {
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
                    $match: {
                        "from_user._id": { $in: follower }
                    }
                },
                {
                    $project: {
                        to_user: {
                            username: "$to_user.username",
                            id: "$to_user._id",
                            avatar: "$to_user.profile.avatar",
                            realname: "$to_user.realname"
                        },
                        from_user: {
                            username: "$from_user.username",
                            id: "$from_user._id",
                            avatar: "$from_user.profile.avatar",
                            realname: "$from_user.realname"
                        },
                        image: "$image",
                        content: "$content",
                        like: "$like",
                        _id: "$_id",
                        createdAt: "$createdAt"
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $skip: ((parseInt(page) - 1) * 5)
                },
                {
                    $limit: 5
                }
            ]);
            return res.json({ success: true, shootouts: shoot })
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    like: async (req, res) => {
        try {
            const { postid } = req.params;
            let post = await Post.findOne({ _id: postid });
            var like = post.like ? post.like : [];
            if (like.indexOf(req.user.id) > -1) {
                return res.json({ success: false, msg: `You've already like this post` });
            }
            like.push(req.user.id);
            let update = await Post.updateOne({ _id: postid }, { like });
            if (update.modifiedCount > 0) {
                return res.json({ success: true, msg: 'You like this post' });
            } else return res.json({ success: false, msg: 'Something went wrong' });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    },
    viewAllImage: async (req, res) => {
        try {
            let { userid } = req.params;
            let { page, pageSize } = req.query;
            let userProfile = await User.findOne({ _id: userid });
            if (Validator.isEmpty(userProfile))
                return res.json({ success: false, msg: 'No Exist User' });
            let total = await Post.aggregate([
                {
                    $match: {
                        $or: [
                            {
                                to: userProfile.email
                            },
                            {
                                poster: userProfile.email
                            }
                        ]
                    }
                }, {
                    $project: {
                        image: '$image'
                    }
                }, {
                    '$unwind': '$image'
                }, {
                    '$group': {
                        '_id': '',
                        'image': {
                            '$push': '$image'
                        }
                    }
                }, {
                    '$unwind': '$image'
                }, {
                    $count: "image"
                }
            ])
            let image = await Post.aggregate([
                {
                    $match: {
                        $or: [
                            {
                                to: userProfile.email
                            },
                            {
                                poster: userProfile.email
                            }
                        ]
                    }
                },
                {
                    '$project': {
                        'image': '$image'
                    }
                }, {
                    '$unwind': '$image'
                }, {
                    '$group': {
                        '_id': '',
                        'image': {
                            '$push': '$image'
                        }
                    }
                }, {
                    '$unwind': '$image'
                }, {
                    '$skip': (parseInt(page) - 1) * parseInt(pageSize)
                }, {
                    '$limit': parseInt(pageSize)
                }, {
                    '$group': {
                        '_id': '',
                        'image': {
                            '$push': '$image'
                        }
                    }
                }
            ]);
            return res.json({ success: true, image: image[0].image, total });
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: msg.server.error });
        }
    }
}

module.exports = profileController;