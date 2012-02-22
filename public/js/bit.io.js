var Bit = function( opts ) {
	var self = this;

	self.canv = opts.canvas || 'canvas';

	// self.ctx = document.getElementById( self.canv ).getContext( '2d' );

	self.x = opts.x;
	self.y = opts.y;
	self.id = opts.id;

	self.color = opts.color || false;
};

Bit.prototype.move = function() {
	var self = this;

	socket.emit( 'move sprite', { id: self.id, x: self.x, y: self.y } );
};

Bit.prototype.moveX = function( inc ) {
	var self = this;

	self.x += inc;

	self.move();
};


Bit.prototype.moveY = function( inc ) {
	var self = this;
	
	self.y += inc;
	self.move();
};
