"use strict";
window.addEventListener("load", () => {
  //Variables
  let canvas = document.querySelector("#canvas");
  let ctx = canvas.getContext("2d");

  let clean = document.querySelector("#whiteCanvas");
  let downloader = document.querySelector("#download");
  let input = document.querySelector(".input1");

  let sepia = document.querySelector("#flt-sepia");
  let negativo = document.querySelector("#flt-negativo");
  let greyScale = document.querySelector("#flt-greyScale");
  let binario = document.querySelector("#flt-binario");
  let blur = document.querySelector("#flt-blur");
  let saturation = document.querySelector("#flt-saturation");

  let red = 0;
  let green = 1;
  let blue = 2;

  let h = 0;
  let s = 1;
  let l = 2;

  let kernelBlur = [
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
  ];


  //EventListeners
  clean.addEventListener("click", cleanCanvas);
  downloader.addEventListener("click", download);
  sepia.addEventListener("click", applySepiaFilter);
  negativo.addEventListener("click", applyNegativeFilter);
  greyScale.addEventListener("click", applyGreyScaleFilter);
  binario.addEventListener("click", applyBinaryFilter);
  blur.addEventListener("click", function () {
    applyKernelFilter(kernelBlur);
  });
  saturation.addEventListener("click", function () {
    applyHSLFilter(s, document.querySelector("#saturation-value").value);
  });

  //Funciones auxiliares
  function cleanCanvas() {
    ctx.fillStyle = "whitesmoke";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  }

  function download() {
    let dnld = document.getElementById("download");
    let image = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    dnld.setAttribute("href", image);
  }

  function getPixel(imageData, x, y, pos) {
    let index = (x + y * imageData.width) * 4;
    return imageData.data[index + pos];
  }

  function setPixel(imageData, x, y, r, g, b) {
    let index = (x + y * imageData.width) * 4;
    imageData.data[index + 0] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
  }

  //multiplica valores de un color (r||g||b) que rodean un determinado pixel (en coordenadas x,y) con una matriz kernel de 3x3 pasada por parametro
  function colorXMatrix(x, y, imageData, matrix, color) {
    let aux =
      getPixel(imageData, x - 1, y - 1, color) * matrix[0][0] +
      getPixel(imageData, x, y - 1, color) * matrix[0][1] +
      getPixel(imageData, x + 1, y - 1, color) * matrix[0][2] +
      getPixel(imageData, x - 1, y, color) * matrix[1][0] +
      getPixel(imageData, x, y, color) * matrix[1][1] +
      getPixel(imageData, x + 1, y, color) * matrix[1][2] +
      getPixel(imageData, x - 1, y + 1, color) * matrix[2][0] +
      getPixel(imageData, x, y + 1, color) * matrix[2][1] +
      getPixel(imageData, x + 1, y + 1, color) * matrix[2][2];
    return aux;
  }

  function AvgXKernelMatrix(x, y, imageData, matrix) {
    let r = colorXMatrix(x, y, imageData, matrix, red);
    let g = colorXMatrix(x, y, imageData, matrix, green);
    let b = colorXMatrix(x, y, imageData, matrix, blue);
    setPixel(imageData, x, y, r, g, b);
  }

  function rgbToHsl(r, g, b) {
    (r /= 255), (g /= 255), (b /= 255);
    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;
    if (max == min) {
      h = s = 0;
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }
    return [h, s, l];
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      }
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r * 255, g * 255, b * 255];
  }

  //Funciones Filtros
  function applySepiaFilter() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        let r =
          0.393 * getPixel(imageData, x, y, red) +
          0.769 * getPixel(imageData, x, y, green) +
          0.189 * getPixel(imageData, x, y, blue);
        if (r > 255) r = 255;

        let g =
          0.349 * getPixel(imageData, x, y, red) +
          0.686 * getPixel(imageData, x, y, green) +
          0.168 * getPixel(imageData, x, y, blue);
        if (g > 255) g = 255;

        let b =
          0.272 * getPixel(imageData, x, y, red) +
          0.534 * getPixel(imageData, x, y, green) +
          0.131 * getPixel(imageData, x, y, blue);
        if (b > 255) b = 255;

        setPixel(imageData, x, y, r, g, b);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function applyNegativeFilter() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        setPixel(
          imageData,
          x,
          y,
          255 - getPixel(imageData, x, y, red),
          255 - getPixel(imageData, x, y, green),
          255 - getPixel(imageData, x, y, blue)
        );
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function applyGreyScaleFilter() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        let greyPixel =
          getPixel(imageData, x, y, red) +
          getPixel(imageData, x, y, green) +
          getPixel(imageData, x, y, blue);
        greyPixel = greyPixel / 3;

        setPixel(imageData, x, y, greyPixel, greyPixel, greyPixel);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function applyBinaryFilter() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        let pixel =
          getPixel(imageData, x, y, red) +
          getPixel(imageData, x, y, green) +
          getPixel(imageData, x, y, blue);
        //uso 381 ((255 + 255 + 255) / 2) como valor frontera entre B y N.
        if (pixel > 381) {
          setPixel(imageData, x, y, 255, 255, 255);
        } else {
          setPixel(imageData, x, y, 0, 0, 0);
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function applyKernelFilter(matrix) {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < imageData.width; x++) {
      for (let y = 0; y < imageData.height; y++) {
        AvgXKernelMatrix(x, y, imageData, matrix);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function applyHSLFilter(hsl_option, value) {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < imageData.width; x++) {
      for (let y = 0; y < imageData.height; y++) {
        let hsl = rgbToHsl(
          getPixel(imageData, x, y, red),
          getPixel(imageData, x, y, green),
          getPixel(imageData, x, y, blue)
        );
        hsl[hsl_option] = hsl[hsl_option] * value;
        let rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        setPixel(imageData, x, y, rgb[0], rgb[1], rgb[2]);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }


  //Cargar imagen desde pc
  input.onchange = (e) => {
    // getting a hold of the file reference
    let file = e.target.files[0];

    // setting up the reader
    let reader = new FileReader();
    reader.readAsDataURL(file); // this is reading as data url

    // here we tell the reader what to do when it's done reading...
    reader.onload = (readerEvent) => {
      let content = readerEvent.target.result;

      let image = new Image();

      image.src = content;

      image.onload = function () {
        let scale = Math.min(
          canvas.width / this.width,
          canvas.height / this.height
        );
        cleanCanvas();
        ctx.drawImage(this, 0, 0, this.width * scale, this.height * scale);
      };
    };
  };
});