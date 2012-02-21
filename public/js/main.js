var socket = io.connect( ),
me, sprites = {};

socket.on( 'create', function( data ) {
	var id = data.id;
	var sprite = data.sprite;

	sprites[ id ] = new Bit( {
		canvas: 'canvas',
		x: sprite.x,
		y: sprite.y
	});

	// socket.emit( 'created', { x: sprite.x, y: sprite.y } ); 
});

socket.on( 'delete', function( id ) {
	delete sprites[ id ];
})

$( 'document' ).ready( function() {
	var canv = $( '#canvas' );
	me = new Bit( {
		canvas: 'canvas',
		x: Math.ceil( Math.random() * canv.width() ),
		y: Math.ceil( Math.random() * canv.height() ),
	});
});
