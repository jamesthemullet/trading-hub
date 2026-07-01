import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Button, ErrorMessage, Heading, Typography } from '@/libs/components';
import {
  CombinedDropdown,
  DropdownVariant,
} from '@/libs/components/dropdown/dropdown';
import {
  useFavouriteRulesetsFlag,
  useProfilePageFlag,
} from '@/libs/components/feature-flag/feature-flag';
import { InfoBox } from '@/libs/components/infoBox/info-box';
import { ROUTES } from '@/libs/constants/routes';
import type { FavouriteRuleset } from '@/libs/hooks/use-favourite-rulesets';
import {
  getStoredFavourites,
  removeFavourite,
} from '@/libs/hooks/use-favourite-rulesets';
import type { MostViewedRuleset } from '@/libs/hooks/use-most-viewed-rulesets';
import {
  getMostViewedRulesets,
  MOST_VIEWED_DAYS,
} from '@/libs/hooks/use-most-viewed-rulesets';
import type {
  RecentlyViewedRuleset,
  RulesetType,
} from '@/libs/hooks/use-recently-viewed-rulesets';
import { getStoredRecentlyViewed } from '@/libs/hooks/use-recently-viewed-rulesets';
import type { PageSize } from '@/libs/hooks/use-rows-per-page-setting';
import {
  DEFAULT_PAGE_SIZE,
  getStoredRowsPerPage,
  PAGE_SIZES,
  saveRowsPerPage,
} from '@/libs/hooks/use-rows-per-page-setting';

import Head from 'next/head';
import Link from 'next/link';

import styles from './index.module.css';

const FAVOURITES_PERSISTENCE_ERROR =
  'Unable to save favourite rulesets in this browser session.';

const FACET_ROUTES: Partial<Record<RulesetType, (id: string) => string>> = {
  category: ROUTES.CATEGORY.FACETS.EDIT,
  search: ROUTES.SEARCH.FACETS.EDIT,
  global: ROUTES.GLOBAL.FACETS.EDIT,
};

const getFacetUrl = (type: RulesetType, id: string): string | null => {
  const route = FACET_ROUTES[type];
  return route ? route(id) : null;
};

export const normalisePageSize = (size: number): PageSize =>
  size === 10 || size === 20 || size === 50 || size === 100
    ? size
    : DEFAULT_PAGE_SIZE;

