
const equipotentialFilter = (points, threshold) =>{
    const program = {
        vs : undefined,
        fs : /*glsl*/`
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float threshold;
        uniform float points[60];
        
    
        vec3 color(){
            
            
            float potential = 0.0;
            for(int i = 0;i<10;i++){
                float dist = distance(gl_FragCoord.xy, vec2(points[3 * i], points[3 * i + 1]));
                potential += points[3 * i + 2] / dist;
            }


            if(potential > 0.04){
                return vec3(0.804,0.706,0.859);
            }
            else if(potential > 0.037){
                return vec3(1.0,0.784,0.867);
            }
            else if(potential > 0.034){
                return vec3(1.0, 0.686, 0.8);
            }
            else if(potential > 0.031){
                return vec3(0.741,0.878, 0.996);
            }
            else{
                return vec3(0.635, 0.824, 1.0);
            }
        }
        void main(void) {
    
            gl_FragColor = vec4(color(), 1.0);
        }
        `
    }
    const filter = new PIXI.Filter(program.vs, program.fs)
    filter.uniforms.threshold = threshold
    filter.uniforms.points = points
    return filter
}

export default equipotentialFilter;