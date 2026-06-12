import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';

export const mockOperationalProduct: BetaMerchandisingProductDiagnosticsListData =
  {
    products: [
      {
        id: '60509377',
        productId: 'P60509377',
        title: 'Pure Cotton T-Shirt',
        price: '£12.50',
        isInStock: true,
        imageUrl: ['SD_01_T60_1234_Y0_X_EC_0'],
        metadata: {
          isPinned: false,
          isBoosted: false,
          isBuried: false,
          isBlocked: false,
        },
      },
    ],
    pagination: { totalItems: 1 },
    issues: [],
  };

export const mockNonOperationalProduct: BetaMerchandisingProductDiagnosticsListData =
  {
    products: [
      {
        id: '60509378',
        productId: 'P60509378',
        title: 'Cotton Joggers',
        price: '£25.00',
        isInStock: false,
        imageUrl: ['SD_01_T60_5678_Y0_X_EC_0'],
        metadata: {
          isPinned: false,
          isBoosted: false,
          isBuried: false,
          isBlocked: false,
        },
      },
    ],
    pagination: { totalItems: 1 },
    issues: [
      {
        reason: 'Product is out of stock',
        action: 'Wait for restock.',
      },
      {
        reason: 'Product is not marked saleable in Product Assembly',
        action: 'Contact Product Domain team',
      },
    ],
  };
