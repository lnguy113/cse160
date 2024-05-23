var uvBuffer;
var vertexBuffer;
class Cube
{
    constructor()
    {
        this.type='cube';
        this.color=[1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
  
        this.vertices = { front: null, back: null, top: null, bot: null, right: null, left: null };
        this.UV = { front: null, back: null, top: null, bot: null, right: null, left: null };
        this.normal = { front: null, back: null, top: null, bot: null, right: null, left: null };
        this.textureNumber = -2;
        this.x = null;
        this.z = null;
    }

    generateVertices() 
    {

        var v = 
        { 
            // the positions 
            // the front 
            front: [0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], 

            // the back
            back: [0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], 

            // the top
            top: [0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], 

            // the bottom
            bot: [0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0], 

            // the right side 
            right: [1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0], 

            // the left side 
            left: [0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 1.0] 
        };

        var v_uv = 
        { 
            // the uv coordinates 
            // the front 
            front: [0.0, 0.0, 1.0, 1.0, 1.0, 0.0,  0.0, 0.0, 0.0, 1.0, 1.0, 1.0],

            // the back
            back: [1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  1.0, 0.0, 1.0, 1.0, 0.0, 1.0], 
            
            // the top 
            top: [0.0, 0.0, 1.0, 1.0, 1.0, 0.0,  0.0, 0.0, 0.0, 1.0, 1.0, 1.0], 
            
            // the bottom 
            bot: [0.0, 1.0, 1.0, 0.0, 1.0, 1.0,  0.0, 1.0, 0.0, 0.0, 1.0, 0.0], 

            // the right side 
            right: [0.0, 0.0, 1.0, 1.0, 1.0, 0.0,  0.0, 0.0, 0.0, 1.0, 1.0, 1.0],

            // the left side 
            left: [0.0, 0.0, 1.0, 1.0, 1.0, 0.0,  0.0, 0.0, 0.0, 1.0, 1.0, 1.0] 
        };

        const normals = 
        {
            // the front
            front: [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0],
            
            // the back
            back: [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0],
            
            // the top
            top: [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0],
            
            // the bottom
            bot: [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0],
            
            // the right
            right: [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0],
            
            // the left
            left: [-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0]
        };

        // the positions 
        this.vertices.front = new Float32Array(v.front);
        this.vertices.back = new Float32Array(v.back);
        this.vertices.top = new Float32Array(v.top);
        this.vertices.bot = new Float32Array(v.bot);
        this.vertices.right = new Float32Array(v.right);
        this.vertices.left = new Float32Array(v.left);

        // the uv
        this.UV.front = new Float32Array(v_uv.front);
        this.UV.back = new Float32Array(v_uv.back);
        this.UV.top = new Float32Array(v_uv.top);
        this.UV.bot = new Float32Array(v_uv.bot);
        this.UV.right = new Float32Array(v_uv.right);
        this.UV.left = new Float32Array(v_uv.left);

        // the norms
        this.normal.front = new Float32Array(normals.front);
        this.normal.back = new Float32Array(normals.back);
        this.normal.top = new Float32Array(normals.top);
        this.normal.bot = new Float32Array(normals.bot);
        this.normal.right = new Float32Array(normals.right);
        this.normal.left = new Float32Array(normals.left);
    }
  

    render()
    {
        var rgba = this.color;
        this.generateVertices();

        // Pass the texture num
        gl.uniform1i(u_whichTexture, this.textureNumber);
        
        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attributes
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        drawTriangle3DUVNormal(this.vertices.front, this.UV.front, this.normal.front);
        //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]*.9);
        drawTriangle3DUVNormal(this.vertices.back, this.UV.back, this.normal.back);
        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]*.8);
        drawTriangle3DUVNormal(this.vertices.top, this.UV.top, this.normal.top);
        //gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]*.7);
        drawTriangle3DUVNormal(this.vertices.bot, this.UV.bot, this.normal.bot);
        //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]*.6);
        drawTriangle3DUVNormal(this.vertices.right, this.UV.right, this.normal.right);
        //gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]*.5);
        drawTriangle3DUVNormal(this.vertices.left, this.UV.left, this.normal.left);
        
  
    }
}
