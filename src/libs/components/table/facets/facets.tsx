import type { MerchandisingRules, RuleSetFacetConfigWithId } from '@/libs/api';
import {
  TableContainer,
  TableHeading,
  TableCol,
  FacetsTableRow as TableRow,
} from '../table.styles';
import { FacetsTableRow } from './facets-table-row';
import { ReturnedCategoryRuleSet } from '@/libs/api';

type Props = {
  ruleSets: Array<ReturnedCategoryRuleSet>;
  canToggle?: boolean;
  canDelete?: boolean;
  onDeleteFacet?: (id: string) => void;
  onEnableDisableRuleSet: (args: {
    categoryId: string;
    facets?: Array<RuleSetFacetConfigWithId>;
    isEnabled: boolean;
    merchandisingRules: MerchandisingRules;
    ruleSetId: string;
  }) => void;
};

export const FacetsManagementTable = ({
  onDeleteFacet,
  onEnableDisableRuleSet,
  ruleSets,
}: Props) => {
  const columns: {
    label: string;
  }[] = [
    {
      label: 'Identifier',
    },
    {
      label: 'Enable',
    },
    {
      label: 'Last changed',
    },
    {
      label: 'User',
    },
    {
      label: 'Actions',
    },
  ];

  return (
    <TableContainer>
      <TableRow style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
        {columns.map(({ label }) => (
          <TableCol
            key={`column-${label}`}
            style={{
              userSelect: 'none',
            }}
          >
            <TableHeading as="p" isStrong={true}>
              {label}
            </TableHeading>
          </TableCol>
        ))}
      </TableRow>

      {ruleSets.map((ruleSet) => (
        <FacetsTableRow
          key={ruleSet.id}
          editUrl={`/facets/edit/${ruleSet.id}`}
          onDeleteFacet={onDeleteFacet}
          onToggle={() => {
            onEnableDisableRuleSet({
              ruleSetId: ruleSet.id,
              facets: ruleSet.facets,
              isEnabled: !ruleSet.isEnabled,
              merchandisingRules: ruleSet.rules,
              categoryId: ruleSet.categoryId,
            });
          }}
          ruleSet={ruleSet}
        />
      ))}
    </TableContainer>
  );
};
