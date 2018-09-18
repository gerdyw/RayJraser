class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.len = Math.sqrt(x*x + y*y + z*z);
    }
    
    Normalise() {
        return new Vector(this.x/this.len,
                            this.y/this.len,
                            this.z/this.len);
    }
    
    Dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    
    Add(v) {
        return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    
    Subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    
    Scale(x, y, z) {
        if (y != undefined) return new Vector(this.x * x, this.y * y, this.z * z);
        else return new Vector(this.x * x, this.y * x, this.z * x);
    }
    
    Cross(v) {
        let x = this.y * v.z - this.z * v.y;
        let y = this.z * v.x - this.x * v.z;
        let z = this.x * v.y - this.y * v.x;
        return new Vector(x, y, z);
    }
    
    Reflect(n) {
        let p = n.Scale(2 * n.Dot(this));
        return this.Subtract(p);
    }
    
    toString() {
        return `[${this.x}, ${this.y}, ${this.z}]`;
    }
	
	get length() {
		return Math.sqrt((this.x * this.x + this.y * this.y + this.z * this.z));
	}
}

let eye = new Vector(0, 0, 1);
let point = new Vector(0, -1, 0);
console.log(eye instanceof Colour);


function lookAt(eye, point) {
	let n = eye.Subtract(point).Normalise();
	let u = new Vector(n.z, 0, -1 * n.x).Normalise();
	let v = n.Cross(u).Normalise();
	return {
		u: u,
		v: v,
		n: n
	}
}