import * as Victor from 'victor';

import { AvailableAgentAction } from './AgentFactory';
export const findFood = (agent, world, academy) => {
  const targetFood = world.food.find(f => f.id === agent.attemptedAction.target);

  if (!targetFood || targetFood.isEaten) {
    const [ , nAgent ] = agent.brain;

    academy.addRewardToAgent(nAgent, -1);

    return {
      //...agent,
      id: agent.id,
      attemptedAction: {
        type: AvailableAgentAction.WAIT
      }
    };
  }

  const distanceToTarget = targetFood.position.distance(agent.position);

  if (distanceToTarget <= agent.speed) {
    return {
      //...agent,
      id: agent.id,
      position: targetFood.position.clone(),
      numEaten: agent.numEaten + 1,
      attemptedAction: {
        type: AvailableAgentAction.EAT_FOOD,
        target: targetFood.id,
        targetPosition: targetFood.position
      }
    };
  }

  const diffVector = targetFood.position.clone().subtract(agent.position.clone());
  const diffAngle = diffVector.angle();
  const newPosition = new Victor(
    agent.position.x + (agent.speed * Math.cos(diffAngle)),
    agent.position.y + (agent.speed * Math.sin(diffAngle))
  );

  return {
    //...agent,
    id: agent.id,
    position: newPosition
  };
};
