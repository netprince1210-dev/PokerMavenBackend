const validation = require('validator');
const msg = require('../const/message');
var Validator = {
    isEmpty: (val) => {
        if (val === undefined
            || val === null
            || val.length === 0
            || (typeof val === 'object' && Object.keys(val).length === 0))
            return true;
        else return false;
    },
    userRegister: (user) => {
        for (var i in Object.keys(user)) {
            if (Validator.isEmpty(user[Object.keys(user)[i]]))
                return { success: false, msg: msg.input.not_fill }
        }
        if (!validation.isEmail(user.email))
            return { success: false, msg: msg.input.wrong }

        return { success: true, msg: '' }
    },
    userLogin: (user) => {
        for (var i in Object.keys(user)) {
            if (Validator.isEmpty(user[Object.keys(user)[i]]))
                return { success: false, msg: msg.input.not_fill }
        }

        return { success: true, msg: '' }
    }
}

module.exports = Validator;