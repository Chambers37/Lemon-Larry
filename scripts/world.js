import * as THREE from 'three';
import { blocks } from './blocks';

import wallImage from '../images/metal_wall.jpg';
import floorImage from '../images/metal_floor.jpg';
import lemonImage from '../images/lemon.jpg';

import coinSound from '../sounds/coinSound.mp3'

const geometry = new THREE.BoxGeometry();
const sphereGeometry = new THREE.SphereGeometry(0.1, 8, 8); 

const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load(wallImage);
const floorTexture = textureLoader.load(floorImage);
const lemonTexture = textureLoader.load(lemonImage);


const wallMaterial = new THREE.MeshLambertMaterial({
  color: 0x302f30, 
  reflectivity: 0, 
  map: wallTexture
});
const floorMaterial = new THREE.MeshLambertMaterial({
  color: 0x523c2c,
  map: floorTexture,
});
const lemonMaterial = new THREE.MeshLambertMaterial({

  color: 0x666318, 
  map: lemonTexture,
  reflectivity: 0
}); 


export class World extends THREE.Group {

  /**
   * @type {{
   * id: number,
   * instanceId: number
   * }[][][]}
   */  

  // 3D array to contain all world blocks
  data = [];

  // Declare properties to store meshes
  sphereMesh = null;
  floorMesh = null;
  wallMesh = null;

  constructor(size = { width: 30, wallHeight: 3 }, mazeLayout, listener) { 
    super();
    this.size = size;
    this.mazeLayout = mazeLayout;
    this.sphereChance = 25;
    this.listener = listener;  // Store the listener for use in this class
    this.audioLoader = new THREE.AudioLoader();

    // Load the lemon collection sound
    this.lemonSound = new THREE.Audio(this.listener);
    this.audioLoader.load(coinSound, (buffer) => {
        this.lemonSound.setBuffer(buffer);
        this.lemonSound.setVolume(0.4);  // Adjust the volume
    });
  }

  /**
  * Generates a 3D array representing the world.
  * Each slice in the array corresponds to an x-coordinate, 
  * containing rows that represent y-coordinates, and each row 
  * contains blocks at various z-coordinates.
  */
  generateBlocks() {
    this.data = [];
    // let count = 1;  // Debugging variable 

    // Creates a 2D array for each x coordinate (a slice of the world)
    for (let x = 0; x < this.size.width; x++) {
        const slice = [];

        // Creates a 1D array for each y coordinate (a row of the current slice)
        for (let y = 0; y <= this.size.wallHeight; y++) {
            const row = [];

            // Creates an object for each z coordinate (the block at the given x, y, z)
            for (let z = 0; z < this.size.width; z++) {

                // Floor layer
                if (y === 0) {                    
                    row.push({
                        id: 1,
                        instanceId: null
                    });

                    // Debugging info
                    // console.log(`Placing block at x: ${x}, y: ${y}, z: ${z}, id: ${row[row.length - 1].id}, total blocks: ${count}`);
                    // count++;

                  // Wall layers at the edges
                } else if (
                    y > 0 && y <= this.size.wallHeight && 
                    (x === 0 || x === this.size.width - 1 || z === 0 || z === this.size.width - 1)
                ) {
                    row.push({
                        id: 2,
                        instanceId: null
                    });

                    // debug info
                    // console.log(`Placing block at x: ${x}, y: ${y}, z: ${z}, id: ${row[row.length - 1].id}, total blocks: ${count}`);
                    // count++;

                  // Empty space
                } else {
                    row.push({
                        id: 0,
                        instanceId: null
                    });
                }
            }
            slice.push(row);
        }
        this.data.push(slice);
    }
}


  generateMeshes = () => {  
    this.clear();  
    
    const maxBlocks = (this.size.width** 2) * this.size.wallHeight;

    this.wallMesh = new THREE.InstancedMesh(geometry, wallMaterial, maxBlocks);
    this.floorMesh = new THREE.InstancedMesh(geometry, floorMaterial, maxBlocks)
    this.sphereMesh = new THREE.InstancedMesh(sphereGeometry, lemonMaterial, maxBlocks)

    // Allow shadows on all instances
    this.wallMesh.castShadow = true;
    this.wallMesh.receiveShadow = true;
    this.floorMesh.castShadow = true;
    this.floorMesh.receiveShadow = true;
    this.sphereMesh.castShadow = true;
    this.sphereMesh.receiveShadow = true;

    // Instances start at 0
    this.wallMesh.count = 0; 
    this.floorMesh.count = 0;
    this.sphereMesh.count = 0;

    const matrix = new THREE.Matrix4();  
    const lemonMatrix = new THREE.Matrix4();
    
    // Create the floor (y = 0) and scatter spheres
    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {

        let blockId = this.getBlock(x, 0, z).id
        let instanceId = this.floorMesh.count;

        if (blockId !== blocks.empty.id) {
          matrix.setPosition(x, 0, z);  
          this.floorMesh.setMatrixAt(instanceId, matrix);  
          this.setBlockInstanceId(x, 0, z, instanceId);
          this.floorMesh.count++;
        }
    
        // default to 25% chance to place a sphere
        // Randomly scatter small spheres above the floor (y = 1)
        if (Math.random() < this.sphereChance / 100 && 
          x > 0 && x < this.size.width - 1 &&
          z > 0 && z < this.size.width - 1
          ) { 

          // Check if the maze layout at this position is a path block
          if (this.mazeLayout[z][x] === 0) {
              instanceId = this.sphereMesh.count;

              lemonMatrix.setPosition(x, 1.25, z);  
              this.sphereMesh.setMatrixAt(instanceId, lemonMatrix);  

              // Update the block at y = 0 to represent a lemon
              let blockBelow = this.getBlock(x, 0, z);
              if (blockBelow) {
                blockBelow.id = blocks.lemon.id;  // Set the block's ID to lemon
                this.setBlockInstanceId(x, 1, z, instanceId);  // Track the instance ID
            }
            

              this.sphereMesh.count++;
          } 
        }
      }
    }

