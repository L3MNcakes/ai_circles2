import * as Victor from 'victor';

import { WorldAction } from '../reducers/WorldReducer';
import {
  AvailableAgentAction,
  createRandomAgent,
  createEgg,
  hatchEgg,
  getRandomPosition
} from '../helpers/AgentFactory';
import { createRandomFood } from '../helpers/FoodFactory';
import { findFood } from '../helpers/AgentDecisions';

export const createAgent = (config, academy, network, dispatcher) => {
  const newAgent = createRandomAgent(
    config,
    academy,
    network
  );

  dispatcher({ type: WorldAction.ADD_AGENT, payload: newAgent });
};

export const createFood = (config, dispatcher) => {
  const newFood = createRandomFood(
    config.world.width,
    config.world.height,
    config.food.radius,
  );

  dispatcher({ type: WorldAction.ADD_FOOD, payload: newFood });
};

const eatFood = (agent, world, academy, dispatcher) => {
  const targetFood = world.food.find(f => f.id === agent.attemptedAction.target);

  if (targetFood && !targetFood.isEaten) {
    const [ , nAgent ] = agent.brain;

    academy.addRewardToAgent(nAgent, 1);

    dispatcher({
      type: WorldAction.EAT_FOOD,
      payload: targetFood,
    });
  }

  return {
    //...agent,
    id: agent.id,
    hasLaidEgg: false,
    attemptedAction: { type: AvailableAgentAction.WAIT }
  };
};

const layEgg = (agent, dispatcher) => {
  const newEgg = createEgg(agent);

  dispatcher({ type: WorldAction.ADD_EGG, payload: newEgg });

  return {
    //...agent,
    id: agent.id,
    hasLaidEgg: true,
    attemptedAction: {
      type: AvailableAgentAction.WAIT
    }
  };
};

