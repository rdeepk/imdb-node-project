// initialize Express in project
const express = require('express'),
  bodyParser = require('body-parser'),
  rp = require('request-promise');

var imdbApiKey = "6b41a668e25ec6c8670df1fc29641a7d";
var imdbRequestUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + imdbApiKey + "&sort_by=popularity.desc";
var imdbSearchRequestUrl = "https://api.themoviedb.org/3/search/movie?api_key=" + imdbApiKey;
var results, searchResults;
var port = process.argv[2] || 7000;

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false
}));

/**
 * @summary Respond to get request for Home link.
 */
app.get('/', (req, res) => {
  let currentPage = req.query.page ? req.query.page : 1;
  imdbRequestUrl +='&page='+currentPage;
  rp(imdbRequestUrl)
    .then(function (response) {
      response = JSON.parse(response);
      results = response.results;
      res.render('pages/index', {
        movies: results,
        baseUrl: 'http://image.tmdb.org/t/p/w342',
        search: false,
        totalResults: response.total_results,
        currentPage: currentPage,
        pagination: true,
        totalPages: response.total_pages
      });
    })
    .catch(function (error) {
      console.log(error);
    });

})

/**
 * @summary Returns movie object by id.
 */
let getMovieById = (id, search) => {
  var data;
  if (search) {
    data = searchResults;
  } else {
    data = results;
  }
  if (data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === Number(id)) {
        return data[i];
      }
    }
  }
}

/**
 * @summary Respond to all requests for search.
 */
app.all('/search', function (req, res) {
  let imdbSearchRequestUrl = "https://api.themoviedb.org/3/search/movie?api_key=" + imdbApiKey;
  let currentPage = req.query.page ? req.query.page : 1;
  imdbSearchRequestUrl += '&page='+currentPage;
  let searchStr = req.body.searchStr ? req.body.searchStr: req.query.query;
  rp(imdbSearchRequestUrl + "&query=" +searchStr)
    .then(function (response) {
      response = JSON.parse(response);
      searchResults = response.results;
      res.render('pages/index', {
        movies: searchResults,
        baseUrl: 'http://image.tmdb.org/t/p/w342',
        search: true,
        totalResults: response.total_results,
        pagination: true,
        currentPage: currentPage,
        searchStr: searchStr,
        totalPages: response.total_pages
      });
    })
    .catch(function (error) {
      console.log(error);
    });
})

/**
 * @summary Respond to request for a movie by id.
 */
app.get('/movie/:movieId', (req, res) => {
  if (req.query.search) {
    res.render("pages/movie", {
      movie: getMovieById(req.params.movieId, true),
      baseUrl: 'http://image.tmdb.org/t/p/w342',
      pagination: false
    });
  } else {
    res.render("pages/movie", {
      movie: getMovieById(req.params.movieId, false),
      baseUrl: 'http://image.tmdb.org/t/p/w342',
      pagination: false
    });
  }
})



// start Express on port
app.listen(port, () => {
  console.log('Server Started on http://localhost:'+port);
  console.log('Press CTRL + C to stop server');
});