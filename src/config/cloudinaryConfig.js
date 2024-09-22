const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../APIsecrect.env') });

cloudinary.config({
  cloud_name: 'dginq7yqw',
  api_key: '139616111469673',
  api_secret: 'P5GZmEtXR1Ig2tzyoF6HeAH8eMk',
});
//process.env.APIsecrect
module.exports = cloudinary;