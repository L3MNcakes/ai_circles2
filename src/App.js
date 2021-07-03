import { useEffect, useState } from 'react';

import './App.css';

import { useAppContext } from './context/AppContext';
import { WorldContainer } from './containers/WorldContainer';
import { ConfigContainer } from './containers/ConfigContainer';
import { createAgent, createFood, tick } from './actions/WorldActions';
import { WorldAction } from './reducers/WorldReducer';

const App = () => {
  const ctx = useAppContext();

  const { neuralAcademy, neuralTeacher, neuralNetwork, academyQueue } = ctx;
  const [ world, worldDispatch ] = ctx.worldReducer;
  const [ config ] = ctx.configReducer;

  const [ intervalRef, setIntervalRef ] = useState(null);
  const [ lastTick, setLastTick ] = useState(world.tick);

  // Initialize the World
  useEffect( () => {
    neuralAcademy.teachers.forEach( (teacher) => {
      neuralAcademy.agents.forEach( (agent) => {
        teacher.removeStudent(agent);
      });
    });

    neuralAcademy.agents.clear();

    for (let i = 0; i < config.agents.initNum; i++) {
      createAgent(config, neuralAcademy, neuralNetwork, worldDispatch);
    }

    for (let i = 0; i < config.food.initNum; i++) {
      createFood(config, worldDispatch);
    }
  }, [worldDispatch, config, neuralAcademy, neuralNetwork, neuralTeacher]);

  // SetUp Tick Interval
  useEffect( () => {
    const intervalFn = () => {
      //console.log('interval');
      worldDispatch({ type: WorldAction.TICK });
    };

    if (world.isRunning && !intervalRef) {
      const iRef = setInterval(intervalFn, config.world.tickInterval);
      setIntervalRef(iRef);
    } else if(!world.isRunning && intervalRef) {
      clearInterval(intervalRef);
      setIntervalRef(null);
    }
  }, [
    config.world.tickInterval,
    intervalRef,
    world.isRunning,
    worldDispatch
  ])

  // Run Ticks
  useEffect( () => {
    let isLearning = false;
    neuralAcademy.teachers.forEach( t => {
      if (t.State > 0) isLearning = true;
    });

    if (world.tick > 0 && lastTick !== world.tick && !isLearning) {
      tick(world, config, neuralAcademy, neuralNetwork, academyQueue, worldDispatch);
      setLastTick( world.tick );
    }
  }, [world, worldDispatch, lastTick, config, neuralAcademy, neuralTeacher, neuralNetwork, academyQueue])

  return (
    <div className="flex-container-column">
      <div className="flex-item"><WorldContainer /></div>
      <div className="flex-item"><ConfigContainer /></div>
    </div>
  );
}

export default App;
