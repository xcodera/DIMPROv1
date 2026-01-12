
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'debit' | 'credit';
  category: string;
}

export interface AccountInfo {
  name: string;
  accountNumber: string;
  balance: number;
  points: number;
  jobTitle: string;
  role: string;
  avatarUrl: string;
}

export interface Activity {
  id: string;
  type: 'Absensi' | 'Slik' | 'Report';
  title: string;
  status: string;
  timestamp: Date;
}

export interface SlikLog {
  id: string;
  name: string;
  date: string;
  time: string;
  status: 'Berhasil' | 'Gagal';
}

export type AppView = 'home' | 'history' | 'qris' | 'ai-assistant' | 'profile' | 'attendance' | 'sliks';
