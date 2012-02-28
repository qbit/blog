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

	switch( e.keyCode ) {
		case 38:	// up
		case 75:	// k
		case 87: 	// w
			if ( me.y -inc > 0 ) {
				me.moveY( -inc );		
			}
			if(e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
			break;

		case 40:	// down
		case 74:	// j
		case 83:	// s
			if ( me.y < canv.height() ) {
				me.moveY( inc );
			}
			if(e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
			break;

		case 37:	// left
		case 72:	// h
		case 65:	// a
			if ( me.x - inc > 0 ) {
				me.moveX( -inc );
			}
			if(e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
			break;

		case 39:	// right
		case 76:	// l
		case 68:	// d
			if ( me.x + inc < canv.width() ) {
				me.moveX( inc );
			}
			if(e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
			break;
	}	// switch(e.keyCode)
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
