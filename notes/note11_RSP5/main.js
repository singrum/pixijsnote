


const getRandom = (min, max) => {
    if (max === undefined) {
        return Math.random() * min
    }
    return Math.random() * (max - min) + min

}

const getWinner = (p1, p2) => {

    if ((p1 + 1) % 3 === p2)
        return 1 //p2승
    else if (p1 === p2)
        return -1
    else
        return 0 //p1승
}
Array.prototype.pairs = function (func) {
    for (let i = 0; i < this.length - 1; i++) {
        for (let j = i; j < this.length - 1; j++) {
            func([this[i], this[j + 1]]);
        }
    }
}
class App {

    constructor() {

        this.startGame()


    }
    startGame() {


        // create an engine
        let engine = Matter.Engine.create();
        engine.gravity.x = 0
        engine.gravity.y = 1
        this.engine = engine
        // create a renderer
        let render = Matter.Render.create({
            element: document.body,
            engine: engine,
            options: {
                width: innerWidth,
                height: innerHeight,
                wireframes: false,
                showAngleIndicator: false,
                background: 0xffffff
            }
        });
        this.render = render

        // create two boxes and a ground

        let walls = [
            Matter.Bodies.rectangle(innerWidth / 2, innerHeight + 100, innerWidth, 200, { isStatic: true }), // bottom
            Matter.Bodies.rectangle(innerWidth / 2, -100, innerWidth, 200, { isStatic: true }), // top
            Matter.Bodies.rectangle(-100, innerHeight / 2, 200, innerHeight, { isStatic: true }), // left
            Matter.Bodies.rectangle(innerWidth + 100, innerHeight / 2, 200, innerHeight, { isStatic: true })
        ]
        walls.forEach(e => { e.restitution = 1 })
        this.walls = walls
        const objs = []
        this.objs = objs

        const length = 200
        const seeds = [this.getObj(0, {x : innerWidth / 2, y : innerHeight / 2 - length / Math.sqrt(3)}),
        this.getObj(1, {x : innerWidth / 2 - length / 2, y : innerHeight / 2 + length / Math.sqrt(12)}),
        this.getObj(2, {x : innerWidth / 2 + length / 2, y : innerHeight / 2 + length / Math.sqrt(12)})]
        
        this.objs = [...seeds]







        this.run()
        this.setEvent()
        this.setInteraction()




    }
    getObj(type, pos) {


        const obj = Matter.Bodies.circle(pos.x, pos.y, 16,
            {
                render: {
                    sprite: {
                        texture: `./asset/${type === 0 ? "rock" : type === 1 ? "paper" : "scissors"}.png`,
                        xScale: 0.2,
                        yScale: 0.2,
                    }
                }
            })
        obj.name = parseInt(type)
        obj.restitution = 1.1
        obj.frictionAir = 0
        return obj
    }
    setEvent() {
        let time = 0
        let cnt = 0
        
        const onCollision = () => {
            this.engine.world.bodies.filter(e=>!this.walls.includes(e)).pairs(pair => {
                const collide = Matter.Collision.collides(pair[0], pair[1])
                if (!collide) {
                    return
                }
                const winner = getWinner(pair[0].name, pair[1].name)

                if (winner === -1) {
                    return
                }


                pair[1 - winner].render.sprite.texture = pair[winner].render.sprite.texture
                pair[1 - winner].name = pair[winner].name

            });
        }
        Matter.Events.on(this.runner, 'afterTick', function (timeStamp) {
            onCollision()
        })


    }
    setInteraction() {
        window.addEventListener("click", e => {
            // console.log(this.engine.world.bodies.filter(e=>!this.walls.includes(e)))
            for(let obj of this.engine.world.bodies.filter(e=>!this.walls.includes(e))){
                const copies = [this.getObj(obj.name, {x : obj.position.x, y : obj.position.y}),
                    this.getObj(obj.name, {x : obj.position.x, y : obj.position.y})]

                Matter.Composite.add(this.engine.world, copies)
            }
            
        })
    }
    run() {
        // add all of the bodies to the world
        Matter.Composite.add(this.engine.world, [...this.objs, ...this.walls]);

        // run the renderer
        Matter.Render.run(this.render);

        // create runner
        let runner = Matter.Runner.create();
        this.runner = runner
        // run the engine
        Matter.Runner.run(runner, this.engine);
    }


}

new App()
