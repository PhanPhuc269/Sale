const mongoose= require('mongoose');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const Schema = mongoose.Schema;
const DetailCourse = new Schema({
    name: { type: String, maxLength: 255 },
    link: { type: String, maxLength: 255 },
    slug: { type: String, unique: false },
    type: { type: String, maxLength: 255 },
},{
    timestamps: true,
}
);

DetailCourse.plugin(mongooseDelete,{overrideMethods: 'all',deletedAt: true});



module.exports = mongoose.model('DetailCourse', DetailCourse);