import { useState } from 'react';

import { useAppContext } from '../context/AppContext';
import { updateConfig } from '../actions/ConfigActions';
import { WorldAction } from '../reducers/WorldReducer';
import { createAgent } from '../actions/WorldActions';

export const ConfigContainer = () => {
  const ctx = useAppContext();

  const { neuralAcademy, neuralNetwork } = ctx;
  const [ config, configDispatch ] = ctx.configReducer;
  const [ world, worldDispatch ] = ctx.worldReducer;

  const [ width, setWidth ] = useState(config.world.width);
  const [ height, setHeight ] = useState(config.world.height);
  const [ tickInterval, setTickInterval ] = useState(config.world.tickInterval);

  const [ initAgents, setInitAgents ] = useState(config.agents.initNum);
  const [ agentRadius, setAgentRadius ] = useState(config.agents.radius);
  const [ agentMinSpeed, setAgentMinSpeed ] = useState(config.agents.minSpeed);
  const [ agentMaxSpeed, setAgentMaxSpeed ] = useState(config.agents.maxSpeed);
  const [ agentMinFoodForEgg, setAgentMinFoodForEgg] = useState(config.agents.minFoodForEgg);
  const [ agentMaxFoodForEgg, setAgentMaxFoodForEgg] = useState(config.agents.maxFoodForEgg);
  const [ agentMinLifespan, setAgentMinLifespan ] = useState(config.agents.minLifeSpan);
  const [ agentMaxLifespan, setAgentMaxLifespan ] = useState(config.agents.maxLifeSpan);
  const [ agentMutationChance, setAgentMutationChance ] = useState(config.agents.mutationChance);

  const [ initFood, setInitFood ] = useState(config.food.initNum);
  const [ foodRadius, setFoodRadius ] = useState(config.food.radius);
  const [ foodSpawnEvery, setFoodSpawnEvery ] = useState(config.food.spawnEvery);
  const [ foodSpawnAmount, setFoodSpawnAmount ] = useState(config.food.spawnAmount);

  const wrapperStyles = {
    backgroundColor: '#DDD',
    padding: '5px',
  };

  const rowStyles = {
    width: '900px',
  };

  const itemStyles = {
    margin: '10px auto',
  };

  const onUpdateClick = (event) => {
    event.preventDefault();

    const world = {
      width: parseInt(width),
      height: parseInt(height),
      tickInterval: parseFloat(tickInterval, 10)
    };

    const agents = {
      initNum: parseInt(initAgents),
      radius: parseInt(agentRadius),
      minSpeed: parseInt(agentMinSpeed),
      maxSpeed: parseInt(agentMaxSpeed),
      minFoodForEgg: parseInt(agentMinFoodForEgg),
      maxFoodForEgg: parseInt(agentMaxFoodForEgg),
      minLifeSpan: parseFloat(agentMinLifespan, 10),
      maxLifeSpan: parseFloat(agentMaxLifespan, 10),
      mutationChance: parseFloat(agentMutationChance, 10),
    };

    const food = {
      initNum: parseInt(initFood),
      radius: parseInt(foodRadius),
      spawnEvery: parseInt(foodSpawnEvery),
      spawnAmount: parseInt(foodSpawnAmount)
    };

    updateConfig(
      world,
      agents,
      food,
      { configDispatch, worldDispatch }
    );
  };

  const toggleRunning = (event) => {
    event.preventDefault();

    worldDispatch({ type: WorldAction.TOGGLE_RUNNING });
  };

  const onNextTick = (event) => {
    event.preventDefault();

    worldDispatch({ type: WorldAction.TICK });
  };

  const onNewBloodClick = (event) => {
    event.preventDefault();

    createAgent(config, neuralAcademy, neuralNetwork, worldDispatch);
  };

  return (
    <div className="flex-container-column" style={wrapperStyles}>
      <div className="flex-item flex-container-row" style={rowStyles}>
        <div className="flex-item flex-container-column">
          <div className="flex-item" style={itemStyles}>
            Width:
            <input type="number" onChange={ e => setWidth(e.target.value) } value={width} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Height:
            <input type="number" onChange={ e => setHeight(e.target.value) } value={height} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Tick Interval:
            <input type="number" onChange={ e => setTickInterval(e.target.value) } value={tickInterval} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Min Food For Egg:
            <input type="number" onChange={ e => setAgentMinFoodForEgg(e.target.value) } value={agentMinFoodForEgg} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Max Food For Egg:
            <input type="number" onChange={ e => setAgentMaxFoodForEgg(e.target.value) } value={agentMaxFoodForEgg} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Min Agent Lifespan:
            <input type="number" onChange={ e => setAgentMinLifespan(e.target.value) } value={agentMinLifespan} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Max Agent Lifespan:
            <input type="number" onChange={ e => setAgentMaxLifespan(e.target.value) } value={agentMaxLifespan} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Agent Mutation Chance:
            <input type="number" onChange={ e => setAgentMutationChance(e.target.value) } value={agentMutationChance} />
          </div>
        </div>
        <div className="flex-item flex-container-column">
          <div className="flex-item" style={itemStyles}>
            Starting Agents:
            <input type="number" onChange={ e => setInitAgents(e.target.value) } value={initAgents} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Agent Radius:
            <input type="number" onChange={ e => setAgentRadius(e.target.value) } value={agentRadius} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Agent Min Speed:
            <input type="number" onChange={ e => setAgentMinSpeed(e.target.value) } value={agentMinSpeed} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Agent Max Speed:
            <input type="number" onChange={ e => setAgentMaxSpeed(e.target.value) } value={agentMaxSpeed} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Starting Food:
            <input type="number" onChange={ e => setInitFood(e.target.value) } value={initFood} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Food Radius:
            <input type="number" onChange={ e => setFoodRadius(e.target.value) } value={foodRadius} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Food Spawns Every (ticks):
            <input type="number" onChange={ e => setFoodSpawnEvery(e.target.value) } value={foodSpawnEvery} />
          </div>
          <div className="flex-item" style={itemStyles}>
            Food Spawn Amount:
            <input type="number" onChange={ e => setFoodSpawnAmount(e.target.value) } value={foodSpawnAmount} />
          </div>
        </div>
      </div>
      <div className="flex-item flex-container-row" style={rowStyles}>
        <button className="flex-item" onClick={onUpdateClick}>NEW</button>
        <button className="flex-item" onClick={toggleRunning}>
          { world.isRunning ? 'PAUSE' : 'RESUME' }
        </button>
        <button className="flex-item" onClick={onNextTick} disabled={world.isRunning}>
          STEP NEXT
        </button>
        <button className="flex-item" onClick={onNewBloodClick}>
          NEW BLOOD
        </button>
      </div>
    </div>
  );
};
