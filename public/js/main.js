var socket = io.connect( ),
canv, ctx, me, sprites = {},
inc = 5, puller, game;

function move( e ) {
	/*
		j       74                                                                                  
		s		83
		down    40                                                                                  
																									
		k       75                                                                                  
		w		87
		up      38                                                                                  
																									
		h       72                                                                                  
		a		65
		left    37                                                                                  
																									
		l       76                                                                                  
		d		68
		right   39
	*/

	var me = sprites[ 'me' ];

	if ( e.keyCode === 75 || e.keyCode === 38 || e.keyCode === 87 ) {
		// UP
		if ( me.y -inc > 0 ) {
			me.moveY( -inc );		
		}
		if(e.preventDefault)
			e.preventDefault();
		e.returnValue = false;
	}

	if ( e.keyCode === 74 || e.keyCode === 40 || e.keyCode === 83 ) {
		// DOWN
		if ( me.y < canv.height() ) {
			me.moveY( inc );
		}
		if(e.preventDefault)
			e.preventDefault();
		e.returnValue = false;
	}

	if ( e.keyCode === 72 || e.keyCode === 37 || e.keyCode === 65 ) {
		// LEFT
		if ( me.x - inc > 0 ) {
			me.moveX( -inc );
		}
		if(e.preventDefault)
			e.preventDefault();
		e.returnValue = false;
	}

	if ( e.keyCode === 76 || e.keyCode === 39 || e.keyCode === 68 ) {
		// RIGHT
		if ( me.x + inc < canv.width() ) {
			me.moveX( inc );
		}
		if(e.preventDefault)
			e.preventDefault();
		e.returnValue = false;
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

	setInterval( draw_sprites );

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
