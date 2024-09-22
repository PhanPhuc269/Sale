const mongoose= require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

mongoose.plugin(slug);

const Schema = mongoose.Schema;
const Post = new Schema({
    content: { type: String, maxLength: 255 },
    media: { type: [String], maxLength: 255 },
    //images: { type: [String], maxLength: 255 },
    // videos: { type: [String], maxLength: 255 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, maxLength: 255 },
},{
    timestamps: true,
}
);

Post.query.sortable=function(req){
    if(req.query.hasOwnProperty('_sort')){
        const isValidtype= ['asc','desc'].includes(req.query.type) ? req.query.type : 'desc';
        return this.sort({
            [req.query.column]: isValidtype
        });
    }
    return this;
}

Post.plugin(mongooseDelete,{overrideMethods: 'all',deletedAt: true});



module.exports = mongoose.model('Post', Post);