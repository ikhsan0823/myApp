const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: '/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5},
}).single('myfile');

const usersSchema = {
    username: String,
    email: String,
    password: String,
    online: {
        type: Boolean,
        default: false,
    },
};
const dailySchema = {
    username: String,
    title: String,
    description: String,
    date: Date,
    uniqueId: String,
    nameday: String
};
const fileSchema = new mongoose.Schema({
    username: String,
    filename: String,
    path: String,
    size: Number,
    uniqueId: String
});
const balanceSchema = new mongoose.Schema({
    username: String,
    value: Number
});
const historySchema = {
    username: String,
    formattedDate: Date,
    formattedTime: String,
    type: String,
    depositeAmount: Number,
    withdrawAmount: Number
}

const Users = mongoose.model("Users", usersSchema);
const Daily = mongoose.model("Daily", dailySchema);
const File = mongoose.model('File', fileSchema);
const Balance = mongoose.model('Balance', balanceSchema);
const History = mongoose.model('History', historySchema);

module.exports = { upload, Users, Daily, File, Balance, History };