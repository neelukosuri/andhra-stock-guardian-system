import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  User,
  Ledger,
  QuantityMetric,
  Budget,
  Item,
  HQStock,
  LoanItem,
  District,
  CommunicationStaff,
  DistrictStock,
  HQIssuanceVoucher,
  HQItemMovement,
  HQLARVoucher,
  DistrictIssuanceVoucher,
  DistrictItemMovement,
  DistrictLARVoucher
} from '@/types';

// Add returnedTo and returnNotes properties to the LoanItem type
interface LoanItem {
  id: string;
  itemId: string;
  quantity: number;
  metricId: string;
  sourceWing: string;
  eventName?: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'Loaned' | 'Returned';
  returnedTo?: string;
  returnNotes?: string;
  created_at?: string;
}

// Initial sample data
const initialLedgers: Ledger[] = [
  {
    id: 'ledger-1',
    name: 'Volume I',
    currentSequenceNumber: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ledger-2',
    name: 'Volume II',
    currentSequenceNumber: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ledger-3',
    name: 'Volume III',
    currentSequenceNumber: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ledger-4',
    name: 'Volume IV',
    currentSequenceNumber: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ledger-5',
    name: 'Volume V',
    currentSequenceNumber: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ledger-6',
    name: 'Volume VI',
    currentSequenceNumber: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialMetrics: QuantityMetric[] = [
  {
    id: 'metric-1',
    name: 'Nos.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'metric-2',
    name: 'KGs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'metric-3',
    name: 'Litres',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialBudgets: Budget[] = [
  {
    id: 'budget-1',
    name: 'Regular Budget (520-521)',
    financialYear: '2023-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'budget-2',
    name: 'MOPF Budget',
    financialYear: '2023-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialDistricts: District[] = [
  {
    id: 'district-1',
    name: 'Vijayawada Commissionerate',
    isCommissionerateOrWing: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'district-2',
    name: 'Guntur District',
    isCommissionerateOrWing: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'district-3',
    name: 'SIB Wing',
    isCommissionerateOrWing: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialStaff: CommunicationStaff[] = [
  {
    id: 'staff-1',
    gNo: 'G12345',
    name: 'Rajesh Kumar',
    rank: 'Inspector',
    placeOfPosting: 'Vijayawada Commissionerate',
    mobileNumber: '9876543210',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'staff-2',
    gNo: 'G67890',
    name: 'Srinivas Rao',
    rank: 'Sub-Inspector',
    placeOfPosting: 'Guntur District',
    mobileNumber: '9876543211',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialUsers: User[] = [
  {
    id: 'user-1',
    username: 'hqadmin',
    password: 'password', // This would be hashed in a real app
    role: 'HQ_ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    username: 'districtadmin',
    password: 'password', // This would be hashed in a real app
    role: 'DISTRICT_ADMIN',
    districtId: 'district-1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface DataContextType {
  // Data entities
  users: User[];
  ledgers: Ledger[];
  metrics: QuantityMetric[];
  budgets: Budget[];
  districts: District[];
  staff: CommunicationStaff[];
  items: Item[];
  hqStock: HQStock[];
  loanItems: LoanItem[];
  districtStock: DistrictStock[];
  hqIssuanceVouchers: HQIssuanceVoucher[];
  hqItemMovements: HQItemMovement[];
  hqLarVouchers: HQLARVoucher[];
  districtIssuanceVouchers: DistrictIssuanceVoucher[];
  districtItemMovements: DistrictItemMovement[];
  districtLarVouchers: DistrictLARVoucher[];
  
  // CRUD operations for Items
  addItem: (item: Omit<Item, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => Item;
  updateItem: (id: string, item: Partial<Item>) => Item | undefined;
  deleteItem: (id: string) => boolean;
  
  // CRUD operations for HQ Stock
  addHQStock: (stock: Omit<HQStock, 'id' | 'createdAt' | 'updatedAt'>) => HQStock;
  updateHQStock: (id: string, stock: Partial<HQStock>) => HQStock | undefined;
  
  // CRUD operations for Loan Items
  addLoanItem: (loanItem: Omit<LoanItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => LoanItem;
  updateLoanItem: (id: string, loanItem: Partial<LoanItem>) => LoanItem | undefined;
  
  // CRUD operations for Ledgers
  addLedger: (ledger: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt'>) => Ledger;
  updateLedger: (id: string, ledger: Partial<Ledger>) => Ledger | undefined;
  
  // CRUD operations for Metrics
  addMetric: (metric: Omit<QuantityMetric, 'id' | 'createdAt' | 'updatedAt'>) => QuantityMetric;
  updateMetric: (id: string, metric: Partial<QuantityMetric>) => QuantityMetric | undefined;
  
  // CRUD operations for Budgets
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Budget;
  updateBudget: (id: string, budget: Partial<Budget>) => Budget | undefined;
  
  // CRUD operations for Districts
  addDistrict: (district: Omit<District, 'id' | 'createdAt' | 'updatedAt'>) => District;
  updateDistrict: (id: string, district: Partial<District>) => District | undefined;
  
  // CRUD operations for Staff
  addStaff: (staff: Omit<CommunicationStaff, 'id' | 'createdAt' | 'updatedAt'>) => CommunicationStaff;
  updateStaff: (id: string, staff: Partial<CommunicationStaff>) => CommunicationStaff | undefined;
  getStaffByGNo: (gNo: string) => CommunicationStaff | undefined;
  
  // CRUD operations for Users
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => User;
  updateUser: (id: string, user: Partial<User>) => User | undefined;
  
  // Operations for HQ to District issuance
  createHQIssuanceVoucher: (voucher: Omit<HQIssuanceVoucher, 'id' | 'ivNumber' | 'createdAt'>) => HQIssuanceVoucher;
  addHQItemMovement: (movement: Omit<HQItemMovement, 'id' | 'createdAt'>) => HQItemMovement;
  
  // Operations for District to HQ returns (LAR)
  createHQLARVoucher: (voucher: Omit<HQLARVoucher, 'id' | 'larNumber' | 'createdAt'>) => HQLARVoucher;
  
  // Operations for District internal issuance
  createDistrictIssuanceVoucher: (voucher: Omit<DistrictIssuanceVoucher, 'id' | 'ivNumber' | 'createdAt'>) => DistrictIssuanceVoucher;
  addDistrictItemMovement: (movement: Omit<DistrictItemMovement, 'id' | 'createdAt'>) => DistrictItemMovement;
  
  // Operations for District internal returns (LAR)
  createDistrictLARVoucher: (voucher: Omit<DistrictLARVoucher, 'id' | 'larNumber' | 'createdAt'>) => DistrictLARVoucher;
  
  // Helper methods
  generateItemCode: (ledgerId: string) => string;
  generateIVNumber: () => string;
  generateLARNumber: () => string;
  getLedgerById: (id: string) => Ledger | undefined;
  getMetricById: (id: string) => QuantityMetric | undefined;
  getDistrictById: (id: string) => District | undefined;
  getItemById: (id: string) => Item | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for all entities
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [ledgers, setLedgers] = useState<Ledger[]>(initialLedgers);
  const [metrics, setMetrics] = useState<QuantityMetric[]>(initialMetrics);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [staff, setStaff] = useState<CommunicationStaff[]>(initialStaff);
  const [items, setItems] = useState<Item[]>([]);
  const [hqStock, setHQStock] = useState<HQStock[]>([]);
  const [loanItems, setLoanItems] = useState<LoanItem[]>([]);
  const [districtStock, setDistrictStock] = useState<DistrictStock[]>([]);
  const [hqIssuanceVouchers, setHQIssuanceVouchers] = useState<HQIssuanceVoucher[]>([]);
  const [hqItemMovements, setHQItemMovements] = useState<HQItemMovement[]>([]);
  const [hqLarVouchers, setHQLARVouchers] = useState<HQLARVoucher[]>([]);
  const [districtIssuanceVouchers, setDistrictIssuanceVouchers] = useState<DistrictIssuanceVoucher[]>([]);
  const [districtItemMovements, setDistrictItemMovements] = useState<DistrictItemMovement[]>([]);
  const [districtLarVouchers, setDistrictLARVouchers] = useState<DistrictLARVoucher[]>([]);
  
  // Helper methods
  const generateItemCode = (ledgerId: string) => {
    const ledger = ledgers.find(l => l.id === ledgerId);
    if (!ledger) return '';
    
    const ledgerNumber = ledgerId.split('-')[1];
    const sequenceNumber = (ledger.currentSequenceNumber + 1).toString().padStart(3, '0');
    
    return `L${ledgerNumber}-${sequenceNumber}`;
  };
  
  const generateIVNumber = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `IV/${day}/${month}/${year}/${random}`;
  };
  
  const generateLARNumber = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `LAR/${day}/${month}/${year}/${random}`;
  };
  
  const getLedgerById = (id: string) => ledgers.find(l => l.id === id);
  const getMetricById = (id: string) => metrics.find(m => m.id === id);
  const getDistrictById = (id: string) => districts.find(d => d.id === id);
  const getItemById = (id: string) => items.find(i => i.id === id);
  const getStaffByGNo = (gNo: string) => staff.find(s => s.gNo === gNo);
  
  // CRUD operations for Items
  const addItem = (itemData: Omit<Item, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    const code = generateItemCode(itemData.ledgerId);
    const newItem: Item = {
      ...itemData,
      id: `item-${uuidv4()}`,
      code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update the ledger's current sequence number
    const updatedLedgers = ledgers.map(ledger => 
      ledger.id === itemData.ledgerId 
        ? { ...ledger, currentSequenceNumber: ledger.currentSequenceNumber + 1, updatedAt: new Date().toISOString() } 
        : ledger
    );
    
    setLedgers(updatedLedgers);
    setItems(prev => [...prev, newItem]);
    return newItem;
  };
  
  const updateItem = (id: string, itemData: Partial<Item>) => {
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    
    const updatedItem = {
      ...items[index],
      ...itemData,
      updatedAt: new Date().toISOString(),
    };
    
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
    return updatedItem;
  };
  
  const deleteItem = (id: string) => {
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    return true;
  };
  
  // CRUD operations for HQ Stock
  const addHQStock = (stockData: Omit<HQStock, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStock: HQStock = {
      ...stockData,
      id: `hqstock-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setHQStock(prev => [...prev, newStock]);
    return newStock;
  };
  
  const updateHQStock = (id: string, stockData: Partial<HQStock>) => {
    const index = hqStock.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    const updatedStock = {
      ...hqStock[index],
      ...stockData,
      updatedAt: new Date().toISOString(),
    };
    
    const newHQStock = [...hqStock];
    newHQStock[index] = updatedStock;
    setHQStock(newHQStock);
    return updatedStock;
  };
  
  // CRUD operations for Loan Items
  const addLoanItem = (loanItemData: Omit<LoanItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newLoanItem: LoanItem = {
      ...loanItemData,
      id: `loanitem-${uuidv4()}`,
      status: 'Loaned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLoanItems(prev => [...prev, newLoanItem]);
    return newLoanItem;
  };
  
  const updateLoanItem = (id: string, updates: Partial<LoanItem>) => {
    const updatedLoanItems = loanItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setLoanItems(updatedLoanItems);
    return updatedLoanItems.find(item => item.id === id);
  };
  
  // CRUD operations for Ledgers
  const addLedger = (ledgerData: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLedger: Ledger = {
      ...ledgerData,
      id: `ledger-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLedgers(prev => [...prev, newLedger]);
    return newLedger;
  };
  
  const updateLedger = (id: string, ledgerData: Partial<Ledger>) => {
    const index = ledgers.findIndex(l => l.id === id);
    if (index === -1) return undefined;
    
    const updatedLedger = {
      ...ledgers[index],
      ...ledgerData,
      updatedAt: new Date().toISOString(),
    };
    
    const newLedgers = [...ledgers];
    newLedgers[index] = updatedLedger;
    setLedgers(newLedgers);
    return updatedLedger;
  };
  
  // CRUD operations for Metrics
  const addMetric = (metricData: Omit<QuantityMetric, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMetric: QuantityMetric = {
      ...metricData,
      id: `metric-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setMetrics(prev => [...prev, newMetric]);
    return newMetric;
  };
  
  const updateMetric = (id: string, metricData: Partial<QuantityMetric>) => {
    const index = metrics.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    
    const updatedMetric = {
      ...metrics[index],
      ...metricData,
      updatedAt: new Date().toISOString(),
    };
    
    const newMetrics = [...metrics];
    newMetrics[index] = updatedMetric;
    setMetrics(newMetrics);
    return updatedMetric;
  };
  
  // CRUD operations for Budgets
  const addBudget = (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `budget-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  };
  
  const updateBudget = (id: string, budgetData: Partial<Budget>) => {
    const index = budgets.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    
    const updatedBudget = {
      ...budgets[index],
      ...budgetData,
      updatedAt: new Date().toISOString(),
    };
    
    const newBudgets = [...budgets];
    newBudgets[index] = updatedBudget;
    setBudgets(newBudgets);
    return updatedBudget;
  };
  
  // CRUD operations for Districts
  const addDistrict = (districtData: Omit<District, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDistrict: District = {
      ...districtData,
      id: `district-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setDistricts(prev => [...prev, newDistrict]);
    return newDistrict;
  };
  
  const updateDistrict = (id: string, districtData: Partial<District>) => {
    const index = districts.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    const updatedDistrict = {
      ...districts[index],
      ...districtData,
      updatedAt: new Date().toISOString(),
    };
    
    const newDistricts = [...districts];
    newDistricts[index] = updatedDistrict;
    setDistricts(newDistricts);
    return updatedDistrict;
  };
  
  // CRUD operations for Staff
  const addStaff = (staffData: Omit<CommunicationStaff, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStaff: CommunicationStaff = {
      ...staffData,
      id: `staff-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setStaff(prev => [...prev, newStaff]);
    return newStaff;
  };
  
  const updateStaff = (id: string, staffData: Partial<CommunicationStaff>) => {
    const index = staff.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    const updatedStaff = {
      ...staff[index],
      ...staffData,
      updatedAt: new Date().toISOString(),
    };
    
    const newStaff = [...staff];
    newStaff[index] = updatedStaff;
    setStaff(newStaff);
    return updatedStaff;
  };
  
  // CRUD operations for Users
  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };
  
  const updateUser = (id: string, userData: Partial<User>) => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    const updatedUser = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    const newUsers = [...users];
    newUsers[index] = updatedUser;
    setUsers(newUsers);
    return updatedUser;
  };
  
  // Operations for HQ to District issuance
  const createHQIssuanceVoucher = (voucherData: Omit<HQIssuanceVoucher, 'id' | 'ivNumber' | 'createdAt'>) => {
    const ivNumber = generateIVNumber();
    const newVoucher: HQIssuanceVoucher = {
      ...voucherData,
      id: `hqiv-${uuidv4()}`,
      ivNumber,
      createdAt: new Date().toISOString(),
    };
    
    setHQIssuanceVouchers(prev => [...prev, newVoucher]);
    return newVoucher;
  };
  
  const addHQItemMovement = (movementData: Omit<HQItemMovement, 'id' | 'createdAt'>) => {
    const newMovement: HQItemMovement = {
      ...movementData,
      id: `hqmovement-${uuidv4()}`,
      createdAt: new Date().toISOString(),
    };
    
    setHQItemMovements(prev => [...prev, newMovement]);
    
    // Find the HQ stock item to get the metricId if not provided
    if (!newMovement.metricId) {
      const stockItem = hqStock.find(s => s.itemId === movementData.itemId);
      if (stockItem) {
        newMovement.metricId = stockItem.metricId;
      }
    }
    
    // Update HQ stock - deduct quantity for issues
    if (movementData.movementType === 'Issue_To_District') {
      const stockItem = hqStock.find(s => s.itemId === movementData.itemId);
      if (stockItem) {
        const updatedStock = {
          ...stockItem,
          quantity: stockItem.quantity - movementData.quantity,
          updatedAt: new Date().toISOString(),
        };
        updateHQStock(stockItem.id, updatedStock);
        
        // Add to district stock
        const existingDistrictStock = districtStock.find(ds => 
          ds.districtId === (hqIssuanceVouchers.find(iv => iv.id === movementData.ivId)?.receivingDistrictId) && 
          ds.itemId === movementData.itemId
        );
        
        if (existingDistrictStock) {
          // Update existing district stock
          const updatedDistrictStock = {
            ...existingDistrictStock,
            quantity: existingDistrictStock.quantity + movementData.quantity,
            isReturnable: movementData.isReturnable,
            updatedAt: new Date().toISOString(),
          };
          
          setDistrictStock(prev => prev.map(ds => 
            ds.id === existingDistrictStock.id ? updatedDistrictStock : ds
          ));
        } else {
          // Create new district stock entry
          const hqIssueVoucher = hqIssuanceVouchers.find(iv => iv.id === movementData.ivId);
          if (hqIssueVoucher) {
            const newDistrictStock: DistrictStock = {
              id: `districtstock-${uuidv4()}`,
              districtId: hqIssueVoucher.receivingDistrictId,
              itemId: movementData.itemId,
              quantity: movementData.quantity,
              metricId: stockItem.metricId,
              isReturnable: movementData.isReturnable,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setDistrictStock(prev => [...prev, newDistrictStock]);
          }
        }
      }
    }
    // Add quantity back to HQ stock for returns
    else if (movementData.movementType === 'Return_From_District') {
      const stockItem = hqStock.find(s => s.itemId === movementData.itemId);
      if (stockItem) {
        const updatedStock = {
          ...stockItem,
          quantity: stockItem.quantity + movementData.quantity,
          updatedAt: new Date().toISOString(),
        };
        updateHQStock(stockItem.id, updatedStock);
      }
      
      // Update the returned quantity in the original issuance movement
      const larVoucher = hqLarVouchers.find(lar => lar.id === movementData.larId);
      if (larVoucher) {
        const originalMovement = hqItemMovements.find(m => 
          m.ivId === larVoucher.ivIdRef && 
          m.itemId === movementData.itemId
        );
        
        if (originalMovement) {
          const updatedMovement = {
            ...originalMovement,
            returnedQuantity: originalMovement.returnedQuantity + movementData.quantity,
          };
          
          setHQItemMovements(prev => prev.map(m => 
            m.id === originalMovement.id ? updatedMovement : m
          ));
        }
      }
    }
    
    return newMovement;
  };
  
  // Operations for District to HQ returns (LAR)
  const createHQLARVoucher = (voucherData: Omit<HQLARVoucher, 'id' | 'larNumber' | 'createdAt'>) => {
    const larNumber = generateLARNumber();
    const newVoucher: HQLARVoucher = {
      ...voucherData,
      id: `hqlar-${uuidv4()}`,
      larNumber,
      createdAt: new Date().toISOString(),
    };
    
    setHQLARVouchers(prev => [...prev, newVoucher]);
    return newVoucher;
  };
  
  // Operations for District internal issuance
  const createDistrictIssuanceVoucher = (voucherData: Omit<DistrictIssuanceVoucher, 'id' | 'ivNumber' | 'createdAt'>) => {
    const ivNumber = `DIST-${generateIVNumber()}`;
    const newVoucher: DistrictIssuanceVoucher = {
      ...voucherData,
      id: `distiv-${uuidv4()}`,
      ivNumber,
      createdAt: new Date().toISOString(),
    };
    
    setDistrictIssuanceVouchers(prev => [...prev, newVoucher]);
    return newVoucher;
  };
  
  const addDistrictItemMovement = (movementData: Omit<DistrictItemMovement, 'id' | 'createdAt'>) => {
    const newMovement: DistrictItemMovement = {
      ...movementData,
      id: `distmovement-${uuidv4()}`,
      createdAt: new Date().toISOString(),
    };
    
    setDistrictItemMovements(prev => [...prev, newMovement]);
    
    // Find the district stock item to get the metricId if not provided
    if (!newMovement.metricId) {
      const stockItem = districtStock.find(s => 
        s.itemId === movementData.itemId && 
        s.districtId === movementData.districtId
      );
      if (stockItem) {
        newMovement.metricId = stockItem.metricId;
      }
    }
    
    // Update district stock - deduct quantity for issues
    if (movementData.movementType === 'Issue_To_Internal') {
      const stockItem = districtStock.find(s => 
        s.itemId === movementData.itemId && 
        s.districtId === movementData.districtId
      );
      
      if (stockItem) {
        const updatedStock = {
          ...stockItem,
          quantity: stockItem.quantity - movementData.quantity,
          updatedAt: new Date().toISOString(),
        };
        
        setDistrictStock(prev => prev.map(ds => 
          ds.id === stockItem.id ? updatedStock : ds
        ));
      }
    }
    // Add quantity back to district stock for returns
    else if (movementData.movementType === 'Return_From_Internal') {
      const stockItem = districtStock.find(s => 
        s.itemId === movementData.itemId && 
        s.districtId === movementData.districtId
      );
      
      if (stockItem) {
        const updatedStock = {
          ...stockItem,
          quantity: stockItem.quantity + movementData.quantity,
          updatedAt: new Date().toISOString(),
        };
        
        setDistrictStock(prev => prev.map(ds => 
          ds.id === stockItem.id ? updatedStock : ds
        ));
      }
      
      // Update the returned quantity in the original issuance movement
      const larVoucher = districtLarVouchers.find(lar => lar.id === movementData.districtLarId);
      if (larVoucher) {
        const originalMovement = districtItemMovements.find(m => 
          m.districtIvId === larVoucher.districtIvIdRef && 
          m.itemId === movementData.itemId
        );
        
        if (originalMovement) {
          const updatedMovement = {
            ...originalMovement,
            returnedQuantity: originalMovement.returnedQuantity + movementData.quantity,
          };
          
          setDistrictItemMovements(prev => prev.map(m => 
            m.id === originalMovement.id ? updatedMovement : m
          ));
        }
      }
    }
    
    return newMovement;
  };
  
  // Operations for District internal returns (LAR)
  const createDistrictLARVoucher = (voucherData: Omit<DistrictLARVoucher, 'id' | 'larNumber' | 'createdAt'>) => {
    const larNumber = `DIST-${generateLARNumber()}`;
    const newVoucher: DistrictLARVoucher = {
      ...voucherData,
      id: `distlar-${uuidv4()}`,
      larNumber,
      createdAt: new Date().toISOString(),
    };
    
    setDistrictLARVouchers(prev => [...prev, newVoucher]);
    return newVoucher;
  };
  
  // Value object for the context
  const value: DataContextType = {
    users,
    ledgers,
    metrics,
    budgets,
    districts,
    staff,
    items,
    hqStock,
    loanItems,
    districtStock,
    hqIssuanceVouchers,
    hqItemMovements,
    hqLarVouchers,
    districtIssuanceVouchers,
    districtItemMovements,
    districtLarVouchers,
    addItem,
    updateItem,
    deleteItem,
    addHQStock,
    updateHQStock,
    addLoanItem,
    updateLoanItem,
    addLedger,
    updateLedger,
    addMetric,
    updateMetric,
    addBudget,
    updateBudget,
    addDistrict,
    updateDistrict,
    addStaff,
    updateStaff,
    getStaffByGNo,
    addUser,
    updateUser,
    createHQIssuanceVoucher,
    addHQItemMovement,
    createHQLARVoucher,
    createDistrictIssuanceVoucher,
    addDistrictItemMovement,
    createDistrictLARVoucher,
    generateItemCode,
    generateIVNumber,
    generateLARNumber,
    getLedgerById,
    getMetricById,
    getDistrictById,
    getItemById,
  };
  
  return (
    <DataContext.Provider
      value={{
        ...value,
        loanItems,
        addLoanItem,
        updateLoanItem,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
