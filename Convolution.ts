class Convolution {

  uniform_array(len: number, value: any): any[] {
    let arr = new Array(len);
    for (let i = 0; i < len; ++i) {
      arr[i] = Array.isArray(value) ? [...value] : value;
    }
    return arr;
  }


  // the code is taken from https://github.com/mattlockyer/iat455/blob/6493c882f1956703133c1bffa1d7ee9a83741cbe/assignment1/assignment/effects/blur-effect-dyn.js
  // (c) Matt Lockyer, https://github.com/mattlockyer

  hypotenuse(x1, y1, x2, y2) {
    var xSquare = Math.pow(x1 - x2, 2);
    var ySquare = Math.pow(y1 - y2, 2);
    return Math.sqrt(xSquare + ySquare);
  }

  /*
   * Generates a kernel used for the gaussian blur effect.
   *
   * @param dimension is an odd integer
   * @param sigma is the standard deviation used for our gaussian function.
   *
   * @returns an array with dimension^2 number of numbers, all less than or equal
   *   to 1. Represents our gaussian blur kernel.
   */
  generateGaussianKernel(dimension, sigma): number[][] {
    if (!(dimension % 2) || Math.floor(dimension) !== dimension || dimension < 3) {
      throw new Error(
        'The dimension must be an odd integer greater than or equal to 3'
      );
    }
    var kernel = [];

    var twoSigmaSquare = 2 * sigma * sigma;
    var centre = (dimension - 1) / 2;
    let sum = 0;

    for (var i = 0; i < dimension; i++) {
      kernel[i] = [];
      for (var j = 0; j < dimension; j++) {
        var distance = this.hypotenuse(i, j, centre, centre);

        // The following is an algorithm that came from the gaussian blur
        // wikipedia page [1].
        //
        // http://en.wikipedia.org/w/index.php?title=Gaussian_blur&oldid=608793634#Mechanics
        var gaussian = (1 / Math.sqrt(
          Math.PI * twoSigmaSquare
        )) * Math.exp((-1) * (Math.pow(distance, 2) / twoSigmaSquare));

        kernel[i].push(gaussian);
        sum += gaussian;
      }
    }

    // Returns the unit vector of the kernel array.
    return kernel.map((row: number[]) => row.map((val: number) => val / sum));
  }

  gaussianConv(dimension: number, sigma: number, array: number[][]) {
    const kernel: number[][] = this.generateGaussianKernel(dimension, sigma);

    console.log(1, kernel);

    return this.conv2d(kernel, array);
  }

  conv2d(kernel: number[][], array: number[][]) {
    var result: number[][] = this.uniform_array(array.length, this.uniform_array(array[0].length, 0));
    var kRows: number = kernel.length;
    var kCols: number = kernel[0].length;
    var rows: number = array.length;
    var cols: number = array[0].length;
    // find center position of kernel (half of kernel size)
    var kCenterX: number = Math.floor(kCols / 2);
    var kCenterY: number = Math.floor(kRows / 2);

    for (let i: number = 0; i < rows; ++i) {          // for all rows
      for (let j: number = 0; j < cols; ++j) {          // for all columns
        for (let m: number = 0; m < kRows; ++m) {         // for all kernel rows
          for (let n: number = 0; n < kCols; ++n) {        // for all kernel columns
            // index of input signal, used for checking boundary
            const ii: number = i + (m - kCenterY);
            const jj: number = j + (n - kCenterX);
            // ignore input samples which are out of bound
            if (ii >= 0 && ii < rows && jj >= 0 && jj < cols) {
              result[i][j] += array[ii][jj] * kernel[m][n];
            };
          };
        };
      };
    };
    return result;
  };
};

export { Convolution }