const Profile = (): ReactElement | null => {
  const router = useRouter();
  const isProfilePageEnabled = useProfilePageFlag();
  const isFavouriteRulesetsEnabled = useFavouriteRulesetsFlag();
  const [initialized, setInitialized] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedRuleset[]>(
    []
  );
  const [mostViewed, setMostViewed] = useState<MostViewedRuleset[]>([]);
  const [favourites, setFavourites] = useState<FavouriteRuleset[]>([]);
  const [favouritesError, setFavouritesError] = useState('');

  useEffect(() => {
    setRowsPerPage(getStoredRowsPerPage());
    setRecentlyViewed(getStoredRecentlyViewed());
    setMostViewed(getMostViewedRulesets());
    setFavourites(getStoredFavourites());
  }, []);

  useEffect(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized && !isProfilePageEnabled) {
      void router.replace('/');
    }
  }, [initialized, isProfilePageEnabled, router]);

  if (!initialized || !isProfilePageEnabled) return null;

  const handleRowsPerPageChange = (_page: number, size: number) => {
    const pageSize = normalisePageSize(size);
    setRowsPerPage(pageSize);
    saveRowsPerPage(pageSize);
  };

  const handleRemoveFavourite = (id: string): void => {
    const isFavouriteRemoved = removeFavourite(id);
    if (!isFavouriteRemoved) {
      setFavouritesError(FAVOURITES_PERSISTENCE_ERROR);
      return;
    }
    setFavouritesError('');
    setFavourites(getStoredFavourites());
  };

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Profile</title>
      </Head>

      <div className={styles.wrapper}>
        <Heading breadcrumbs={['Profile']} title="Profile" />
        <div className={styles.notice}>
          <InfoBox
            variant="info"
            title="Your settings are saved on this device only"
            text="Any changes you make here are stored in your browser. If you sign in on a different computer or browser, you will need to set them up again."
            width="100%"
            height="auto"
          />
        </div>
        <section className={styles.section}>
          <Typography variant="titleMedium" isStrong as="h2">
            Settings
          </Typography>
          <div className={styles.setting}>
            <Typography variant="bodyMedium" isStrong as="label">
              Rows per page
            </Typography>
            <Typography variant="bodyMedium">
              How many rows to show in tables across the app.
            </Typography>
            <CombinedDropdown
              variant={DropdownVariant.PageSize}
              label={String(rowsPerPage)}
              ariaLabel={`Select rows per page - currently ${rowsPerPage}`}
              width={125}
              pageSizes={[...PAGE_SIZES]}
              currentPage={1}
              currentPageSize={rowsPerPage}
              totalItems={0}
              onPageSizeChange={handleRowsPerPageChange}
            />
          </div>
        </section>
        {isFavouriteRulesetsEnabled && (
          <section className={styles.section}>
            <Typography variant="titleMedium" isStrong as="h2">
              Favourite rulesets
            </Typography>
            {favouritesError && <ErrorMessage>{favouritesError}</ErrorMessage>}
            {favourites.length === 0 ? (
              <Typography variant="bodyMedium">
                No favourite rulesets yet.
              </Typography>
            ) : (
              <div className={styles.recentCard}>
                <div className={styles.favouriteHeader} aria-hidden="true">
                  <Typography variant="bodySmall" isStrong>
                    Ruleset
                  </Typography>
                  <Typography variant="bodySmall" isStrong>
                    Type
                  </Typography>
                  <div />
                  <div />
                </div>
                <ul className={styles.recentList}>
                  {favourites.map((item) => {
                    const facetUrl = getFacetUrl(item.type, item.id);
                    return (
                      <li key={item.id}>
                        <div className={styles.favouriteRow}>
                          <Link href={item.url} className={styles.labelLink}>
                            <Typography
                              variant="bodySmall"
                              as="span"
                              className={styles.labelText}
                            >
                              {item.label}
                            </Typography>
                          </Link>
                          <Typography
                            variant="bodySmall"
                            className={styles.recentType}
                          >
                            {item.type}
                          </Typography>
                          <Button
                            type="button"
                            appearance="plain"
                            className={styles.removeFavourite}
                            onClick={() => handleRemoveFavourite(item.id)}
                            aria-label={`Remove ${item.label} from favourites`}
                          >
                            <Typography variant="bodySmall" as="span">
                              ★ Remove
                            </Typography>
                          </Button>
                          <div className={styles.actionLinks}>
                            <Link href={item.url} className={styles.actionLink}>
                              <Typography variant="bodySmall" as="span">
                                Ruleset
                              </Typography>
                            </Link>
                            {facetUrl && (
                              <Link
                                href={facetUrl}
                                className={styles.actionLink}
                              >
                                <Typography variant="bodySmall" as="span">
                                  Facets
                                </Typography>
                              </Link>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        )}
        <section className={styles.section}>
          <Typography variant="titleMedium" isStrong as="h2">
            Most viewed rulesets (last {MOST_VIEWED_DAYS} days)
          </Typography>
          {mostViewed.length === 0 ? (
            <Typography variant="bodyMedium">
              No ruleset views recorded yet.
            </Typography>
          ) : (
            <div className={styles.recentCard}>
              <div className={styles.recentHeaderWithCount} aria-hidden="true">
                <Typography variant="bodySmall" isStrong>
                  Ruleset
                </Typography>
                <Typography variant="bodySmall" isStrong>
                  Type
                </Typography>
                <Typography
                  variant="bodySmall"
                  isStrong
                  className={styles.countCol}
                >
                  Views
                </Typography>
                <div />
              </div>
              <ul className={styles.recentList}>
                {mostViewed.map((item) => {
                  const facetUrl = getFacetUrl(item.type, item.id);
                  return (
                    <li key={item.id}>
                      <div className={styles.recentRowWithCount}>
                        <Link href={item.url} className={styles.labelLink}>
                          <Typography
                            variant="bodySmall"
                            as="span"
                            className={styles.labelText}
                          >
                            {item.label}
                          </Typography>
                        </Link>
                        <Typography
                          variant="bodySmall"
                          className={styles.recentType}
                        >
                          {item.type}
                        </Typography>
                        <Typography
                          variant="bodySmall"
                          className={styles.countCol}
                        >
                          {item.count}
                        </Typography>
                        <div className={styles.actionLinks}>
                          <Link href={item.url} className={styles.actionLink}>
                            <Typography variant="bodySmall" as="span">
                              Ruleset
                            </Typography>
                          </Link>
                          {facetUrl && (
                            <Link href={facetUrl} className={styles.actionLink}>
                              <Typography variant="bodySmall" as="span">
                                Facets
                              </Typography>
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
        <section className={styles.section}>
          <Typography variant="titleMedium" isStrong as="h2">
            Recently viewed rulesets
          </Typography>
          {recentlyViewed.length === 0 ? (
            <Typography variant="bodyMedium">
              No recently viewed rulesets yet.
            </Typography>
          ) : (
            <div className={styles.recentCard}>
              <div className={styles.recentHeader} aria-hidden="true">
                <Typography variant="bodySmall" isStrong>
                  Ruleset
                </Typography>
                <Typography variant="bodySmall" isStrong>
                  Type
                </Typography>
                <div />
              </div>
              <ul className={styles.recentList}>
                {recentlyViewed.map((item) => {
                  const facetUrl = getFacetUrl(item.type, item.id);
                  return (
                    <li key={item.id}>
                      <div className={styles.recentRow}>
                        <Link href={item.url} className={styles.labelLink}>
                          <Typography
                            variant="bodySmall"
                            as="span"
                            className={styles.labelText}
                          >
                            {item.label}
                          </Typography>
                        </Link>
                        <Typography
                          variant="bodySmall"
                          className={styles.recentType}
                        >
                          {item.type}
                        </Typography>
                        <div className={styles.actionLinks}>
                          <Link href={item.url} className={styles.actionLink}>
                            <Typography variant="bodySmall" as="span">
                              Ruleset
                            </Typography>
                          </Link>
                          {facetUrl && (
                            <Link href={facetUrl} className={styles.actionLink}>
                              <Typography variant="bodySmall" as="span">
                                Facets
                              </Typography>
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Profile;
