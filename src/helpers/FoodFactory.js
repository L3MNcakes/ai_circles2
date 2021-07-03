import * as Victor from 'victor';
import { Random } from 'random-js'

const rng = new Random(Random.browserCrypto);

const getRandomPosition = (width, height) => {
  const PAD = 50;

  return new Victor(
    rng.integer(PAD, width - PAD),
    rng.integer(PAD, height - PAD)
  );
};

export const createRandomFood = (
  worldWidth,
  worldHeight,
  radius
) => ({
  id: rng.uuid4(),
  position: getRandomPosition(worldWidth, worldHeight),
  radius: radius,
  isEaten: false,
});
