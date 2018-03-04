import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

export class Plane extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  tempIndices: Array<number>;
  tempPositions: Array<number>;
  tempNormals: Array<number>;

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.tempIndices = [];
    this.tempNormals = [];
    this.tempPositions = [];
  }

  // Sets indices, positions, normals w/o pushing to VBOs
  setVals() {

  this.tempIndices = [0, 1, 2,
      0, 2, 3
     ];

  this.tempNormals = [
       0, 1, 0, 0,
       0, 1, 0, 0,
       0, 1, 0, 0,
       0, 1, 0, 0,
      ];

this.tempPositions = [

         10, 0, 10, 1,
         10, 0, -10, 1,
         -10, 0, -10, 1,
         -10, 0, 10, 1]

  }

  create() {

    
    // Like Square but with more faces!
    this.indices = new Uint32Array( [0, 1, 2,
      0, 2, 3
     ]);

  this.normals = new Float32Array([
       0, 1, 0, 0,
       0, 1, 0, 0,
       0, 1, 0, 0,
       0, 1, 0, 0,
      ]);

this.positions = new Float32Array([

         10, 0, 10, 1,
         10, 0, -10, 1,
         -10, 0, -10, 1,
         -10, 0, 10, 1]

);

    
    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created Plane`);
  }
};

export default Plane;
