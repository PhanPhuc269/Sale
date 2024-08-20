const mongoose= require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const Schema = mongoose.Schema;
const Course = new Schema({
    _id: { type: Number },
    name: { type: String, maxLength: 255 },
    description: { type: String, maxLength: 600 },
    image: { type: String, maxLength: 255 },
    videoid: { type: String, maxLength: 255 },
    slug: { type: String, slug: 'name', unique: true },
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

mongoose.plugin(slug);

Course.plugin(AutoIncrement);
Course.plugin(mongooseDelete,{overrideMethods: 'all',deletedAt: true});



module.exports = mongoose.model('Course', Course);