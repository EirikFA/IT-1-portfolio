import Game from "./game/Game";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const game = new Game(ctx);
game.draw();
document.addEventListener("keydown", e => {
  if (!game.started && e.keyCode >= 37 && e.keyCode <= 40) game.start();
});
