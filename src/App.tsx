import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import { Stage, Container } from '@inlet/react-pixi';
import Tile from './components/Tile';
import { Cell, Vector2, dataToCell, getNeighbourCellData } from './logic';
import { terminateWorker, launchWorker, sendMessage } from './logic/worker.js'

function App() {
  const [data, setData] = useState(['']);
  const [preparedData, setPreparedData] = useState<Cell[][]>([[]]);
  const [liveMap, setLiveMap] = useState<Boolean[][]>([[]]);
  const [level, setLevel] = useState(2);
  const [loading, setLoading] = useState(true);
  const [win, setWin] = useState(null);
  const [winLevel, setWinLevel] = useState(1);

  useEffect(() => {
    if (preparedData.length === 1) { // initial game data or after reset;
      let newLiveMap = Array(data.length).fill(1).map(() => Array(data[0].length).fill(false));
      const newPreparedData = data.reduce((acc: Cell[][], line: string, i: number) => {
        return [
          ...acc,
          line.split('').map((cell: string, j: number) => dataToCell(i, j, cell))
        ]
      }, []);

      setLiveMap(newLiveMap);
      setPreparedData(newPreparedData);
    } else {
      // this map came after we turned tile,
      // we should check if it corresponds preparedData
      console.log('from server:', data);
      if (data.length === 1) return
      preparedData.map((line, i) => line.map((cell, j) => cell.self !== data[i][j]))
      const linesFromState = preparedData.map(line => line.map(cell => cell.self).join(''));
      if (preparedData.find((line, i) => line.find((cell, j) => cell.self !== data[i][j]))) {
        debugger
      } else {
        console.log('checked');
      }
      
    }
  }, [data]);

  useEffect(() => {
    setLoading(false);
    console.log('preparedData', preparedData);
  }, [preparedData]);

  useEffect(() => {
    launchWorker(onMessage, level);
    return terminateWorker;
  }, []);

  const onMessage = (message) => {
    if (message.startsWith('map:')) { // set game data
      setData(message.split('\n').slice(1));
    } else if (message.startsWith('verify:')) {
      //"verify: Correct! Password: JustWarmingUp"
      const temp = message.split('Password: ');
      if (temp[1]) {
        setWin(temp[1]);
        setWinLevel(level);
        setLevel(level+1);
        setLoading(true);
        sendMessage(`new ${level+1}`);
      } else {
        setWin(null);
        setWinLevel(level);
      }
    } else {
      debugger
    }
  };

  const setAlive = (newPreparedData: Cell[][], newLiveMap: Boolean[][], affectedICoords: Vector2, notConnectedNeighbours: Cell[], bouncing: Cell[]) => {
    const [affectedJ, affectedI] = affectedICoords;
    const affectedCell = newPreparedData[affectedI][affectedJ];
    newLiveMap[affectedI][affectedJ] = true;

    affectedCell.connections.forEach((vector: Vector2) => {
      const {neighbourCell, alive, responsing} = getNeighbourCellData(affectedICoords, newPreparedData, newLiveMap, vector);
      
      if (neighbourCell) {
        if (!alive) {
          
          if (responsing) setAlive(newPreparedData, newLiveMap, neighbourCell.coords, notConnectedNeighbours, bouncing);
          else {
            notConnectedNeighbours.push(neighbourCell);
            bouncing.push(affectedCell);
          }
        }
      }
    });
  };

  const handleMouseDown = (coords: Vector2, noTurn: boolean, notConnectedNeighbours: Cell[], bouncing: Cell[]) => {
    const [j, i] = coords;
    let newPreparedData = [...preparedData];
    let newLiveMap = [...liveMap];

    if (!noTurn) {
      // rotate cell
      sendMessage({message: `rotate ${coords[0]} ${coords[1]}`});
      const nextCell = dataToCell(i, j, preparedData[i][j].turnTo);
      newPreparedData = preparedData.map((line: Cell[], l: number) => 
        line.map((cell: Cell, c: number) => 
          (i === l) && (j === c)
            ? nextCell
            : cell
        )
      );
    }

    // kill all cells before next calculations
    newLiveMap.forEach((line, iTemp) => {
      line.forEach((cell, jTemp) => {
        newLiveMap[iTemp][jTemp] = false;
      });
    });

    setAlive(newPreparedData, newLiveMap, coords, notConnectedNeighbours, bouncing);

    setPreparedData(newPreparedData);
    setLiveMap(newLiveMap);
  };

  const solve = () => {
    let initialCell: Cell | undefined;
    for (let l = 4; l > 2; l--) {
    // for (let l = 1; l < 2; l++) {
      preparedData.find((line: Cell[], i: number) => {
        initialCell = line.find((cell: Cell, j: number) => cell.connections.length === l);
        return !!initialCell
      });
      if (initialCell) break;
    }

    if (initialCell) {
      const coords = initialCell.coords;
      // let newData = preparedData;
      // newData = setAlive(newData, coords[1], coords[0]);
      let notConnectedNeighbours: Cell[] = [];
      let bouncing : Cell[] = [];
      let turned = false;

      handleMouseDown(coords, true, notConnectedNeighbours, bouncing);
      // console.log('notConnectedNeighbours', notConnectedNeighbours);
      notConnectedNeighbours.forEach((cell: Cell) => {
        if (liveMap[cell.coords[1]][cell.coords[0]]) return
        turned = true;
        handleMouseDown(cell.coords, false, notConnectedNeighbours, bouncing);
        //debugger
      });

      if (!turned) {
        console.log(bouncing);
        //debugger
        
        const cell = bouncing[0];
        if (cell) {
          
          bouncing.forEach(cell => {
            handleMouseDown(cell.coords, false, notConnectedNeighbours, bouncing);
            setAlive(preparedData, liveMap, cell.coords, notConnectedNeighbours, bouncing)
          });
        } else {
          //debugger
          const bouncing = [];
          liveMap.forEach((line, i) => {
            line.forEach((isAlive, j) => {
              if (isAlive) {

                preparedData[i][j].connections.forEach((vector: Vector2) => {
                  const {neighbourCell, alive, responsing} = getNeighbourCellData([j, i], preparedData, liveMap, vector);
                  // if (neighbourCell) {
                  //   //
                  // }
                  // const [x, y] = vector;
                  // const [newX, newY] = [j + x, i - y]; // neighbour cell coords 
                  // const neighbourLine = preparedData[newY];
                  // if (neighbourLine && neighbourLine[newX]) {
                  //   // if (!newLiveMap[newY][newX]) {
                  //   //   const neighbourCell = neighbourLine[newX];
                  //   //   const reverseConnection = neighbourCell.connections.find(([xTemp, yTemp]) => (xTemp === -x) && (yTemp === -y))
                      
                  //   //   if (reverseConnection) setAlive(newPreparedData, newLiveMap, newY, newX, notConnectedNeighbours, bouncing);
                  //   //   else {
                  //   //     notConnectedNeighbours.push(neighbourCell);
                  //   //     bouncing.push(affectedCell);
                  //   //   }
                  //   // }
                  // } else {
                  //   //debugger
                  //   if (newX >= 0 && newX < 9 && y >= 0 && y<= 0) {
                  //     debugger
                  //   }
                  // }
                });
              }
            });
          });
        }
      }
    } else {
      debugger
    }

    
  };

  const reset = () => {
    setLoading(true);
    setPreparedData([[]])
    setData(['']);
    setLiveMap([[]]);
    sendMessage({message: `new ${level}`});
  }

  return (
    <div className="App">
      <div className="side-panel">
        <div>select level: <p onClick={() => setLevel(level - 1)}>-</p>{level}<p onClick={() => setLevel(level + 1)}>+</p></div>
        {win && (
          <>
            <div>last win level: {winLevel}</div>
            <div>password: {win}</div>
          </>
        )}
        <div onClick={solve}>solve</div>
        <div onClick={() => sendMessage({message: `verify`})}>verify</div>
        {/* <div onClick={() => sendMessage({message: `map`})}>map</div> */}
        <div onClick={reset}>reset</div>
      </div>
      <div className="stage-wrapper">
        <Stage
          width={900}
          height={900}
          options={{backgroundColor: 0xffffff }}>
          <Container x={0} y={0}>
            {!loading && preparedData.map((line: Cell[], i) => 
              line.map((cell: Cell, j: number) => (
                <Tile
                  cell={cell}
                  liveMap={liveMap}
                  i={i}
                  j={j}
                  key={`${i}-${j}-cell`}
                  handleMouseDown={() => handleMouseDown([j, i], false, [], [])}
                />
              ))
            )}
          </Container>
        </Stage>
      </div>
    </div>
  );
}

export default App;
