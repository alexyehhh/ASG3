class Cube {
    constructor(){
        this.type='cube';
        this.color=[1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.cubeVerts32 = new Float32Array([
            0, 0, 0,  1, 1, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,  1, 1, 0,
            0, 1, 0,  0, 1, 1,  1, 1, 1,
            0, 1, 0,  1, 1, 1,  1, 1, 0,
            1, 1, 0,  1, 1, 1,  1, 0, 0,
            1, 0, 0,  1, 1, 1,  1, 0, 1,
            0, 1, 0,  0, 1, 1,  0, 0, 0,
            0, 0, 0,  0, 1, 1,  0, 0, 1,
            0, 0, 0,  0, 0, 1,  1, 0, 1,
            0, 0, 0,  1, 0, 1,  1, 0, 0,
            0, 0, 1,  1, 1, 1,  1, 0, 1,
            0, 0, 1,  0, 1, 1,  1, 1, 1
        ]);
        this.cubeVerts = [
            0, 0, 0,  1, 1, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,  1, 1, 0,
            0, 1, 0,  0, 1, 1,  1, 1, 1,
            0, 1, 0,  1, 1, 1,  1, 1, 0,
            1, 1, 0,  1, 1, 1,  1, 0, 0,
            1, 0, 0,  1, 1, 1,  1, 0, 1,
            0, 1, 0,  0, 1, 1,  0, 0, 0,
            0, 0, 0,  0, 1, 1,  0, 0, 1,
            0, 0, 0,  0, 0, 1,  1, 0, 1,
            0, 0, 0,  1, 0, 1,  1, 0, 0,
            0, 0, 1,  1, 1, 1,  1, 0, 1,
            0, 0, 1,  0, 1, 1,  1, 1, 1
        ];
        // Only initialize the buffer ONCE for all cubes
        if (!Cube.vertexBuffer) {
            this.initVertexBuffer();
        }
    }

    initVertexBuffer() {
        Cube.vertexBuffer = gl.createBuffer();
        if (!Cube.vertexBuffer) {
            console.log("Failed to create the vertex buffer");
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);

        // Define vertices (including positions + UVs)
        const vertices = new Float32Array([
            // Front face
            0, 0, 0, 0, 0,   1, 1, 0, 1, 1,   1, 0, 0, 1, 0,
            0, 0, 0, 0, 0,   0, 1, 0, 0, 1,   1, 1, 0, 1, 1,

            // Top face
            0, 1, 0, 0, 0,   0, 1, 1, 0, 1,   1, 1, 1, 1, 1,
            0, 1, 0, 0, 0,   1, 1, 1, 1, 1,   1, 1, 0, 1, 0,

            // Back face
            1, 0, 1, 1, 0,   0, 0, 1, 0, 0,   0, 1, 1, 0, 1,
            1, 0, 1, 1, 0,   0, 1, 1, 0, 1,   1, 1, 1, 1, 1,

            // Bottom face
            0, 0, 0, 0, 1,   1, 0, 0, 1, 1,   1, 0, 1, 1, 0,
            0, 0, 0, 0, 1,   1, 0, 1, 1, 0,   0, 0, 1, 0, 0,

            // Left face
            0, 0, 0, 1, 0,   0, 1, 1, 0, 1,   0, 1, 0, 1, 1,
            0, 0, 0, 1, 0,   0, 0, 1, 0, 0,   0, 1, 1, 0, 1,

            // Right face
            1, 0, 0, 1, 0,   1, 1, 1, 0, 1,   1, 1, 0, 1, 1,
            1, 0, 0, 1, 0,   1, 0, 1, 0, 0,   1, 1, 1, 0, 1
        ]);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        Cube.numVertices = vertices.length / 5;
    }
  
    render(){
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        // Use solid color if not using a texture
        if (this.textureNum == -2) {
            gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        }

        // Set texture blending weight
        // if (this.textureNum === 0) {
        //     gl.uniform1f(u_texColorWeight, 1.0); // Fully textured for walls
        // } else {
        //     gl.uniform1f(u_texColorWeight, 0.0); // Only base color for skybox
        // }

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube       
        // drawTriangle3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
        
        // drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);
        drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);
        

        // Top of cube
        // drawTriangle3D([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);
        drawTriangle3DUV([0, 1, 0,  0, 1, 1,  1, 1, 1], [0, 0, 0,  1, 1, 1]);
        // drawTriangle3D([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);
        drawTriangle3DUV([0, 1, 0,  0, 1, 1,  1, 1, 1], [0, 0, 0,  1, 1, 1]);
        
        // // Bottom of cube
        // drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  0.0, 0.0, 1.0]);
        // drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0]);
        drawTriangle3DUV([0, 0, 0,  1, 0, 1,  0, 0, 1], [0, 0, 1,  1, 1, 0]);
        drawTriangle3DUV([0, 0, 0,  1, 0, 0,  1, 0, 1], [0, 0, 0,  1, 1, 1]);

        // // Left of cube
        // drawTriangle3D([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);
        // drawTriangle3D([1.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0]);
        drawTriangle3DUV([1, 0, 0,  1, 1, 1,  1, 1, 0], [0, 0, 1,  1, 1, 0]);
        drawTriangle3DUV([1, 0, 0,  1, 0, 1,  1, 1, 1], [0, 0, 0,  1, 1, 1]);

        // // Right of cube
        // drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0]);
        // drawTriangle3D([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 1.0]);
        drawTriangle3DUV([0, 0, 0,  0, 1, 1,  0, 1, 0], [0, 0, 1,  1, 1, 0]);
        drawTriangle3DUV([0, 0, 0,  0, 0, 1,  0, 1, 1], [0, 0, 0,  1, 1, 1]);

        // // Back of cube
        // drawTriangle3D([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0]);
        // drawTriangle3D([0.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0]);
        drawTriangle3DUV([0, 0, 1,  1, 1, 1,  0, 1, 1], [0, 0, 1,  1, 1, 0]);
        drawTriangle3DUV([0, 0, 1,  1, 0, 1,  1, 1, 1], [0, 0, 0,  1, 1, 1]);
    }

    renderfast(){
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        if (this.textureNum == -2) {
            gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        }

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts=[];

        // Front of cube
        allverts = allverts.concat([0, 0, 0,  1, 1, 0,  1, 0, 0]);
        allverts = allverts.concat([0, 0, 0,  0, 1, 0,  1, 1, 0]);

        // Pass the matrix to u_ModelMatrix attribute
        // gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube       
        // drawTriangle3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
        
        // drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);
        // drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
        // drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);
        

        // Top of cube
        // drawTriangle3D([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);
        // drawTriangle3DUV([0, 1, 0,  0, 1, 1,  1, 1, 1], [0, 0, 0,  1, 1, 1]);
        // // drawTriangle3D([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);
        // drawTriangle3DUV([0, 1, 0,  0, 1, 1,  1, 1, 1], [0, 0, 0,  1, 1, 1]);
        allverts=allverts.concat([0, 1, 0,  0, 1, 1,  1, 1, 1]);
        allverts=allverts.concat([0, 1, 0,  1, 1, 1,  1, 1, 0]);
        
        // // Bottom of cube
        // drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  0.0, 0.0, 1.0]);
        // drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0]);
        // drawTriangle3DUV([0, 0, 0,  1, 0, 1,  0, 0, 1], [0, 0, 1,  1, 1, 0]);
        // drawTriangle3DUV([0, 0, 0,  1, 0, 0,  1, 0, 1], [0, 0, 0,  1, 1, 1]);
        allverts=allverts.concat([0, 0, 0,  0, 0, 1,  1, 0, 1]);
        allverts=allverts.concat([1, 0, 0,  1, 1, 1,  1, 0, 1]);

        // // Left of cube
        // drawTriangle3D([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);
        // drawTriangle3D([1.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0]);
        // drawTriangle3DUV([1, 0, 0,  1, 1, 1,  1, 1, 0], [0, 0, 1,  1, 1, 0]);
        // drawTriangle3DUV([1, 0, 0,  1, 0, 1,  1, 1, 1], [0, 0, 0,  1, 1, 1]);
        allverts=allverts.concat([0, 1, 0,  0, 1, 1,  0, 0, 0]);
        allverts=allverts.concat([0, 0, 0,  0, 1, 1,  0, 0, 1]);

        // // Right of cube
        // drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0]);
        // drawTriangle3D([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 1.0]);
        // drawTriangle3DUV([0, 0, 0,  0, 1, 1,  0, 1, 0], [0, 0, 1,  1, 1, 0]);
        // drawTriangle3DUV([0, 0, 0,  0, 0, 1,  0, 1, 1], [0, 0, 0,  1, 1, 1]);
        allverts=allverts.concat([1, 1, 0,  1, 1, 1,  1, 0, 0]);
        allverts=allverts.concat([1, 0, 0,  1, 1, 1,  1, 0, 1]);

        // // Back of cube
        // drawTriangle3D([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0]);
        // drawTriangle3D([0.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0]);
        // drawTriangle3DUV([0, 0, 1,  1, 1, 1,  0, 1, 1], [0, 0, 1,  1, 1, 0]);
        // drawTriangle3DUV([0, 0, 1,  1, 0, 1,  1, 1, 1], [0, 0, 0,  1, 1, 1]);
        allverts=allverts.concat([0, 0, 1,  1, 1, 1,  1, 0, 1]);
        allverts=allverts.concat([0, 0, 1,  0, 1, 1,  1, 1, 1]);
        drawTriangle3D(allverts);
    }

    renderfaster() {
        var rgba = this.color;

        // Ensure the buffer exists
        if (!Cube.vertexBuffer) {
            console.log("Vertex buffer is not initialized.");
            return;
        }

        // Bind the shared buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);

        const FSIZE = Float32Array.BYTES_PER_ELEMENT;

        // Assign buffer to a_Position
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
        gl.enableVertexAttribArray(a_Position);

        // Assign buffer to a_UV
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
        gl.enableVertexAttribArray(a_UV);

        // Set texture and color
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Apply transformation matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, Cube.numVertices);
    }
}


