import p5 from 'p5';

type Location = {
  lat: number,
  lon: number
};

const postBody = function(locs: Array<Location>): string {
  const locations = locs.map(loc => {
    return { latitude: loc.lat, longitude: loc.lon };
  });
  const json = { locations };
  return JSON.stringify(json);
};

const elevationAPiUrl = 'https://api.open-elevation.com/api/v1/lookup';

const getElevations = function(locations: Array<Location>): Promise<any> {
  return new Promise((resolve, reject) =>
    fetch(
      elevationAPiUrl,
      {
        method: 'POST',
        body: postBody(locations),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(jsonResponse => resolve(jsonResponse.results))
      .catch(error => reject(error)));
}


const width: number = 700;
const height: number = 700;
const square: number = 20;

const east:number =   2.570290;
const west:number = -14.931820;
const north:number = 62.310835;
const south:number = 48.519515;

const p2g = function(x: number, y: number): {lat: number, lon: number} {
  return {
    lat: ( y / height) * (south - north) + north,
    lon: ( x / width ) * (east - west) + west
  }
};

const sketch = function(p5: p5) {
  p5.setup = function() {
    p5.createCanvas(width, height);
    p5.background(0);
    p5.fill('blue');

    const locations:Array<Location> = [];
    for (let x: number = 0; x < width; x += square) {
      for (let y: number = 0; y < height; y += square) {
        locations.push(p2g(x, y));
      }
    }

    getElevations(locations)
      .then(locationsWithElevations => {
        for (let x: number = 0; x < width; x += square) {
          for (let y: number = 0; y < height; y += square) {
            const elevation = locationsWithElevations.shift().elevation;
            p5.fill(elevation/3);
            p5.rect(x, y, square, square);
          }
        }
      })
  };
};

const myp5 = new p5(sketch);
