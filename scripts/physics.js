import * as THREE from 'three';
import { blocks } from './blocks';
import evilLaugh from '../sounds/deep-evil-laugh.mp3'

const collisionMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.2
});
const collisionGeometry = new THREE.BoxGeometry(1.001, 1.001, 1.001)

const contactGeometry = new THREE.SphereGeometry(0.03, 6, 6);

const contactMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: 0x00ff00
})

export class Physics {
  simulationRate = 200;
  timeStep = 1 / this.simulationRate;
  accumulator = 0;
  gravity = 32;

  constructor(scene, ghosts, world) {
    this.helpers = new THREE.Group();
    scene.add(this.helpers)
    this.ghosts = ghosts
  }

  update(changeInTime, player, world) {
    this.accumulator += changeInTime;

    while (this.accumulator >= this.timeStep) {
        this.helpers.clear();

        // Apply gravity
        player.velocity.y -= this.gravity * this.timeStep;

        // Apply player inputs (e.g., movement, jumping)
        player.applyInputs(this.timeStep);

        // Update the player's bounds helper
        player.updateBoundsHelper();

        // Check if the player is on the ground and correct their position if necessary
        const groundLevel = 1.9; // Adjust this value based on your game's ground level

        if (player.position.y <= groundLevel) {
            // If player is below or at ground level, reset their vertical velocity
            player.velocity.y = 0;
            player.position.y = groundLevel+ 0.01;
            player.onGround = true; // Ensure the player is considered on the ground
        } else {
            // If the player is above ground, allow gravity to continue affecting them
            player.onGround = false;
        }

        // Detect collisions (this should happen after position corrections)
        this.detectCollisions(player, world);

        // Detect collisions with ghosts
        this.detectGhostCollisions(player, world);

        this.accumulator -= this.timeStep;
    }
}

  detectCollisions(player, world) {
    player.onGround = false;
    const candidates = this.broadPhase(player, world);
    const collisions = this.narrowPhase(candidates, player, world);

    if (collisions.length > 0) {
      this.resolveCollisions(collisions, player);
    }
  }

  broadPhase(player, world) {

    this.helpers.clear()

    const candidates = [];

    const extents = {
      x: {
        min: Math.floor(player.position.x - player.radius),
        max: Math.ceil(player.position.x + player.radius)
      },
      y: {
        min: Math.floor(player.position.y - player.height),
        max: Math.ceil(player.position.y)
      },
      z: {
        min: Math.floor(player.position.z - player.radius),
        max: Math.ceil(player.position.z + player.radius)
      },
    }

    for (let x = extents.x.min; x <= extents.x.max; x++) {
      for (let y = extents.y.min; y <= extents.y.max; y++) {
        for (let z = extents.z.min; z <= extents.z.max; z++) {
          const block = world.getBlock(x, y, z);
          if (block && block.id !== blocks.empty.id) {
            const blockPos = { x, y, z }
            candidates.push({ position: blockPos, id: block.id })

          //   if (block.id === blocks.lemon.id) {

          //     // Trigger the visual update to remove the lemon
          //     // Floor block that has a lemon above it
          //     world.onLemonCollected(x, y, z);
          // }

            // this.addCollisionHelper(blockPos)
          }
        };
      };
    };

      // console.log(`Total Collision Candidates: ${candidates.length}`)

    return candidates;
  }

