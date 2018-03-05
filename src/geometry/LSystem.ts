import Drawable from "../rendering/gl/Drawable";
import { vec3, vec4 } from 'gl-matrix';
import LongCube from "../geometry/LongCube";
import Cube from "../geometry/Cube";
import Icosphere from "../geometry/Icosphere";



// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
class Rule {
    probability: number; // The probability that this Rule will be used when replacing a character in the grammar string
    successorString: string; // The string that will replace the char that maps to this Rule

    // :3c
    constructor(prob: number, succ: string) {
        this.probability = prob;
        this.successorString = succ;
    }
}

export class Shape {
    // Represents the type of Shape
    sym: string;
    geometry: Drawable;

    pos: vec3;   // World space
    rot: vec3;   // Probably won't use much
    scale: vec3;
    terminal: boolean; // Says if shape won't be iterated on

    constructor(sym: string, geometry: Drawable, pos: vec3, rot: vec3, scale: vec3, term: boolean) {
        this.sym = sym;
        this.geometry = geometry;
        this.pos = pos;
        this.rot = rot;
        this.scale = scale;
        this.terminal = term;
    }
}



export class Node {
    sym: string;
    prev: Node;
    next: Node;

    constructor(prev: Node, next: Node, sym: string) {
        this.prev = prev;
        this.next = next;
        this.sym = sym;
    }
}

export class LinkedList {
    head: Node;
    tail: Node;

    constructor(head: Node, tail: Node) {
        this.head = head;
        this.tail = tail;
    }
}

// Given the node to be replaced, 
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList: LinkedList, node: Node, replacementString: string) {
    // New string as a linked list
    var subLinkedList = stringToLinkedList(replacementString);

    // Singleton
    if (linkedList.head == linkedList.tail) {
        linkedList.head = subLinkedList.head;
    }
    else {
        var curr = linkedList.head;
        // while not linked list still has entries
        while (curr) {
            // if curr is the node to be replaced 
            if (curr == node) {
                if (curr != linkedList.head) {
                    // prev now points to new linked list
                    curr.prev.next = subLinkedList.head;
                }
                // link new linked list to point back to curr's prev
                subLinkedList.head.prev = curr.prev;
                // if curr's next exists, link it to new linked list
                if (curr.next) {
                    subLinkedList.tail.next = curr.next;
                }
            }
            // move onto next element
            curr = curr.next;
        }
    }
}

// Turn the string into linked list 
export function stringToLinkedList(input_string: string) {
    // ex. assuming input_string = "F+X"
    // you should return a linked list where the head is 
    // at Node('F') and the tail is at Node('X')

    let head: Node = new Node(null, null, input_string.charAt(0));
    let prev: Node = head;
    let tail: Node = head;
    for (var i = 1; i < input_string.length; ++i) {
        let newNode: Node = new Node(prev, null, input_string.charAt(i));
        tail = newNode;
        prev.next = newNode;
        prev = newNode;
    }
    let ll: LinkedList = new LinkedList(head, tail);
    return ll;
}

// Return a string form of the LinkedList
export function linkedListToString(linkedList: LinkedList) {
    // ex. Node1("F")->Node2("X") should be "FX"
    var result = "";
    var curr = linkedList.head;
    while (curr) {
        result += curr.sym;
        curr = curr.next;
    }
    return result;
}

export class Lsystem {
    // default LSystem
    axiom: string;
    iterations: number;
    grammar: Map<string, Rule>; 

    shapeSet: Array<Shape> = [];

    constructor(axiom: string, iterations: number, initialSet: Array<Shape>) {
        this.axiom = axiom;
        this.iterations = iterations;
        this.grammar = new Map<string, Rule>();
        this.grammar.set('X', new Rule(1.0, 'FFF[+FXF>F+F]FX[-FFX-FX<]X[+F>XFFF+]X>XF'));
        this.grammar.set('F', new Rule(1.0, 'FF'));
        this.shapeSet = initialSet;
    }

    parseShapes() {
        for (let i: number = 0; i < this.iterations; ++i) {
            let origSet: Array<Shape> = this.shapeSet;
            for (let j: number = 0; j < origSet.length; ++j) {
                let currShape: Shape = origSet[j];
                if (currShape == null) {
                    continue;
                }
                // If not a terminal shape
                if (true) {
                    // Apply rule
                    let succShapes: Array<Shape> = [];
                    succShapes = this.applyRules(currShape);
                    // Remove original
                    this.shapeSet[j] = null;
                    // Add new shapes
                    this.shapeSet = this.shapeSet.concat(succShapes);

                }
            }
        }

        //console.log('RETURNED SHAPESET' + this.shapeSet);
        return this.shapeSet;
    }

