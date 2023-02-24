const socketIo = require('socket.io');
const _ = require('lodash');
const uuid = require('node-uuid');
var UserList = [];
var socketHandle = null;
module.exports = {
    Socket: (app) => {
        const io = socketIo(app, {
            cors: {
                origin: 'http://localhost:3000'
            }
        })
        //Add this before the app.get() block
        io.on('connection', (socket) => {
            console.log('connected', socket.rooms)
            socketHandle = socket;
            socket.on('login', (val) => {
                if (!_.find(UserList, { userid: val.userid}))
                    UserList.push({
                        userid: val.userid,
                        roomId: socket.id
                    });
                else {
                    _.find(UserList, { userid: val.userid}).roomId = socket.id
                }
                console.log(UserList);
                socket.emit("roomId", socket.id);
            });
            socket.on('disconnect', function (reason) {
                console.log(reason)
            })
        });
    },
    Action: {
        follow: (from, to) => {
            var to_user = _.find(UserList, { userid: to });
            if (to_user) {
                socketHandle.id = _.find(UserList, { userid: from.id })['roomId'];
                socketHandle.to(to_user.roomId).emit("follow", { msg: from.username + ' is following you!', to });
            }

        },
        post: (from, to) => {
            var to_user = _.find(UserList, { userid: to });
            if (to_user) {
                socketHandle.id = _.find(UserList, { userid: from.id })['roomId'];
                socketHandle.to(to_user.roomId).emit("post", { msg: from.username + ' shoot out!', to });
                // socketHandle.emit('follow', from.username + ' is following you!');
            }
        }
    },
}
