const mongoose= require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

mongoose.plugin(slug);

const Schema = mongoose.Schema;
const Course = new Schema({
    _id: { type: Number },
    name: { type: String, maxLength: 255 },
    description: { type: String, maxLength: 600 },
    image: { type: String, default: null },
    videoid: { type: [String], maxLength: 255 },
    document: { type: [String], maxLength: 255 },
    slug: { type: String, slug: 'name', unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},{
    _id: false,
    timestamps: true,
}
);

Course.query.sortable=function(req){
    if(req.query.hasOwnProperty('_sort')){
        const isValidtype= ['asc','desc'].includes(req.query.type) ? req.query.type : 'desc';
        return this.sort({
            [req.query.column]: isValidtype
        });
    }
    return this;
}


Course.plugin(AutoIncrement);
Course.plugin(mongooseDelete,{overrideMethods: 'all',deletedAt: true});



module.exports = mongoose.model('Course', Course);