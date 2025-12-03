
import { Parser } from './Parser.ts';

export class FormulaEvaluator {
  private parser = new Parser();

  public evaluate(formula: string, cells: (string | number)[][]): number | string {
    try {
      return this.parser.parse(formula, cells);
    } catch (error) {
      return `#ERROR: ${error.message}`;
    }
  }
}
