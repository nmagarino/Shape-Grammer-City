import {mat4, vec4, vec3, mat3} from 'gl-matrix';

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality

export class Turtle {

    position: vec3;
    direction: vec3;
    depth: number;
    angleX: number;
    angleZ: number;
    scale: number;
    

    constructor(depth: number) {
        this.position = vec3.fromValues(0.0,0.0,0.0);
        this.direction = vec3.fromValues(0.0,1.0,0.0);
        this.depth = 0.0;
        this.angleX = 0.0;
        this.angleZ = 0.0;
        this.scale = 1.0;
    }

    state() {
        let stateMat : mat4 = mat4.create();
        stateMat = mat4.scale(stateMat, stateMat, vec3.fromValues(.2, .2, .2));
        let transMat : mat4 = mat4.create();
        transMat = mat4.fromTranslation(transMat, this.position);
        let rotXMat : mat4 = mat4.create();
        rotXMat = mat4.fromXRotation(rotXMat, this.angleX);
        let rotZMat : mat4 = mat4.create();
        rotXMat = mat4.fromXRotation(rotZMat, this.angleZ);
        stateMat = mat4.multiply(stateMat, rotXMat, rotZMat);
        stateMat = mat4.multiply(stateMat, transMat, stateMat);
        
        return stateMat;
    }

    rotateTurtle(angle : number, dir: number) {
        switch(dir) {
            case 0: {
                this.angleX = angle;
                this.direction = vec3.rotateX(this.direction, this.direction, vec3.create(), angle);
                this.direction = vec3.normalize(this.direction, this.direction);
                break;
            }
            case 1: {
                this.direction = vec3.rotateY(this.direction, this.direction, vec3.create(), angle);
                this.direction = vec3.normalize(this.direction, this.direction);
                break;
            }
            case 2: {
                this.angleZ = angle;
                this.direction = vec3.rotateZ(this.direction, this.direction, vec3.create(), angle);
                this.direction = vec3.normalize(this.direction, this.direction);
                
                break;
            }
        }
    }

    translateForwardTurtle() {
        this.scale = this.scale / 1.0

        this.position = vec3.add(this.position, this.position, vec3.scale(this.direction, this.direction, 3.0 * this.scale));
        this.direction = vec3.scale(this.direction, this.direction, 1.0/(3.0 * this.scale));

    }

    scaleTurtle(amt: number) {
    }

    copyTurtle(otherTurt : Turtle) {
        otherTurt.depth = this.depth;
        otherTurt.position = vec3.fromValues(this.position[0],this.position[1],this.position[2]);
        otherTurt.direction = vec3.fromValues(this.direction[0],this.direction[1],this.direction[2])
    }
}

    