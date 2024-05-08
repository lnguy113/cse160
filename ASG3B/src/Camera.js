class Camera 
{
    constructor(fov, aspect, near, far)
    {
        this.type = "camera";
        this.eye = new Vector3([1,0.5,3]);
        this.at = new Vector3([0,0,-50]);
        this.up = new Vector3([0,1,0]);
        this.speed = 1;
        this.bounds = { minX: -10, maxX: 14.5, minZ: -15, maxZ: 16 };

        this.viewMat = new Matrix4();

        this.x = this.eye.elements[0];
        //this.y = this.eye.elements[1];
        this.z = this.eye.elements[2];

        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

    }

    forwards() 
    {
        let forwards = new Vector3();
        forwards.set(this.at);
        forwards.sub(this.eye);
        forwards.div(forwards.magnitude());

        var nextAt = this.at.add(forwards);
        var nextEye = this.eye.add(forwards);

        // These operations keep me in bound. Prevents from exiting the parameter and from going under.
        nextEye.elements[0] = clamp(nextEye.elements[0], this.bounds.minX, this.bounds.maxX);
        nextEye.elements[1] = 0.4;
        nextEye.elements[2] = clamp(nextEye.elements[2], this.bounds.minZ, this.bounds.maxZ);

        this.at.set(nextAt);
        this.eye.set(nextEye);
    }

    backwards() 
    {
        var backwards = new Vector3();
        backwards.set(this.at);
        backwards.sub(this.eye);
        backwards.div(backwards.magnitude());
        backwards.mul(-1); 

        var nextAt = this.at.add(backwards);
        var nextEye = this.eye.add(backwards);

        // Bounds
        nextEye.elements[0] = clamp(nextEye.elements[0], this.bounds.minX, this.bounds.maxX);
        nextEye.elements[1] = 0.4;
        nextEye.elements[2] = clamp(nextEye.elements[2], this.bounds.minZ, this.bounds.maxZ);

        this.at.set(nextAt);
        this.eye.set(nextEye);
    }

    left() 
    {
        var left = new Vector3();
        left.set(this.at);
        left.sub(this.eye);
        left.div(left.magnitude()); 

        var s = new Vector3();
        s = Vector3.cross(this.up, left); 
        s.div(s.magnitude()); 

        var nextAt = this.at.add(s);
        var nextEye = this.eye.add(s);
        
        nextEye.elements[0] = clamp(nextEye.elements[0], this.bounds.minX, this.bounds.maxX);
        nextEye.elements[1] = 0.4;
        nextEye.elements[2] = clamp(nextEye.elements[2], this.bounds.minZ, this.bounds.maxZ);

        this.at.set(nextAt);
        this.eye.set(nextEye);
    }

  
    
    right() 
    {
        var right = new Vector3();
        right.set(this.at);
        right.sub(this.eye);
        right.div(right.magnitude()); 

        var s = new Vector3();
        s = Vector3.cross(this.up, right); 
        s.div(s.magnitude()); 
        s.mul(-1);

        var nextAt = this.at.add(s);
        var nextEye = this.eye.add(s);

        nextEye.elements[0] = clamp(nextEye.elements[0], this.bounds.minX, this.bounds.maxX);
        nextEye.elements[1] = 0.4;
        nextEye.elements[2] = clamp(nextEye.elements[2], this.bounds.minZ, this.bounds.maxZ);

        this.at.set(nextAt);
        this.eye.set(nextEye);
    }

    panLeft()
    {
        var panright = new Vector3();
        panright.set(this.at);
        panright.sub(this.eye);

        // Math
        var radius = Math.sqrt(panright.elements[0]*panright.elements[0] + panright.elements[2]*panright.elements[2]);
        var theta = Math.atan2(panright.elements[2], panright.elements[0]);
        theta -= (2 * Math.PI / 180);

        panright.elements[0] = radius * Math.cos(theta);
        panright.elements[2] = radius * Math.sin(theta);

        // Updating camera 
        this.at.set(panright);
        this.at.add(this.eye);

    }

    panRight()
    { 
        var panleft = new Vector3();
        panleft.set(this.at);
        panleft.sub(this.eye);

        // Math
        var radius = Math.sqrt(panleft.elements[0] * panleft.elements[0] + panleft.elements[2] * panleft.elements[2]);
        var theta = Math.atan2(panleft.elements[2], panleft.elements[0]);
        theta += (2 * Math.PI / 180);

        panleft.elements[0] = radius * Math.cos(theta);
        panleft.elements[2] = radius * Math.sin(theta);

        // Updating camera 
        this.at.set(panleft);
        this.at.add(this.eye);
    }

    panUp()
    {
        this.at.elements[1]+=2;
    }

    panDown()
    {
        this.at.elements[1]-=2;
    }

    Fdirection() 
    {
        let forward = new Vector3();
        forward.set(this.at);
        forward.sub(this.eye);
        forward.normalize();
        return forward; 
    }
}

function clamp(value, min, max) 
{
    return Math.max(min, Math.min(max, value));
}

// Adding and Deleting Blocks 
function CameraPosition(camera) 
{
    let F = camera.Fdirection();
    let x = camera.eye.elements[0] + F.elements[0];
    let z = camera.eye.elements[2] + F.elements[2];

    // keep track of numbers 
    let X = Math.floor(x + 15.5);
    let Z = Math.floor(z + 15.5);

    if (X >= 0 && X < g_map.length && Z >= 0 && Z < g_map[X].length) 
    {
        if (g_map[X][Z] === 0) 
        { 
            g_map[X][Z] = 3;
            let block = new Cube();
            block.textureNum = 7; 
            block.translate(X - 15.5, 0.01, Z - 15.5);
            allies.push(block);
            renderAllScene();
        }
    }
}

function mouseOrbit() 
{
    canvas.onmousedown = function(event) 
    {
        mouseControl = true;
        endX = event.clientX;
        endY = event.clientY;
    };

    document.onmouseup = function(event) 
    {
        mouseControl = false;
    };

    canvas.onmousemove = function(event) 
    {
        if (!mouseControl) return;

        var X = event.clientX;
        var Y = event.clientY;
        var dx =  (X - endX);
        var dy =  (Y - endY);

        if(dx > 0)
        {
          g_Camera.panRight();
        }

        else if (dx < 0)
        {
          g_Camera.panLeft();
        }

        if(dy < 0)
        {
          g_Camera.panUp();
        } 

        else if (dy > 0)
        {
          g_Camera.panDown();
        }

        endX = X;
        endY = Y;
        renderAllShapes(); 
    };
  }
