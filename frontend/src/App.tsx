
import React, { useState, useCallback, useEffect } from 'react';

const GRID_WIDTH = 26;
const GRID_HEIGHT = 100;

const getColumnLabel = (index: number): string => {
  let label = '';
  let num = index;
  while (num >= 0) {
    label = String.fromCharCode(65 + (num % 26)) + label;
    num = Math.floor(num / 26) - 1;
  }
  return label;
};

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
  const [zoom, setZoom] = useState(100);
  const [showSolverDialog, setShowSolverDialog] = useState(false);
  const [solverType, setSolverType] = useState<'ode' | 'pde' | 'coupled' | null>(null);

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
          body: JSON.stringify({ formula: formulaInput, cells: currentCells.map(row => row.map(cell => cell.displayValue)) }),
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
      if (event.target instanceof HTMLInputElement && event.target.classList.contains('formula-input')) {
        return;
      }

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
        case 'Tab':
          event.preventDefault();
          newCol = Math.min(GRID_WIDTH - 1, selectedCell.col + 1);
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

  const cellReference = `${getColumnLabel(selectedCell.col)}${selectedCell.row + 1}`;

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fa]">
      <div className="bg-[#f0f0f0] border-b border-[#c0c0c0] px-3 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-[#2c3e50]">FrankSheets</h1>
          <div className="flex space-x-1">
            <button className="px-3 py-1.5 text-sm hover:bg-[#e0e0e0] rounded" title="New">File</button>
            <button className="px-3 py-1.5 text-sm hover:bg-[#e0e0e0] rounded" title="Edit">Edit</button>
            <button className="px-3 py-1.5 text-sm hover:bg-[#e0e0e0] rounded" title="View">View</button>
            <button className="px-3 py-1.5 text-sm hover:bg-[#e0e0e0] rounded" title="Insert">Insert</button>
            <button className="px-3 py-1.5 text-sm hover:bg-[#e0e0e0] rounded" title="Format">Format</button>
            <button className="px-3 py-1.5 text-sm hover:bg-[#e0e0e0] rounded" title="Tools">Tools</button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-[#c0c0c0] px-3 py-2 flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <button className="p-1.5 hover:bg-[#e8e8e8] rounded" title="Bold">B</button>
          <button className="p-1.5 hover:bg-[#e8e8e8] rounded" title="Italic">I</button>
          <button className="p-1.5 hover:bg-[#e8e8e8] rounded" title="Underline">U</button>
          <div className="w-px h-6 bg-[#d0d0d0] mx-1"></div>
          <button className="p-1.5 hover:bg-[#e8e8e8] rounded" title="Align Left">≡</button>
          <button className="p-1.5 hover:bg-[#e8e8e8] rounded" title="Align Center">≡</button>
          <button className="p-1.5 hover:bg-[#e8e8e8] rounded" title="Align Right">≡</button>
          <div className="w-px h-6 bg-[#d0d0d0] mx-1"></div>
          <button className="p-1.5 hover:bg-[#e8e8e8] rounded" title="Sum">Σ</button>
          <button className="p-1.5 hover:bg-[#e8e8e8] rounded" title="Function">fx</button>
          <div className="w-px h-6 bg-[#d0d0d0] mx-1"></div>
          <button 
            onClick={() => { setSolverType('ode'); setShowSolverDialog(true); }}
            className="px-3 py-1.5 text-sm bg-[#e3f2fd] hover:bg-[#bbdefb] border border-[#90caf9] rounded font-medium" 
            title="ODE Solver (1st & 2nd Order)">
            d/dt
          </button>
          <button 
            onClick={() => { setSolverType('pde'); setShowSolverDialog(true); }}
            className="px-3 py-1.5 text-sm bg-[#e8f5e9] hover:bg-[#c8e6c9] border border-[#81c784] rounded font-medium" 
            title="PDE Solver">
            ∂²/∂x²
          </button>
          <button 
            onClick={() => { setSolverType('coupled'); setShowSolverDialog(true); }}
            className="px-3 py-1.5 text-sm bg-[#fff3e0] hover:bg-[#ffe0b2] border border-[#ffb74d] rounded font-medium" 
            title="Coupled ODE System">
            [A]x'
          </button>
        </div>
      </div>

      <form onSubmit={handleFormulaSubmit} className="bg-white border-b border-[#c0c0c0] px-3 py-2 flex items-center space-x-2">
        <div className="px-3 py-1 bg-[#f5f5f5] border border-[#c0c0c0] rounded text-sm font-mono min-w-[80px] text-center">
          {cellReference}
        </div>
        <input
          type="text"
          value={formulaInput}
          onChange={handleFormulaChange}
          className="formula-input flex-1 px-3 py-1.5 border border-[#c0c0c0] rounded font-mono text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2]"
          placeholder="Enter value or formula (=)"
        />
        <button type="submit" className="px-4 py-1.5 bg-[#4a90e2] hover:bg-[#357abd] text-white text-sm rounded font-medium">
          ✓
        </button>
      </form>

      <div className="flex-1 overflow-auto bg-white">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-20 w-12 h-6 bg-[#e8e8e8] border border-[#c0c0c0] text-xs font-semibold"></th>
                {Array.from({ length: GRID_WIDTH }, (_, i) => (
                  <th key={i} className="sticky top-0 z-10 min-w-[100px] h-6 bg-[#e8e8e8] border border-[#c0c0c0] text-xs font-semibold text-center">
                    {getColumnLabel(i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cells.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <th className="sticky left-0 z-10 w-12 h-7 bg-[#e8e8e8] border border-[#c0c0c0] text-xs font-semibold text-center">
                    {rowIndex + 1}
                  </th>
                  {row.map((cell, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`min-w-[100px] h-7 border border-[#d0d0d0] px-2 text-sm cursor-cell ${
                        selectedCell.row === rowIndex && selectedCell.col === colIndex
                          ? 'ring-2 ring-[#4a90e2] ring-inset bg-white'
                          : 'hover:bg-[#f8f9fa]'
                      }`}
                    >
                      {cell.displayValue}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#f0f0f0] border-t border-[#c0c0c0] px-3 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-white border border-[#c0c0c0] rounded font-semibold">Sheet1</div>
          <button className="text-[#4a90e2] hover:underline">+</button>
        </div>
        <div className="flex items-center space-x-4">
          <span>Average: - | Sum: -</span>
          <div className="flex items-center space-x-2">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="px-2 py-0.5 hover:bg-[#e0e0e0] rounded">-</button>
            <span className="min-w-[45px] text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="px-2 py-0.5 hover:bg-[#e0e0e0] rounded">+</button>
          </div>
        </div>
      </div>

      {showSolverDialog && (
        <SolverDialog
          type={solverType}
          onClose={() => { setShowSolverDialog(false); setSolverType(null); }}
          onSolve={(config) => {
            console.log('Solver config:', config);
            setShowSolverDialog(false);
          }}
        />
      )}
    </div>
  );
}

interface SolverDialogProps {
  type: 'ode' | 'pde' | 'coupled' | null;
  onClose: () => void;
  onSolve: (config: any) => void;
}

function SolverDialog({ type, onClose, onSolve }: SolverDialogProps) {
  const [equation, setEquation] = useState('');
  const [initialConditions, setInitialConditions] = useState('');
  const [timeRange, setTimeRange] = useState('0:0.1:10');
  const [method, setMethod] = useState('rk4');

  const handleSolve = () => {
    onSolve({
      type,
      equation,
      initialConditions,
      timeRange,
      method,
    });
  };

  const getTitle = () => {
    switch (type) {
      case 'ode': return 'ODE Solver (1st & 2nd Order)';
      case 'pde': return 'Partial Differential Equation Solver';
      case 'coupled': return 'Coupled ODE System Solver';
      default: return 'Solver';
    }
  };

  const getEquationPlaceholder = () => {
    switch (type) {
      case 'ode': return "dy/dt = -k*y (or) d2y/dt2 + 2*zeta*wn*dy/dt + wn^2*y = 0";
      case 'pde': return "∂u/∂t = D*∂²u/∂x²";
      case 'coupled': return "dx/dt = A*x + B*y, dy/dt = C*x + D*y";
      default: return 'Enter equation';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-auto">
        <div className="bg-[#f5f5f5] px-4 py-3 border-b border-[#d0d0d0] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2c3e50]">{getTitle()}</h2>
          <button onClick={onClose} className="text-xl text-[#666] hover:text-[#333]">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Differential Equation</label>
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder={getEquationPlaceholder()}
              className="w-full px-3 py-2 border border-[#c0c0c0] rounded font-mono text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2]"
            />
          </div>

          {type !== 'pde' && (
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Initial Conditions</label>
              <input
                type="text"
                value={initialConditions}
                onChange={(e) => setInitialConditions(e.target.value)}
                placeholder={type === 'coupled' ? "x0 = 1, y0 = 0" : "y(0) = 1, y'(0) = 0"}
                className="w-full px-3 py-2 border border-[#c0c0c0] rounded font-mono text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">
              {type === 'pde' ? 'Spatial & Time Range' : 'Time Range (start:step:end)'}
            </label>
            <input
              type="text"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              placeholder="0:0.1:10"
              className="w-full px-3 py-2 border border-[#c0c0c0] rounded font-mono text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Solver Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-[#c0c0c0] rounded text-sm focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2]"
            >
              <option value="rk4">Runge-Kutta 4th Order</option>
              <option value="rk45">Runge-Kutta-Fehlberg (Adaptive)</option>
              <option value="euler">Euler (1st Order)</option>
              <option value="heun">Heun's Method (2nd Order)</option>
              {type === 'pde' && <option value="crank-nicolson">Crank-Nicolson</option>}
              {type === 'pde' && <option value="ftcs">Forward Time Central Space</option>}
              {type === 'ode' && <option value="bdf">Backward Differentiation (Stiff)</option>}
            </select>
          </div>

          {type === 'coupled' && (
            <div className="bg-[#f0f8ff] border border-[#b3d9ff] rounded p-3">
              <p className="text-xs text-[#333] mb-2"><strong>Matrix Input:</strong> Define system as x' = Ax</p>
              <p className="text-xs text-[#666]">Reference cells for matrix A and initial vector x0</p>
            </div>
          )}

          {type === 'ode' && (
            <div className="bg-[#f0fff4] border border-[#b3e6c9] rounded p-3">
              <p className="text-xs text-[#333]"><strong>Supported:</strong> 1st order (dy/dt) and 2nd order (d²y/dt²) ODEs</p>
              <p className="text-xs text-[#666] mt-1">Use variables: t, y, dy (for second order)</p>
            </div>
          )}

          {type === 'pde' && (
            <div className="bg-[#fff8f0] border border-[#ffe6b3] rounded p-3">
              <p className="text-xs text-[#333]"><strong>Boundary Conditions:</strong></p>
              <p className="text-xs text-[#666] mt-1">Specify Dirichlet, Neumann, or periodic boundaries</p>
            </div>
          )}
        </div>

        <div className="bg-[#f5f5f5] px-6 py-3 border-t border-[#d0d0d0] flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[#c0c0c0] rounded hover:bg-[#e8e8e8]"
          >
            Cancel
          </button>
          <button
            onClick={handleSolve}
            className="px-4 py-2 text-sm bg-[#4a90e2] hover:bg-[#357abd] text-white rounded font-medium"
          >
            Solve & Insert Results
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
