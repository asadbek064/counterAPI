const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const bcrypt = require('bcrypt');
const saltRounds = Number(process.env.SALT_ROUNDS);
const { nanoid } = require('nanoid');

const UserSchema = mongoose.Schema({
    userID: { type: String, unique: true, require: true },
    email: { type: String, unique: true, require: true },
    password: { type: String, unique: true, require: true },
    apiKey: { type: string, unique: true }, 
    isActivated: { type: Boolean, default: false }
});

const User = module.exports = mongoose.model