import type {
  BetaMerchandisingProductDiagnosticsListData,
  MerchandisingProduct,
  MerchandisingRankingAttribute,
  ProductOfflineIssue,
} from '@/libs/api/generated/open-api';
import type {
  OperationalStatusVariant,
  ProductStatusVariant,
} from '@/libs/components/status-badge/status-badge';

export type Product = MerchandisingProduct & { rating?: string };

export type DetailItem = { label: string; value: string };

export type SectionStatus = Extract<
  OperationalStatusVariant | ProductStatusVariant,
  'operational' | 'issue-detected' | 'blocked' | 'push-available' | 'waiting'
>;

export type Section<T> = {
  content: T;
  issues: Array<ProductOfflineIssue & { type: 'warning' | 'error' }>;
  status: SectionStatus;
};

type ProductSections = {
  productAssembly: Section<DetailItem[]>;
  availability: Section<string | null>;
  saleability: Section<string | null>;
  associatedRules: Section<string | null>;
};

const getRankingValue = (
  ranking: MerchandisingRankingAttribute[] | undefined,
  property: string
) => ranking?.find((attribute) => attribute.property === property)?.values[0];

export enum ProductError {
  NotSaleable = 'Product is not marked saleable in Product Assembly',
  OutOfStock = 'Product is out of stock',
  NotIndexed = 'Product is not indexed in Elastic yet',
}

const withErrors = <T>(
  content: T,
  issues: ProductOfflineIssue[]
): Section<T> => ({
  content,
  issues: issues.map((issue) => ({ ...issue, type: 'error' })),
  status: 'issue-detected',
});

const operational = <T>(content: T): Section<T> => ({
  content,
  issues: [],
  status: 'operational',
});

const blocked = <T>(content: T): Section<T> => ({
  content,
  issues: [],
  status: 'blocked',
});

const waitingForPush = <T>(content: T): Section<T> => ({
  content,
  issues: [],
  status: 'waiting',
});

export const getProductDetails = (
  data: BetaMerchandisingProductDiagnosticsListData
): {
  isIndexed: boolean;
  product: Product | null;
  sections: ProductSections;
} => {
  const isIndexed = data.products.length > 0;
  const issues = data.issues;
  const product = isIndexed ? (data.products[0] as Product) : null;

  const ranking = product?.metadata?.ranking;
  const predictedRevenueScore = getRankingValue(
    ranking,
    'Predicted Revenue Score'
  );
  const daysSinceLaunch = getRankingValue(ranking, 'Days Since Launch');

  const assemblyDetails: DetailItem[] = [
    product?.brand && { label: 'Brand', value: product.brand },
    product?.rating && { label: 'Rating', value: product.rating },
    { label: 'Price range', value: product?.price ?? '—' },
    predictedRevenueScore && {
      label: 'Predicted Revenue Score',
      value: predictedRevenueScore,
    },
    daysSinceLaunch && { label: 'Days since launch', value: daysSinceLaunch },
    product?.url && { label: 'URL', value: product.url },
  ].filter((item): item is DetailItem => Boolean(item));

  let sections: ProductSections;

  if (issues.length === 0) {
    if (isIndexed) {
      sections = {
        productAssembly: operational(assemblyDetails),
        availability: operational(null),
        saleability: operational(null),
        associatedRules: operational(null),
      };
    } else {
      sections = {
        productAssembly: {
          content: [],
          issues: [
            {
              reason: ProductError.NotIndexed,
              action:
                'Send an Emergency Push request to the Merch hub team below to index it and make this product available online.',
              type: 'warning',
            },
          ],
          status: 'push-available',
        },
        availability: waitingForPush(null),
        saleability: waitingForPush(null),
        associatedRules: waitingForPush(null),
      };
    }
  } else {
    const outOfStockIssues = issues.filter(
      (issue) => issue.reason === ProductError.OutOfStock
    );
    const notSaleableIssues = issues.filter(
      (issue) => issue.reason === ProductError.NotSaleable
    );
    const unknownIssues = issues.filter(
      (issue) =>
        issue.reason !== ProductError.OutOfStock &&
        issue.reason !== ProductError.NotSaleable
    );

    sections = {
      productAssembly:
        unknownIssues.length > 0
          ? withErrors(assemblyDetails, unknownIssues)
          : blocked(assemblyDetails),
      availability:
        outOfStockIssues.length > 0
          ? withErrors(null, outOfStockIssues)
          : blocked(null),
      saleability:
        notSaleableIssues.length > 0
          ? withErrors(null, notSaleableIssues)
          : blocked(null),
      associatedRules: blocked(null),
    };
  }

  return { isIndexed, product, sections };
};
