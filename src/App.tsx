import React from "react";
import "./App.css";
import { useState, useEffect } from "react";
import { Stage, Container } from "@inlet/react-pixi";
import Tile from "./components/Tile";
import { Cell, Vector2, dataToCell, getNeighbourCellData } from "./logic";
import { terminateWorker, launchWorker, sendMessage } from "./logic/worker.js";

function App() {
  const [data, setData] = useState([""]); // data almost like it comes from server
  const [preparedData, setPreparedData] = useState<Cell[][]>([[]]); // turn data in object with all additional data
  const [liveMap, setLiveMap] = useState<Boolean[][]>([[]]); // table of same size as preparedData - shows alive cells (connected to currently selected)
  const [level, setLevel] = useState(1); // level number to request on bext <<reset>>
  const [loading, setLoading] = useState(true); // don't show sprites while data is not ready
  const [win, setWin] = useState(null); // last received pwd
  const [winLevel, setWinLevel] = useState(1); // number of level where last pwd received
  const tileSize = 30;
  const [size, setSize] = useState([tileSize * 9, tileSize * 10]); // canvas size
  const [pending, setPending] = useState(false); //
  const [readyToVerify, setReadyToVerify] = useState(false); // block <<verify>> at list while there are not alive cells i.e not connected
  const [requestQueue, setRequestQueue] = useState([]);

  useEffect(() => {
    const message = requestQueue[0];
    if (!pending && message) {
      setPending(true);
      setRequestQueue(requestQueue.splice(1));
      sendMessage(message);
    }
  }, [pending, requestQueue]);

  useEffect(() => {
    // check if all cells are alive
    setReadyToVerify(liveMap.every((line) => line.every((alive) => alive)));
  }, [liveMap]);

  useEffect(() => {
    if (preparedData.length === 1) {
      // initial game data or after reset;
      let newLiveMap = Array(data.length)
        .fill(1)
        .map(() => Array(data[0].length).fill(false));
      const newPreparedData = data.reduce(
        (acc: Cell[][], line: string, i: number) => {
          return [
            ...acc,
            line
              .split("")
              .map((cell: string, j: number) => dataToCell(i, j, cell)),
          ];
        },
        []
      );

      setLiveMap(newLiveMap);
      setPreparedData(newPreparedData);
    } else {
      // this map came after we turned tile,
      // we should check if it corresponds preparedDat
      if (data.length === 1) return;
      preparedData.map((line, i) =>
        line.map((cell, j) => cell.self !== data[i][j])
      );
      // const linesFromState = preparedData.map((line) =>
      //   line.map((cell) => cell.self).join("")
      // );
      if (
        preparedData.find((line, i) =>
          line.find((cell, j) => cell.self !== data[i][j])
        )
      ) {
        // console.log(data);
        // console.log(linesFromState);
        resetData();
        sendMessage({ message, map });
      }
      // else {
      //   console.log('checked');
      // }
    }
  }, [data]);

  useEffect(() => {
    setLoading(false);
  }, [preparedData]);

  useEffect(() => {
    launchWorker(onMessage, level);
    return () => {
      resetData();
      terminateWorker();
    };
  }, []);

  const onMessage = (message) => {
    if (message.startsWith("map:")) {
      // set game data
      let newData = message
        .split("\n")
        .slice(1)
        .filter((line) => line !== "");
      setData(newData);
      setSize([
        (newData[0].length + 1) * tileSize,
        (newData.length + 1) * tileSize,
      ]);
      setPending(false);
      // there should be checks for empty lines.
    } else if (message.startsWith("verify:")) {
      //"verify: Correct! Password: JustWarmingUp"
      const temp = message.split("Password: ");
      if (temp[1]) {
        setWin(temp[1]);
        setWinLevel(level);
        setLevel(level + 1);
        resetData();
        sendMessage({ message: `new ${level + 1}` });
      }
    }
  };

  const setAlive = (
    newPreparedData: Cell[][],
    newLiveMap: Boolean[][],
    affectedICoords: Vector2,
    notConnectedNeighbours: Cell[],
    bouncing: Cell[]
  ) => {
    const [affectedJ, affectedI] = affectedICoords;
    const affectedCell = newPreparedData[affectedI][affectedJ];
    newLiveMap[affectedI][affectedJ] = true;

    affectedCell.connections.forEach((vector: Vector2) => {
      const { neighbourCell, alive, responsing, neighbourCoords } =
        getNeighbourCellData(
          affectedICoords,
          newPreparedData,
          newLiveMap,
          vector
        );

      if (neighbourCell) {
        if (!alive) {
          if (responsing)
            setAlive(
              newPreparedData,
              newLiveMap,
              neighbourCell.coords,
              notConnectedNeighbours,
              bouncing
            );
          else {
            notConnectedNeighbours.push(neighbourCell);
            bouncing.push(affectedCell);
          }
        } else if (!responsing) {
          bouncing.push(affectedCell);
        }
      } else {
        const [x, y] = neighbourCoords;
        if (
          x < 0 ||
          x >= preparedData[0].lenght ||
          y < 0 ||
          y >= preparedData.length
        )
          bouncing.push(affectedCell);
      }
    });
  };

  const handleMouseDown = (
    coords: Vector2,
    noTurn: boolean,
    notConnectedNeighbours: Cell[],
    bouncing: Cell[]
  ) => {
    const [j, i] = coords;
    let newPreparedData = [...preparedData];
    let newLiveMap = [...liveMap];

    if (!noTurn) {
      const message = { message: `rotate ${coords[0]} ${coords[1]}` };
      // rotate cell

      const nextCell = dataToCell(i, j, preparedData[i][j].turnTo);
      newPreparedData = preparedData.map((line: Cell[], l: number) =>
        line.map((cell: Cell, c: number) =>
          i === l && j === c ? nextCell : cell
        )
      );
      setRequestQueue([...requestQueue, message]);
    }

    // kill all cells before next calculations
    newLiveMap.forEach((line, iTemp) => {
      line.forEach((cell, jTemp) => {
        newLiveMap[iTemp][jTemp] = false;
      });
    });

    setAlive(
      newPreparedData,
      newLiveMap,
      coords,
      notConnectedNeighbours,
      bouncing
    );

    setPreparedData(newPreparedData);
    setLiveMap(newLiveMap);
  };

  const resetData = () => {
    setLoading(true);
    setPreparedData([[]]);
    setData([""]);
    setLiveMap([[]]);
    setReadyToVerify(false);
  };

  const solve = () => {
    let initialCell: Cell | undefined;
    for (let l = 4; l > 2; l--) {
      // for (let l = 1; l < 2; l++) {
      preparedData.find((line: Cell[], i: number) => {
        initialCell = line.find(
          (cell: Cell, j: number) => cell.connections.length === l
        );
        return !!initialCell;
      });
      if (initialCell) break;
    }

    if (initialCell) {
      const coords = initialCell.coords;
      let notConnectedNeighbours: Cell[] = [];
      let bouncing: Cell[] = [];
      let turned = false;

      handleMouseDown(coords, true, notConnectedNeighbours, bouncing);
      // console.log('notConnectedNeighbours', notConnectedNeighbours);
      notConnectedNeighbours.forEach((cell: Cell) => {
        if (liveMap[cell.coords[1]][cell.coords[0]]) return;
        turned = true;
        handleMouseDown(cell.coords, false, notConnectedNeighbours, bouncing);
      });

      if (!turned) {
        const cell = bouncing[0];
        if (cell) {
          bouncing.forEach((cell) => {
            handleMouseDown(
              cell.coords,
              false,
              notConnectedNeighbours,
              bouncing
            );
            setAlive(
              preparedData,
              liveMap,
              cell.coords,
              notConnectedNeighbours,
              bouncing
            );
          });
        } else {
          // solver is not ready yet
          // there should be rest of it
        }
      }
    }
  };

  const reset = () => {
    resetData();
    sendMessage({ message: `new ${level}` });
  };

  return (
    <div className="App">
      <div className={`stage-wrapper${pending ? " disabled" : ""}`}>
        <Stage
          width={size[0]}
          height={size[1]}
          options={{ backgroundColor: 0xffffff }}
        >
          <Container x={0} y={0}>
            {!loading &&
              preparedData.map((line: Cell[], i) =>
                line.map((cell: Cell, j: number) => (
                  <Tile
                    tileSize={tileSize}
                    cell={cell}
                    liveMap={liveMap}
                    i={i}
                    j={j}
                    key={`${i}-${j}-cell`}
                    handleMouseDown={() =>
                      handleMouseDown([j, i], false, [], [])
                    }
                  />
                ))
              )}
          </Container>
        </Stage>
      </div>
      <div className="side-panel">
        <div className="level-select">
          select level:
          <br />
          <p onClick={() => setLevel(level - 1 || 1)} className="button">
            -
          </p>
          {level}
          <p className="button" onClick={() => setLevel(level + 1)}>
            +
          </p>
        </div>
        {win && (
          <>
            <div>last win level: {winLevel}</div>
            <div>password: {win}</div>
          </>
        )}
        <div onClick={solve} className={`button${pending ? " disabled" : ""}`}>
          solve
        </div>
        <div
          onClick={() => sendMessage({ message: `verify` })}
          className={`button${readyToVerify ? "" : " disabled"}`}
        >
          verify
        </div>
        <div onClick={reset} className="button">
          reset
        </div>
      </div>
    </div>
  );
}

export default App;
