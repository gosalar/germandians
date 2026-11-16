import SourceNote from '@/components/SourceNote';

import { COSTS_TABLE_COPY } from './data';
import styles from './styles.module.scss';
import type { CostsTopic } from './types';

interface CostsTableProps {
  costs: CostsTopic['costs'];
  /** The id of the card's title, which names the table. */
  labelledBy: string;
}

/**
 * Every group and item of the costs the site holds, with each item's source. The group names are
 * row-group headings. Below the phone breakpoint each cost becomes a block: name and amount on top,
 * the details underneath.
 */
export default function CostsTable({ costs, labelledBy }: CostsTableProps) {
  return (
    <table className={styles.costs} aria-labelledby={labelledBy}>
      <thead className={styles.costsHead}>
        <tr>
          <th scope="col">{COSTS_TABLE_COPY.item}</th>
          <th scope="col">{COSTS_TABLE_COPY.amount}</th>
          <th scope="col">{COSTS_TABLE_COPY.detail}</th>
        </tr>
      </thead>
      {costs.map(({ group, items }) => (
        <tbody key={group} className={styles.costGroup}>
          <tr className={styles.costGroupRow}>
            <th scope="rowgroup" colSpan={3} className={styles.costGroupName}>
              {group}
            </th>
          </tr>
          {items.map((item) => (
            <tr key={item.label} className={styles.costRow}>
              <th scope="row" className={styles.costName}>
                {item.label}
              </th>
              <td className={styles.costAmount} data-empty={item.amount ? undefined : true}>
                {item.amount ?? COSTS_TABLE_COPY.noAmount}
              </td>
              <td className={styles.costDetail}>
                {item.detail}
                {item.source ? <SourceNote source={item.source} /> : null}
              </td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}
