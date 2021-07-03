import { worldStateToInputs } from './AgentBrain';

const AcademyQueueState = {
  READY: 'READY',
  PROCESSING: 'PROCESSING',
  ERROR: 'ERROR',
};

export class AcademyQueue {
  constructor(academy) {
    this.academy = academy;
    this.agentQueue = new Set();
    this.state = AcademyQueueState.READY;
    this.IsAcademyLearning = false;
  }

  queueAgent(agentId) {
    this.agentQueue.add(agentId);
  }

  isAcademyLearning() {
    let isLearning = false;

    this.academy.teachers.forEach( teacher => {
      if (teacher.State > 0) {
        isLearning = true;
      }
    });

    this.IsAcademyLearning = isLearning;

    return isLearning;
  }

  process(worldState, configState, onComplete, onError) {
    if (this.state === AcademyQueueState.READY) {
      const agentIterator = this.agentQueue.values();
      const nextAgent = agentIterator.next().value;
      const agent = worldState.agents.find( a => a.id === nextAgent );

      if (!agent) {
        this.agentQueue.delete(nextAgent);
        return;
      }

      if (agent.attemptedAction.type !== 'THINKING') {
        console.log('processing for agent who is: ', agent.attemptedAction.type);
      }

      if (this.isAcademyLearning()) {
        return;
      }

      this.state = AcademyQueueState.PROCESSING;

      const [ teacher, nAgent ] = agent.brain;
      const inputs = worldStateToInputs(worldState, configState, agent.id);

      this.academy.step({
        teacherName: teacher,
        agentsInput: inputs
      }).then( output => {
        const guess = output.get(nAgent);

        let guessSuccess;

        if (guess === configState.world.maxFood) {
          this.academy.addRewardToAgent(nAgent, 0.1);
          guessSuccess = true;
        } else if (worldState.food[guess] && !worldState.food[guess].isEaten) {
          this.academy.addRewardToAgent(nAgent, 0.75);
          guessSuccess = true;
        } else {
          this.academy.addRewardToAgent(nAgent, -0.75);
          guessSuccess = false;
        }

        onComplete(agent, guess, guessSuccess);

        this.agentQueue.delete(nextAgent);
        this.state = AcademyQueueState.READY;
      }).catch( err => {
        console.error(err);
        onError(err);
        this.state = AcademyQueueState.ERROR;
      });
    }
  }
}
