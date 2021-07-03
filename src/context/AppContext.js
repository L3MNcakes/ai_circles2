import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Academy } from 'reimprovejs/dist/reimprove';

import { useAppReducer } from '../reducers/AppReducer';
import { useConfigReducer } from '../reducers/ConfigReducer';
import { useWorldReducer } from '../reducers/WorldReducer';
import { createNetwork } from '../helpers/AgentBrain';
import { AcademyQueue } from '../helpers/AcademyQueue';

export const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
  const [ config, configDispatch ] = useConfigReducer();
  const [ academy ] = useState(new Academy());
  const [ network ] = useState(
    createNetwork(config.world.maxAgents, config.world.maxFood)
  );
  const [ academyQueue ] = useState(new AcademyQueue(academy));

  const ctxServices = {
    appReducer: useAppReducer(),
    configReducer: [ config, configDispatch ],
    worldReducer: useWorldReducer(),
    neuralAcademy: academy,
    neuralNetwork: network,
    academyQueue: academyQueue,
  };

  return (
    <AppContext.Provider value={ctxServices}>
      { children }
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

AppContextProvider.propTypes = {
  children: PropTypes.element,
};
