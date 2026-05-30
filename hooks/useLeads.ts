"use client";

import { useState, useEffect } from "react";
import type { Lead, LeadFilters } from "@/types/lead";

const STORAGE_KEY = "agencyLeads";

export const useLeads = (agencyId?: string) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, [agencyId]);

  const loadLeads = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const filteredLeads = agencyId 
          ? parsed.filter((lead: Lead) => lead.agencyId === agencyId)
          : parsed;
        setLeads(filteredLeads);
      }
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLeads = (leadList: Lead[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leadList));
      setLeads(leadList);
    } catch (error) {
      console.error("Error saving leads:", error);
    }
  };

  const createLead = (leadData: Omit<Lead, "id" | "createdAt" | "updatedAt">): Lead => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "new"
    };

    const updatedLeads = [...leads, newLead];
    saveLeads(updatedLeads);
    return newLead;
  };

  const updateLeadStatus = (id: string, status: Lead["status"], notes?: string) => {
    const updatedLeads = leads.map(lead => 
      lead.id === id 
        ? { 
            ...lead, 
            status, 
            updatedAt: new Date().toISOString(),
            ...(notes && { notes })
          } 
        : lead
    );
    saveLeads(updatedLeads);
  };

  const deleteLead = (id: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== id);
    saveLeads(updatedLeads);
  };

  const addNote = (id: string, note: string) => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      const existingNotes = lead.notes || "";
      const updatedNotes = existingNotes ? `${existingNotes}\n\n${new Date().toISOString()}: ${note}` : `${new Date().toISOString()}: ${note}`;
      updateLeadStatus(id, lead.status, updatedNotes);
    }
  };

  const filterLeads = (filters: LeadFilters): Lead[] => {
    return leads.filter(lead => {
      if (filters.status && lead.status !== filters.status) return false;
      if (filters.destination && !lead.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
      if (filters.budget && lead.budget !== filters.budget) return false;
      if (filters.dateRange) {
        const leadDate = new Date(lead.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (leadDate < startDate || leadDate > endDate) return false;
      }
      return true;
    });
  };

  const getLeadsByStatus = () => {
    return {
      new: leads.filter(lead => lead.status === "new"),
      contacted: leads.filter(lead => lead.status === "contacted"),
      quoted: leads.filter(lead => lead.status === "quoted"),
      booked: leads.filter(lead => lead.status === "booked"),
      closed: leads.filter(lead => lead.status === "closed")
    };
  };

  const getLeadStats = () => {
    const statusCounts = getLeadsByStatus();
    const total = leads.length;

    return {
      total,
      new: statusCounts.new.length,
      contacted: statusCounts.contacted.length,
      quoted: statusCounts.quoted.length,
      booked: statusCounts.booked.length,
      closed: statusCounts.closed.length,
      conversionRate: total > 0 ? Math.round((statusCounts.booked.length / total) * 100) : 0
    };
  };

  const getRecentLeads = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return leads.filter(lead => new Date(lead.createdAt) >= cutoffDate);
  };

  const getLeadsByDestination = () => {
    const destinationCounts: Record<string, number> = {};
    
    leads.forEach(lead => {
      destinationCounts[lead.destination] = (destinationCounts[lead.destination] || 0) + 1;
    });

    return Object.entries(destinationCounts)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  return {
    leads,
    isLoading,
    createLead,
    updateLeadStatus,
    deleteLead,
    addNote,
    filterLeads,
    getLeadsByStatus,
    getLeadStats,
    getRecentLeads,
    getLeadsByDestination,
    loadLeads
  };
};
