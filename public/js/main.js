var socket = io.connect( ),
canv, ctx, me, sprites = {},
inc = 5;

function move( e ) {
	var me = sprites[ 'me' ];
	switch( e.keyCode ) {
		case 38:
			if ( me.y -inc > 0 ) {
				me.moveY( -inc );		
			}
			break;

		case 40:
			if ( me.y < canv.height() ) {
				me.moveY( inc );
			}
			break;

		case 37:
			if ( me.x - inc > 0 ) {
				me.moveX( -inc );
			}

			break;

		case 39: 
			if ( me.x + inc < canv.width() ) {
				me.moveX( inc );
			}
			break;
	}
}

function draw_sprites() {
	var s;

	ctx.clearRect( 0, 0, canv.width(), canv.height() );
	for ( s in sprites ) {
		if ( sprites.hasOwnProperty( s ) ) {

			var sprite = sprites[s];

			ctx.beginPath();
			ctx.arc( sprite.x, sprite.y, 10, 0, Math.PI*2, true );
			ctx.closePath();

			if ( sprite.color ) {
				ctx.fillStyle = sprite.color;
			} else {
				ctx.fillStyle = 'black';
			}

			ctx.fill();
		}
	}
}

$( 'document' ).ready( function() {

	window.addEventListener( 'keydown', move, true );

	canv = $( '#canvas' );

	ctx = canv.get(0).getContext("2d");

	socket.on( 'my sprite', function( data ) {
		sprites[ 'me' ] = new Bit({
			color: 'orange',
			x: data.x,
			y: data.y,
			id: data.id
		});
	});

	socket.on( 'other sprite', function( data ) {
		if ( data.id !== sprites[ 'me' ].id ) {
			sprites[ data.id ] = new Bit( data );
		}
	});

	socket.on( 'move', function( data ) {
		$.extend( sprites[ data.id ], data );
	});

	socket.on( 'rm sprite', function( id ) {
		delete sprites[ id ];
	});

	setInterval( draw_sprites, 100 );
});
