/**
 * Admin 应用主入口
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MenuLayout from './layouts/MenuLayout';
import TileLayout from './layouts/TileLayout';

// 示例页面
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';

// 采购申请
import {
  ListPage as PurchaseRequisitionsPage,
  CreatePage as CreatePurchaseRequisitionPage,
  ViewPage as ViewPurchaseRequisitionPage,
  EditPage as EditPurchaseRequisitionPage,
} from './pages/purchase-requisitions';

// 采购订单
import {
  ListPage as PurchaseOrdersPage,
  ViewPage as ViewPurchaseOrderPage,
} from './pages/purchase-orders';

// 收货管理
import {
  ListPage as GoodsReceiptPage,
  ViewPage as ViewGoodsReceiptPage,
  CreatePage as CreateGoodsReceiptPage,
  EditPage as EditGoodsReceiptPage,
} from './pages/goods-receipt';

// 主数据 - 物料
import {
  ListPage as MaterialsListPage,
  ViewPage as MaterialsViewPage,
} from './pages/master-data/materials';

// 主数据 - 供应商
import {
  ListPage as VendorsListPage,
  ViewPage as VendorsViewPage,
} from './pages/master-data/vendors';

// 主数据 - 工厂/仓库
import {
  ListPage as PlantsListPage,
  ViewPage as PlantsViewPage,
} from './pages/master-data/plants';

// 主数据 - 币种
import { CurrenciesPage } from './pages/master-data/currencies';

// 主数据 - 计量单位
import { UnitsOfMeasurePage } from './pages/master-data/units-of-measure';

// 主数据 - 采购组织
import { PurchaseOrganizationsPage } from './pages/master-data/purchase-organizations';

// 主数据 - 成本中心
import { CostCentersPage } from './pages/master-data/cost-centers';

// 报表分析
import {
  PurchaseRequisitionReport,
  PurchaseOrderReport,
} from './pages/reports';

function App() {
  // 从 localStorage 读取布局偏好
  const [layoutMode, setLayoutMode] = useState<'menu' | 'tile'>(() => {
    const saved = localStorage.getItem('admin-layout-mode');
    return (saved as 'menu' | 'tile') || 'tile';
  });

  // 保存布局偏好
  useEffect(() => {
    localStorage.setItem('admin-layout-mode', layoutMode);
  }, [layoutMode]);

  const handleLayoutModeChange = (mode: 'menu' | 'tile') => {
    setLayoutMode(mode);
  };

  return (
    <BrowserRouter>
      <Routes>
        {layoutMode === 'menu' ? (
          <Route
            element={<MenuLayout onLayoutModeChange={handleLayoutModeChange} />}
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/purchase-requisitions" element={<PurchaseRequisitionsPage />} />
            <Route path="/purchase-requisitions/create" element={<CreatePurchaseRequisitionPage />} />
            <Route path="/purchase-requisitions/:id/edit" element={<EditPurchaseRequisitionPage />} />
            <Route path="/purchase-requisitions/:id" element={<ViewPurchaseRequisitionPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchase-orders/:id" element={<ViewPurchaseOrderPage />} />
            <Route path="/goods-receipt" element={<GoodsReceiptPage />} />
            <Route path="/goods-receipt/create" element={<CreateGoodsReceiptPage />} />
            <Route path="/goods-receipt/:id/edit" element={<EditGoodsReceiptPage />} />
            <Route path="/goods-receipt/:id" element={<ViewGoodsReceiptPage />} />
            {/* 主数据 - 物料 */}
            <Route path="/master-data/materials" element={<MaterialsListPage />} />
            <Route path="/master-data/materials/:id" element={<MaterialsViewPage />} />
            {/* 主数据 - 供应商 */}
            <Route path="/master-data/vendors" element={<VendorsListPage />} />
            <Route path="/master-data/vendors/:id" element={<VendorsViewPage />} />
            {/* 主数据 - 工厂/仓库 */}
            <Route path="/master-data/plants" element={<PlantsListPage />} />
            <Route path="/master-data/plants/:id" element={<PlantsViewPage />} />
            {/* 主数据 - 币种 */}
            <Route path="/master-data/currencies" element={<CurrenciesPage />} />
            {/* 主数据 - 计量单位 */}
            <Route path="/master-data/units-of-measure" element={<UnitsOfMeasurePage />} />
            {/* 主数据 - 采购组织 */}
            <Route path="/master-data/purchase-organizations" element={<PurchaseOrganizationsPage />} />
            {/* 主数据 - 成本中心 */}
            <Route path="/master-data/cost-centers" element={<CostCentersPage />} />
            {/* 报表分析 */}
            <Route path="/reports/purchase-requisitions" element={<PurchaseRequisitionReport />} />
            <Route path="/reports/purchase-orders" element={<PurchaseOrderReport />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route
            element={<TileLayout onLayoutModeChange={handleLayoutModeChange} />}
          >
            <Route path="/" element={null} />
            <Route path="/purchase-requisitions" element={<PurchaseRequisitionsPage />} />
            <Route path="/purchase-requisitions/create" element={<CreatePurchaseRequisitionPage />} />
            <Route path="/purchase-requisitions/:id/edit" element={<EditPurchaseRequisitionPage />} />
            <Route path="/purchase-requisitions/:id" element={<ViewPurchaseRequisitionPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchase-orders/:id" element={<ViewPurchaseOrderPage />} />
            <Route path="/goods-receipt" element={<GoodsReceiptPage />} />
            <Route path="/goods-receipt/create" element={<CreateGoodsReceiptPage />} />
            <Route path="/goods-receipt/:id/edit" element={<EditGoodsReceiptPage />} />
            <Route path="/goods-receipt/:id" element={<ViewGoodsReceiptPage />} />
            {/* 主数据 - 物料 */}
            <Route path="/master-data/materials" element={<MaterialsListPage />} />
            <Route path="/master-data/materials/:id" element={<MaterialsViewPage />} />
            {/* 主数据 - 供应商 */}
            <Route path="/master-data/vendors" element={<VendorsListPage />} />
            <Route path="/master-data/vendors/:id" element={<VendorsViewPage />} />
            {/* 主数据 - 工厂/仓库 */}
            <Route path="/master-data/plants" element={<PlantsListPage />} />
            <Route path="/master-data/plants/:id" element={<PlantsViewPage />} />
            {/* 主数据 - 币种 */}
            <Route path="/master-data/currencies" element={<CurrenciesPage />} />
            {/* 主数据 - 计量单位 */}
            <Route path="/master-data/units-of-measure" element={<UnitsOfMeasurePage />} />
            {/* 主数据 - 采购组织 */}
            <Route path="/master-data/purchase-organizations" element={<PurchaseOrganizationsPage />} />
            {/* 主数据 - 成本中心 */}
            <Route path="/master-data/cost-centers" element={<CostCentersPage />} />
            {/* 报表分析 */}
            <Route path="/reports/purchase-requisitions" element={<PurchaseRequisitionReport />} />
            <Route path="/reports/purchase-orders" element={<PurchaseOrderReport />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
