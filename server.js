#!/usr/bin/env node 
   var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
	var amqp = require('amqplib');
	var http = require('http').Server(app);
//	var io = require('socket.io')(http);
	var server = require('http').createServer(app);
	var io = require('socket.io').listen(server);
	var exchangeName = "direct";
	var routingKey = "debug1";
	 MongoWatch = require('mongo-watch');

	var MongoOplog = require('mongo-oplog');
	var oplog = MongoOplog('mongodb://localhost:27017/local', { ns: 'test.todos' }).tail();
 

    // configuration =================

    mongoose.connect('mongodb://localhost:27017/test');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

 // define model =================
//watcher.watch('test.todos', function(event) {
            // get and return all the todos after you create another
//i             Todo.find(function(err, todos) {
//                if (err)
//                    res.send(err)
//                        console.log(todos);
//                    io.sockets.emit('todoemit',{msg:todos});
//                  res.send(200);
//            });

//  return console.log('something changed:', event);
//});


    var Todo = mongoose.model('Todo', {
        text : String
    });


       oplog.on('insert', function (doc) {
                console.log('idocop');
                console.log(doc.op);

             Todo.find(function(err, todos) {
                if (err)
                    res.send(err)
                        console.log(todos);
                    io.sockets.emit('todoemit',{msg:todos});
//                  res.send(200);
            });

        });


	app.get('/api/todos', function(req, res) {

        // use mongoose to get all todos in the database
        Todo.find(function(err, todos) {


            if (err)
                res.send(err)

		console.log('server get');
		console.log(todos);
            res.json(todos); // return all todos in JSON format
        });
    });


// create todo and send back all todos after creation
    app.post('/api/todos', function(req, res) {

        // create a todo, information comes from AJAX request from Angular
        Todo.create({
            text : req.body.text,
            done : false
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
	     Todo.find(function(err, todos) {
                if (err)
                    res.send(err)
			console.log(todos);
            	    io.sockets.emit('todoemit',{msg:todos});
//		    res.send(200);
            });
        });

    });



    // delete a todo
    app.delete('/api/todos/:todo_id', function(req, res) {
        Todo.remove({
            _id : req.params.todo_id
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            Todo.find(function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        });
    });



  // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });



    // listen (start app with node server.js) ======================================
    server.listen(process.env.PORT || 8080);
    console.log("App listening on port 8080");

