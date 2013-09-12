//This file defines and implements the Image class

/**
* Constructor
*
* @param h The height of the image to create
* @param w The width of the image to create
* @param level A 2D array containing the definition for the current level
* @param blank True if the image should be made white, false if the level data should be used
**/
function Image(h, w, level, blank) {

	this.height = h; //height of image
	this.width = w;  //width of image

	//array of arrays of strings (representing the colors)
	this.pixels = [];

	//initialize the image to be either all white if blank
	//or base it off the given level
	for(var i = 0; i < this.width; i += 1) {
		this.pixels[i] = [];
		for(var j = 0; j < this.height; j += 1) {
			if(blank) {
				this.pixels[i][j] = "white";
			}
			else {
				this.pixels[i][j] = level[i][j];
			}
		}
	}
};

/**
* Checks if two images are the same
*
* @param other The image to compare
* @return a boolean, true if the images are identicle, false otherwise (or if the other isn't even an image)
**/
Image.prototype.equals = function(other) {

	var equal = true;

	if(this.height === other.height) {
		for(var x = 0; x < this.width; x += 1) {
			for(var y = 0; y < this.height; y += 1) {
				equal = equal && this.pixels[x][y] === other.pixels[x][y];
			}
		}
	}

	else {
		equal = false;
	}
	return equal;
};

/**
* Returns a set of rectangles to be drawn on the given paper
*
* @param currPaper the paper to draw the rectangles on
* @return A set of rectangles representing the image
*
* Note: Until more further testing, only try to draw images whose dementions
* evenly divide the dementions of the paper.
**/
Image.prototype.draw = function(currPaper) {

	//create a set to hold all the rectangles (pixels)
	var retVal = currPaper.set();

	//calculate the width and height of each rectangle
	//based on the image and paper dementions
	var pixWidth = Math.floor(currPaper.width/this.width);
	var pixHeight = Math.floor(currPaper.height/this.height);

	//populate the set with rectangles
	for(var x = 0; x < this.width; x += 1) {
		for(var y = 0; y < this.height; y += 1) {
			retVal.push(addPixel(x, pixWidth, y, pixHeight, this.pixels[x][y], currPaper));
		}
	}

	//create a boder
	retVal.push(currPaper.rect(0, 0, currPaper.width, currPaper.height).attr(
				               {"fill": "", "stroke": "black", "stroke-width": 5}));

	
	return retVal;
};

/**
* Sets the given pixel to the given color
*
* @param x The x coordinate of the pixel
* @param y The y coordinate of the pixel
* @param color A string representing a color to set the pixel to
**/
Image.prototype.setPixel = function(x, y, color) {
	this.pixels[x][y] = color;
};

/**
* Fills the given row with the given color
*
* @param y The y coordinate of the row
* @param color A string representing a color to fill the row with
**/
Image.prototype.fillRow = function(y, color) {
	for(var x = 0; x < this.width; x += 1) {
		this.pixels[x][y] = color;
	}
};

/**
* Fills the given column with the given color
*
* @param x The x coordinate of the column
* @param color A string representing a color to fill the column with
**/
Image.prototype.fillColumn = function(x, color) {
	for(var y = 0; y < this.height; y += 1) {
		this.pixels[x][y] = color;
	}
};

/**
* Fills the entire image with the given color
*
* @param color The color to fill the image with
**/
Image.prototype.fillImage = function(color) {
	for(var x = 0; x < this.width; x += 1) {
		this.fillColumn(x, color);
	}
};

/**
* Creates a rectangle to represent a pixel
*
* Adds mouseover and mouseout functionality to every pixel
**/
var addPixel = function(x, pw, y, ph, color, currPaper) {
	var onMouseOver = function() {
		$("#pixelInfo").empty().append(currPaper.identity + ": (" + x + ", " + y + ")= \"" + color + "\"");
	};
	var onMouseOut = function() {
		$("#pixelInfo").empty().append("Mouse over a pixel to see its coordinates and color.");
	};
	return currPaper.rect(pw * x, ph * y, pw, ph).attr(
				   {fill: color}).mouseover(onMouseOver).mouseout(onMouseOut);
};