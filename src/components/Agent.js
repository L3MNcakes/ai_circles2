import { AvailableAgentAction } from '../helpers/AgentFactory';

export const Agent = ({ agent }) => {
  const styles = {
    opacity: 0.7
  };

  const onAgentClick = (event) => {
    event.preventDefault();

    console.log(agent);
  };

  return (
    <>
      <circle
        onClick={onAgentClick}
        style={styles}
        cx={agent.position.x}
        cy={agent.position.y}
        r={agent.radius}
        fill={agent.color}
        stroke={agent.isMutant ? "#3F3" : "#333"}
        strokeWidth={agent.attemptedAction.type === AvailableAgentAction.WANDER ? '3px' : '1px'}
      />
      <text x={agent.position.x} y={agent.position.y}>{agent.numEaten}</text>
      <text x={agent.position.x} y={agent.position.y + 15}>{agent.generation}</text>
    </>
  );
};
