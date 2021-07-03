import { Model, NeuralNetwork } from 'reimprovejs/dist/reimprove';
import { Random } from 'random-js';

import { AvailableAgentAction } from './AgentFactory';

const rng = new Random(Random.browserCrypto);

export const createNetwork = (maxAgents, maxFood) => {
  const baseInputShape =
    (2 * maxAgents) +   // Inputs for each Agent's current postion (x,y)
    (maxAgents) +       // Inputs for each Agent's current action
    (2 * maxAgents) +   // Inputs for position (x,y) of each Agent's target
    (maxAgents) +       // Inputs for each Agent's speed
    (2 * maxFood) +     // Inputs for the position of each Food resource
    6;                  // Inputs for the specific agent's self-identity (position/action/etc.)

  const numActions = maxFood; // The network outputs a given food index the Agent to should go for
  const finalInputShape = (2 * baseInputShape) + numActions;

  const network = new NeuralNetwork();
  network.InputShape = [ finalInputShape ];
  network.addNeuralNetworkLayers([
    { type: 'dense', units: 32, activation: 'relu' },
    { type: 'dense', units: numActions, activation: 'softmax' }
  ]);

  return network;
};

export const createModel = (network) => {
  const modelFitConfig = {
    epochs: 1,
    stepsPerEpoch: 16
  };

  const model = Model.FromNetwork(network, modelFitConfig);
  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  return model;
};

export const createTeacher = (academy) => {
  const teacherConfig = {
    lessonsQuantity: 10000,
    lessonLength: 100,
    lessonsWithRandom: 0,
    epsilon: 1,
    epsilonDecay: 0.995,
    epsilonMin: 0.05,
    gamma: 0.9,
  };

  const t = academy.addTeacher(teacherConfig);
  //academy.OnLessonEnded(t, (tc, l) => {
    //const tcObject = academy.teachers.get(tc);
    //console.log(tc, 'state1', tcObject.State);
    //console.log('OnLessonEnded', tc, l);
  //});
  //academy.OnLearningLessonEnded(t, (tc) => {
    //const tcObject = academy.teachers.get(tc);
    //console.log(tc, 'state2', tcObject.State);
    //console.log('OnLearningLessonEnded', tc);
  //});

  //return academy.addTeacher(teacherConfig);
  return t;
};

export const createNeuralAgent = (academy, network) => {
  const agentConfig = {
    model: createModel(network),
    agentConfig: {
      memorySize: 500,
      batchSize: 32,
      temporalWindow: 1
    }
  };

  return academy.addAgent(agentConfig);
};

export const createNeuralAgentFromModel = (academy, model) => {
  const modelFitConfig = {
    epochs: 1,
    stepsPerEpoch: 16
  };

  const newModel = new Model({
    name: rng.uuid4(),
    layers: [ ...model.layers ]
  }, modelFitConfig);

  newModel.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
  newModel.model.setWeights(model.model.getWeights());

  const agentConfig = {
    model: newModel,
    agentConfig: {
      memorySize: 500,
      batchSize: 128,
      temporalWindow: 1
    }
  };

  return academy.addAgent(agentConfig);
};

export const createNewAgentBrain = (academy, network) => {
  const pTeacher = createTeacher(academy);
  const agent = createNeuralAgent(academy, network);

  academy.assignTeacherToAgent(agent, pTeacher);

  return [ pTeacher, agent ];
};

export const createDerivedAgentBrain = (agentBrain, academy, network) => {
  const [ , nAgent ] = agentBrain;
  const oldAgent = academy.agents.get(nAgent);
  const newAgent = createNeuralAgentFromModel(academy, oldAgent.model.model);

  let pTeacher;
  academy.teachers.forEach( (t, id) => {
    if (pTeacher) return;

    if (t.agents.size === 0) {
      t.currentLessonLength = t.currentLessonLength < 25 ? 0 : t.currentLessonLength - 25;
      pTeacher = id;
    }
  });
  pTeacher = pTeacher || createTeacher(academy);

  academy.assignTeacherToAgent(newAgent, pTeacher);

  return [ pTeacher, newAgent ];
};

const mapAgentActionToInput = (action) => {
  switch(action) {
    case AvailableAgentAction.FIND_FOOD:
      return 0;
    case AvailableAgentAction.EAT_FOOD:
      return 1;
    case AvailableAgentAction.WAIT:
      return 2;
    case AvailableAgentAction.THINKING:
      return 4;
    case AvailableAgentAction.LAY_EGG:
      return 5;
    case AvailableAgentAction.FERTILIZE_EGG:
      return 6;
    default:
      return -1;
  }
};

export const worldStateToInputs = (world, config, agentId) => {
  const MAX_AGENTS = config.world.maxAgents;
  const MAX_FOOD = config.world.maxFood;

  const agentPosList = [];
  const agentActionList = [];
  const agentActionTargetList = [];
  const agentSpeedList = [];
  const agentSelfIdentity = [];

  for (let i = 0; i < MAX_AGENTS; i++) {
    const foundAgent = world.agents[i];

    if (foundAgent) {
      agentPosList.push(foundAgent.position.x);
      agentPosList.push(foundAgent.position.y);
      agentActionList.push(mapAgentActionToInput(foundAgent.attemptedAction.type));
      agentSpeedList.push(foundAgent.speed);

      if (foundAgent.id === agentId) {
        agentSelfIdentity.push(foundAgent.position.x);
        agentSelfIdentity.push(foundAgent.position.y);
        agentSelfIdentity.push(mapAgentActionToInput(foundAgent.attemptedAction.type));
        agentSelfIdentity.push(foundAgent.speed);
      }

      if (foundAgent.attemptedAction.targetPosition) {
        agentActionTargetList.push(foundAgent.attemptedAction.targetPosition.x);
        agentActionTargetList.push(foundAgent.attemptedAction.targetPosition.y);

        if (foundAgent.id === agentId) {
          agentSelfIdentity.push(foundAgent.attemptedAction.targetPosition.x);
          agentSelfIdentity.push(foundAgent.attemptedAction.targetPosition.y);
        }
      } else {
        agentActionTargetList.push(null);
        agentActionTargetList.push(null);

        if (foundAgent.id === agentId) {
          agentSelfIdentity.push(null);
          agentSelfIdentity.push(null);
        }
      }

    } else {
      agentPosList.push(null);
      agentPosList.push(null);
      agentActionList.push(null);
      agentActionTargetList.push(null);
      agentActionTargetList.push(null);
      agentSpeedList.push(null);
    }
  }

  const foodPosList = [];

  for (let i = 0; i < MAX_FOOD; i++) {
    if (world.food[i]) {
      foodPosList.push(world.food[i].position.x);
      foodPosList.push(world.food[i].position.y);
    } else {
      foodPosList.push(null);
      foodPosList.push(null);
    }
  }

  return [
    ...agentSelfIdentity,
    ...agentPosList,
    ...agentActionList,
    ...agentActionTargetList,
    ...agentSpeedList,
    ...foodPosList,
  ];
};
