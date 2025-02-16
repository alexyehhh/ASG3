class Camera {
    constructor(){
        this.fov = 60; // Field of view

        // Start at beginning of maze
        this.eye = new Vector3([4.10, 0, 2.59]);  // Camera position
        this.at = new Vector3([1.24, 0, 2.48]);  // Look-at point

        // Look at maze from above
        // this.eye = new Vector3([3.07, 10.11, 0.19]);  // Camera position
        // this.at = new Vector3([2.35, 7.34, 0.17]);  // Look-at point

        this.up = new Vector3([0, 1, 0]);   // Up direction

        this.viewMatrix = new Matrix4();  // View matrix
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        this.projectionMatrix = new Matrix4();  // Projection matrix
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    }

    logCameraPosition() {
        console.log(`Camera Position: x=${this.eye.elements[0].toFixed(2)}, y=${this.eye.elements[1].toFixed(2)}, z=${this.eye.elements[2].toFixed(2)}`);
        console.log(`Looking At: x=${this.at.elements[0].toFixed(2)}, y=${this.at.elements[1].toFixed(2)}, z=${this.at.elements[2].toFixed(2)}`);
    }
    

    moveForward(speed) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);
        
        this.eye.add(f);
        this.at.add(f);
    
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );

        this.logCameraPosition();
    }

    moveBackward(speed) {
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(speed);

        this.eye.add(b);
        this.at.add(b);
    
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    moveLeft(speed) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
    
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(speed);

        this.eye.add(s);
        this.at.add(s);

    
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
      }

    moveRight(speed) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();

        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);

        this.eye.add(s);
        this.at.add(s);

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    panLeft(angle) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    panRight(angle) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    panUp(angle) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = Vector3.cross(f, this.up); // Get right direction
        s.normalize();

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angle, s.elements[0], s.elements[1], s.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    panDown(angle) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
    
        let s = Vector3.cross(f, this.up); // Get the right direction
        s.normalize();
    
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-angle, s.elements[0], s.elements[1], s.elements[2]); // Negative angle for downward rotation
    
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);
    
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }    
}
