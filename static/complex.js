function Complex(real, imaginary) {
    this.re = real;
    this.im = imaginary;
    this.mag = Math.sqrt(this.re*this.re+this.im*this.im);
	this.phi = Math.atan2(this.re, this.im);
};

Complex.prototype.val = function(idx){
	switch(idx){
		case 0: return this.mag
		case 1: return this.phi
		case 2: return this.re
		case 3: return this.im
	}
}

Complex.add = function (a, b) {
    return new Complex(a.re + b.re, a.im + b.im);
};

Complex.subtract = function (a, b) {
    return new Complex(a.re - b.re, a.im - b.im);
};

Complex.multiply = function(a, b) {
    return new Complex(a.re * b.re - a.im * b.im,
                       a.re * b.im + a.im * b.re);
};

Complex.zero = new Complex(0,0);
Complex.one = new Complex(1,0);
Complex.i = new Complex(0,1);
