export interface Tree {
  _id: string;
  plan: 'sapling' | 'adult' | 'grand';
  name: string;
  location: string;
  yieldMin: number;
  yieldMax: number;
  pricePerSeason: number;
  isAvailable: boolean;
}

export interface Rental {
  _id: string;
  tree: Tree;
  season: string;
  status: 'active' | 'completed' | 'cancelled';
  deliveryAddress: string;
  estimatedYield?: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
