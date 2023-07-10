import PIXI from "../../node_modules/pixi.js/dist/pixi.js"



const rectToCircleShader = PIXI.Program.from(
    `
  attribute vec2 vPosition;
  attribute vec2 vUv;
  
  uniform mat3 projectionMatrix;
  
  varying vec2 uv;

  void main() {
    gl_Position = vec4((projectionMatrix * vec3(vPosition, 1.0)).xy, 0.0, 1.0);
    uv = vUv;
  }
`,
    `
varying vec2 uv;
  
uniform int u_isWhite;

void makeCircle(){
  if(distance(uv, vec2(0.5)) > 0.5){
      discard;
  }
}

vec3 color(){
  if(u_isWhite == 1){
      return vec3(1.0,1.0,1.0);
  }
  return vec3(0.0,0.0,0.0);
  
}

void main() {
  
  // makeCircle();

  gl_FragColor = vec4(1.0,1.0,0.0, 1.0);
}
`);

class Circle {
    constructor(centerX, centerY, isWhite) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = 0;
        this.isWhite = isWhite;
        this.obj = this.getObj();
    }
    addRad(x) {
        this.radius += x;
    }
    getObj() {
        // Geometry 객체를 생성합니다.
        const geometry = new PIXI.Geometry()
            .addAttribute('vPosition',[
                -10, -10, 
                10, -10, 
                -10, 10, 
                10, 10],2)
            .addAttribute('vUv', [
                0, 0,
                1, 0,
                0, 1,
                1, 1,
            ],2)
            .addIndex(new Uint16Array([
                0, 1, 2, // 삼각형 1의 정점 인덱스
                1, 2, 3  // 삼각형 2의 정점 인덱스
            ]))




        // Mesh 객체를 생성합니다.
        const mesh = new PIXI.Mesh(
            geometry,
            new PIXI.MeshMaterial(PIXI.Texture.WHITE, {
                program: rectToCircleShader,
                uniforms: { u_isWhite: this.isWhite }
            })
        );
        return mesh


        // const obj = new PIXI.Graphics()
        // obj.lineStyle(0);
        // obj.beginFill(this.isWhite ? 0xffffff : 0x000000, 1);

        // obj.drawRect(-1,-1,2,2);

        // const RectToCircleFilter = new RectToCircle()
        // obj.filters = [RectToCircleFilter];
        // if(this.isWhite){
        //     RectToCircleFilter.uniforms.isWhite = 1;
        // }

        // return obj;
    }
}

class App {

    constructor() {
        PIXI.settings.RESOLUTION = window.devicePixelRatio
        PIXI.GRAPHICS_CURVES.adaptive = false
        const app = new PIXI.Application({
            width: window.innerWidth, height: window.innerHeight,
            backgroundColor: 0x000000, // 배경 색상을 불투명한 검은색으로 설정합니다.
            transparent: false,
        });
        this.app = app;


        document.body.appendChild(app.view);
        this.setInteraction();
        this.setTicker();
        console.log(app.renderer)

    }
    setInteraction() {
        this.currPointers = [];
        const downEvent = e => {

            if ('ontouchstart' in window) {
                window.addEventListener("touchmove", moveEvent, false);
                this.currPointers = e.targetTouches;

            }
            else {
                window.addEventListener("mousemove", moveEvent, false);
                this.currPointers = [e];

            }
        }
        const moveEvent = e => {
            if ('ontouchstart' in window) {
                this.currPointers = e.targetTouches

            }
            else {
                this.currPointers = [e]

            }
        }
        const upEvent = e => {
            if ('ontouchstart' in window) {
                window.removeEventListener("touchmove", moveEvent, false)
                for (let touch of e.changedTouches) {
                    this.currPointers = this.currPointers.filter(e => e !== touch);
                }
            }
            else {
                window.removeEventListener("mousemove", moveEvent, false)
                this.currPointers = []
            }

        }


        if ('ontouchstart' in window) {
            window.addEventListener('touchstart', downEvent);
            window.addEventListener('touchend', upEvent);
        }
        else {

            window.addEventListener('mousedown', downEvent);
            window.addEventListener('mouseup', upEvent);
        }

    }
    async setTicker() {
        let counter = 0;
        const period = 10;
        this.currCircles = [];
        const discardCircle = () => {
            if (this.currCircles.length === 0) { return; }

            if (this.currCircles[0].radius > Math.hypot(this.app.view.width, this.app.view.height)) {
                const circle = this.currCircles.shift();
                if (circle.isWhite) {
                    this.app.renderer.background.color = 0xffffff;
                }
                else {
                    this.app.renderer.background.color = 0x000000;
                }
                circle.obj.destroy()



            }
        }
        const makeCircle = delta => {
            counter += delta
            if (counter > period) {
                counter = 0;

                for (let pointer of this.currPointers) {
                    const pixelData = this.app.renderer.extract.pixels();
                    const index = (pointer.clientY * this.app.view.width + pointer.clientX) * 4;
                    // 픽셀 데이터에서 해당 좌표의 채널(R, G, B, A) 값을 추출
                    const red = pixelData[index];

                    const circle = new Circle(pointer.clientX, pointer.clientY, red === 0 ? 1 : 0);
                    this.currCircles.push(circle);
                    this.app.stage.addChild(circle.obj)
                    circle.obj.position.set(circle.centerX,circle.centerY)
                    circle.obj.scale.set(circle.radius)

                }

                discardCircle();
            }
        }

        const growCircle = delta => {
            for (let circle of this.currCircles) {
                circle.addRad(delta * 2);
                circle.obj.scale.x = circle.radius
                circle.obj.scale.y = circle.radius

            }
        }


        this.app.ticker.add(delta => {
            this.app.renderer.render(this.app.stage)
            makeCircle(delta);
            growCircle(delta);

        })



    }

}

new App()