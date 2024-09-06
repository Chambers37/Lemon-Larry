import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export function createUI(world, sun, player) {
  const gui = new GUI();
  const width = world.size.width;

  // World Settings
  const worldFolder = gui.addFolder('Wold Settings');
    // worldFolder.add(world.size, 'width', 5, 100, 1).name('Width');
    worldFolder.add(world.size, 'wallHeight', 1, 10, 1).name('Wall Height');  
    worldFolder.add(world, 'sphereChance', 0, 100, 1).name('Sphere Chance %');
  
  // Sun Settings
  const sunFolder = gui.addFolder('Sun Settings');
  sunFolder.add(sun.position, 'x', -.5*width, 1.5*width, 1).name('Sun X Position');
  sunFolder.add(sun.position, 'y', 0, 50).name('Sun Y Height');
  sunFolder.add(sun.position, 'z', -.5*width, 1.5*width, 1).name('Sun Z Position');
  
  sunFolder.add(sun, 'intensity', 0, 10000, 1).name('Sun Intensity');
  
  sunFolder.add(sun, 'distance', 0, 1000).name('Sun Distance');
  
  sunFolder.add(sun, 'castShadow').name('Cast Shadow');
  
  sunFolder.open();
  
  // Player Settings
  const playerFolder = gui.addFolder('Player Settings');
    playerFolder.add(player, 'maxSpeed', 0, 10, .1).name('Max Speed')
    playerFolder.add(player.position, 'y', 0, 20, 1).name('Player Y Height');
    playerFolder.add(player.cameraHelper, 'visible').name('Show Camera Helper');
    playerFolder.add(player.boundsHelper, 'visible').name('Show Bounds Helper');

  gui.onChange(() => {
    world.generateBlocks();
    world.generateMeshes();
  });
}