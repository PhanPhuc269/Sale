const mongoose = require('mongoose');
//'mongodb+srv://2php2692004:conchimlahet@du-an-dau-tay.3zmkc.mongodb.net/?retryWrites=true&w=majority&appName=du-an-dau-tay/my-education-dev'
async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/my-education-dev', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
        });
        console.log('Connect successfully!!!');
    } catch (error) {
        console.log('Connect failure!!!', error);
    }
}

module.exports = { connect };