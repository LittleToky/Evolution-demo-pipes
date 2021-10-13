import React from 'react';
import { Sprite, useTick } from '@inlet/react-pixi';

const Tile = (props:any) => {
  return (
    <Sprite
      image={`tiles/${props.cell.image}.svg`}
      anchor={0.5}
      height={50}
      width={50}
      interactive={true}
      x={(props.j + 1) * 50}
      y={(props.i + 1) * 50}
      rotation={props.cell.rotate * Math.PI / 180} 
      pointerdown={() => props.handleMouseDown(props.i, props.j)}
      />
  );
}

export default Tile;