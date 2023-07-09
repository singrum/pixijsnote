import * as PIXI from '../../node_module/dist/pixi.min.js"';

// Create a PixiJS application of type cavas with specify background color and make it resizes to the iframe window
const app = new PIXI.Application() < HTMLCanvasElement > { background: '#1099bb', resizeTo: window };

// Adding the application's view to the DOM
document.body.appendChild(app.view);