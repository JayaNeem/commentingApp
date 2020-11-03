var express = require('express');
var path = require('path');
var con = require('./model/Db');

var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

var port = process.env.port || 8080;

var server = http.listen(port, () => {
	console.log("Server started at " +port);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
	var sql = 'select * from posts';
	con.query(sql, (err, posts) => {
		if (err) throw err;
		else
			res.render('index', { posts: posts });
	});
});

app.get('/posts/detail/:id', (req, res) => {
	var sql = 'select * from posts where id = ?';
	con.query(sql, [req.params.id], (err, postDetail) => {
		if (err) throw err;
		else {
			var sql = 'select * from comments where postId = ?';
			con.query(sql, [req.params.id], (err, comments) => {
				if (err) throw err;
				else
					res.render('post-detail', { postDetail: postDetail[0], comments: comments, postId: req.params.id });
			});
		}
	});
});

io.on('connection', function(socket) {
    socket.on('comment', function(data) {
			var sql = 'insert into comments (comment, postId) values (?, ?)';
			con.query(sql, [data.comment, data.postId], (err) => {
				if (err) throw err;
				else {
					socket.broadcast.emit('comment',data);
				}
			});
    });
});

// catch 404 and forward to error handler
app.use(function(req, res) {
	res.status(404);
	res.render('error');
});