    applyRules(oldShape: Shape) {
        let tempShapes: Array<Shape> = [];
        let rand: number = Math.random();

        let zeroVec: vec3 = vec3.create();
        switch (oldShape.sym) {
            case 'L': {
                // Only one rule to do - ball on top of tall cube
                let newPos: vec3 = vec3.fromValues(oldShape.pos[0], oldShape.pos[1], oldShape.pos[2]);
                newPos[1] *= 1.5;
                let newScale: vec3 = vec3.fromValues(oldShape.scale[0], oldShape.scale[1], oldShape.scale[2]);
                newScale[0] /= 1.8;
                newScale[1] /= 1.8;
                newScale[2] /= 1.8;
                tempShapes.push(new Shape('L', oldShape.geometry, oldShape.pos, oldShape.rot, oldShape.scale, oldShape.terminal));
                tempShapes.push(new Shape('C', new Cube(zeroVec), newPos, oldShape.rot, newScale, false));
                break;
            }
            case 'C': {
                // Do first rule - one cube on top
                if (rand < .33) {
                    let newPos: vec3 = vec3.fromValues(oldShape.pos[0], oldShape.pos[1], oldShape.pos[2]);
                    newPos[1] *= 1.6;
                    let newScale: vec3 = vec3.fromValues(oldShape.scale[0], oldShape.scale[1], oldShape.scale[2]);
                    newScale[0] /= 1.8;
                    newScale[1] /= 1.8;
                    newScale[2] /= 1.8;
                    tempShapes.push(new Shape('C', oldShape.geometry, oldShape.pos, oldShape.rot, oldShape.scale, oldShape.terminal));
                    tempShapes.push(new Shape('C', oldShape.geometry, newPos, oldShape.rot, newScale, false));

                }
                // Do other -- 2 cubes on side
                else if (rand < .66) {
                    let newPos1: vec3 = vec3.fromValues(oldShape.pos[0], oldShape.pos[1], oldShape.pos[2]);
                    let newPos2: vec3 = vec3.fromValues(oldShape.pos[0], oldShape.pos[1], oldShape.pos[2]);
                    let newPos3: vec3 = vec3.fromValues(oldShape.pos[0], oldShape.pos[1], oldShape.pos[2]);

                    newPos1[0] *= 1.7;

                    newPos2[0] *= -1.7;

                    newPos1[1] /= 1.8;
                    newPos2[1] /= 1.8;

                    let newScale: vec3 = vec3.fromValues(oldShape.scale[0], oldShape.scale[1], oldShape.scale[2]);

                    let rand2: number = Math.random();
                    if (rand2 < 5) {
                        newScale[0] /= 1.8;
                        newScale[1] /= 1.8;
                        newScale[2] /= 1.8;
                    }
                    else {
                        newScale[0] *= 1.2;
                        newScale[1] *= 1.2;
                        newScale[2] *= 1.2;

                    }

                    // Also make a sort of stick on top of the building (no floating cubes!)
                    let longPos : vec3 = vec3.fromValues(oldShape.pos[0], oldShape.pos[1], oldShape.pos[2]);
                    longPos[1] *= 1.5; 
                    let longScale: vec3 = vec3.fromValues(oldShape.scale[0], oldShape.scale[1], oldShape.scale[2]);
                    longScale[0] /= 11.0;
                    longScale[1] *= 5.0;
                    longScale[2] /= 11.0;



                    tempShapes.push(new Shape('C', oldShape.geometry, newPos1, oldShape.rot, newScale, oldShape.terminal));
                    tempShapes.push(new Shape('C', oldShape.geometry, newPos2, oldShape.rot, newScale, oldShape.terminal));
                    tempShapes.push(new Shape('C', oldShape.geometry, newPos3, oldShape.rot, oldShape.scale, oldShape.terminal));
                    tempShapes.push(new Shape('L', oldShape.geometry, longPos, oldShape.rot, longScale, oldShape.terminal));
                }
                else {
                    let newPos1: vec3 = vec3.fromValues(oldShape.pos[0], oldShape.pos[1], oldShape.pos[2]);
                    let newPos2: vec3 = vec3.fromValues(oldShape.pos[0], oldShape.pos[1], oldShape.pos[2]);
                    let newPos3: vec3 = vec3.fromValues(oldShape.pos[0], oldShape.pos[1], oldShape.pos[2]);

                    newPos1[2] *= 1.7;

                    newPos2[2] *= -1.7;

                    newPos1[1] /= 1.8;
                    newPos2[1] /= 1.8;

                    let newScale: vec3 = vec3.fromValues(oldShape.scale[0], oldShape.scale[1], oldShape.scale[2]);

                    let rand2: number = Math.random();

                    if (rand2 < .5) {
                        newScale[0] *= 1.2;
                        newScale[1] *= 1.2;
                        newScale[2] *= 1.2;
                    }
                    else {
                        newScale[0] /= 1.8;
                        newScale[1] /= 1.8;
                        newScale[2] /= 1.8;

                    }


                    tempShapes.push(new Shape('C', oldShape.geometry, newPos1, oldShape.rot, newScale, oldShape.terminal));
                    tempShapes.push(new Shape('C', oldShape.geometry, newPos2, oldShape.rot, newScale, oldShape.terminal));
                    tempShapes.push(new Shape('C', oldShape.geometry, newPos3, oldShape.rot, oldShape.scale, oldShape.terminal));
                }
                break;
            }
            
        }

        //console.log("ADDED SHAPES: " + tempShapes);
        return tempShapes;
    }

    // This function returns a linked list that is the result 
    // of expanding the L-system's axiom n times.
    // The implementation we have provided you just returns a linked
    // list of the axiom.
    doIterations() {
        let orig: string = this.axiom;
        // Output linked list
        let lSystemLL: LinkedList;

        // If no iterations, just return axiom
        if (this.iterations == 0) {
            lSystemLL = stringToLinkedList(this.axiom);
        }
        else {
            // Directly edit linked list from axiom
            lSystemLL = stringToLinkedList(orig);

            // Expand string per number of iterations
            for (let i: number = 0; i < this.iterations; ++i) {
                let curr: Node = lSystemLL.head;

                // while the linked list has entries
                while (curr) {
                    // original next node of curr
                    let next: Node = curr.next;
                    // If the current node is in the grammar (can be replaced)
                    if (this.grammar.get(curr.sym)) {
                        // Access the replacement string for this character
                        let replacement: string = this.grammar.get(curr.sym).successorString;
                        // Replace the node in the linked list
                        replaceNode(lSystemLL, curr, replacement);

                        // move onto the next unedited character
                        curr = next;
                    }
                    else {
                        // move onto the next character
                        curr = next;
                    }
                }
            }
        }

        return lSystemLL;
    }
}