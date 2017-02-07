"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
var http = require('http');
var url = require('url');
var fs = require('fs');
var port = 30022;
var config = JSON.parse(fs.readFileSync('config.json'));


var stylesheet = fs.readFileSync('gallery.css');

var imageNames = ['ace', 'bubble', 'chess', 'fern', 'mobile'];


function getImageNames(callback){
	fs.readdir('images/', function(err, fileNames){
		if(err) callback(err, undefined);
		else callback(false, fileNames);
	});
}

function imageNamesToTags(fileNames){
	return fileNames.map(function(fileName){
		return `<img src="${fileName}" alt="${fileName}">`;
	});
}

function serveImage(filename, req, res){
	fs.readFile('images/' + filename, function(err, body){
		if(err){
			console.error(err);
			res.statusCode = 404;
			res.statusMessage = "Resource not found";
			res.end();
			return;
		}
	res.setHeader("Content-Type", "image/jpeg");
	res.end(body);
	});
}

function buildGallery(imageTags){

		var html = '<!doctype HTML><head><title>' + config.title + '</title>';
			html += '<link href="gallery.css" rel="stylesheet" type="text/css"></head>';
			html += "<body>";
			html += '<h1>' + config.title +'</h1>';
			html += '<form action="">';
			html += '<input type = "text" name = "title">';
			html += '<input type = "submit" value="Change Gallery Title">';
			html += '</form>;'
			html += imageNamesToTags(imageTags).join('');
			html += '<form action="" method="POST" enctype="multipart/form-data">';
			html += '<input type="file" name="image">';
			html += '<input type="submit" value="Upload Image">';
			html +='</form>'
			html += "<h1>Hello.</h1>The time is " + Date.now();
			html += "</body>";
		return html;

}

function serveGallery(req, res){	
	getImageNames(function (err, imageNames){
		if (err){
			console.error(err);
			res.statusCode = 500;
			res.statusMessage = 'Server error';
			res.end();
			return;
		}
			res.setHeader('Content-Type', 'text/html');
			res.end(buildGallery(imageNames));
		});
			

}


function uploadImage(req, res){
	var body = '';
	req.on('error', function(){
		res.statusCode = 500;
		res.end();
	});
	req.on('data', function(){
		body += data;
	});
	req.on('end', function(){
		fs.writeFile('filename', body, function(){
			if (err){
				console.error(err);
				res.end();
				return;
			}
			serveGallery(req, res);
		});
	});
}

var server = http.createServer((req, res) => {
	var urlParse = url.parse(req.url);

	if(urlParse.query){
		var matches = /title=(.+)($|&)/.exec(urlParse.query);
		if (matches && matches[1]){
			config.title = decodeURIComponent(matches[1]);
			fs.writeFile('config.json', JSON.stringify(config));
		}
	}
	
	switch(urlParse.pathname){
		case '/':		
		case '/gallery':
			if (req.method == 'GET'){
				serveGallery(req, res);
			}else if (req.method == 'POST'){
				uploadImage(req, res);
			}
			
			break;
		case '/gallery.css':
			res.setHeader('Content-Type', 'text/css');
			res.end(stylesheet);
			break;
		default:
			serveImage(req.url, req, res);		
	}
});

server.listen(port, ()=>{
	console.log("Listening on Port " + port);
});
