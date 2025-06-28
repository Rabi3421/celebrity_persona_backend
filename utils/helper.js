const slugify = require('slugify');

async function generateUniqueSlug(Model, title) {
  let slug = slugify(title, { lower: true });
  let exists = await Model.findOne({ slug });
  let suffix = 1;
  while (exists) {
    slug = slugify(title, { lower: true }) + '-' + suffix;
    exists = await Model.findOne({ slug });
    suffix++;
  }
  return slug;
}

module.exports = { generateUniqueSlug };
