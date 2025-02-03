class Cube {
    constructor(){
        this.type='cube';
        this.color=[1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
  
    render(){
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube       
        drawTriangle3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);

        // Top of cube
        drawTriangle3D([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);
        
        // // Bottom of cube
        drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  0.0, 0.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0]);

        // // Left of cube
        drawTriangle3D([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);
        drawTriangle3D([1.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0]);

        // // Right of cube
        drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 1.0]);

        // // Back of cube
        drawTriangle3D([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0]);
    }
}