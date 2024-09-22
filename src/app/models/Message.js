const mongoose= require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

mongoose.plugin(slug);

const Schema = mongoose.Schema;
const Message = new Schema({
    sender: String,
    receiver: String,
    message: String,
},{
    timestamps: true,
}
);

Message.plugin(mongooseDelete,{overrideMethods: 'all',deletedAt: true});



module.exports = mongoose.model('Message', Message);