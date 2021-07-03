import { useAppContext } from '../context/AppContext';
import { Agent } from '../components/Agent';
import { Food } from '../components/Food';
import { Egg } from '../components/Egg';

export const WorldContainer = () => {
  const ctx = useAppContext();
  const [ config ] = ctx.configReducer;
  const [ world ] = ctx.worldReducer;

  const styles = {
    backgroundColor: '#DDD',
  };

  const wrapStyles = {
    width: '100%',
  };

  return (
    <div style={wrapStyles}>
      <svg width={config.world.width} height={config.world.height} style={styles}>
        { world.food.map( (f, i) => (
          <Food key={`f-${i}`} food={f} />
        )) }

        { world.eggs.map( (e, i) => (
          <Egg key={`e-${i}`} egg={e} />
        )) }

        { world.agents.map( (a, i) => (
          <Agent key={`a-${i}`} agent={a} />
        )) }
      </svg>
    </div>
  );
};
