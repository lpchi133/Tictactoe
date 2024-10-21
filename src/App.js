import { useState } from "react";

function Square({ value, onSquareClick, isHighLight }) {
  return (
    <button
      style={value === 'X' ? {color: 'blue'} : {color: 'red'}}
      className={isHighLight ? `square highlight` : `square`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ size, squares, xIsNext, onPlay }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares, size)) {
      return;
    }
    let nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, parseInt(i / size), i % size);
  }

  const winnerInf = calculateWinner(squares, size);
  let status = winnerInf
    ? `Winner: ${winnerInf.winner}`
    : `Next player: ${xIsNext ? "X" : "O"}`;

  //check draw
  if (!winnerInf && isBoardFull(squares)) {
    status = "Draw!";
  }

  const board = Array(size)
    .fill()
    .map((r, index) => {
      let row = [];
      for (let i = 0; i < size; i++) {
        let ind = index * size + i;
        row.push(
          <Square
            isHighLight={winnerInf && winnerInf.highlight.includes(ind)}
            key={ind}
            value={squares[ind]}
            onSquareClick={() => handleClick(ind)}
          ></Square>
        );
      }
      return (
        <div className="board-row" key={index}>
          {row}
        </div>
      );
    });

  return (
    <>
      <div className="status">{status}</div>
      {board}
    </>
  );
}

export default function Game() {
  const size = 3;
  const [history, setHistory] = useState([
    { squares: Array(size * size).fill(null), xLocation: 0, yLocation: 0 },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, dx, dy) {
    setHistory([...history.slice(0, currentMove + 1),
      {
        squares: nextSquares,
        xLocation: dx,
        yLocation: dy
      }]);
    setCurrentMove(currentMove + 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  let move = history.map((step, move) => {
    let description;
    if (move === currentMove) {
      description = move === 0 ? 'You are at move #0' : `You are at move #${move} (${step.xLocation}, ${step.yLocation})`;
    } else {
      description = move > 0 ? `Go to move #${move} (${history[move].xLocation}, ${history[move].yLocation})` : "Go to game start";
    }

    return (
      <li key={move}>
        {move === currentMove ? (
          <span onClick={() => jumpTo(move)}>{description}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  if (!isAscending) {
    move.reverse();
  }
  return (
    <div className="game">
      <div className="game-board">
        <Board
          size={size}
          squares={currentSquares}
          xIsNext={xIsNext}
          onPlay={handlePlay}
        />
      </div>
      <div className="game-info">
        <button className="sort-button"
          onClick={() => {
            setIsAscending(!isAscending);
          }} 
        >
          {isAscending ? "Sort Descending" : "Sort Ascending"}
        </button>
        <ol>{move}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares, size) {
  // Number of consecutive squares needed to win
  const winCondition = size >= 5 ? 5 : 3;

  // Create winning lines for the grid size
  const lines = [];

  // Horizontal lines
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      lines.push(Array.from({ length: winCondition }, (_, index) => row * size + col + index));
    }
  }

  // Vertical lines
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winCondition; row++) {
      lines.push(Array.from({ length: winCondition }, (_, index) => (row + index) * size + col));
    }
  }

  // Main diagonal lines
  for (let row = 0; row <= size - winCondition; row++) {
    for (let col = 0; col <= size - winCondition; col++) {
      lines.push(Array.from({ length: winCondition }, (_, index) => (row + index) * size + (col + index)));
    }
  }

  // Anti-diagonal lines
  for (let row = 0; row <= size - winCondition; row++) {
    for (let col = winCondition - 1; col < size; col++) {
      lines.push(Array.from({ length: winCondition }, (_, index) => (row + index) * size + (col - index)));
    }
  }

  // Check for winning lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (squares[line[0]] && line.every(index => squares[index] === squares[line[0]])) {
      return {
        winner: squares[line[0]],
        highlight: line,
      };
    }
  }

  return null;
}

function isBoardFull(squares) {
  return squares.every((square) => square != null);
}
