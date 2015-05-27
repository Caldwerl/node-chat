'use strict';

//Function to create a random hex color value for user names
module.exports = function () {

  var hue = Math.random();
  var goldRatio = 0.618033988749895;
  var red, green, blue = 255;
  var h_i = Math.floor(hue * 6);
  var sat = 0.5;
  var val = 0.95;
  var f = hue * 6 - h_i;
  var p = val * (1 - sat);
  var q = val * (1 - f * sat);
  var t = val * (1 - (1 - f) * sat);

  //Use golden ratio to get even spread of colors
  hue += goldRatio;
  hue %= 1;

  switch (h_i) {

    case 0:
      red = val;
      green = t;
      blue = p;
      break;
    case 1:
      red = q;
      green = val;
      blue = p;
      break;
    case 2:
      red = p;
      green = val;
      blue = t;
      break;
    case 3:
      red = p;
      green = q;
      blue = val;
      break;
    case 4:
      red = t;
      green = p;
      blue = val;
      break;
    case 5:
      red = val;
      green = p;
      blue = q;
      break;
  }

  //Converts the values to hex
  red = Math.floor(red * 256).toString(16);
  green = Math.floor(green * 256).toString(16);
  blue = Math.floor(blue * 256).toString(16);

  return '#' + red + green + blue;
}
