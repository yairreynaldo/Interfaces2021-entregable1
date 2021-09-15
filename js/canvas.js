"use strict";
window.addEventListener("load", () => {
    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");
    let painting = false;
    let lapiz = document.querySelector("#lapiz");
    let goma = document.querySelector("#goma");
    let downloader = document.querySelector("#download");
    let borrar = false;

    //EventListeners
    lapiz.addEventListener("click", activaLapiz);
    goma.addEventListener("click", activaGoma);
    downloader.addEventListener("click", download);

    //funciones
    function startPosition(e) {
        painting = true;
        //draw(e);
    }

    function finishPosition() {
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting) return;
        if (!borrar) ctx.strokeStyle = document.querySelector("#html5colorpicker").value;
        ctx.lineWidth = document.querySelector("#slider-size").value;
        ctx.lineTo(e.clientX - this.offsetLeft, e.clientY - this.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - this.offsetLeft, e.clientY - this.offsetTop);
    }

    function activaLapiz() {
        ctx.strokeStyle = document.querySelector("#html5colorpicker").value;
        ctx.lineCap = "round";
        borrar = false;
        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", finishPosition);
        canvas.addEventListener("mousemove", draw);
    }

    function activaGoma() {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineCap = "round";
        borrar = true;
        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", finishPosition);
        canvas.addEventListener("mousemove", draw);
    }


    function download() {
        let dnld = document.getElementById("download");
        let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        dnld.setAttribute("href", image);

    }

});