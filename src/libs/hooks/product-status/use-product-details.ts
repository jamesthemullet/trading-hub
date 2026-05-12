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
) => ranking?.find((r) => r.property === property)?.values[0];

export enum ProductError {
  AssemblyFailed = 'Failed to get product data',
  DataUnavailable = 'Product data is not available',
  NotIndexed = 'Product is not indexed in Elastic yet',
  OutOfStock = 'Product is out of stock',
  // PriceUnavailable = 'Price data is not available',
}

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
) => {
  const isIndexed = data.products.length > 0;
  const issues = data.issues;
  const product = isIndexed ? (data.products[0] as Product) : null;

  const ranking = product?.metadata.ranking;
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
        productAssembly: {
          content: assemblyDetails,
          issues: [],
          status: 'operational',
        },
        availability: { content: '', issues: [], status: 'operational' },
        saleability: { content: '', issues: [], status: 'operational' },
        associatedRules: { content: '', issues: [], status: 'operational' },
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
    switch (issues[0]?.reason) {
      case ProductError.AssemblyFailed:
        sections = {
          productAssembly: {
            content: [],
            issues: issues.map((issue) => ({ ...issue, type: 'error' })),
            status: 'issue-detected',
          },
          availability: blocked(null),
          saleability: blocked(null),
          associatedRules: blocked(null),
        };
        break;
      case ProductError.DataUnavailable:
        sections = {
          productAssembly: {
            content: assemblyDetails,
            issues: issues.map((issue) => ({ ...issue, type: 'error' })),
            status: 'issue-detected',
          },
          availability: blocked(null),
          saleability: blocked(null),
          associatedRules: blocked(null),
        };
        break;
      case ProductError.OutOfStock:
        sections = {
          productAssembly: blocked(assemblyDetails),
          availability: {
            content: 'Not available',
            issues: issues.map((issue) => ({ ...issue, type: 'error' })),
            status: 'issue-detected',
          },
          saleability: blocked(null),
          associatedRules: blocked(null),
        };
        break;
      default:
        sections = {
          productAssembly: {
            content: assemblyDetails,
            issues: issues.map((issue) => ({ ...issue, type: 'error' })),
            status: 'operational',
          },
          availability: { content: '', issues: [], status: 'operational' },
          saleability: { content: '', issues: [], status: 'operational' },
          associatedRules: { content: '', issues: [], status: 'operational' },
        };
    }
  }

  return { isIndexed, product, sections };
};
