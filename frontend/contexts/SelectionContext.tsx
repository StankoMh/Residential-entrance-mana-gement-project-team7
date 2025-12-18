import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { ManagedBuilding, MyHome } from '../types/database';

type SelectionType = 'building' | 'unit' | null;

interface SelectionContextType {
  selectionType: SelectionType;
  selectedBuilding: ManagedBuilding | null;
  selectedUnit: MyHome | null;
  selectBuilding: (building: ManagedBuilding) => void;
  selectUnit: (unit: MyHome) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

const STORAGE_KEY = 'dashboard_selection';

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectionType, setSelectionType] = useState<SelectionType>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<ManagedBuilding | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<MyHome | null>(null);

  // Load selection from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setSelectionType(data.type);
        if (data.type === 'building') {
          setSelectedBuilding(data.building);
        } else if (data.type === 'unit') {
          setSelectedUnit(data.unit);
        }
      }
    } catch (error) {
      console.error('Failed to load selection from storage:', error);
    }
  }, []);

  const selectBuilding = (building: ManagedBuilding) => {
    setSelectionType('building');
    setSelectedBuilding(building);
    setSelectedUnit(null);
    
    // Save to sessionStorage
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      type: 'building',
      building,
    }));
  };

  const selectUnit = (unit: MyHome) => {
    setSelectionType('unit');
    setSelectedUnit(unit);
    setSelectedBuilding(null);
    
    // Save to sessionStorage
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      type: 'unit',
      unit,
    }));
  };

  const clearSelection = () => {
    setSelectionType(null);
    setSelectedBuilding(null);
    setSelectedUnit(null);
    
    // Clear from sessionStorage
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SelectionContext.Provider
      value={{
        selectionType,
        selectedBuilding,
        selectedUnit,
        selectBuilding,
        selectUnit,
        clearSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}