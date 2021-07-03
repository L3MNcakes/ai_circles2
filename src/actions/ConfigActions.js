import { ConfigAction } from '../reducers/ConfigReducer';
import { WorldAction } from '../reducers/WorldReducer';

export const updateConfig = (world, agents, food, dispatchers) => {
  const { configDispatch, worldDispatch } = dispatchers;

  worldDispatch({ type: WorldAction.RESET });
  configDispatch({ type: ConfigAction.UPDATE_WORLD, payload: world });
  configDispatch({ type: ConfigAction.UPDATE_AGENTS, payload: agents });
  configDispatch({ type: ConfigAction.UPDATE_FOOD, payload: food });
};
