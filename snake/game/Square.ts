export enum SquareColor {
  Light = "LIGHT",
  Dark = "DARK"
}

export namespace SquareColor {
  export const getHexColor = (color: SquareColor): string => {
    switch (color) {
      case SquareColor.Light:
        return "#8ECF63";
      
      case SquareColor.Dark:
        return "#80C94F";
    }
  }
}

export default class Square {
  private readonly color: SquareColor;

  private readonly coordinate: number;

  private readonly size: number;

  public constructor (color: SquareColor, coordinate: number, size: number,) {
    this.color = color;
    this.coordinate = coordinate;
    this.size = size;
  }

  public draw (x: number, y: number, context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.fillStyle = SquareColor.getHexColor(this.color);
    context.fillRect(x, y, this.size, this.size);
    context.closePath();
  }
}
