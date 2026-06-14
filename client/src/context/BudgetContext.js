import React, { createContext, useState, useEffect } from 'react';
import { getStoredData, setStoredData } from '../utils/storage';

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const data = getStoredData();
    setTransactions(data.transactions);
    setProjects(data.projects);
  }, []);

  const addTransaction = (t) => {
    const newTransactions = [...transactions, t];
    setTransactions(newTransactions);
    setStoredData({ transactions: newTransactions, projects });
  };

  const allocateToProject = (projectId, amount) => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        const newSaved = p.saved + amountNum;
        const newProgress = Math.min(Math.round((newSaved / p.target) * 100), 100);
        return { ...p, saved: newSaved, progress: newProgress };
      }
      return p;
    });

    const newTx = {
      id: Date.now(),
      date: new Date().toLocaleDateString('fr-FR'),
      category: 'Projet',
      desc: 'Virement vers projet',
      amount: -amountNum,
      type: 'expense'
    };

    const updatedTransactions = [...transactions, newTx];
    
    setProjects(updatedProjects);
    setTransactions(updatedTransactions);
    setStoredData({ transactions: updatedTransactions, projects: updatedProjects });
  };

  return (
    <BudgetContext.Provider value={{ transactions, projects, addTransaction, allocateToProject }}>
      {children}
    </BudgetContext.Provider>
  );
};