const mongoose = require('mongoose');

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

module.exports = { Users, Daily, File, Balance, History };