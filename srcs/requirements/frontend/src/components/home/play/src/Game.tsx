import React, { useEffect, useState, CSSProperties } from 'react';
import Box, { BACKGROUND, PLAYER, BALL } from './box';
import { io, Socket } from 'socket.io-client';
import '../css/Game.css'
import GameOver from './Game-over';

/* size */
const ROW_SIZE = 10;
const COL_SIZE = 20;

let previousMouseY = 0;

/* paddle */
const PADDLE_BOARD_SIZE = 3;
const PADDLE_EDGE_SPACE = 1;

type GameState = {
  player1: number[];
  player2: number[];
  ball: number;
  deltaY: number;
  deltaX: number;
  pause: boolean;
  playerScore: number;
  opponentScore: number;
  playerID: number;
};

const InitialState = (): GameState => {
  const board = [...Array(PADDLE_BOARD_SIZE)].map((_, pos) => pos);
  return {
    player1: board.map((x) => x * COL_SIZE + PADDLE_EDGE_SPACE),
    player2: board.map((x) => (x + 1) * COL_SIZE - (PADDLE_EDGE_SPACE + 1)),
    ball: Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE,
    deltaX: -1,
    deltaY: -COL_SIZE,
    playerScore: 0,
    opponentScore: 0,
    pause: true,
    playerID: 0,
  };
};

interface GameProps {
  changeComponent: (component: string) => void;
  socket?: Socket;
  opponentID: string | number;
  gameMode: string;
}

const Game: React.FC<GameProps> = ({ changeComponent, socket, opponentID, gameMode}) => {
  const [state, setState] = useState<GameState>(InitialState());

  useEffect(() => {
    console.log("client side: joining a room");
    socket?.emit('join-room', {Mode: gameMode, opponentid: opponentID});// pass the game mode as well

    return () => {
      socket?.emit("GameOver");
    };
  }, []);

  const resetGame = () => {
    setState(InitialState());
  };

  const topbottomEdge = (pos: number) =>
    pos < COL_SIZE + 1 || // Ball touches top edge
    pos >= (ROW_SIZE - 1) * COL_SIZE - 1;

  socket?.on('gameState', (gameState: GameState) => {
    console.log("client side event: gameState");
    setState(gameState);
  });

  socket?.on('start', (_playerID: number) => {
    console.log("client side event: start with id of: ", _playerID);
    setState((prevState) => ({
      ...prevState,
      pause: false,
      playerID: _playerID,
    }));
  });

  socket?.on('pause', () => {
    console.log("client side event: pause");
    setState((prevState) => ({
      ...prevState,
      pause: true,
    }));
  });

  socket?.on('game-over', () => {
    console.log("client side event: game-over");
    resetGame();
    changeComponent("GameOver");
  });

  socket?.on('updateBallPosition', (gameState: GameState) => {
    // console.log("client side event: updateBallPosition ", socket.id);
    setState((prevState) => ({
      ...prevState,
      deltaX: gameState.deltaX,
      deltaY: gameState.deltaY,
      ball: gameState.ball,
      playerScore: gameState.playerScore,
      opponentScore: gameState.opponentScore,
    }));
  });

  socket?.on('move-paddles', (gameState: GameState) => {
    // console.log("client side event: moving paddles");
    setState((prevState) => ({
      ...prevState,
      player1: gameState.player1,
      player2: gameState.player2,
    }));
  });

  const moveBoard = (playerBoard: number[], isUp: boolean) => {
    const playerEdge = isUp ? playerBoard[0] : playerBoard[PADDLE_BOARD_SIZE - 1];
    const deltaY = isUp ? -COL_SIZE : COL_SIZE;

    if (!topbottomEdge(playerEdge)) {
      return playerBoard.map((x) => x + deltaY);
    }

    return playerBoard;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (state.pause)
      return ;
    const container = document.getElementById("game");
    let movedPlayer: number[] | null = null;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const mouseY = event.clientY - containerRect.top;
      let playerBoard;
      if (state.playerID === 1)
        playerBoard = state.player1;
      else
        playerBoard = state.player2;
      const mouseYDifference = mouseY - previousMouseY;
      const isUp = mouseYDifference < 0;

      // console.log("going up?: ", isUp, " with middle position of: ", mouseYDifference," , " , mouseY);
      previousMouseY = mouseY;
      movedPlayer = moveBoard(playerBoard, isUp);
    }
    if (movedPlayer !== null) {
      socket?.emit('move-player', {movedPlayer: movedPlayer, playerID: state.playerID});
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);

    };
  }, [handleMouseMove]);

  const board = [...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
    let val = BACKGROUND;
    if (
      state.player1.indexOf(pos) !== -1 ||
      state.player2.indexOf(pos) !== -1
    ) {
      val = PLAYER;
    } else if (state.ball === pos) {
      val = BALL;
    }
    return <Box key={pos} name={val} />;
  });

  const divider = [...Array(ROW_SIZE / 2 + 2)].map((_, index) => <div key={index}>{"|"}</div>);

  return (
    <div id="game" className="outer">
      <div className="style">
        <div className="style">{board}</div>
        <div className="score">{state.playerScore}</div>
        <div className="dividerStyle">{divider} </div>
        <div className="dividerStyle">{state.opponentScore}</div>
      </div>
    </div>
  );
};

export default Game;
