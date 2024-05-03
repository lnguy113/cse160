class Triangle
{
    constructor()
    {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render()
    {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
    
        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the size of a point to u_size variable
        gl.uniform1f(u_size, size);

        // Draw
        //gl.drawArrays(gl.POINTS, 0, 1);
        var d = this.size/200.0;
        drawTriangle( [xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d]);
    }
}

function drawTriangle(vertices)
    {
        var n = 3; //vertices number
        //buffer creation
        var vertexBuffer = gl.createBuffer();
        if(!vertexBuffer)
        {
            console.log('Failed to create the buffer object');
            return -1;
        }
        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        gl.drawArrays(gl.TRIANGLES, 0, n);  
    }

function drawTriangle3DUV(vertices, uv) 
    {
        // gives me error (only prints half of the cube), vertices.length/3 prints the whole cube
        var n = vertices.length / 3; 
  
        // Buffer for vertices
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) 
        {
            console.log('Failed to create the buffer object for vertices');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);
        
        // Buffer for UV coordinates
        var uvBuffer = gl.createBuffer();
        if (!uvBuffer) 
        {
            console.log('Failed to create the buffer object for UV');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);

        // Assign the buffer object to a_UV variable
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_UV variable
        gl.enableVertexAttribArray(a_UV);
    
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
