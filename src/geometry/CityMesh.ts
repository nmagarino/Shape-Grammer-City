import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import {LongCube} from '../geometry/LongCube'
import {Cube} from '../geometry/Cube';
import {Icosphere} from '../geometry/Icosphere';
import {Turtle} from '../geometry/Turtle';
import {Lsystem, LinkedList, Node, linkedListToString, Shape} from '../geometry/LSystem'

class LSystemMesh extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  tempIndices: Array<number>;
  tempPositions: Array<number>;
  tempNormals: Array<number>;

  countIdx : number = 0;
  iterations: number;
  axiom: string;

  constructor(center: vec3, iter: number, axiom: string) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.tempIndices = [];
    this.tempPositions = [];
    this.tempNormals = [];
    this.iterations = iter;
    this.axiom = axiom;

  }

  randPos() {
      // Intial empty set
      let initialShapeSet : Array<Shape> = [];
      // Add shapes at random positions
      for(let i : number = -20; i < 20; i += 10) {
          let xPos = (Math.random() * 5) + i;
          for(let j : number = -20; j < 20; j += 8) {
              let zPos = (Math.random() * 4) + j;
              let shape: Shape;
              let rand = Math.random();
              // More cubes than rectangle towers
              if(rand < .7) {
                shape = new Shape('C', new Cube(vec3.create()), vec3.fromValues(xPos, 1.0, zPos), vec3.create(), vec3.fromValues(1.5,1.9,1.5), false);
                initialShapeSet.push(shape);
              }
              else {
                shape = new Shape('L', new LongCube(vec3.create()), vec3.fromValues(xPos, 1.0, zPos), vec3.create(), vec3.fromValues(.8,1.5,.8), false);
                initialShapeSet.push(shape);
              }
          }
      }
      return initialShapeSet;
  }

  doIterations() {

      // Use l-system to iterate over shapes
      let elSistema : Lsystem = new Lsystem('X', this.iterations, this.randPos());
      let newShapeSet : Array<Shape> = elSistema.parseShapes();
      console.log(newShapeSet);

      // Render every shape in the set -- by adding them to the overall VBO.
      for(let i : number = 0; i < newShapeSet.length; i++) {
          // If an entry isn't null, render the shape
          if(newShapeSet[i] != null) {
              let currShape : Shape = newShapeSet[i];
              let currGeo : Drawable = currShape.geometry;
              currGeo.setVals();
              let newIndices : Array<number> = currGeo.tempIndices;
              let newPositions : Array<number> = currGeo.tempPositions;
              let newNormals : Array<number> = currGeo.tempNormals;

              //console.log('Size of index buffer: ' + newIndices.length);
              //console.log('Actual indices: ' + newIndices);

              for(let i : number = 0; i < newIndices.length; ++i) {
                newIndices[i] = newIndices[i] + (newIndices.length * (2/3) * this.count);
              }
              this.count++;

              let start = 0;
              for(let i : number = 0; i < (newPositions.length / 4); ++i) {
                let val1 : number = newPositions[start];
                let val2 : number = newPositions[start + 1];
                let val3 : number = newPositions[start + 2];
                let val4 : number = newPositions[start + 3];
                let currPos : vec4 = vec4.fromValues(val1, val2, val3, val4);

                //console.log("old: " + currPos);

                let transfMat : mat4 = mat4.create();
                transfMat = mat4.fromTranslation(transfMat, currShape.pos);
                let rotateXMat : mat4 = mat4.create();
                rotateXMat = mat4.fromXRotation(rotateXMat, currShape.rot[0]);
                let rotateYMat : mat4 = mat4.create();
                rotateYMat = mat4.fromYRotation(rotateYMat, currShape.rot[1]);
                let rotateZMat : mat4 = mat4.create();
                rotateZMat = mat4.fromZRotation(rotateZMat, currShape.rot[2]);
                let scaleMat : mat4 = mat4.create();
                scaleMat = mat4.fromScaling(scaleMat, currShape.scale);

                let overallMat = mat4.create();
                overallMat = mat4.multiply(overallMat, transfMat, rotateXMat);
                overallMat = mat4.multiply(overallMat, overallMat, rotateYMat);
                overallMat = mat4.multiply(overallMat, overallMat, rotateZMat);
                overallMat = mat4.multiply(overallMat, overallMat, scaleMat);

                let newPos : vec4 = vec4.create();
                newPos = vec4.transformMat4(newPos, currPos, overallMat);


                newPositions[start] = newPos[0];
                newPositions[start + 1] = newPos[1];
                newPositions[start + 2] = newPos[2];
                newPositions[start + 3] = newPos[3];

                start = start + 4;
              }

              this.tempIndices = this.tempIndices.concat(newIndices);
              this.tempPositions = this.tempPositions.concat(newPositions);
              this.tempNormals = this.tempNormals.concat(newNormals);
          }
      }
  }


  setVals() {

  }

  create() {

    this.doIterations();

    

    this.indices = new Uint32Array(this.tempIndices);
    this.positions = new Float32Array(this.tempPositions);
    this.normals = new Float32Array(this.tempNormals);


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

    console.log(`Created L-system`);
  }
};

export default LSystemMesh;
