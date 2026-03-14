
import React from 'react';
import { Navigate } from 'react-router-dom';

// DEPRECATED: This component has been replaced by SellerCenter.tsx
// All functionality (Analytics, Inventory, Show Planner) has been migrated.
// Redirecting to the new Seller Hub.

const CreatorDashboard: React.FC = () => {
  return <Navigate to="/seller" replace />;
};

export default CreatorDashboard;
