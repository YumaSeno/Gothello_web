'use strict';
import {Piece} from "./gothello.js";

export class DrawablePiece extends Piece{
    element = null;

    constructor(x, y, element){
        super(x,y);
        this.element = element;
    }

    setState(state){
        super.setState(state);
        switch(state){
            case 0:
                this.element.className = "piece ";
            break;
            case 1:
                this.element.className = "piece black";
            break;
            case 2:
                this.element.className = "piece white";
            break;
            case 3:
                this.element.className = "piece black sole";
            break;
            case 4:
                this.element.className = "piece white sole";
            break;
        }
    }
}