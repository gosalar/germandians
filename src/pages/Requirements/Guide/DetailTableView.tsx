import styles from './styles.module.scss';
import type { DetailTable } from './types';

interface DetailTableViewProps {
  table: DetailTable;
  /** The id of the detail part's heading, which names the table. */
  labelledBy: string;
}

/**
 * A small table of facts inside "More detail". The first cell of each row is its row header. Below the
 * phone breakpoint each row becomes a block, and every cell shows its column name beside it.
 */
export default function DetailTableView({ table, labelledBy }: DetailTableViewProps) {
  const [rowHeader, ...columns] = table.columns;

  return (
    <table className={styles.factTable} aria-labelledby={labelledBy}>
      <thead className={styles.factHead}>
        <tr>
          <th scope="col">{rowHeader}</th>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map(([first, ...cells]) => (
          <tr key={first} className={styles.factRow}>
            <th scope="row" data-label={rowHeader} className={styles.factRowHeader}>
              {first}
            </th>
            {cells.map((cell, index) => (
              <td key={columns[index]} data-label={columns[index]} className={styles.factCell}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
