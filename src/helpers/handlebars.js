const Handlebars = require('handlebars');
const User = require('../app/models/User');
const { mutipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');

module.exports={
    sum: (a, b) => a + b,
    sortable: (field, sort) => {
      const sortType = field === sort.column ? sort.type : 'default';

      const icons = {
        default: 'fa-solid fa-sort',
        asc: 'fa-solid fa-arrow-down-short-wide',
        desc: 'fa-solid fa-arrow-down-wide-short',
      };

      const types = {
        default: 'desc',
        asc: 'desc',
        desc: 'asc',
      };

      const icon = icons[sortType];
      const type = types[sortType];

      const href = Handlebars.escapeExpression(`?_sort&column=${field}&type=${type}`);

      const output = `<a href="?_sort&column=${field}&type=${type}">
        <i class="${icon}"></i>
      </a>`;
        return new Handlebars.SafeString(output);
    },
    eq: (media, type)=>{
      if (!media) {
        return false;
      }

      // Các phần mở rộng tệp phổ biến cho video và hình ảnh
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];

      const fileExtension = media.split('.').pop().toLowerCase();

      // Kiểm tra loại tệp
      if (type === 'image') {
          return imageExtensions.includes(fileExtension);
      } else if (type === 'video') {
          return videoExtensions.includes(fileExtension);
      }

      return false;
    },
    
}