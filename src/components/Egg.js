export const Egg = ({ egg }) => {
  const calcPoints = () => {
    const { position, radius = 5 } = egg;
    const points = [];

    for (let i = 0; i < 4; i++) {
      points.push([
        position.x + (radius * Math.cos(2 * Math.PI * i / 4)),
        position.y + (radius * Math.sin(2 * Math.PI * i / 4))
      ]);
    }

    return points.map( ([x, y]) => `${x},${y}` ).reduce( (acc, val) => `${acc} ${val}` );
  };

  const styles = {
    fill: egg.color,
    stroke: egg.parents.length === 2 ? '#F00' : '#000',
  };

  return (
    <polygon style={styles} points={calcPoints()}></polygon>
  );
};
