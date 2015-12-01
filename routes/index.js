var express = require('express');
var router = express.Router();
var knex = require('../database');

router.get('/', function(req, res) {

    var news = knex.select('headline_text', 'date_posted').from('news').limit(10);

    var reviews = knex.select('band_name', 'record_name')
        .join('records', 'reviews.record_id', 'records.id')
        .join('bands', 'records.band_id', 'bands.id')
        .from('reviews').limit(10);

    res.render('homepage', {
        title: 'Express',
        news: news,
        reviews: reviews
    });
});

module.exports = router;
