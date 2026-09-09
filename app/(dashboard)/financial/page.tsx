"use client";

import React from "react";
import PageHeader from "@/components/ui/PageHeader";
import Tabs from "@/components/ui/Tabs";
import CommissionsTab from "./CommissionsTab";
import PayoutsTab from "./PayoutsTab";
import TransactionsTab from "./TransactionsTab";

export default function FinancialPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financial & Commission Management"
        description="Manage seller commissions, payouts, and order transactions."
      />
      <Tabs
        tabs={[
          { key: "commissions", label: "Commissions", content: <CommissionsTab /> },
          { key: "payouts", label: "Payouts", content: <PayoutsTab /> },
          { key: "transactions", label: "Transactions", content: <TransactionsTab /> },
        ]}
      />
    </div>
  );
}
