import React from 'react';
import { useState, useEffect } from 'react';
import { Sprite } from '@inlet/react-pixi';

const tileSize = 30;

const Tile = (props:any) => {

  const [alive, setAlive] = useState(false);

  useEffect(() => {
    setAlive(props.liveMap[props.i][props.j]);
  },[props]);
  // here I use two sprites just because I supouse we will need it to do beautiful animations and avoid blinking on image onload
  return (
    <>
      <Sprite
        alpha={1}
        image={`tiles/${props.cell.image}.svg`}
        anchor={0.5}
        height={tileSize}
        width={tileSize}
        interactive={true}
        x={(props.j + 1) * tileSize}
        y={(props.i + 1) * tileSize}
        rotation={props.cell.rotate * Math.PI / 180} 
        pointerdown={() => props.handleMouseDown(props.i, props.j)}
        />
      <Sprite
        alpha={alive ? .2 : 0}
        image={`tiles/${props.cell.image}_live.svg`}
        anchor={0.5}
        height={tileSize}
        width={tileSize}
        interactive={true}
        x={(props.j + 1) * tileSize}
        y={(props.i + 1) * tileSize}
        rotation={props.cell.rotate * Math.PI / 180} 
        pointerdown={() => props.handleMouseDown(props.i, props.j)}
        />
    </>
  );
}

export default Tile;