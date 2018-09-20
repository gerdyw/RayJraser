let bground = new Colour("#00bfff");
let eye = new Vector(4, 6, -12);
let view = new Vector(0, 0, 0);
let SIGNIFICANT_DEPTH = 0.1;

let coords = lookAt(eye, view);
//let coords = {
//	u: new Vector(1, 0, 0),
//	v: new Vector(0, 1, 0).Normalise(),
//	n: new Vector(0, 0, 1).Normalise()
//}

let image, viewPlane;

let reflects = 10;
let AA = false;

let light = new Colour(0, 0, 0);
let redLight = light.red.Multiply(0.5);
let blueLight = light.blue.Multiply(0.5);

let edgeAA = false;

let lights = [
		new Light(new Vector(3, 4, 5), redLight, redLight, redLight),
		new Light(new Vector(-3, 4, 5), blueLight, blueLight, blueLight)
];

//        let u = new Vector(1, 0, 0);
//        let v = new Vector(0, 1, -1).Normalise();
//        let n = new Vector(0, 1, 1).Normalise();


//  scaling, translation, ambient, diffuse, specular, shininess, reflectivity, j, k, l

let fillColour;

function main() {
	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");
	
	fillColour = (c, r, colour) => {
		ctx.fillStyle = colour.Hex();
		ctx.fillRect(c, image.height - r, 1, 1);
	}
	
	$("#aa").on("change", () => {
		AA = $("#aa").prop("checked");
	});
	$("#object-type").change(() => {
		switch ($("#object-type").val()) {
			case "Plane":
				$(".object-field-cell").css("display", "none");
				$(".object-colour-cell").css("display", "table-cell");
				$(".object-plane-cell").css("display", "table-cell");
				$("#object-create-button").css("display", "table-cell");
				break;
			default:
				$(".object-field-cell").css("display", "none");
		}
	});
	
	let callback;
	if (AA) callback = (c, r) => generatePixelAA(c, r, fillColour);
	else callback = (c, r) => generatePixel(c, r, fillColour);
	
	$("#render-button").on("mousedown", () => {
		$("#render-status").text("Rendering...");
		$("#render-button").attr("disabled");
	}).on("mouseup", fireDrawer);
    $.getJSON("objects.json", (json) => {
    	objects = json.map(o => objectFactory(o));
//		fireDrawer();
    });
}

function fireDrawer() {
	
	image = (() => {
		let _width = Math.floor($("#canvas").width());
		return {
			width: _width,
			height: Math.floor(_width * 9/16)
		}
	})();
	
	viewPlane = {
		N: 1,
		W: image.width / image.height,
		H: 1
	}
	
	eye = new Vector(parseFloat($("#eye-x").val()),
					 parseFloat($("#eye-y").val()),
					 parseFloat($("#eye-z").val()));
	
	view = new Vector(parseFloat($("#view-x").val()),
					  parseFloat($("#view-y").val()),
					  parseFloat($("#view-z").val()));
	
	coords = lookAt(eye, view);
	
	bground = new Colour($("#background-colour").val());
	lights[0].ambient = bground.Multiply(0.2);
	
	$("#canvas").attr("width", image.width);
	$("#canvas").attr("height", image.height);
	
	if ($("#aa").prop("checked")) callback = (c, r) => generatePixelAA(c, r, fillColour);
	else callback = (c, r) => generatePixel(c, r, fillColour);

    drawImage(callback, time);
}

function drawImageEdgeAA(callback) {
	console.log("starting draw");
	
	let depths = edgeAA ? measureDepths() : null;
	let queue = new CircularQueue(9);

    for (let r = 0; r < image.height; r++) {
        for (let c = 0; c < image.width; c++) {
			if (!edgeAA) {
				callback(c, r);
				continue;
			}
			if (c == 1) {
				queue.clear()
				for (let i = 0; i < 9; i++) queue.push(depths.get((i % 3) - 1 + c, Math.floor(i / 3) - 1) + r);
			} else if ((r != 0) && (r != image.height - 1) && (c > 1) && (c != image.width - 1)) {
				queue.push(depths.get(c + 1, r - 1));
				queue.push(depths.get(c + 1, r));
				queue.push(depths.get(c + 1, r + 1));
				let max = queue.max;
				let min = queue.min;
				if (Math.abs(depths.get(c, r) - max) > SIGNIFICANT_DEPTH || Math.abs(depths.get(c, r) - min) > SIGNIFICANT_DEPTH) generatePixelAA()
			}
        }
    }
	let finished = new Date();
	$("#render-status").text(`${finished - time}ms`);
	$("#render-button").removeAttr("disabled");
}

function generatePixelEdgeAA(c, r, hit, dir, callback) {
	if (hit == null) {
		let colour = bground;
	} else {
		let colour = Phong(hit.obj, eye, d, hit.t, objects, reflects, -1);
	}
	callback(c, r, colour);
}

function measureDepths() {
	let depths = new Matrix(image.width, image.height);
	for (let r = 0; r < image.height, r++) {
		for (let c = 0; c < image.width; c++) {
			let d = getRay(c, r);
			let hit = intersect(eye, d, -1);
			depths.set(c, r, (hit ? hit.t : Infinity));
		}
	}
	return depths;
}

