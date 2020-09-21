import P5 from "p5";
import birdImg from "url:./assets/image/beagle.jpg";

declare var ml5: any;

const loadDate = new Date();

const draw = (p5: P5) => {
  let mobilenet: any;

  let bird: P5.Element;

  const modelReady = () => {
    const modelLoadTime = (new Date().getTime() - loadDate.getTime()) / 1000;
    console.log(`Model ready after ${modelLoadTime} seconds`);
    mobilenet.predict(bird, gotResult);
  }

  const imageReady = () => {
    p5.image(bird, 0, 0, p5.width, p5.height)
  }

  const gotResult = (error: any, results: any) => {
    if (error) {
      console.error(error);
    } else {
      console.log(results);
    }
  }

  p5.setup = () => {
    p5.createCanvas(640, 480);
    bird = p5.createImg(birdImg, imageReady) as P5.Element;
    bird.hide();
    p5.background(0);
    mobilenet = ml5.imageClassifier("MobileNet", modelReady);
  }
}

const p5 = new P5(draw);