    // Create the walls (y = 1 to y = wallHeight)
    for (let y = 1; y <= this.size.wallHeight; y++) {
      for (let x = 0; x < this.size.width; x++) {

        let blockId = this.getBlock(x, y, 0).id
        let instanceId = this.wallMesh.count;

        // Front wall (z = 0)
        if (blockId !== blocks.empty.id) {

          matrix.setPosition(x, y, 0);  
          this.wallMesh.setMatrixAt(instanceId, matrix);
          this.setBlockInstanceId(x, y, 0, instanceId)
          this.wallMesh.count++;
        }

        blockId = this.getBlock(x, y, this.size.width - 1).id
        instanceId = this.wallMesh.count;

        // Back wall (z = width - 1)
        if (blockId !== blocks.empty.id) {
          
          matrix.setPosition(x, y, this.size.width - 1);  
          this.wallMesh.setMatrixAt(instanceId, matrix);
          this.setBlockInstanceId(x, y, this.size.width - 1, instanceId)
          this.wallMesh.count++
        }
        

      }

      for (let z = 1; z < this.size.width - 1; z++) {  

        let blockId = this.getBlock(0, y, z)
        let instanceId = this.wallMesh.count;
        
        // Left wall (x = 0)
        if (blockId !== blocks.empty.id) {
          matrix.setPosition(0, y, z);  
          this.wallMesh.setMatrixAt(instanceId, matrix);
          this.setBlockInstanceId(0, y, z, instanceId)
          this.wallMesh.count++
        }

        blockId = this.getBlock(this.size.width - 1, y, z).id
        instanceId = this.wallMesh.count;

        // Right wall (x = width - 1)
        if (blockId !== blocks.empty.id) {
          matrix.setPosition(this.size.width - 1, y, z);  
          this.wallMesh.setMatrixAt(instanceId, matrix);
          this.setBlockInstanceId(0, y, z, instanceId)
          this.wallMesh.count++
        }
      }
    }

    // Regenerate and create the maze based on the new size
    // this.mazeLayout = this.generateMazeLayout(this.size.width);

    // Maze creation
    this.createMaze(this.wallMesh, matrix);

    this.add(this.floorMesh);
    this.add(this.wallMesh);
    this.add(this.sphereMesh);
   
  };

  createMaze = (wallMesh, matrix) => {

    // Loop through the maze layout array
    for (let z = 0; z < this.mazeLayout.length; z++) {
        for (let x = 0; x < this.mazeLayout[z].length; x++) {

            // 1 represents a wall in the maze
            if (this.mazeLayout[z][x] === 1) { 
                for (let y = 1; y <= this.size.wallHeight; y++) {

                    // Get the block at this position
                    let block = this.getBlock(x, y, z);

                    // Update the block's id to 3 to represent a maze wall
                    if (block) {
                        block.id = 3;
                    }

                    // Place the maze wall block visually
                    matrix.setPosition(x, y, z); 
                    this.wallMesh.setMatrixAt(this.wallMesh.count++, matrix);
                }
            }
        }
    }
  };

  getBlock(x, y, z) {
    if (this.inBounds(x, y, z)) {
      return this.data[x][y][z];
    } else {
      return null;
    }
  };

  setBlockId(x, y, z, id) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].id = id
    }
  }

  setBlockInstanceId(x, y, z, instanceId) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].instanceId = instanceId;
    }
  }

  inBounds(x, y, z) {
    if (x >= 0 && x < this.size.width &&
      y >= 0 && y <= this.size.wallHeight &&
      z >= 0 && z < this.size.width) {
        return true;
      } else {
        return false;
      }
  };

  // Method to handle lemon collection
  onLemonCollected(x, y, z, player) {
    const floorBlock = this.getBlock(x, y, z);
    const blockWithLemon = this.getBlock(x, y + 1, z);
    if (blockWithLemon && blockWithLemon.id === blocks.empty.id) {
      const instanceId = blockWithLemon.instanceId;
      
      if (instanceId !== null) {
        if (this.lemonSound.isPlaying) {
          this.lemonSound.stop(); // Stop if it's already playing to restart it
        }
        this.lemonSound.play(); 
          player.score += 13;

          // Update the score display directly
          window.scoreDisplay.textContent = `Score: ${player.score}`;
          
          // Update the floor block to no longer indicate a lemon is above it
          floorBlock.id = blocks.floor.id;
          

          // Move the lemon sphere below the floor (y = -1) to hide it
          const hiddenMatrix = new THREE.Matrix4().setPosition(x, -1, z);
          this.sphereMesh.setMatrixAt(instanceId, hiddenMatrix);  // Apply the matrix to move the lemon
          this.sphereMesh.instanceMatrix.needsUpdate = true;  // Notify Three.js to update the mesh

          // Mark the air block as empty and clear the instance ID
          blockWithLemon.id = blocks.empty.id;  // Set the block ID to empty
          blockWithLemon.instanceId = null;  // Clear the instance ID
      }
  }
  }
  
}