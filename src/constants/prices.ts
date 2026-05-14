export const BOX_PRICES: Record<string, number> = {
  chausa:  1299,
  dasheri: 1499,
  langra:  1399,
};

export const TREE_TOKEN_PRICES: Record<string, number> = {
  sapling: 1,      // TEST — restore to 799
  adult:   1499,
  grand:   2499,
};

export const TREE_FULL_PRICES: Record<string, number> = {
  sapling: 2,      // TEST — restore to 4499
  adult:   6999,
  grand:   9999,
};

export const TIER_DATA: Record<string, { fullPrice: number; tokenPrice: number; yield: string }> = {
  Base: { fullPrice: TREE_FULL_PRICES.sapling, tokenPrice: TREE_TOKEN_PRICES.sapling, yield: '15–25 kg' },
  Mid:  { fullPrice: TREE_FULL_PRICES.adult,   tokenPrice: TREE_TOKEN_PRICES.adult,   yield: '30–45 kg' },
  Big:  { fullPrice: TREE_FULL_PRICES.grand,   tokenPrice: TREE_TOKEN_PRICES.grand,   yield: '50–70 kg' },
};

export const PLAN_AMOUNTS: Record<string, { token: number; full: number }> = {
  sapling: { token: TREE_TOKEN_PRICES.sapling, full: TREE_FULL_PRICES.sapling },
  adult:   { token: TREE_TOKEN_PRICES.adult,   full: TREE_FULL_PRICES.adult   },
  grand:   { token: TREE_TOKEN_PRICES.grand,   full: TREE_FULL_PRICES.grand   },
};
