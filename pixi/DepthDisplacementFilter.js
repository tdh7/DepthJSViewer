/**
 *
 * The DepthDisplacementFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used offset the x and the g propery of the texture is used to offset the y.
 * @class DepthDisplacementFilter
 * @contructor
 * @param texture {Texture} The texture used for the displacemtent map * must be power of 2 texture at the moment
 */
'use strict';
PIXI.DepthDisplacementFilter = function(texture, sprite)
{

  // texture.baseTexture._powerOf2 = true;

const vertSrc = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

void main(void)
{
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;
   vTextureCoord = aTextureCoord;
}
`;

  var fragmentSrc = `
    precision mediump float;
    varying vec2 vTextureCoord;
    varying vec2 vFilterCoord;
    uniform sampler2D displacementMap;
    uniform sampler2D uSampler;
    uniform float scale;
    uniform vec2 offset;
    uniform vec4 dimensions;
    uniform vec2 mapDimensions;
    uniform float focus;

    void main(void) {
       float aspect = dimensions.x / dimensions.y;
       vec2 scale2 = vec2(scale * min(1.0, 1.0 / aspect), scale * min(1.0, aspect));
       vec2 mapCords = vTextureCoord;
       //mapCords.x *= -1.0;
       //mapCords.y += 1.0;
       float map = texture2D(displacementMap, mapCords).r;
       map = map * -1.0 + focus;
       vec2 disCords = vTextureCoord;
       disCords += offset * map * scale2;
       gl_FragColor = texture2D(uSampler, disCords);
    //    gl_FragColor = vec4(1,1,1,0.5);
    //    gl_FragColor *= texture2D(displacementMap, mapCords);
    }

  `;

   PIXI.Filter.call(
    this,
    vertSrc,
    fragmentSrc, // fragment shader
  );


  if(texture.baseTexture.hasLoaded)
  {
    this.uniforms.mapDimensions = [texture.width, texture.height];
  }
  else
  {
    this.uniforms.mapDimensions   = [1, 5112],
    this.boundLoadedFunction = this.onTextureLoaded.bind(this);

    texture.baseTexture.on('loaded', this.boundLoadedFunction);
  }



  this.uniforms.displacementMap = texture;
  this.uniforms.scale           = 0.015;
  this.uniforms.offset          = [0, 0];
  this.uniforms.focus           = 0.5;

  this.padding = 0;
  this.sprite = sprite;
  this.matrix = new PIXI.Matrix();

  this.apply = function(filterManager, input, output, clear)
  {
    this.uniforms.dimensions[0] = input.sourceFrame.width
    this.uniforms.dimensions[1] = input.sourceFrame.height
    this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.matrix, this.sprite);

    // draw the filter...
    filterManager.applyFilter(this, input, output, clear);
  }
};

PIXI.DepthDisplacementFilter.prototype = Object.create( PIXI.Filter.prototype );
PIXI.DepthDisplacementFilter.prototype.constructor = PIXI.DepthDisplacementFilter;

PIXI.DepthDisplacementFilter.prototype.onTextureLoaded = function()
{
  this.uniforms.mapDimensions = [this.uniforms.displacementMap.width, this.uniforms.displacementMap.height];


  this.uniforms.displacementMap.baseTexture.off('loaded', this.boundLoadedFunction);
};

/**
 * The texture used for the displacemtent map * must be power of 2 texture at the moment
 *
 * @property map
 * @type Texture
 */
Object.defineProperty(PIXI.DepthDisplacementFilter.prototype, 'map', {
  get: function() {
    return this.uniforms.displacementMap;
  },
  set: function(value) {
    this.uniforms.displacementMap = value;
  }
});

/**
 * The multiplier used to scale the displacement result from the map calculation.
 *
 * @property scale
 * @type Point
 */
Object.defineProperty(PIXI.DepthDisplacementFilter.prototype, 'scale', {
  get: function() {
    return this.uniforms.scale;
  },
  set: function(value) {
    this.uniforms.scale = value;
  }
});

/**
 * Focus point in paralax
 *
 * @property focus
 * @type float
 */
Object.defineProperty(PIXI.DepthDisplacementFilter.prototype, 'focus', {
  get: function() {
    return this.uniforms.focus;
  },
  set: function(value) {
    this.uniforms.focus = Math.min(1,Math.max(0,value));
  }
});

/**
 * The offset used to move the displacement map.
 *
 * @property offset
 * @type Point
 */
Object.defineProperty(PIXI.DepthDisplacementFilter.prototype, 'offset', {
  get: function() {
    return this.uniforms.offset;
  },
  set: function(value) {
    this.uniforms.offset = [value.x,value.y];
  }
});
