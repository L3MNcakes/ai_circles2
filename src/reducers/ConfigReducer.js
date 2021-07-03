import { useReducer } from 'react';

export const ConfigAction = {
  UPDATE_WORLD: 'UPDATE_WORLD',
  UPDATE_AGENTS: 'UPDATE_AGENTS',
  UPDATE_FOOD: 'UPDATE_FOOD',
};

const ConfigReducer = (state, action) => {
  switch(action.type) {
    case ConfigAction.UPDATE_WORLD:
      return {
        ...state,
        world: {
          ...state.world,
          width: action.payload.width,
          height: action.payload.height,
          tickInterval: action.payload.tickInterval
        }
      };
    case ConfigAction.UPDATE_AGENTS:
      return {
        ...state,
        agents: {
          ...state.agents,
          initNum: action.payload.initNum,
          radius: action.payload.radius,
          minSpeed: action.payload.minSpeed,
          maxSpeed: action.payload.maxSpeed,
          minFoodForEgg: action.payload.minFoodForEgg,
          maxFoodForEgg: action.payload.maxFoodForEgg,
          minLifeSpan: action.payload.minLifeSpan,
          maxLifeSpan: action.payload.maxLifeSpan,
          mutationChance: action.payload.mutationChance,
        }
      };
    case ConfigAction.UPDATE_FOOD:
      return {
        ...state,
        food: {
          ...state.food,
          initNum: action.payload.initNum,
          radius: action.payload.radius,
          spawnEvery: action.payload.spawnEvery,
          spawnAmount: action.payload.spawnAmount,
        }
      };
    default:
      return state;
  }
};

const initialState = {
  world: {
    width: 800,
    height: 600,
    tickInterval: 30 / 1000,
    maxAgents: 20,
    maxFood: 40
  },
  agents: {
    initNum: 5,
    radius: 14,
    minSpeed: 600,
    maxSpeed: 1200,
    minFoodForEgg: 15,
    maxFoodForEgg: 30,
    minLifeSpan: 12,
    maxLifeSpan: 24,
    mutationChance: 0.07,
  },
  food: {
    initNum: 15,
    radius: 10,
    spawnEvery: 750,
    spawnAmount: 10,
  }
};

export const useConfigReducer = () => useReducer(ConfigReducer, initialState);
