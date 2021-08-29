import p5 from 'p5';


const elevationAPiUrl = (lat: number, lon: number): string =>
  `https://localhost/api/v1/lookup?locations=${lat},${lon}`;

const getElevation = async function(lat, lon): Promise<string> {
  const response = await fetch('http://localhost:8081');
  console.log(response.json);
  return 'awesome';
}

const p2g = function(p: {x: number, y: number}): {lat: number, lon: number} {
  return { lat: p.x, lon: p.x };
}




const sketch = function(p5: p5) {

  const width: number = 700;
  const height: number = 700;

  p5.setup = function() {
    p5.createCanvas(width, height);
  }

  p5.draw = function() {
    p5.background(0);
    p5.fill('blue');


    for (let x: number = 0; x < width; x += 50) {
      for (let y: number = 0; y < height; y += 50) {
        p5.rect(x, y, 30, 30);
      }
    }
  }
};

const myp5 = new p5(sketch);
