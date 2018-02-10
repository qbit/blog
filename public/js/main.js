var socket = io.connect( ),
canv, ctx, me, sprites = {},
inc = 5, puller, game;

var right = {
	76: true,
	68: true,
	39: true
};

var left = {
	72: true,
	65: true,
	37: true
};

var up = {
	75: true,
	87: true,
	38: true
};

var down = {
	74: true,
	83: true,
	40: true
};

function pd( e ) {
	if ( e.preventDefault ) {
		e.preventDefault();
	}
	e.returnValue = false;
}

function move( e ) {

	var me = sprites[ 'me' ];

	if ( up[ e.keyCode ] ) {
		// UP
		if ( me.y -inc > 0 ) {
			me.moveY( -inc );
		}

		pd( e );
	}

	if ( down[ e.keyCode ] ) {
		// DOWN
		if ( me.y < canv.height() ) {
			me.moveY( inc );
		}

		pd( e );
	}

	if ( left[ e.keyCode ] ) {
		// LEFT
		if ( me.x - inc > 0 ) {
			me.moveX( -inc );
		}

		pd( e );
	}

	if ( right[ e.keyCode] ) {
		// RIGHT
		if ( me.x + inc < canv.width() ) {
			me.moveX( inc );
		}

		pd( e );
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
	puller = $( '#puller' );
	game = $( '#game' );

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
		if ( data && data.id !== sprites[ 'me' ].id ) {
			sprites[ data.id ] = new Bit( data );
		}
	});

	socket.on( 'move', function( data ) {
		$.extend( sprites[ data.id ], data );
	});

	socket.on( 'rm sprite', function( id ) {
		delete sprites[ id ];
	});

	setInterval( draw_sprites, 1 );

	$( '.navbutton' ).each( function( idx, ele ) {
		a = $( ele );

		a.click( function() {
			var t = $( this );

			var showid = t.attr( 'id' ).replace( /-toggle/, '' );

			$( '.navbutton' ).each( function() {
				$( this ).parent().removeClass( 'active' );
			});

			$( '.page-content' ).each( function() {
				$( this ).addClass( 'hidden' );
			});

			t.parent().addClass( 'active' );
			$( '#' + showid ).removeClass( 'hidden' );
		});
	});

});