  narrowPhase(candidates, player, world){
    const collisions = [];

    for (const block of candidates) {

      // Get the point on the block that is closest to the center of the players bounding cylinder

      const playerPoint = player.position;
      const closestPoint = {
        x: Math.max(block.position.x - 0.5, Math.min(playerPoint.x, block.position.x + 0.5)),
        y: Math.max(block.position.y - 0.5, Math.min(playerPoint.y - (player.height / 2), block.position.y + 0.5)),
        z: Math.max(block.position.z - 0.5, Math.min(playerPoint.z, block.position.z + 0.5)),
      };

      const deltaX = closestPoint.x - player.position.x;
      const deltaY = closestPoint.y - (player.position.y - (player.height / 2));
      const deltaZ = closestPoint.z - player.position.z;

      if (this.pointInPlayerBoundingCylinder(closestPoint, player)) {

        const overlapY = (player.height / 2) - Math.abs(deltaY);
        const overlapXZ = player.radius - Math.sqrt(deltaX**2 + deltaZ**2)

        let normal, overlap;
        if (overlapY < overlapXZ) {
          normal = new THREE.Vector3(0, -Math.sign(deltaY), 0);
          overlap = overlapY;
          player.onGround = true;
        } else {
          normal = new THREE.Vector3(-deltaX, 0, -deltaZ)
          overlap = overlapXZ;
        }

        collisions.push({
          block: block,
          contactPoint: closestPoint,
          normal,
          overlap
        });

        if (block.id === blocks.lemon.id) {

          // Trigger the visual update to remove the lemon
          // Floor block that has a lemon above it
          world.onLemonCollected(block.position.x, block.position.y, block.position.z, player);
      }

        // this.addContactPointHelper(closestPoint)
        // Debugging log

          // console.log(`Narrowphase Collisions: ${collisions.length} block-id ${block.id}`);
          // console.log(`Collision Block pos ${ block.position.x }, ${ block.position.y }, ${ block.position.z }`)
      }



    }

    return collisions;
  }

  resolveCollisions(collisions, player) {

    // Resolve collisions from smallest to largest
    collisions.sort((a, b) => {
      return a.overlap < b.overlap;
    });

    for (const collision of collisions) {

      if (!this.pointInPlayerBoundingCylinder(collision.contactPoint, player))
      continue;
      // Change player position so there is no more overlap

      // Vector pointing from palyer to contact poiint
      let deltaPosition = collision.normal.clone();

      // Scaling vector to be same size as the overlap
      deltaPosition.multiplyScalar(collision.overlap);

      // Push player away from the block the way of the collision just enough to remove overlap
      player.position.add(deltaPosition);

      let magnitude = player.worldVelocity.dot(collision.normal);

      let velocityAdjustment = collision.normal.clone().multiplyScalar(magnitude)

      player.applyWorldDeltaVelocity(velocityAdjustment.negate())
    }
  }

  detectGhostCollisions(player, world) {
    this.ghosts.forEach((ghost) => {
        const distance = player.position.distanceTo(ghost.mesh.position);

        // Set a collision threshold based on your models' sizes
        const collisionThreshold = 1.0;

        if (distance < collisionThreshold) {
            this.handlePlayerDeath(player, world);
        }
    });
  }

  handlePlayerDeath(player, world) {
    // Prevent repeated death handling
    if (player.isDead) return;
    player.isDead = true; // Set a flag to indicate the player has died

    // Disable player controls
    player.disableControls(); 

    // Exit pointer lock to release the mouse cursor
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }

    // Show the "You Died" popup
    player.youDiedText.style.display = 'block';
    player.youDiedText.style.cursor = 'pointer'; // Set cursor to pointer for the popup

    console.log('Game Over');

    // Play death sounds using the world's listener
    const deathSound = new THREE.Audio(world.listener); // Attach the sound to the world's listener

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(evilLaugh, function(buffer) {
        deathSound.setBuffer(buffer);
        deathSound.setVolume(0.99);
        deathSound.play();
    });

    // Ensure the event listener is only added once
    if (!player.youDiedText.hasAttribute('data-restart-bound')) {
        player.youDiedText.addEventListener('click', () => {
            window.location.reload(); // Simple way to restart the game
        });

        // Mark that the event listener has been added
        player.youDiedText.setAttribute('data-restart-bound', 'true');
    }
}


  addCollisionHelper(block) {
    const blockMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
    blockMesh.position.copy(block);
    this.helpers.add(blockMesh)
  }

  addContactPointHelper(point) {
    const contactMesh = new THREE.Mesh(contactGeometry, contactMaterial);
    contactMesh.position.copy(point);
    this.helpers.add(contactMesh);
  }

  pointInPlayerBoundingCylinder(playerPoint, player) {
    const deltaX = playerPoint.x - player.position.x;
    const deltaY = playerPoint.y - (player.position.y - (player.height / 2));
    const deltaZ = playerPoint.z - player.position.z;

    const radiusSqd = deltaX**2 + deltaZ**2;

    // Check if contant point is inside the player cylinder
    return (Math.abs(deltaY) < player.height / 2) && (radiusSqd < player.radius**2)

  }

}
