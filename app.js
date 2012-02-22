var express = require( 'express' ), 
	app = module.exports = express.createServer(),
	sio = require( 'socket.io' ),
	io = sio.listen( app ),
	scripts = '', styles = '',
	prod_scripts, dev_scripts,
	prod_css, dev_css,
	width, height,
	sprites = {},
	sprite_count = 0;

// Configuration

app.configure( function(){
  app.set( 'views', __dirname + '/views' );
  app.set( 'view engine', 'ejs' );
  app.use( express.bodyParser() );
  app.use( express.methodOverride() );
  app.use( express.cookieParser() );
  app.use( express.session( { secret: 'ohlol' } ));
  app.use( express.static( __dirname + '/public' ));
});

width = 800;
height = 600;

function rand( max ) {
	return Math.ceil( Math.random() * max );
}

io.sockets.on( 'connection', function( socket ) {
	console.log( 'connected' );
	// on connect - create a new bit, and put it in the sprites obj
	// then send the sprites obj to all clients
	//
	// receive updated sprite from client, 
	// shove update into obj
	// pass obj to client
	// ;
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
		console.log( "removing sprite" );
		io.sockets.emit( 'rm sprite', socket.id );
		delete sprites[ socket.id ];
	});
});

prod_scripts = [
	'http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js',
	'/js/bootstrap.min.js',
	'/socket.io/socket.io.js',
	'/js/bit.io.min.js',
	'/js/main.min.js',
];

dev_scripts = [
	'http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.js',
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
];

function stringify( type, list ) {
	var i, l, str = '';
	for ( i = 0, l = list.length; i < l; i++ ) {
		var line = list[i];
		if ( type === 'css' ) {
			str = str + '<link rel="stylesheet" href="' + line + '" type="text/stylesheet"/>\n';
		}

		if ( type === 'js' ) {
			str = str + '<script type="text/javascript" src="' + line + '"></script>\n';
		}
	}

	return str;
}

app.configure( 'development', function(){
  app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ));

  scripts = stringify( 'js', dev_scripts );
  styles  = stringify( 'css', dev_css );
});

app.configure( 'production', function(){
  app.use( express.errorHandler() );

  scripts = stringify( 'js', dev_scripts );
  styles  = stringify( 'css', dev_css );
});

// Routes

app.get( '/', function( req, res ) {
	res.render( 'index', { 
		title: 'asdf', 
		styles: styles, 
		scripts: scripts, 
		width: width, 
		height: height 
	} );
});

app.listen( 3000 );
console.log( "Express server listening on port %d in %s mode", app.address().port, app.settings.env );
