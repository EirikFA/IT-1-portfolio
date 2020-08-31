import Grid from "./Grid";
import Snake, { Direction } from "./Snake";

export default class Game {
  private readonly context: CanvasRenderingContext2D;

  private currentFrameDirection: Direction;

  private foodLocation: number | null;

  public readonly grid: Grid;

  private readonly snake: Snake;

  private _started: boolean;
  public get started(): boolean {
    return this._started;
  }

  public constructor (
    context: CanvasRenderingContext2D,
    height: number = 15,
    width: number = 17
  ) {
    if (height % 2 === 0 || width % 2 === 0) throw new Error("Height and width must be odd numbers");

    this.context = context;
    this.grid = new Grid(height, width, 35);
    this.snake = new Snake(this, 0, 25);
    this._started = false;
    this.foodLocation = 5;
    document.addEventListener("keydown", e => this.handleKey(e));
  }

  public draw (): void {
    this.grid.draw(this.context);
    this.snake.draw(this.context);

    const [foodX, foodY] = this.grid.getCordPosition(this.foodLocation);
    const padding = (this.grid.squareSize - 21) / 2;
    
    this.context.beginPath();
    this.context.fillStyle = "#A40000";
    this.context.fillRect(foodX + padding, foodY + padding, 21, 21);
    this.context.closePath();
  }

  private generateFood (): void {
    const gridArea = this.grid.width * this.grid.height;

    let cord = Math.round(Math.random() * (gridArea - 1));

    while (this.snake.coordinate === cord || this.snake.trail.slice(0, this.snake.tailLength).includes(cord)) {
      cord = Math.round(Math.random() * (gridArea - 1));
    }

    this.foodLocation = cord;
  }

  private detectEdgeCollision (prevCord: number, newCord: number): boolean {
    const prevCol = this.grid.getCordColumn(prevCord);
    const newCol = this.grid.getCordColumn(newCord);

    return (prevCol === 0 && newCol === this.grid.width - 1)
      || (prevCol === this.grid.width - 1 && newCol === 0)
      || newCord < 0 || newCord > this.grid.width * this.grid.height - 1;
  }

  private detectSnakeCollision (newCord: number): boolean {
    const tail = this.snake.trail.slice(0, this.snake.tailLength);
    return tail.includes(newCord);
  }

  private play (): void {
    if (!this.started) return;

    const prevCord = this.snake.coordinate;

    this.snake.move();
    this.currentFrameDirection = this.snake.direction;

    if (this.detectEdgeCollision(prevCord, this.snake.coordinate) || this.detectSnakeCollision(this.snake.coordinate)) {
      this.stop();
      alert("Game over");
      return;
    }
    
    if (this.snake.coordinate === this.foodLocation) {
      this.snake.eat();
      this.foodLocation = null;
    }

    if (!this.foodLocation) this.generateFood();
    this.draw();
    setTimeout(() => requestAnimationFrame(this.play.bind(this)), 350);
  }

  private handleKey (e: KeyboardEvent): void {
    switch (e.keyCode) {
      case 37:
        if (this.currentFrameDirection !== Direction.Right) {
          this.snake.setDirection(Direction.Left);
        }
        break;

      case 38:
        if (this.currentFrameDirection !== Direction.Down) {
          this.snake.setDirection(Direction.Up);
        }
        break;
      
      case 39:
        if (this.currentFrameDirection !== Direction.Left) {
          this.snake.setDirection(Direction.Right);
        }
        break;
      
      case 40:
        if (this.currentFrameDirection !== Direction.Up) {
          this.snake.setDirection(Direction.Down);
        }
        break;
    }
  }

  public start (): void {
    if (!this.started) {
      this._started = true;
      this.play();
    }
  }

  private stop (): void {
    this._started = false;
  }
}
