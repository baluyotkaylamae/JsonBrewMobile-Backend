const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String, 
      },

});

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
