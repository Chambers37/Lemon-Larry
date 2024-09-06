import * as THREE from 'three';
import { AStarFinder } from 'pathfinding';
import PF from 'pathfinding';

import lemonImage from '../images/lemon.jpg'

const textureLoader = new THREE.TextureLoader();
const lemonTexture = textureLoader.load(lemonImage);

export class Ghost {
    constructor(scene, maze, player, x, z) {
        this.scene = scene;
        this.maze = maze; // The maze layout, used for pathfinding
        this.player = player; // Reference to the player object
        this.position = { x: x, y: 2, z: z }; // Initial position of the ghost
        this.targetPosition = null; // The next grid position the ghost is moving towards

        // Setup the ghost's visual representation as a red sphere
        const geometry = new THREE.SphereGeometry(0.3, 6, 6); 
        const material = new THREE.MeshLambertMaterial({ color: 0x666318, map: lemonTexture, reflectivity: 0 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 2, z);
        scene.add(this.mesh);

        // Setup A* pathfinder
        this.finder = new AStarFinder({
            allowDiagonal: false, // Disallow diagonal movement
            dontCrossCorners: true // Prevent the ghost from cutting corners
        });
    }

    update() {
        const playerPos = this.getPlayerGridPosition(); // Get the player's current grid position
        const ghostPos = this.getGhostGridPosition();  // Get the ghost's current grid position

        // If the ghost has reached its target or has no target, find a new path
        if (!this.targetPosition || (ghostPos.x === this.targetPosition.x && ghostPos.y === this.targetPosition.y)) {
            this.calculateNewPath();
        }

        // Move towards the target position if it exists
        if (this.targetPosition) {
            this.moveTowardsTarget();
        }
    }

    getPlayerGridPosition() {
        // Convert the player's world position to a grid position (integer values)
        return {
            x: Math.floor(this.player.camera.position.x),
            y: Math.floor(this.player.camera.position.z)
        };
    }

    getGhostGridPosition() {
        // Convert the ghost's world position to a grid position (integer values)
        return {
            x: Math.floor(this.mesh.position.x),
            y: Math.floor(this.mesh.position.z)
        };
    }

    calculateNewPath() {
      // Create a grid based on the maze layout
      const grid = new PF.Grid(this.maze);
      const start = [this.getGhostGridPosition().x, this.getGhostGridPosition().y];
  
      // Determine whether the ghost should wander randomly (1% chance)
      const shouldWander = Math.random() < 0.01;
      let end;
  
      if (shouldWander) {
        // Wander to a random walkable position in the maze
        let randomX, randomY;
        do {
            randomX = Math.floor(Math.random() * this.maze[0].length);
            randomY = Math.floor(Math.random() * this.maze.length);
        } while (this.maze[randomY][randomX] === 0); // Ensure the position is not a wall
        
        end = [randomX, randomY];
    } else {
        // Set the end position to the player's current position
        end = [this.getPlayerGridPosition().x, this.getPlayerGridPosition().y];
    }
  
      // Find the path from the ghost's current position to the target position
      const path = this.finder.findPath(start[0], start[1], end[0], end[1], grid);
  
      // If a path is found, set the next target position along the path
      if (path.length > 1) {
        this.targetPosition = { 
            x: path[1][0], // The next grid position along the path
            y: path[1][1] 
        };
    } else {
        this.targetPosition = null; // No valid path found, clear the target
    }
    }

    moveTowardsTarget() {
        if (!this.targetPosition) return; // If there's no target, do nothing

        // Convert the target grid position to world coordinates
        const targetWorldPos = new THREE.Vector3(this.targetPosition.x, this.mesh.position.y, this.targetPosition.y);
        
        // Calculate the direction vector towards the target position
        const direction = targetWorldPos.clone().sub(this.mesh.position).normalize();
        
        // Determine the ghost's movement speed
        const moveSpeed = this.player.maxSpeed / 150; // Adjust speed as needed
        
        // Calculate the distance to the target position
        const distance = this.mesh.position.distanceTo(targetWorldPos);

        // Move the ghost towards the target, but not farther than the distance to the target
        const stepDistance = Math.min(moveSpeed, distance);

        if (distance > 0.01) { // A small buffer to prevent clipping issues
            this.mesh.position.add(direction.multiplyScalar(stepDistance)); // Move towards target
        } else {
            // Snap to the target position if close enough
            this.mesh.position.copy(targetWorldPos);
            this.position = { x: this.targetPosition.x, y: this.targetPosition.y };
            this.targetPosition = null; // Target reached, clear it
            this.calculateNewPath(); // Immediately calculate a new path after reaching the target
        }
    }
}