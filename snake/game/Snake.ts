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

    context.beginPath();
    context.fillStyle = "#018096";
    context.fillRect(x + padding, y + padding, width, height);

    for (let i = 0; i < this._tailLength; i++) {
      const cord = this._trail.get(i);
      if (!cord && cord !== 0) throw new Error("Snake trail is insufficient (missing elements)");

      console.log(cord);

      const [tailX, tailY] = this.game.grid.getCordPosition(cord);
      context.fillRect(tailX + padding, tailY + padding, width, height);
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
        cord -= 1;
        break;
      
      case Direction.Right:
        cord += 1;
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
