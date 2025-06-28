const Celebrity = require('../models/Celebrity');
const Outfit = require('../models/Outfit');
const Blog = require('../models/Blog');

exports.generateSitemap = async (req, res) => {
  try {
    const [celebs, outfits, blogs] = await Promise.all([
      Celebrity.find({}, 'slug'),
      Outfit.find({}, '_id'),
      Blog.find({}, 'slug')
    ]);

    let urls = [
      ...celebs.map(c => `/celebrities/${c.slug}`),
      ...outfits.map(o => `/outfits/${o._id}`),
      ...blogs.map(b => `/blogs/${b.slug}`)
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `<url><loc>https://celebritypersona.com${url}</loc></url>`).join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Error generating sitemap');
  }
};