const mongoose = require('mongoose');

async function connect() {
    try {
        console.log(process.env.MONGODB);
        await mongoose.connect('mongodb+srv://2php2692004:conchimlahet@du-an-dau-tay.3zmkc.mongodb.net/?retryWrites=true&w=majority&appName=du-an-dau-tay/my-education-dev', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            setTimeout: 30000,
        });
        console.log('Connect successfully!!!');
    } catch (error) {
        console.log('Connect failure!!!', error);
    }
}

module.exports = { connect };