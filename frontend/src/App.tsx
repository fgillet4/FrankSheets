
import React, { useState, useCallback, useEffect } from 'react';

const GRID_WIDTH = 5;
const GRID_HEIGHT = 5;

function App() {
  const [cells, setCells] = useState(() => {
    const initialCells: { formula: string; displayValue: string }[][] = [];
    for (let r = 0; r < GRID_HEIGHT; r++) {
      initialCells.push([]);
      for (let c = 0; c < GRID_WIDTH; c++) {
        initialCells[r].push({ formula: '', displayValue: ''});
      }
    }
    return initialCells;
  });
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [formulaInput, setFormulaInput] = useState('');
  const [isEditingFormula, setIsEditingFormula] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setFormulaInput(cells[row][col].formula);
  };

  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulaInput(e.target.value);
  };

  const handleFormulaSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const currentCells = cells.map(row => [...row]);
    const cellToUpdate = currentCells[selectedCell.row][selectedCell.col];

    cellToUpdate.formula = formulaInput;

    if (formulaInput.startsWith('=')) {
      try {
        const response = await fetch(`http://localhost:8000/api/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ formula: formulaInput, cells: currentCells.map(row => row.map(cell => cell.displayValue)) }), // Send display values for calculation
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        cellToUpdate.displayValue = data.result;
      } catch (error) {
        console.error("Failed to calculate:", error);
        cellToUpdate.displayValue = '#ERROR';
      }
    } else {
      cellToUpdate.displayValue = formulaInput;
    }
    setCells(currentCells);
  }, [formulaInput, selectedCell, cells]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      let newRow = selectedCell.row;
      let newCol = selectedCell.col;

      switch (event.key) {
        case 'ArrowUp':
          newRow = Math.max(0, selectedCell.row - 1);
          event.preventDefault();
          break;
        case 'ArrowDown':
          newRow = Math.min(GRID_HEIGHT - 1, selectedCell.row + 1);
          event.preventDefault();
          break;
        case 'ArrowLeft':
          newCol = Math.max(0, selectedCell.col - 1);
          event.preventDefault();
          break;
        case 'ArrowRight':
          newCol = Math.min(GRID_WIDTH - 1, selectedCell.col + 1);
          event.preventDefault();
          break;
        case 'Enter':
          handleFormulaSubmit(event as unknown as React.FormEvent);
          event.preventDefault();
          newRow = Math.min(GRID_HEIGHT - 1, selectedCell.row + 1);
          break;
        default:
          return;
      }
      setSelectedCell({ row: newRow, col: newCol });
      setFormulaInput(cells[newRow][newCol].formula);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, cells, handleFormulaSubmit]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">FrankSheets</h1>
      <form onSubmit={handleFormulaSubmit} className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={formulaInput}
          onChange={handleFormulaChange}
          className="border p-2 rounded w-full font-mono"
          placeholder={`Enter formula for cell ${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`}
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Update
        </button>
      </form>
      <table className="table-auto border-collapse border border-gray-400">
        <tbody>
          {cells.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`border p-2 w-32 h-12 ${selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'bg-blue-200' : ''}`}>
                  {cell.displayValue}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
