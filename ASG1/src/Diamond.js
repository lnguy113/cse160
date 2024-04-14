class Diamond
{
    constructor()
    {
        this.type = 'diamond';
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
        var d = this.size/100.0;
         drawTriangle( [xy[0]-d, xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d]);
         drawTriangle( [xy[0]-d, xy[1], xy[0]+d, xy[1], xy[0], xy[1]-d]);

    }
}
