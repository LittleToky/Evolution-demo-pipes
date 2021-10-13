import React from 'react';
import './App.css';
import {useState, useEffect} from 'react';

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
      'rotate': 0
    },
    '┗': {
      'image': 'angle',
      'rotate': 90
    },
    '┏': {
      'image': 'angle',
      'rotate': 180
    },
    '┓': {
      'image': 'angle',
      'rotate': 270
    },

    '┃': {
      'image': 'two_sides',
      'rotate': 0
    },
    '━': {
      'image': 'two_sides',
      'rotate': 90
    },

    '╻': {
      'image': 'one_side',
      'rotate': 0
    },
    '╸': {
      'image': 'one_side',
      'rotate': 90
    },
    '╹': {
      'image': 'one_side',
      'rotate': 180
    },
    '╺': {
      'image': 'one_side',
      'rotate': 270
    },

    '┫': {
      'image': 'three_sides',
      'rotate': 0
    },
    '┻': {
      'image': 'three_sides',
      'rotate': 90
    },
    '┣': {
      'image': 'three_sides',
      'rotate': 180
    },
    '┳': {
      'image': 'three_sides',
      'rotate': 270
    },

    '╋': {
      'image': 'four_sides',
      'rotate': 0
    }
  };

  useEffect(() => {
    setPreparedData(data.reduce((acc: any[], line: string, i: number) => ([
      ...acc,
      line.split('').map((cell: string, j: number) => dict[cell])
    ]), []));
  }, [data]);

  useEffect(() => {
    debugger
    console.log('preparedData', preparedData);
  }, [preparedData]);

  const handleClick = (i: number, j: number) => {
    debugger
  }

  return (
    <div className="App">
      {preparedData.map((line: any[], i: number) => 
        <div className="line" key={i}>
          {line && line.map && line.map((cell: any, j: number) => (
            <img
              alt=""
              key={`${i}-${j}-cell`}
              src={`tiles/${cell.image}.svg`}
              style={{transform: `rotate(${cell.rotate}deg)`}}
              onClick={() => handleClick(i, j)}/>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
