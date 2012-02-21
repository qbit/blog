var Bit = function( opts ) {
	var self = this;

	self.ctx = document.getElementById( opts.canvas ).getContext( '2d' );

	self.x = opts.x;
	self.y = opts.y;

	self.interval = setInterval( function() {
		self.draw();
	}, 1000 );
}

Bit.prototype.up = function( e ) {
};

Bit.prototype.down = function( e ) {
};

Bit.prototype.get_pos = function() {
	var self = this;
	//gets the position of a bit
};

Bit.prototype.draw = function() {
	var self = this;

	self.ctx.beginPath();
	self.ctx.arc( self.x, self.y, 10, 0, Math.PI*2, true );
	self.ctx.closePath();
	self.ctx.fill();
};


