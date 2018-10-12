# RayJraser

An entirely in browser ray tracer, written in OOP/functionalish JavaScript. Currently implements the Phong illumination model with shadows and reflections (a bit buggy), however only renders triangles, planes, and a sphere at the origin. Object data is read in from a json file, lights are currently hardcoded but will get a similar treatment. Anti-aliasing is currently implemented by using four rays per pixel and averaging the results. Edge-detection anti-aliasing is currently WIP. Also a WIP is a GUI for adding objects to the scene on the page. View settings are functional, by entering a location from which to view the scene, and the coordinates of the point to be looked at, as well as the background colour. Bootstrap is used for the layout of the scene and the theme of the page.

## Getting Started

Simply download the package and open the HTML file, tested in Safari, Chrome and Firefox.

### Prerequisites

A browser supporting ECMAScript 2015, HTML5, and an internet connection.

## Built With

* [jQuery](http://www.jquery.com/) - DOM Manipulation
* [Bootstrap](https://www.getbootstrap.com/) - Styles, elements, and somewhat reactive UI

## Authors

* **Geordie Winlove** - *Initial work* - [gerdyw](https://github.com/gerdyw)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Computer Science 373 at the University of Auckland
