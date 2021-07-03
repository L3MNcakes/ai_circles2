import { Random } from 'random-js';

import { AvailableAgentAction } from './AgentFactory';

const rng = new Random();

export const hatchEgg = (egg, config) => {
  const [ mother, father ] = egg.parents;

  const baby = {
    id: rng.uuid4(),
    position: egg.position.clone(),
    color: rng.bool() ? mother.color : father.color,
    radius: config.agents.radius,
    speed: config.agents.speed / 1000,
    attemptedAction: {
      type: AvailableAgentAction.WAIT
    },
    brain: rng.bool() ? [ ...mother.brain ] : [ ...father.brain ],
    numEaten: 0,
    hasLaidEgg: false,
    ticksAlive: 0
  };

  return baby;
};
