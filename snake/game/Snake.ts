import Game from "./Game";
import { List as ImmutableList } from "immutable";

export enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

export default class Snake {
  private _coordinate: number;
  public get coordinate (): number {
    return this._coordinate;
  }

  private cordOffset: number;
  
  private _direction: Direction;
  public get direction (): Direction {
    return this._direction;
  }

  private readonly game: Game;

  private readonly size: number;

  private _tailLength: number;
  public get tailLength (): number {
    return this._tailLength;
  }

  private _trail: ImmutableList<number>;
  public get trail (): ImmutableList<number> {
    return this._trail;
  }

  public constructor (game: Game, initialPosition: number, size: number) {
    this._coordinate = initialPosition;
    this.cordOffset = 0;
    this._direction = Direction.Right;
    this.game = game;
    this.size = size;
    this._tailLength = 0;
    this._trail = ImmutableList();
  }

  public draw (context: CanvasRenderingContext2D): void {
    let [x, y] = this.game.grid.getCordPosition(this.coordinate);
    const padding = (this.game.grid.squareSize - this.size) / 2;

    let width = this.size;
    let height = this.size;

    let headStartAngl: number;
    let headEndAngl: number;
    let headX = x + (this.game.grid.squareSize / 2);
    let headY = y + (this.game.grid.squareSize / 2);

    switch (this.direction) {
      case Direction.Up:
        headStartAngl = Math.PI;
        headEndAngl = 0;
        headY += (this.game.grid.squareSize / 3);
        break;

      case Direction.Down:
        headStartAngl = 0;
        headEndAngl = Math.PI;
        headY -= (this.game.grid.squareSize / 3);
        break;

      case Direction.Right:
        headStartAngl = 3/2 * Math.PI;
        headEndAngl = 1/2 * Math.PI;
        headX -= (this.game.grid.squareSize / 3);
        headX += (this.cordOffset * this.game.grid.squareSize);
        break;

      case Direction.Left:
        headStartAngl = 1/2 * Math.PI;
        headEndAngl = 3/2 * Math.PI;
        headX += (this.game.grid.squareSize / 3);
        break;
    }

    context.beginPath();
    context.fillStyle = "#018096";
    context.arc(headX, headY, width / 2, headStartAngl, headEndAngl);
    context.fill();

    for (let i = 0; i < this._tailLength; i++) {
      let cord = this._trail.get(i);
      if (!cord && cord !== 0) throw new Error("Snake trail is insufficient (missing elements)");

      if (this.cordOffset !== 0) cord -= 1;

      const [tailX, tailY] = this.game.grid.getCordPosition(cord);
      console.log(tailX, this.cordOffset * this.game.grid.squareSize)
      context.fillRect(tailX + padding + (this.cordOffset * this.game.grid.squareSize), tailY + padding, width, height);
    }

    context.closePath();
  }

  public setDirection (direction: Direction): void {
    this._direction = direction;
  }

  private getNewCord (current: number, direction: Direction): number {
    let cord = current;

    switch (direction) {
      case Direction.Up:
        cord -= this.game.grid.width;
        break;
      
      case Direction.Down:
        cord += this.game.grid.width;
        break;

      case Direction.Left:
        this.cordOffset += 0.1;
        if (this.cordOffset === 1) {
          cord -= 1;
          this.cordOffset = 0;
        }
        break;
      
      case Direction.Right:
        this.cordOffset += 0.2;
        this.cordOffset = Math.round(this.cordOffset * 10) / 10;
        if (this.cordOffset === 1) {
          cord += 1;
          this.cordOffset = 0;
        }
        break;
    }

    return cord;
  }

  public move (): void {
    this._trail = this._trail.unshift(this._coordinate);
    this._coordinate = this.getNewCord(this.coordinate, this._direction);
  }

  public eat (): void {
    this._tailLength += 1;
  }
}