function getRay(c, r) {
	let vecU = coords.u.Scale(viewPlane.W * ((2 * c) / (image.width  - 1) - 1));
	let vecV = coords.v.Scale(viewPlane.H * ((2 * r) / (image.height - 1) - 1));
	let vecN = coords.n.Scale(-1 * viewPlane.N);
	return (vecN.Add(vecU).Add(vecV).Add(vecN)).Normalise();
}

function generatePixel(c, r, callback) {
	let d = getRay(c, r);
	let hit = intersect(eye, d, -1);
	if (hit == null) {
		let colour = bground;
	} else {
		let colour = Phong(hit.obj, eye, d, hit.t, reflects, -1);
	}
	callback(c, r, colour);
}

function generatePixelSync(d) {
	let hit = intersect(eye, d, -1);
	if (hit == null) {
		let colour = bground;
	} else {
		let colour = Phong(hit.obj, eye, d, hit.t, reflects, -1);
	}
	return colour;
}

function generatePixelAA(c, r, callback) {
	let d = getRay(c, r);
	callback(c, r, findMean([
		generatePixelSync(getRay(c - 1/4, r - 1/4)),
		generatePixelSync(getRay(c - 1/4, r + 1/4)),
		generatePixelSync(getRay(c + 1/4, r - 1/4)),
		generatePixelSync(getRay(c + 1/4, r + 1/4))
	]));
}

function findMean(cluster) {
	let r = cluster.map(c => c.r).reduce((a, c) => a + c) / cluster.length;
	let g = cluster.map(c => c.g).reduce((a, c) => a + c) / cluster.length;
	let b = cluster.map(c => c.b).reduce((a, c) => a + c) / cluster.length;
	return new Colour(r, g, b);
}

function findMedian(cluster) {
	let r = cluster.map(c => c.r);
	let g = cluster.map(c => c.g);
	let b = cluster.map(c => c.b);
	
}

function intersect(source, d, index) {
    let hit = objects.filter((o, i) => i != index).reduce((acc, cur) => {
        let _t = cur.Intersect(source, d);
        if (_t > 0 && (acc.obj == null || _t < acc.t)) {
            return {t: _t, obj: cur};
        } else return acc;
    }, {t: -1, obj: null});
    if (hit.obj == null) return null;
    else return hit;
}

function Phong(obj, source, dir, t, bounce, thisIndex) {
    let kl = 0.05;
    let kc = 0.1;
    let colour = new Colour(0, 0, 0);
	let point = source.Add(dir.Scale(t));
	let normal = obj.Normal(point).Normalise();
	
	for (let light of lights) {
		let ambient = light.ambient.Multiply(obj.ambient);
		colour = colour.Add(ambient);

		if (inShadow(light, point, obj)) continue;

		let lDist = light.position.Subtract(point).len;
		let rLightVector = light.position.Subtract(point).Normalise();

		if (rLightVector.Dot(normal) < 0) continue;

		let _diffuse = light.diffuse.Multiply(obj.diffuse);
		let _lambert = normal.Dot(rLightVector);
		_diffuse = _diffuse.Multiply(_lambert);
		_diffuse = _diffuse.Multiply(1 / (kl * lDist + kc));

		colour = colour.Add(_diffuse);

		let _specular = light.specular.Multiply(obj.specular);
		let h = rLightVector.Add(dir.Scale(-1)).Normalise();
		let _specModifier = h.Dot(normal);
		_specModifier = Math.pow(_specModifier, obj.shininess);
		_specular = _specular.Multiply(_specModifier);
		_specular = _specular.Multiply(1 / (kl * lDist + kc));

		colour = colour.Add(_specular);
	}
	
    let reflected = dir.Subtract(normal.Scale(normal.Dot(dir) * 2));

    thisIndex = objects.indexOf(obj);

    let hit = intersect(point, reflected, thisIndex);

    if (obj.reflectivity != null && obj.reflectivity != 0 && bounce >= 0) {
        if (hit != null) {
			colour = colour.Add(Phong(hit.obj, point, reflected, bounce - 1, thisIndex));
		}
		
    }

    return colour;
}

function inShadow(light, hit, object) {
    let i = objects.indexOf(object);
    let _lVec = light.position.Subtract(hit);
    let isHit = intersect(hit, _lVec, i);
    if (isHit != null && isHit.t < 1 && isHit.t > 0) return true;
    else return false;
}

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

function objectFactory(json) {
	{
		switch (json.type) {
			case "Plane":
				return new Plane(
					new Colour(json.colour.ambient),
					new Colour(json.colour.diffuse),
					new Colour(json.colour.specular),
					json.colour.shininess,
					json.colour.reflectivity,
					new Vector(json.normal),
					json.distance
				);
			case "Triangle":
				return new Triangle(
					new Colour(json.colour.ambient),
					new Colour(json.colour.diffuse),
					new Colour(json.colour.specular),
					json.colour.shininess,
					json.colour.reflectivity,
					json.vertices
				);
			case "Sphere":
				return new Sphere(
					new Colour(json.colour.ambient),
					new Colour(json.colour.diffuse),
					new Colour(json.colour.specular),
					json.colour.shininess,
					json.colour.reflectivity,
					json.scale,
					new Vector(json.translate)
				);
		}
//	} catch (e) {
//		console.log(json, "failed")
//		return null;
	}
}

$(document).ready(main);
