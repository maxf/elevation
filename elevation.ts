import p5 from 'p5';


const elevationAPiUrl = (lat: number, lon: number): string =>
  `https://localhost/api/v1/lookup?locations=${lat},${lon}`;

const getElevation = async function(lat, lon): Promise<string> {
  const response = await fetch('http://localhost:8081');
  console.log(response.json);
  return 'awesome';
}



const sketch = function(p5: p5) {

  p5.setup = function() {
    p5.createCanvas(700, 410);
  }

  p5.draw = function() {
    p5.background(0);
    p5.fill('blue');
    p5.rect(100, 100, 50, 50);
  }
};

const myp5 = new p5(sketch);
