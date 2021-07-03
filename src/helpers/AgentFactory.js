import * as Victor from 'victor';
import { Random } from 'random-js'

import { createNewAgentBrain, createDerivedAgentBrain } from './AgentBrain';

const rng = new Random(Random.browserCrypto);

export const getRandomPosition = (width, height) => {
  const PAD = 50;

  return new Victor(
    rng.integer(PAD, width - PAD),
    rng.integer(PAD, height - PAD)
  );
};

const getRandomFloat = (min, max, precision) => {
  const num = rng.real(min, max);
  const pow = Math.pow(10, precision);

  return Math.round(num * pow) / pow;
};

export const AvailableAgentAction = {
  FIND_FOOD: 'FIND_FOOD',
  EAT_FOOD: 'EAT_FOOD',
  WAIT: 'WAIT',
  THINKING: 'THINKING',
  PROCESSING_THOUGHTS: 'PROCESSING_THOUGHTS',
  LAY_EGG: 'LAY_EGG',
  FERTILIZE_EGG: 'FERTILIZE_EGG',
  WANDER: 'WANDER',
};

export const createRandomAgent = (
  config,
  academy,
  network,
) => ({
  id: rng.uuid4(),
  position: getRandomPosition(config.world.width, config.world.height),
  color: `#${rng.hex(6)}`,
  radius: config.agents.radius,
  speed: rng.integer(config.agents.minSpeed, config.agents.maxSpeed) / 1000,
  attemptedAction: {
    type: AvailableAgentAction.WAIT
  },
  brain: createNewAgentBrain(academy, network),
  numEaten: 0,
  hasLaidEgg: false,
  ticksAlive: 0,
  foodForEgg: rng.integer(config.agents.minFoodForEgg, config.agents.maxFoodForEgg),
  lifeSpan: getRandomFloat(config.agents.minLifeSpan, config.agents.maxLifeSpan, 4),
  isMutant: false,
  generation: 0,
});

export const createEgg = (
  fromParent
) => ({
  id: rng.uuid4(),
  position: fromParent.position.clone(),
  color: fromParent.color,
  parents: [
    { ...fromParent }
  ]
});

export const hatchEgg = (
  egg,
  config,
  academy,
  network
) => {
  const [ mother, father ] = egg.parents;

  let mutationMultiplier = 1;

  const inheritColor = rng.bool() ? mother.color : father.color;
  const mutateColor = rng.bool(Math.pow(config.agents.mutationChance, mutationMultiplier));
  const newColor = mutateColor ? `#${rng.hex(6)}` : inheritColor;

  if (mutateColor) {
    mutationMultiplier += 1;
    console.log('color mutated');
  }

  const inheritSpeed = rng.bool() ? mother.speed : father.speed;
  const mutateSpeed = rng.bool(Math.pow(config.agents.mutationChance, mutationMultiplier));
  const newSpeed = mutateSpeed ?
    rng.integer(config.agents.minSpeed, config.agents.maxSpeed) / 1000 :
    inheritSpeed;

  if (mutateSpeed) {
    mutationMultiplier += 1;
    console.log('speed mutated');
  }

  const inheritFoodForEgg = rng.bool() ? mother.foodForEgg : father.foodForEgg;
  const mutateFoodForEgg = rng.bool(Math.pow(config.agents.mutationChance, mutationMultiplier));
  const newFoodForEgg = mutateFoodForEgg ?
    rng.integer(config.agents.minFoodForEgg, config.agents.maxFoodForEgg) :
    inheritFoodForEgg;

  if (mutateFoodForEgg) {
    mutationMultiplier += 1;
    console.log('foodForEgg mutated');
  }

  const inheritLifespan = rng.bool() ? mother.lifeSpan : father.lifeSpan;
  const mutateLifespan = rng.bool(Math.pow(config.agents.mutationChance, mutationMultiplier));
  const newLifespan = mutateLifespan ?
    getRandomFloat(config.agents.minLifeSpan, config.agents.maxLifeSpan, 4) :
    inheritLifespan;

  if (mutateLifespan) {
    mutationMultiplier += 1;
    console.log('lifespan mutated');
  }

  const isMutant = mutateColor || mutateSpeed || mutateFoodForEgg || mutateLifespan;
  const generation = Math.max(mother.generation, father.generation) + 1;

  return {
    id: rng.uuid4(),
    position: egg.position.clone(),
    color: newColor,
    radius: config.agents.radius,
    speed: newSpeed,
    attemptedAction: {
      type: AvailableAgentAction.WAIT
    },
    brain: createDerivedAgentBrain(
      rng.bool() ? mother.brain : father.brain,
      academy,
      network
    ),
    numEaten: 0,
    hasLaidEgg: false,
    ticksAlive: 0,
    foodForEgg: newFoodForEgg,
    lifeSpan: newLifespan,
    isMutant: isMutant,
    generation: generation,
  };
};
