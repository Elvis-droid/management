import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getJSON, setJSON, STORAGE_KEYS } from '../utils/storage';

const StockContext = createContext(null);

// Utility: generate a simple unique id
function generateId() {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

// Utility: number of whole days between two ISO date strings
function daysBetween(startISO, endISO = new Date().toISOString()) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function StockProvider({ children }) {
  const [stockItems, setStockItems] = useState([]); // Goods in / current inventory
  const [salesRecords, setSalesRecords] = useState([]); // Goods out / sales history
  const [costItems, setCostItems] = useState([]); // Business costs/expenses by month
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const items = await getJSON(STORAGE_KEYS.STOCK_ITEMS, []);
      const sales = await getJSON(STORAGE_KEYS.SALES_RECORDS, []);
      const costs = await getJSON(STORAGE_KEYS.COST_ITEMS, []);
      setStockItems(items);
      setSalesRecords(sales);
      setCostItems(costs);
      setLoading(false);
    })();
  }, []);

  // Persist whenever data changes
  useEffect(() => {
    if (!loading) setJSON(STORAGE_KEYS.STOCK_ITEMS, stockItems);
  }, [stockItems, loading]);

  useEffect(() => {
    if (!loading) setJSON(STORAGE_KEYS.SALES_RECORDS, salesRecords);
  }, [salesRecords, loading]);

  useEffect(() => {
    if (!loading) setJSON(STORAGE_KEYS.COST_ITEMS, costItems);
  }, [costItems, loading]);

  // ---- STOCK IN ----
  // Add a brand new stock entry (Goods In)
  const addStockItem = useCallback(({ name, buyPrice, sellPrice, quantity, dateAdded }) => {
    const newItem = {
      id: generateId(),
      name: name.trim(),
      buyPrice: parseFloat(buyPrice) || 0,
      sellPrice: parseFloat(sellPrice) || 0,
      quantity: parseInt(quantity, 10) || 0,
      initialQuantity: parseInt(quantity, 10) || 0,
      dateAdded: dateAdded || new Date().toISOString(),
    };
    setStockItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  // Edit an existing stock item's details (name, prices, quantity)
  const updateStockItem = useCallback((id, updates) => {
    let result = { success: false, message: 'Stock item not found.' };
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = {
          ...item,
          name: updates.name !== undefined ? updates.name.trim() : item.name,
          buyPrice:
            updates.buyPrice !== undefined ? parseFloat(updates.buyPrice) || 0 : item.buyPrice,
          sellPrice:
            updates.sellPrice !== undefined ? parseFloat(updates.sellPrice) || 0 : item.sellPrice,
          quantity:
            updates.quantity !== undefined ? parseInt(updates.quantity, 10) || 0 : item.quantity,
        };
        result = { success: true, item: updated };
        return updated;
      })
    );
    return result;
  }, []);

  const deleteStockItem = useCallback((id) => {
    setStockItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ---- STOCK OUT ----
  // Record a sale (Goods Out) and reduce remaining quantity of the matching stock item
  const sellStock = useCallback(({ stockItemId, quantitySold, salePrice, dateSold }) => {
    const qty = parseInt(quantitySold, 10) || 0;
    let result = { success: false, message: 'Stock item not found.' };

    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id !== stockItemId) return item;
        if (qty <= 0) {
          result = { success: false, message: 'Quantity must be greater than zero.' };
          return item;
        }
        if (qty > item.quantity) {
          result = { success: false, message: `Only ${item.quantity} unit(s) left in stock.` };
          return item;
        }
        result = { success: true, item };
        return { ...item, quantity: item.quantity - qty };
      })
    );

    if (result.success) {
      const item = result.item;
      const record = {
        id: generateId(),
        stockItemId: item.id,
        productName: item.name,
        quantitySold: qty,
        salePrice: parseFloat(salePrice) || item.sellPrice,
        buyPrice: item.buyPrice,
        dateSold: dateSold || new Date().toISOString(),
      };
      setSalesRecords((prev) => [record, ...prev]);
    }

    return result;
  }, []);

  const deleteSalesRecord = useCallback((id) => {
    setSalesRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ---- COST / EXPENSES ----
  // Add a business cost/expense, attributed to a given month & year so it can
  // be deducted from that month's profit (rent, transport, wages, etc).
  const addCostItem = useCallback(({ description, amount, month, year, dateAdded }) => {
    const now = new Date();
    const newItem = {
      id: generateId(),
      description: (description || '').trim(),
      amount: parseFloat(amount) || 0,
      month: month ?? now.getMonth(),
      year: year ?? now.getFullYear(),
      dateAdded: dateAdded || now.toISOString(),
    };
    setCostItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateCostItem = useCallback((id, updates) => {
    let result = { success: false, message: 'Cost item not found.' };
    setCostItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = {
          ...item,
          description:
            updates.description !== undefined ? updates.description.trim() : item.description,
          amount: updates.amount !== undefined ? parseFloat(updates.amount) || 0 : item.amount,
          month: updates.month !== undefined ? updates.month : item.month,
          year: updates.year !== undefined ? updates.year : item.year,
        };
        result = { success: true, item: updated };
        return updated;
      })
    );
    return result;
  }, []);

  const deleteCostItem = useCallback((id) => {
    setCostItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getMonthlyCost = useCallback(
    (month, year) => {
      const now = new Date();
      const targetMonth = month ?? now.getMonth();
      const targetYear = year ?? now.getFullYear();
      const recordsThisMonth = costItems.filter(
        (c) => c.month === targetMonth && c.year === targetYear
      );
      const totalCost = recordsThisMonth.reduce((sum, c) => sum + c.amount, 0);
      return { totalCost, records: recordsThisMonth };
    },
    [costItems]
  );

  // ---- MANAGEMENT / REPORTS ----

  // Remaining stock per product, with days since stocked in
  const getInventorySummary = useCallback(() => {
    return stockItems.map((item) => ({
      ...item,
      daysInStock: daysBetween(item.dateAdded),
      stockValue: item.quantity * item.buyPrice,
      potentialRevenue: item.quantity * item.sellPrice,
    }));
  }, [stockItems]);

  // Total profit for a given month/year (defaults to current month).
  // "realProfit" deducts the month's recorded business costs/expenses from
  // gross profit (revenue - cost of goods sold) so the user sees their true profit.
  const getMonthlyProfit = useCallback(
    (month, year) => {
      const now = new Date();
      const targetMonth = month ?? now.getMonth();
      const targetYear = year ?? now.getFullYear();

      const recordsThisMonth = salesRecords.filter((r) => {
        const d = new Date(r.dateSold);
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
      });

      const totalRevenue = recordsThisMonth.reduce((sum, r) => sum + r.salePrice * r.quantitySold, 0);
      const totalCost = recordsThisMonth.reduce((sum, r) => sum + r.buyPrice * r.quantitySold, 0);
      const totalProfit = totalRevenue - totalCost;
      const itemsSold = recordsThisMonth.reduce((sum, r) => sum + r.quantitySold, 0);

      const expensesThisMonth = costItems.filter(
        (c) => c.month === targetMonth && c.year === targetYear
      );
      const totalExpenses = expensesThisMonth.reduce((sum, c) => sum + c.amount, 0);
      const realProfit = totalProfit - totalExpenses;

      return {
        totalRevenue,
        totalCost,
        totalProfit,
        totalExpenses,
        realProfit,
        itemsSold,
        records: recordsThisMonth,
        expenseRecords: expensesThisMonth,
      };
    },
    [salesRecords, costItems]
  );

  // Overall totals across all time
  const getOverallTotals = useCallback(() => {
    const totalStockValue = stockItems.reduce((sum, i) => sum + i.quantity * i.buyPrice, 0);
    const totalRevenue = salesRecords.reduce((sum, r) => sum + r.salePrice * r.quantitySold, 0);
    const totalCost = salesRecords.reduce((sum, r) => sum + r.buyPrice * r.quantitySold, 0);
    const totalProfit = totalRevenue - totalCost;
    const totalExpenses = costItems.reduce((sum, c) => sum + c.amount, 0);
    const realProfit = totalProfit - totalExpenses;
    const totalProductsTracked = stockItems.length;
    const totalUnitsInStock = stockItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalUnitsSold = salesRecords.reduce((sum, r) => sum + r.quantitySold, 0);
    return {
      totalStockValue,
      totalRevenue,
      totalCost,
      totalProfit,
      totalExpenses,
      realProfit,
      totalProductsTracked,
      totalUnitsInStock,
      totalUnitsSold,
      totalSalesRecords: salesRecords.length,
      totalCostRecords: costItems.length,
    };
  }, [stockItems, salesRecords, costItems]);

  return (
    <StockContext.Provider
      value={{
        loading,
        stockItems,
        salesRecords,
        costItems,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        sellStock,
        deleteSalesRecord,
        addCostItem,
        updateCostItem,
        deleteCostItem,
        getMonthlyCost,
        getInventorySummary,
        getMonthlyProfit,
        getOverallTotals,
        daysBetween,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error('useStock must be used within a StockProvider');
  return ctx;
}
