class Vector {
    constructor(x, y, z) {
		if (y != undefined) {
			this.x = x;
			this.y = y;
			this.z = z;
		} else {
			this.x = x[0];
			this.y = x[1];
			this.z = x[2];
		}
        this.len = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
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

class Colour {
    constructor(r, g, b) {
		if (typeof r == "string" && r.indexOf("#") == 0 && r.length == 7) {
			let chars = r.toLowerCase().split("");
			let nums = chars.map(c => parseInt(c, 16));
			this.r = (nums[1] * 16 + nums[2]) / 256;
			this.g = (nums[3] * 16 + nums[4]) / 256;
			this.b = (nums[5] * 16 + nums[6]) / 256;
		} else {
        this.r = r;
        this.g = g;
        this.b = b;
		}
    }
    
    Add(c) {
        return new Colour(this.r + c.r, this.g + c.g, this.b + c.b);
    }
    
    Multiply(c) {
        if (c.r == undefined) return new Colour(this.r * c,
                                                    this.g * c,
                                                    this.b * c);
        return new Colour(this.r * c.r,
                            this.g * c.g,
                            this.b * c.b);
    }
    
    toString() {
        return `r: ${this.r}, g: ${this.g}, b: ${this.b}`;
    }
	
	Hex() {
		let rHex = this.r < 1
					? Math.round(this.r * 255).toString(16)
					: "ff";
		let gHex = this.g < 1
					? Math.round(this.g * 255).toString(16)
					: "ff";
		let bHex = this.b < 1
					? Math.round(this.b * 255).toString(16)
					: "ff";
		
		return "#" + 
			(rHex.length < 2 ? "0" + rHex : rHex) +
			(gHex.length < 2 ? "0" + gHex : gHex) +
			(bHex.length < 2 ? "0" + bHex : bHex);
	}
	
	get red() {
		return new Colour(1, 0, 0);
	}
	
	get green() {
		return new Colour(0, 1, 0);
	}
	
	get blue() {
		return new Colour(0, 0, 1);
	}
}

class Light {
    constructor(position, ambient, diffuse, specular) {
        this.position = position;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}

class Hit {
    constructor(source, d, t, object) {
        this.source = source;
        this.d = d;
        this.t = t;
        this.object = object;
    }
    
    get HitPoint() {
        return this.CalcHitPoint();
    }
    
    CalcHitPoint() {
        return this.d.Scale(this.t).Add(this.source);
    }
}

class SceneObject {
    constructor(ambient, diffuse, specular, shininess, reflectivity) {
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
        this.reflectivity = reflectivity;
    }
}

class Plane extends SceneObject {
    constructor(ambient, diffuse, specular, shininess, reflectivity, n, a) {
        super(ambient, diffuse, specular, shininess, reflectivity);
        this.n = n;
        this.a = a;
    }
    
    Intersect(source, direction) {
        if (direction.Dot(this.n) == 0) return -1;
		if 
        return (this.a - source.Dot(this.n)) / (direction.Dot(this.n));
    }
    
    Normal(position) {
        return this.n;
    }
}

class Triangle extends Plane {
    constructor(ambient, diffuse, specular, shininess, reflectivity, vertices) {
		let j, k, l;
		if (typeof vertices[0].Multiply == "function") {
			j = vertices[0];
			k = vertices[1];
			l = vertices[2];
		} else {
			j = new Vector(vertices[0]);
			k = new Vector(vertices[1]);
			l = new Vector(vertices[2]);
		}
		
		let n = (k.Subtract(j)).Cross(l.Subtract(j)).Normalise();
		let a = n.Dot(j);
		super(ambient, diffuse, specular, shininess, reflectivity, n, a);
		this.j = j;
		this.k = k;
		this.l = l;
    }
    
    Intersect(source, direction) {
        let t = super.Intersect(source, direction);
        if (t > 0) { //if the ray intersects with the plane
			//tests if intersect falls inside triangle
            let p = source.Add(direction.Scale(t));
            let q = ((this.k.Subtract(this.j)).Cross(p.Subtract(this.j))).Dot(this.n);
            let r = ((this.l.Subtract(this.k)).Cross(p.Subtract(this.k))).Dot(this.n);
            let s = ((this.j.Subtract(this.l)).Cross(p.Subtract(this.l))).Dot(this.n);
            if ((q * r) > 0 && (r * s) > 0) {
                return t;
            } else return -1;
        } else return -1;
    }
    
    Normal(position) {
        return super.Normal(position);
    }
    
    toString() {
        return `J: ${this.j}
                K: ${this.k}
                L: ${this.l}`;
    }
}

class Sphere extends SceneObject {
    constructor(ambient, diffuse, specular, shininess, reflectivity, scale, translate) {
        super(ambient, diffuse, specular, shininess, reflectivity);
        self.scale = scale;
        self.translate = translate;
    }
    
    Intersect(source, direction) {
        let A = direction.Dot(direction);
        let B = 2 * source.Dot(direction);
        let C = source.Dot(source) - 1;
        
        let discrim = B * B - 4 * A * C;
        
        if (discrim <= 0) return -1;
        
        let t1 = (-1 * B + Math.sqrt(discrim)) / (2 * A); 
        let t2 = (-1 * B - Math.sqrt(discrim)) / (2 * A);
        
        return (t1 < t2) ? t1 : t2;
    }
    
    Normal(position) {
        return position;
    }
}

class PhongColour {
	constructor(ambient, diffuse, specular) {
		this.ambient = ambient;
		this.diffuse = diffuse;
		this.specular = specular;
	}
}

class CircularQueue {
	constructor(length) {
		this.array = new Array(length);
		this.i = 0;
	}
	
	push(value) {
		this.array[this.i] = value;
		this.i += 1;
	}
}