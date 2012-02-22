var express = require( 'express' ), 
	app = module.exports = express.createServer(),
	RedisStore = require('connect-redis')(express),
	sqlite3 = require( 'sqlite3' ),
	db_file = __dirname + '/blog.db',
	db = new sqlite3.Database( db_file ),
	fs = require( 'fs' ),
	coderwall = require( 'coderwall' ),
	sio = require( 'socket.io' ),
	io = sio.listen( app ),
	scripts = '', styles = '',
	prod_scripts, dev_scripts,
	prod_css, dev_css,
	width, height,
	sprites = {},
	blog = [],
	sprite_count = 0;


prod_scripts = [
	'/js/jquery.min.js',
	'/coderwall/coderwall.js',
	'/js/bootstrap.min.js',
	'/socket.io/socket.io.js',
	'/js/bit.io.min.js',
	'/js/main.min.js',
];

dev_scripts = [
	'/js/jquery.js',
	'/coderwall/coderwall.js',
	'/js/bootstrap.js',
	'/socket.io/socket.io.js',
	'/js/bit.io.js',
	'/js/main.js',
];

prod_css = [
	'/css/bootstrap.min.css',
	'/css/qbit.io.min.css',
];

dev_css = [
	'/css/bootstrap.css',
	'/css/qbit.io.css',
	'/coderwall/coderwall.css'
];

fs.stat( db_file, function( err, stat ) {
	if ( stat.size === 0 ) {
		db.serialize( function() {
			db.run( 'create table categories ( id integer primary key autoincrement, name text )' );
			db.run( 'create table blog( id integer primary key autoincrement, title text, date timestamp, body text, categoryid integer )' );

			console.log( "database created.." );
		});
	}
});

db.each( 'select * from blog join categories on ( categories.id = categoryid )', function( err, row ) {
	blog.push( row );
});

function stringify( type, list ) {
	var i, l, str = '';
	for ( i = 0, l = list.length; i < l; i++ ) {
		var line = list[i];
		if ( type === 'css' ) {
			str = str + '<link rel="stylesheet" href="' + line + '" type="text/css"/>\n';
		}

		if ( type === 'js' ) {
			str = str + '<script type="text/javascript" src="' + line + '"></script>\n';
		}
	}

	return str;
}

var cw = new coderwall( {
	user: 'qbit',
	orientation: 'horizontal',
	images: __dirname + '/public/images',
	url: '/coderwall/'
});

cw.get();

cw.connect( app );

// Configuration
app.configure( 'development', function(){
  app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ));

  io.configure( 'development', function() {
	  io.set( 'transports', ['websocket'] );
  });

  scripts = stringify( 'js', dev_scripts );
  styles  = stringify( 'css', dev_css );
});

app.configure( 'production', function(){
  app.use( express.errorHandler() );

  io.configure( 'production', function() {
	  io.enable( 'browser client etag' );
	  io.set( 'log level', 1 );

	  io.set( 'transports', [
		 'websocket',
		 'flashsocket',
		 'htmlfile',
		 'xhr-polling',
		 'jsonp-polling'
	  ]);
  });

  scripts = stringify( 'js', dev_scripts );
  styles  = stringify( 'css', dev_css );
});

app.configure( function(){
  app.set( 'views', __dirname + '/views' );
  app.set( 'view engine', 'ejs' );
  app.use( express.bodyParser() );
  app.use( express.methodOverride() );
  app.use( express.cookieParser() );
  app.use( express.session( { secret: 'ohlol', store: new RedisStore } ));
  // app.use( express.session( { secret: 'ohlol' } ) );
  app.use( express.static( __dirname + '/public' ) );
});

width = 800;
height = 600;

function rand( max ) {
	return Math.ceil( Math.random() * max );
}

io.sockets.on( 'connection', function( socket ) {

	sprites[ socket.id ] = {
		x: rand( width ),
		y: rand( height ),
		id: socket.id 
	};

	socket.emit( 'my sprite', sprites[ socket.id ] );

	var s;
	for ( s in sprites ) {
		if ( sprites.hasOwnProperty( s ) ) {
			io.sockets.emit( 'other sprite', sprites[ s ] );
		}
	}

	socket.on( 'move sprite', function( data ) {
		sprites[ socket.id ] = data;
		io.sockets.emit( 'move', data );
	});

	socket.on( 'disconnect', function() {
		io.sockets.emit( 'rm sprite', socket.id );
		delete sprites[ socket.id ];
	});
});

var date = new Date();

app.get( '/', function( req, res ) {
	res.render( 'index', { 
		title: 'qbit.io', 
		year: date.getFullYear(),
		blog: blog,
		styles: styles, 
		scripts: scripts, 
		coderwall: cw.coderwall_element,
		width: width, 
		height: height 
	} );
});

app.listen( 3000 );
console.log( "Express server listening on port %d in %s mode", app.address().port, app.settings.env );
