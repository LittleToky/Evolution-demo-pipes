import React from 'react';
import './App.css';
import {useState, useEffect} from 'react';
import { Stage, Container } from '@inlet/react-pixi';
import Tile from './components/Tile';

interface RectangleProps {
  x: number
  y: number
  width: number
  height: number
  color: number
}

function App() {
  const [data, setData] = useState([
    '┛┃╻┗╺╺┏╻',
    '┣╹╺╋┫┓┃╹',
    '┏┏┓┏━╻━━',
    '╹┳┳╻╹━┣┛',
    '━╻┻┣╻┳┣╺',
    '┏┓┃┓┫┻╹╺',
    '┗┳┳┓┛╋┓━',
    '╻┗┓╺╸┗━┏'
  ]);

  // ┏━╸┏╸╻┏╸
  // ┣╸╺╋┳┛┃╻
  // ┗┓┏┛┃╻┃┃
  // ╻┣┫╻╹┃┣┛
  // ┃╹┣┫╻┣┻╸
  // ┗┓┃┗┻┫╻╻
  // ┏┫┣┓┏╋┛┃
  // ╹┗┛╹╹┗━┛

  // type Cell =
  //   '┛' | '┗' | '┏' | '┓' |
  //   '┃' | '━' |
  //   '╻' | '╸' | '╹' | '╺' |
  //   '┫' | '┻' | '┣' | '┳' |
  //   '╋' ;

  const [preparedData, setPreparedData] = useState<any[]>([]);

  const dict: any = {
    '┛': {
      'image': 'angle',
      'rotate': 0,
      'turnTo': '┗',
    },
    '┗': {
      'image': 'angle',
      'rotate': 90,
      'turnTo': '┏',
    },
    '┏': {
      'image': 'angle',
      'rotate': 180,
      'turnTo': '┓',
    },
    '┓': {
      'image': 'angle',
      'rotate': 270,
      'turnTo': '┛',
    },

    '┃': {
      'image': 'two_sides',
      'rotate': 0,
      'turnTo': '━',
    },
    '━': {
      'image': 'two_sides',
      'rotate': 90,
      'turnTo': '┃',
    },

    '╻': {
      'image': 'one_side',
      'rotate': 0,
      'turnTo': '╸',
    },
    '╸': {
      'image': 'one_side',
      'rotate': 90,
      'turnTo': '╹',
    },
    '╹': {
      'image': 'one_side',
      'rotate': 180,
      'turnTo': '╺',
    },
    '╺': {
      'image': 'one_side',
      'rotate': 270,
      'turnTo': '╻',
    },

    '┫': {
      'image': 'three_sides',
      'rotate': 0,
      'turnTo': '┻',
    },
    '┻': {
      'image': 'three_sides',
      'rotate': 90,
      'turnTo': '┣',
    },
    '┣': {
      'image': 'three_sides',
      'rotate': 180,
      'turnTo': '┳',
    },
    '┳': {
      'image': 'three_sides',
      'rotate': 270,
      'turnTo': '┫',
    },

    '╋': {
      'image': 'four_sides',
      'rotate': 0,
      'turnTo': '╋',
    }
  };

  useEffect(() => {
    setPreparedData(data.reduce((acc: any[], line: string, i: number) => ([
      ...acc,
      line.split('').map((cell: string, j: number) => dict[cell])
    ]), []));
  }, [data]);

  useEffect(() => {
    console.log('preparedData', preparedData);
  }, [preparedData]);

  const handleMouseDown = (i: number, j: number) => {
    const nextCell = dict[preparedData[i][j].turnTo];
    setPreparedData(preparedData.map((line: any[], l: number) => 
      line.map((cell: any, c: number) => 
        (i === l) && (j === c)
          ? nextCell
          : cell
        )
      )
    );
  };

  return (
    <div className="App">
      <Stage
        width={900}
        height={900}
        options={{backgroundColor: 0xffffff }}>
        <Container x={0} y={0}>
          {preparedData.map((line: any[], i) => 
            line.map((cell: any, j: number) => (
              <Tile
                cell={cell}
                i={i}
                j={j}
                key={`${i}-${j}-cell`}
                handleMouseDown={handleMouseDown}
              />
            ))
          )}
        </Container>
      </Stage>
    </div>
  );
}

export default App;
