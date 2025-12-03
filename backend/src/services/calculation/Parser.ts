
// A simple parser for arithmetic expressions.
// This will be expanded to handle more complex formulas.

export class Parser {
  public parse(formula: string, cells: (string | number)[][]): number {
    if (formula.startsWith('=')) {
      formula = formula.substring(1);
    }

    // Resolve cell references
    formula = this.resolveCellReferences(formula, cells);

    // Handle functions
    formula = this.handleFunctions(formula, cells);

    // Tokenize the formula into numbers and operators
    const tokens: (string | number)[] = formula.split(/([+\-*\/])/).map(v => v.trim()).filter(v => v !== '');
    for(let i = 0; i < tokens.length; i++) {
        if(!isNaN(Number(tokens[i]))) {
            tokens[i] = Number(tokens[i]);
        }
    }

    // Handle multiplication and division first
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === '*' || tokens[i] === '/') {
        const operator = tokens[i];
        const left = tokens[i - 1] as number;
        const right = tokens[i + 1] as number;
        const result = operator === '*' ? left * right : left / right;
        tokens.splice(i - 1, 3, result);
        i -= 1; // Adjust index after splice
      }
    }

    // Handle addition and subtraction
    let result = tokens[0] as number;
    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i] as string;
      const operand = tokens[i + 1] as number;
      if (operator === '+') {
        result += operand;
      } else if (operator === '-') {
        result -= operand;
      }
    }

    return result;
  }

  private resolveCellReferences(formula: string, cells: (string | number)[][]): string {
    return formula.replace(/[A-Z]+[0-9]+/g, (match) => {
      const col = match.charCodeAt(0) - 65;
      const row = parseInt(match.substring(1)) - 1;
      const cellValue = cells[row][col];
      // If the cell contains a formula, we need to evaluate it first.
      // This is a recursive evaluation, and we need to be careful
      // to avoid circular references.
      if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
        return this.parse(cellValue, cells).toString();
      }
      return cellValue.toString();
    });
  }

  private handleFunctions(formula: string, cells: (string | number)[][]): string {
    return formula.replace(/([A-Z]+)\((.*)\)/, (match, functionName, args) => {
      const argValues = args.split(',').map((arg: string) => {
        arg = arg.trim();
        if (/[A-Z]+[0-9]+:[A-Z]+[0-9]+/.test(arg)) { // Range
          const [start, end] = arg.split(':');
          const startCol = start.charCodeAt(0) - 65;
          const startRow = parseInt(start.substring(1)) - 1;
          const endCol = end.charCodeAt(0) - 65;
          const endRow = parseInt(end.substring(1)) - 1;
          const values: number[] = [];
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              values.push(this.parse(cells[r][c].toString(), cells));
            }
          }
          return values;
        } else { // Single cell or value
          return this.parse(arg, cells);
        }
      });

      switch (functionName) {
        case 'SUM':
          return (argValues.flat() as number[]).reduce((a, b) => a + b, 0).toString();
        case 'CIRCLE_AREA':
          return (Math.PI * Math.pow(argValues[0] as number, 2)).toString();
        case 'POWER':
          return Math.pow(argValues[0] as number, argValues[1] as number).toString();
        case 'SQRT':
          return Math.sqrt(argValues[0] as number).toString();
        case 'SIN':
          return Math.sin(argValues[0] as number).toString();
        case 'COS':
          return Math.cos(argValues[0] as number).toString();
        case 'TAN':
          return Math.tan(argValues[0] as number).toString();
        case 'ASIN':
          return Math.asin(argValues[0] as number).toString();
        case 'ACOS':
          return Math.acos(argValues[0] as number).toString();
        case 'ATAN':
          return Math.atan(argValues[0] as number).toString();
        case 'PI':
          return Math.PI.toString();
        case 'ABS':
          return Math.abs(argValues[0] as number).toString();
        case 'ROUND':
          return (argValues.length === 2 ? (argValues[0] as number).toFixed(argValues[1] as number) : Math.round(argValues[0] as number)).toString();
        case 'LOG':
          return (Math.log(argValues[0] as number) / (argValues.length === 2 ? Math.log(argValues[1] as number) : Math.log(10))).toString();
        case 'LN':
          return Math.log(argValues[0] as number).toString();
        case 'EXP':
          return Math.exp(argValues[0] as number).toString();
        case 'DEGREES':
          return (argValues[0] as number * 180 / Math.PI).toString();
        case 'RADIANS':
          return (argValues[0] as number * Math.PI / 180).toString();
        case 'AVERAGE':
          return ((argValues.flat() as number[]).reduce((a, b) => a + b, 0) / argValues.flat().length).toString();
        case 'MIN':
          return Math.min(...(argValues.flat() as number[])).toString();
        case 'MAX':
          return Math.max(...(argValues.flat() as number[])).toString();
        case 'IF':
          return (argValues[0] ? argValues[1] : argValues[2]).toString();
        case 'AND':
          return argValues.every(Boolean).toString();
        case 'OR':
          return argValues.some(Boolean).toString();
        case 'NOT':
          return (!argValues[0]).toString();
        case 'COUNT':
          return (argValues.flat().filter(val => typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))).length).toString();
        case 'COUNTIF':
          const range = argValues[0] as (string | number)[];
          const criteria = argValues[1];
          return (range.filter(val => {
            if (typeof criteria === 'string' && criteria.startsWith('>=')) {
              return Number(val) >= Number(criteria.substring(2));
            } else if (typeof criteria === 'string' && criteria.startsWith('<=')) {
              return Number(val) <= Number(criteria.substring(2));
            } else if (typeof criteria === 'string' && criteria.startsWith('>')) {
              return Number(val) > Number(criteria.substring(1));
            } else if (typeof criteria === 'string' && criteria.startsWith('<')) {
              return Number(val) < Number(criteria.substring(1));
            } else if (typeof criteria === 'string' && criteria.startsWith('=')) {
              return Number(val) === Number(criteria.substring(1));
            } else {
              return val === criteria;
            }
          }).length).toString();
        case 'ROUNDUP':
          return (argValues.length === 2 ? Math.ceil(argValues[0] as number * Math.pow(10, argValues[1] as number)) / Math.pow(10, argValues[1] as number) : Math.ceil(argValues[0] as number)).toString();
        case 'ROUNDDOWN':
          return (argValues.length === 2 ? Math.floor(argValues[0] as number * Math.pow(10, argValues[1] as number)) / Math.pow(10, argValues[1] as number) : Math.floor(argValues[0] as number)).toString();
        case 'FLOOR':
          return (Math.floor((argValues[0] as number) / (argValues[1] as number)) * (argValues[1] as number)).toString();
        case 'CEILING':
          return (Math.ceil((argValues[0] as number) / (argValues[1] as number)) * (argValues[1] as number)).toString();
        case 'MOD':
          return ((argValues[0] as number) % (argValues[1] as number)).toString();
        case 'FACT':
          const factorial = (n: number): number => (n === 0 || n === 1) ? 1 : n * factorial(n - 1);
          return factorial(argValues[0] as number).toString();
        case 'COMBIN':
          const nCombin = argValues[0] as number;
          const kCombin = argValues[1] as number;
          const fact = (num: number): number => (num === 0 || num === 1) ? 1 : num * fact(num - 1);
          return (fact(nCombin) / (fact(kCombin) * fact(nCombin - kCombin))).toString();
        case 'PERMUT':
          const nPermut = argValues[0] as number;
          const kPermut = argValues[1] as number;
          const factPermut = (num: number): number => (num === 0 || num === 1) ? 1 : num * factPermut(num - 1);
          return (factPermut(nPermut) / factPermut(nPermut - kPermut)).toString();
        default:
          return match; // Or throw an error for unknown functions
      }
    });
  }
}
