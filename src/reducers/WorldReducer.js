import { useReducer } from 'react';

export const WorldAction = {
  ADD_AGENT: 'ADD_AGENT',
  ADD_EGG: 'ADD_EGG',
  ADD_FOOD: 'ADD_FOOD',
  EAT_FOOD: 'EAT_FOOD',
  FERTILIZE_EGG: 'FERTILIZE_EGG',
  LAZY_UPDATE_AGENTS: 'LAZY_UPDATE_AGENTS',
  REMOVE_EGG: 'REMOVE_EGG',
  REPLACE_AGENTS: 'REPLACE_AGENTS',
  RESET: 'RESET',
  SET_LEARNING: 'LEARNING',
  TICK: 'TICK',
  TOGGLE_RUNNING: 'TOGGLE_RUNNING',
  UPDATE_AGENT: 'UPDATE_AGENT',
  UPDATE_AGENTS: 'UPDATE_AGENTS',
  UPDATE_FOOD: 'UPDATE_FOOD',
};

const WorldReducer = (state, action) => {
  switch(action.type) {
    case WorldAction.ADD_AGENT:
      return {
        ...state,
        agents: [
          ...state.agents,
          action.payload
        ]
      };
    case WorldAction.ADD_EGG:
      return {
        ...state,
        eggs: [
          ...state.eggs,
          action.payload
        ]
      };
    case WorldAction.ADD_FOOD:
      return {
        ...state,
        food: [
          ...state.food,
          action.payload
        ]
      };
    case WorldAction.EAT_FOOD:
      const foodIndex = state.food.indexOf(action.payload);

      const newFood = [
        ...state.food.slice(0, foodIndex),
        ...state.food.slice(foodIndex + 1)
      ];

      return {
        ...state,
        food: newFood
      };
    case WorldAction.FERTILIZE_EGG:
      const { targetEgg, agent } = action.payload;
      const eggIndex = state.eggs.indexOf(targetEgg);

      return eggIndex !== -1 ? {
        ...state,
        eggs: [
          ...state.eggs.slice(0, eggIndex),
          {
            ...state.eggs[eggIndex],
            parents: [
              ...state.eggs[eggIndex].parents,
              { ...agent }
            ]
          },
          ...state.eggs.slice(eggIndex + 1)
        ]
      } : state;
    case WorldAction.LAZY_UPDATE_AGENTS:
      const newAgentsState = state.agents.map( agent => {
        const updatesToAgent = action.payload.find( a => a.id === agent.id );

        return updatesToAgent ? {
          ...agent,
          ...updatesToAgent
        } : { ...agent };
      });

      return {
        ...state,
        agents: newAgentsState
      };
    case WorldAction.REMOVE_EGG:
      const eggI = state.eggs.indexOf(action.payload);

      return {
        ...state,
        eggs: [
          ...state.eggs.slice(0, eggI),
          ...state.eggs.slice(eggI+1)
        ]
      };
    case WorldAction.REPLACE_AGENTS:
      //console.log('REPLACE_AGENTS', state, action.payload);

      return {
        ...state,
        agents: action.payload,
        replaced: true
      };
    case WorldAction.RESET:
      return {
        ...initialState
      };
    case WorldAction.SET_LEARNING:
      return {
        ...state,
        isLearning: action.payload
      };
    case WorldAction.TICK:
      return {
        ...state,
        tick: state.tick + 1
      };
    case WorldAction.TOGGLE_RUNNING:
      return {
        ...state,
        isRunning: action.payload ? action.payload : !state.isRunning
      };
    case WorldAction.UPDATE_AGENT:
      const agentIndex = state.agents.findIndex( a => a.id === action.payload.id );

      return agentIndex !== -1 ? {
        ...state,
        agents: [
          ...state.agents.slice(0, agentIndex),
          action.payload,
          ...state.agents.slice(agentIndex + 1)
        ]
      } : state;
    case WorldAction.UPDATE_AGENTS:
      //console.log('UPDATE_AGENTS', state, action.payload);
      const newIds = action.payload.map( a => a.id );
      const keepAgents = state.agents.filter( a => !newIds.includes(a.id) );
      const newState = [ ...keepAgents, ...action.payload ].map( a => {
        const agentInState = state.agents.find( sa => sa.id === a.id );

        return agentInState ? {
          ...a,
          ticksAlive: agentInState.ticksAlive
        } : null;
      }).filter(Boolean);

      return {
        ...state,
        agents: newState,
      };
    case WorldAction.UPDATE_FOOD:
      return {
        ...state,
        food: action.payload
      };
    default:
      return state;
  }
};

const initialState = {
  agents: [],
  eggs: [],
  food: [],
  tick: 0,
  isRunning: false,
  isLearning: false,
};

export const useWorldReducer = () => useReducer(WorldReducer, initialState);
