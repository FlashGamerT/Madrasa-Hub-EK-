
// Added React import to support React.ReactNode type definition
import React from 'react';

export interface FeatureItem {
  id: string;
  title: string;
  malayalamTitle: string;
  icon: React.ReactNode;
  color: string;
  category: 'academic' | 'resource' | 'utility' | 'kids';
}

export type ClassLevel = 
  | 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5' 
  | 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10' 
  | 'Plus One' | 'Plus Two';

export enum Tab {
  Home = 'home',
  Academic = 'academic',
  Kids = 'kids',
  Profile = 'profile'
}