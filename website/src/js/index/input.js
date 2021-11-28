function input(canvas, ctx, data){
    const range = document.getElementById("range");
    range.addEventListener("input", () => {

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.beginPath();
        ctx.moveTo(0, (data[0] / 100) * (range.value / 100))
        for(let i = 1; i < data.length; i++){
            ctx.lineTo(i, (data[i] /100) * (range.value / 100));
        }
        ctx.stroke();

    })
}