let fbo;
let fbo_2;
let delay_ms_slider;
let scatter_slider;
let feedback_slider;
let diffusion_slider;

let waveshine_shader;

const FPS = 30;
const DIM = 512;

function setup() {
    const canvas = createCanvas(DIM, DIM, WEBGL);
    delay_ms_slider = createSlider(0, 1, 0.5, 0);
    scatter_slider = createSlider(0, 1, 0.5, 0);
    feedback_slider = createSlider(0, 1, 0.5, 0);
    diffusion_slider = createSlider(0, 1, 0.5, 0);
    feedback_slider.position(45, 0);
    diffusion_slider.position(45, 20);
    delay_ms_slider.position(45, 572);
    let scatter_div = createDiv();
    scatter_div.style('transform-origin: 0 50% 0');
    scatter_div.style('transform: rotate(-90deg);');
    scatter_div.position(20, 552);
    scatter_div.child(scatter_slider);  
    feedback_slider.style('width', '512px');
    diffusion_slider.style('width', '512px');
    delay_ms_slider.style('width', '512px');
    scatter_slider.style('width', '512px');

    fbo = new p5Fbo({renderer: canvas, width: DIM, height: DIM, wrapMode: REPEAT, floatTexture: true});
    fbo_2 = new p5Fbo({renderer: canvas, width: DIM, height: DIM, wrapMode: REPEAT, floatTexture: true});
    frameRate(FPS);
    waveshine_shader = loadShader("sketch.vert", "waveshine.frag");
}

function draw() {

    if (mouseIsPressed === true && mouseX >= 0 && mouseX < DIM && mouseY >= 0 && mouseY < DIM) {
        delay_ms_slider.value(mouseX / width);
        scatter_slider.value(1.0 - mouseY / height);
    }

    noStroke();

    fbo.begin();
    waveshine_shader.setUniform("feedback_texture", fbo_2.getTexture());
    waveshine_shader.setUniform("delay_ms", delay_ms_slider.value());
    waveshine_shader.setUniform("scatter", scatter_slider.value());
    waveshine_shader.setUniform("feedback", feedback_slider.value());
    waveshine_shader.setUniform("diffusion", diffusion_slider.value());
    waveshine_shader.setUniform("time", millis() / 1000.0);
    clear();
    shader(waveshine_shader);
    quad(-1, -1, 1, -1, 1, 1, -1, 1);
    fbo.end();

    fbo.copyTo(fbo_2);

    fbo.draw();

}
