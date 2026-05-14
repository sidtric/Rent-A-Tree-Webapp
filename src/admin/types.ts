export type AdminTab =
  | 'overview'
  | 'trees'
  | 'rentals'
  | 'orders'
  | 'reviews'
  | 'publicupdates'
  | 'orchardboard'
  | 'messages'
  | 'userroles'
  | 'payments'
  | 'sitesettings';

export interface AdminTabMeta {
  id: AdminTab;
  icon: string;
  label: string;
}

export const ADMIN_TABS: AdminTabMeta[] = [
  { id: 'overview',      icon: '📊', label: 'Overview'     },
  { id: 'trees',         icon: '🌳', label: 'Trees'        },
  { id: 'rentals',       icon: '📋', label: 'Rentals'      },
  { id: 'orders',        icon: '📦', label: 'Box Orders'   },
  { id: 'publicupdates', icon: '🌿', label: 'Life on Farm' },
  { id: 'orchardboard',  icon: '🏡', label: 'Orchard Board' },
  { id: 'reviews',       icon: '⭐', label: 'Reviews'      },
  { id: 'messages',      icon: '✉️', label: 'Messages'     },
  { id: 'userroles',     icon: '🔑', label: 'User Roles'   },
  { id: 'payments',      icon: '💳', label: 'Payments'     },
  { id: 'sitesettings', icon: '⚙️', label: 'Site Settings' },
];

export interface AdminTree {
  _id: string;
  plan: 'sapling' | 'adult' | 'grand';
  variety: 'chausa' | 'dasheri' | 'langra';
  price: number;
  yieldMin: number;
  yieldMax: number;
  available: boolean;
}

export interface AdminRental {
  _id: string;
  user?: { name: string; email: string; phone?: string };
  plan: string;
  variety: string;
  season: string;
  deliveryAddress: string;
  status: string;
  createdAt: string;
}

export interface AdminOrder {
  _id: string;
  user?: { name: string; email: string };
  variety: string;
  quantity: number;
  totalAmount: number;
  deliveryAddress: string;
  status: string;
  createdAt: string;
}

export interface AdminReview {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  media: { url: string; type: 'image' | 'video' }[];
  createdAt: string;
}

export interface AdminMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  type: string;
  createdAt: string;
}

export interface AdminPublicUpdate {
  _id: string;
  caption: string;
  media: { url: string; type: 'image' | 'video' }[];
  createdAt: string;
}

export interface AdminStats {
  totalTrees: number;
  availableTrees: number;
  rentedTrees: number;
  totalRentals: number;
  cancelledRentals: number;
  activeRentals: number;
  reviews: number;
  users: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface TreeForm {
  plan: 'sapling' | 'adult' | 'grand';
  variety: 'chausa' | 'dasheri' | 'langra';
  price: string;
  yieldMin: string;
  yieldMax: string;
  available: boolean;
}

export const EMPTY_TREE_FORM: TreeForm = {
  plan: 'sapling',
  variety: 'chausa',
  price: '',
  yieldMin: '',
  yieldMax: '',
  available: true,
};
