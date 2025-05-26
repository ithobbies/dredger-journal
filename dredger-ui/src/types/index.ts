export interface User {
  id: number;
  username: string;
  email: string;
  groups: string[];
}

export interface Dredger {
  id: number;
  inv_number: string;
  type: {
    id: number;
    name: string;
    code: string;
  };
}

export interface SparePart {
  id: number;
  code: string;
  name: string;
  manufacturer: string;
  norm_hours: number;
  drawing_file: string | null;
}

export interface ComponentInstance {
  id: number;
  part: SparePart;
  serial_number: string | null;
  current_dredger: Dredger | null;
  total_hours: number;
}

export interface Repair {
  id: number;
  dredger: Dredger;
  start_date: string;
  end_date: string;
  notes: string;
  items: RepairItem[];
  created_by: User;
  created_at: string;
  updated_by: User;
  updated_at: string;
}

export interface RepairItem {
  id: number;
  component: ComponentInstance;
  hours: number;
  note: string;
}

export interface Deviation {
  id: number;
  dredger: Dredger;
  date: string;
  type: 'mechanical' | 'electrical' | 'technological';
  location: 'ПНС' | 'ТВС' | 'ШХ';
  last_ppr_date: string;
  hours_at_deviation: number;
  description: string;
  shift_leader: string;
  mechanic: string;
  electrician: string;
  created_by: User;
  created_at: string;
  updated_by: User;
  updated_at: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
} 