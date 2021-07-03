export const Food = ({ food }) => {
  const calcPoints = () => {
    const { position, radius } = food;
    const points = [];

    for (let i = 0; i < 6; i++) {
      points.push([
        position.x + (radius * Math.cos(2 * Math.PI * i / 6)),
        position.y + (radius * Math.sin(2 * Math.PI * i / 6))
      ]);
    }

    return points.map( ([x, y]) => `${x},${y}` ).reduce( (acc, val) => `${acc} ${val}` );
  };

  const styles = {
    fill: '#FFF',
    stroke: '#000',
  };

  return (
    <polygon style={styles} points={calcPoints()}></polygon>
  );
};
