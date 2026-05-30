"use client";

import { useState, useEffect } from "react";
import type { AgencyRequest, UserInput, Itinerary } from "@/types/itinerary";

const STORAGE_KEY = "agencyRequests";

export const useAgencyRequests = () => {
  const [requests, setRequests] = useState<AgencyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRequests(parsed);
      }
    } catch (error) {
      console.error("Error loading agency requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRequests = (requestList: AgencyRequest[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requestList));
      setRequests(requestList);
    } catch (error) {
      console.error("Error saving agency requests:", error);
    }
  };

  const createRequest = (
    userInput: UserInput,
    itinerary: Itinerary,
    userEmail?: string,
    userName?: string
  ): AgencyRequest => {
    const newRequest: AgencyRequest = {
      id: Date.now().toString(),
      userInput,
      itinerary,
      status: "pending",
      createdAt: new Date().toISOString(),
      userEmail,
      userName
    };

    const updatedRequests = [...requests, newRequest];
    saveRequests(updatedRequests);
    return newRequest;
  };

  const updateRequestStatus = (id: string, status: AgencyRequest["status"]) => {
    const updatedRequests = requests.map(req => 
      req.id === id ? { ...req, status } : req
    );
    saveRequests(updatedRequests);
  };

  const deleteRequest = (id: string) => {
    const updatedRequests = requests.filter(req => req.id !== id);
    saveRequests(updatedRequests);
  };

  const getPendingRequests = () => {
    return requests.filter(req => req.status === "pending");
  };

  const getContactedRequests = () => {
    return requests.filter(req => req.status === "contacted");
  };

  const getCompletedRequests = () => {
    return requests.filter(req => req.status === "completed");
  };

  return {
    requests,
    isLoading,
    createRequest,
    updateRequestStatus,
    deleteRequest,
    getPendingRequests,
    getContactedRequests,
    getCompletedRequests,
    loadRequests
  };
};
