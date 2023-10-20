const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const methodOverride = require('method-override'); 
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method')); 
app.use(express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage: storage });

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blogdbh'
});

app.get('/', (req, res) => {
  connection.query('SELECT * FROM articles', (error, results) => {
    if (error) {
      console.error(error);
      return;
    }
    res.render('index', { articles: results });
  });
});

app.get('/articles/new', (req, res) => {
  res.render('new');
});

app.post('/articles', upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.filename : null;
  connection.query('INSERT INTO articles (title, content, image) VALUES (?, ?, ?)', [title, content, image], (error) => {
    if (error) {
      console.error(error);
      return;
    }
    res.redirect('/');
  });
});
app.get('/articles/:id', (req, res) => {
  const articleId = req.params.id;
  connection.query('SELECT * FROM articles WHERE id = ?', [articleId], (error, results) => {
    if (error) {
      console.error(error);
      return;
    }
    res.render('show', { article: results[0] });
  });
});

app.delete('/articles/:id', (req, res) => { 
  const articleId = req.params.id;
  connection.query('DELETE FROM articles WHERE id = ?', [articleId], (error) => {
    if (error) {
      console.error(error);
      return;
    }
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
