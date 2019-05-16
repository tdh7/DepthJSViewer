/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 *
 * The ColorMatrixFilter2 class lets you apply a 4x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. Its pretty powerful!
 * @class ColorMatrixFilter
 * @contructor
 */
PIXI.ColorMatrixFilter2 = function()
{
  'use strict';
  //PIXI.AbstractFilter.call( this );

  //this.passes = [this];

  // set the uniforms
  var uniforms = {};

  uniforms.matrix = {type: 'mat4', value: [1,0,0,0,
                                   0,1,0,0,
                                   0,0,1,0,
                                   0,0,0,1]};
  uniforms.shift= {type: '4fv', value:  [0.0,0.0,0.0,0.0]};

  var fragmentSrc = [
    'precision mediump float;',
    'varying vec2 vTextureCoord;',
    //'varying vec4 vColor;',
    //'uniform float invert;',
    'uniform vec4 filterArea;',
    'uniform mat4 matrix;',
    'uniform vec4 shift;',
    'uniform sampler2D uSampler;',

    'void main(void) {',
    //'   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;',
    '   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix + shift;',
    //'   gl_FragColor = vec4(1.0,0.0,1.0,1.0);',
    '}'
  ].join("\r\n");

   PIXI.Filter.call(
      this,
      null,
      fragmentSrc, // fragment shader
      uniforms
    );

};

PIXI.ColorMatrixFilter2.prototype = Object.create(PIXI.Filter.prototype);
PIXI.ColorMatrixFilter2.prototype.constructor = PIXI.ColorMatrixFilter2;

/**
 * Sets the matrix of the color matrix filter
 *
 * @property matrix
 * @type Array and array of 16 numbers
 * @default [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
 */
Object.defineProperty(PIXI.ColorMatrixFilter2.prototype, 'matrix', {
  get: function() {
    return this.uniforms.matrix;
  },
  set: function(value) {
    this.uniforms.matrix = value;
  }
});

/**
 * Sets the constant channel shift
 *
 * @property shift
 * @type Array and array of 26 numbers
 * @default [0,0,0,0]
 */
Object.defineProperty(PIXI.ColorMatrixFilter2.prototype, 'shift', {
  get: function() {
    return this.uniforms.shift;
  },
  set: function(value) {
    this.uniforms.shift = value;
  }
});