const fertilizeEgg = (agent, world, dispatcher) => {
  const targetEgg = world.eggs.find(e => e.id === agent.attemptedAction.target);

  if (!targetEgg || targetEgg.parents.length === 2) {
    return {
      //...agent,
      id: agent.id,
      attemptedAction: {
        type: AvailableAgentAction.WAIT
      }
    };
  }

  const distanceToTarget = targetEgg.position.distance(agent.position);

  if (distanceToTarget <= agent.speed) {
    dispatcher({ type: WorldAction.FERTILIZE_EGG, payload: { targetEgg, agent } });

    return {
      //...agent,
      id: agent.id,
      position: targetEgg.position.clone(),
      hasLaidEgg: true,
      attemptedAction: {
        type: AvailableAgentAction.WAIT
      }
    };
  }

  const diffVector = targetEgg.position.clone().subtract(agent.position.clone());
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

const tickFood = (world, config, dispatcher) => {
  if (world.tick % config.food.spawnEvery === 0) {
    let spawnAmount = config.food.spawnAmount;

    if (spawnAmount + world.food.length > config.world.maxFood) {
      spawnAmount = config.world.maxFood - world.food.length;
    }

    for (let i = 0; i < spawnAmount; i++) {
      createFood(config, dispatcher);
    }
  }
};

const tickEggs = (world, config, academy, network, dispatcher) => {
  const fertilizedEggs = world.eggs.filter( e => e.parents.length === 2 );

  fertilizedEggs.forEach( (egg) => {
    if (world.agents.length < config.world.maxAgents) {
      const newAgent = hatchEgg(
        egg,
        config,
        academy,
        network
      );

      dispatcher({ type: WorldAction.ADD_AGENT, payload: newAgent });
    }

    dispatcher({ type: WorldAction.REMOVE_EGG, payload: egg });
  });

};

export const tickDeath = (world, config, academy, dispatcher) => {
  const newAgents = world.agents.map( agent => {
    const newTicksAlive = agent.ticksAlive + 1;

    if (newTicksAlive > agent.lifeSpan * 1000) {
      const [ teacher, nAgent ] = agent.brain;
      const academyTeacher = academy.teachers.get(teacher);
      const academyAgent = academy.agents.get(nAgent);

      academyTeacher.removeStudent(academyAgent);

      return false;
    }

    return {
      ...agent,
      ticksAlive: newTicksAlive
    };
  }).filter(Boolean);

  dispatcher({ type: WorldAction.REPLACE_AGENTS, payload: newAgents });
};

const agentWait = (agent, world, config) => {
  if (
    agent.numEaten !== 0 &&
    agent.numEaten % agent.foodForEgg === 0 &&
    !agent.hasLaidEgg
  ) {
    const fertilizableEggs = world.eggs.filter( egg => {
      return egg.parents.length === 1 && egg.parents[0].id !== agent.id;
    });

    return fertilizableEggs.length > 0 ? {
      //...agent,
      id: agent.id,
      attemptedAction: {
        type: AvailableAgentAction.FERTILIZE_EGG,
        target: fertilizableEggs[0].id
      }
    } : {
      //...agent,
      id: agent.id,
      attemptedAction: {
        type: AvailableAgentAction.LAY_EGG
      }
    }
  }

  return world.food.length > 0 ? {
    //...agent,
    id: agent.id,
    attemptedAction: {
      type: AvailableAgentAction.THINKING
    }
  } : {
    id: agent.id,
    attemptedAction: {
      type: AvailableAgentAction.WANDER,
      targetPosition: getRandomPosition(config.world.width, config.world.height),
    }
  };
};

const agentWander = (agent) => {
  const targetPosition = agent.attemptedAction.targetPosition.clone();
  const distanceToTarget = targetPosition.distance(agent.position);

  if (distanceToTarget <= agent.speed) {
    return {
      id: agent.id,
      position: targetPosition,
      attemptedAction: {
        type: AvailableAgentAction.WAIT
      }
    };
  }

  const diffVector = targetPosition.clone().subtract(agent.position.clone());
  const diffAngle = diffVector.angle();
  const newPosition = new Victor(
    agent.position.x + (agent.speed * Math.cos(diffAngle)),
    agent.position.y + (agent.speed * Math.sin(diffAngle))
  );

  return {
    id: agent.id,
    position: newPosition
  }
};

const tickAgentActions = (world, config, academy, academyQueue, dispatcher) => {
  const updatedAgents = world.agents.map( agent => {
    switch (agent.attemptedAction.type) {

      case AvailableAgentAction.THINKING:
        academyQueue.queueAgent(agent.id);
        return null;

      case AvailableAgentAction.FIND_FOOD:
        return findFood(agent, world, academy);
      case AvailableAgentAction.EAT_FOOD:
        return eatFood(agent, world, academy, dispatcher);
      case AvailableAgentAction.LAY_EGG:
        return layEgg(agent, dispatcher);
      case AvailableAgentAction.FERTILIZE_EGG:
        return fertilizeEgg(agent, world, dispatcher);
      case AvailableAgentAction.WAIT:
        return agentWait(agent, world, config);
      case AvailableAgentAction.WANDER:
        return agentWander(agent);
      default:
        return null;
    }
  }).filter(Boolean);

  dispatcher({ type: WorldAction.LAZY_UPDATE_AGENTS, payload: updatedAgents });
};

const tickAcademyQueue = (world, config, academyQueue, dispatcher) => {
  academyQueue.process(
    world,
    config,
    (agent, guess, guessSuccess) => {
      if (guessSuccess) {
        const newAction = guess === config.world.maxFood ? {
          id: agent.id,
          attemptedAction: {
            type: AvailableAgentAction.WANDER,
            targetPosition: getRandomPosition(config.world.width, config.world.height),
          }
        } : {
          id: agent.id,
          attemptedAction: {
            type: AvailableAgentAction.FIND_FOOD,
            target: world.food[guess].id,
            targetPosition: world.food[guess].position.clone()
          }
        };

        dispatcher({
          type: WorldAction.LAZY_UPDATE_AGENTS,
          payload: [newAction],
        });
      } else {
        dispatcher({
          type: AvailableAgentAction.LAZY_UPDATE_AGENTS,
          payload: [{
            //...agent,
            id: agent.id,
            attemptedAction: {
              type: WorldAction.WAIT,
            }
          }]
        });
      }
    },
    (error) => {
      dispatcher({ type: WorldAction.TOGGLE_RUNNING, payload: false });
    }
  );
};

export const tick = (world, config, academy, network, academyQueue, dispatcher) => {
  //tickAgents(world, config, academy, dispatcher);
  tickDeath(world, config, academy, dispatcher);
  tickAgentActions(world, config, academy, academyQueue, dispatcher);
  tickAcademyQueue(world, config, academyQueue, dispatcher);
  tickFood(world, config, dispatcher);
  tickEggs(world, config, academy, network, dispatcher);
};

