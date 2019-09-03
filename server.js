var express = require('express');				//Get instance of Express
let bodyParser = require('body-parser');		//Get instance of Body Parser
const mongodb = require('mongodb');				//Get instance of MongoDb
var app = express();							//Get express object as app
let http = require('http');

const MongoClient = mongodb.MongoClient;		//Reference Monogodb client
const url = 'mongodb://localhost:27017/';		//URL for Mongo - typically 27017
let database;									//Used to reference the Mongodb database.

app.engine('html', require('ejs').renderFile);  //Setup the view Engine
app.set('view engine', 'html');
app.use(express.static('images'));              //Setup the static assets directories
app.use(express.static('css'));

/*
	First parameter: URL for the mongodb server, port is 27017
	Second parameter: Object required for Mongodb latest object
	Third parameter: callback function that is executed after connect is completed. Two parameters (err object
		that has value if an error occurs, client which is used to access the database)
*/
MongoClient.connect( url, {useNewUrlParser: true}, function(err, client){
	if (err) {
        console.log('Error encountered connecting to server.  ', err);
    } else {
        console.log("Connected successfully to server");
        database = client.db('fit2095db');
		database.createCollection('task');
    }
});

app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/', function(request, response){
    response.render('index.html');
});

app.get('/newTask', function(request, response){
    response.render('newTask.html');
});

app.post('/addTask', function(request, response){
	taskID = Math.floor(Math.random() * 1000);		//Integer from 0-1000.
	taskStatus = 'In Progress';
	
	database.collection("task").insertOne({
		ID : taskID,
		TaskName : request.body.taskName,
		Assigned : request.body.assigned,
		DueDate : request.body.dueDate,
		Status : taskStatus,
		Description : request.body.description
	});

	response.redirect('/listTask');
});

app.get('/listTask', function(request, response){
	
	// Finds all documents in collection 'task', converted to an array and placed into result object.
	database.collection("task").find({}).toArray(function (err, result) {
		if (err){
			console.log("Error");
		} else {
			response.render('listTask.html', {
				db: result
			}
		)};
	});
});

app.get('/deleteTaskPage', function(request, response) {
	response.render('deleteTask.html');
});

app.get('/deleteAllTasks', function(request, response){
	// Remove () will delete all documents from the collection 'task'. Same as deleteMany() with {} as filter.
	database.collection("task").remove();
	response.redirect('/listTask');
});

app.post('/deleteTask', function(request, response){
	taskID = parseInt(request.body.taskID);

	let filter = { ID: taskID};
	database.collection("task").deleteOne(filter);

	response.redirect('/listTask');
});

app.get('/updateTaskPage', function(request, response){
	response.render('updateTask.html');
});

app.post('/updateTask', function(request, response){
	taskID = parseInt(request.body.taskID);
	taskStatus = request.body.status;

	let filter = { ID: taskID };
	let update = { $set: { Status: taskStatus}};
	database.collection('task').updateOne(filter, update);

	response.redirect('/listTask');
});

// Extra Task~~~~~~

app.get('/findtasks/:lowerID/:upperID', function(request, response){
	lowerId = parseInt(request.params.lowerID);
	upperId = parseInt(request.params.upperID);

	query = { ID: {$gte: lowerId, $lte: upperId}};
	database.collection('task').find(query).toArray(function(error, result){
		if (error){
			console.log('No ID found');
		} else {
			console.log('Success~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
			// Do something
		}
	});
});

app.listen(8080);
