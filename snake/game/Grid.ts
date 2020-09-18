import { Map as ImmutableMap } from "immutable";
import Square, { SquareColor } from "./Square";

export default class Grid {
  public readonly height: number;

  public readonly width: number;

  public readonly squareSize: number;

  private readonly squares: ImmutableMap<number, Square>;

  public constructor (height: number, width: number, squareSize: number) {
    this.height = height;
    this.width = width;
    this.squareSize = squareSize;

    const mutableSquares = new Map<number, Square>();
    for (let i = 0; i < this.height * this.width; i++) {
      const color = i % 2 === 0 ? SquareColor.Light : SquareColor.Dark;
      mutableSquares.set(i, new Square(color, i, this.squareSize));
    }
    this.squares = ImmutableMap(mutableSquares);
  }

  public getCordColumn (cord: number): number {
    return cord % this.width;
  }

  public getCordRow (cord: number): number {
    return Math.floor(cord / this.width);
  }

  public getCordPosition (cord: number): [number, number] {
    const x = this.getCordColumn(cord) * this.squareSize;
    const y = this.getCordRow(cord) * this.squareSize
    return [x, y];
  }

  public draw (context: CanvasRenderingContext2D): void {
    this.squares.forEach((square, cord) => {
      const [x, y] = this.getCordPosition(cord);
      square.draw(x, y, context);
    });
  }
}
