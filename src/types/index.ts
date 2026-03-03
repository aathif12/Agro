export type Category =
  | 'Food & Dining'
  | 'Transportation'
  | 'Housing'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Education'
  | 'Travel'
  | 'Utilities'
  | 'Others';

export const CATEGORIES: Category[] = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Utilities',
  'Others',
];

export const CATEGORY_ICONS: Record<Category, string> = {
  'Food & Dining': 'restaurant',
  Transportation: 'car',
  Housing: 'home',
  Entertainment: 'musical-notes',
  Healthcare: 'medkit',
  Shopping: 'cart',
  Education: 'school',
  Travel: 'airplane',
  Utilities: 'flash',
  Others: 'ellipsis-horizontal',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  'Food & Dining': '#FF6B6B',
  Transportation: '#4ECDC4',
  Housing: '#45B7D1',
  Entertainment: '#96CEB4',
  Healthcare: '#FFEAA7',
  Shopping: '#DDA0DD',
  Education: '#98D8C8',
  Travel: '#F7DC6F',
  Utilities: '#82E0AA',
  Others: '#AEB6BF',
};

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: Category;
  description?: string;
  date: string;
  created_at: string;
}

export interface ExpenseInsert {
  title: string;
  amount: number;
  category: Category;
  description?: string;
  date: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  AddExpense: undefined;
  Expenses: undefined;
  Profile: undefined;
};
