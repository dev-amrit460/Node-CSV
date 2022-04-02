const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require("csv-parser");
const path = require('path');
const { Parser } = require('json2csv');


let books;
let magazines;
let authors;


/* GET ROUTES*/
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Assignment', data: books, mg: magazines, auth: authors });
});

router.get('/books', function (req, res, next) {
  uploadData();
  res.render('index', { title: 'Assignment', data: books, mg: null, auth: null });
});

router.get('/magazines', function (req, res, next) {
  uploadData();
  res.render('index', { title: 'Assignment', mg: magazines, data: null, auth: null });
});

router.get('/authors', function (req, res, next) {
  res.render('index', { title: 'Assignment', auth: authors, data: null, mg: null });
});



router.post('/add-book', (req, res) => {
  const { title, isbn, authors, description } = req.body;
  const book = { title, isbn, authors, description };
  books.push(book);
  const json2csvParser = new Parser()
  const csvData = json2csvParser.parse(books);
  fs.writeFile(path.join(__dirname, '../public/updated-csv/latest-books.csv'), csvData, function (err) {
    if (err) throw err;
    console.log('file saved');
  });
  res.redirect('/books');
})

router.post('/filter-book', (req, res) => {
  const query = req.body;
  //console.log(query);

  books = books.filter(function (el) {
    return el.isbn == query.isbn;
  });

  res.redirect('/books');
})


router.post('/filter-email', (req, res) => {
  const query = req.body;
  //console.log(query);

  books = books.filter(function (el) {
    const op = el.authors.split(",");

    return op.find((au) => { return au == query.email });
  });

  magazines = magazines.filter(function (el) {
    const op = el.authors.split(",");

    return op.find((au) => { return au == query.email });
  });

  res.redirect('/books');
})

router.post('/add-mg', (req, res) => {
  const { title, isbn, authors, publishedAt } = req.body;
  const magazine = { title, isbn, authors, publishedAt };
  magazines.push(magazine);
  const json2csvParser = new Parser()
  const csvData = json2csvParser.parse(magazines);
  fs.writeFile(path.join(__dirname, '../public/updated-csv/latest-magazines.csv'), csvData, function (err) {
    if (err) throw err;
    console.log('file saved');
  });
  res.redirect('/magazines');
})

router.post('/add-auth', (req, res) => {
  const { email, firstname, lastname } = req.body;
  const author = { email, firstname, lastname };
  authors.push(author);
  const json2csvParser = new Parser()
  const csvData = json2csvParser.parse(authors);
  fs.writeFile(path.join(__dirname, '../public/updated-csv/latest-authors.csv'), csvData, function (err) {
    if (err) throw err;
    console.log('file saved');
  });
  res.redirect('/authors');
})

router.get('/downbook', function (req, res, next) {
  const file = path.join(__dirname, '../public/updated-csv/latest-books.csv');
  res.download(file);
});

router.get('/downmg', function (req, res, next) {
  const file = path.join(__dirname, '../public/updated-csv/latest-magazines.csv');
  res.download(file);
});

router.get('/downauth', function (req, res, next) {
  const file = path.join(__dirname, '../public/updated-csv/latest-authors.csv');
  res.download(file);
});

const readfile = (filename) =>
  new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filename).pipe(csv({
      separator: ';'
    }))
      .on('data', (data) => { records.push(data) })
      .on('end', async () => {
        // console.log("File Read Successfully");
        resolve(records);
      })
      .on('error', (err) => reject(err));

  })
const compare = (a, b) => {

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

async function uploadData() {
  const bookFile = path.join(__dirname, '../public/csv-files/books.csv')
  books = await readfile(bookFile);
  books.sort(compare);
  const magzineFile = path.join(__dirname, '../public/csv-files/magazines.csv')
  magazines = await readfile(magzineFile);
  magazines.sort(compare);
  const authorFile = path.join(__dirname, '../public/csv-files/authors.csv')
  authors = await readfile(authorFile);

  // console.log({authors,books,magazines})
}

uploadData();







module.exports = router;
