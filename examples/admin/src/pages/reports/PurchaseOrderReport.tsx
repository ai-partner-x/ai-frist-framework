/**
 * 采购订单报表页
 * 基于 SAP Fiori Analytical List Page (ALP) 设计
 */

import { useState } from 'react';
import { cn, DataTable, type DataTableColumn, Select, Label } from '@aiko-boot/admin-component';

// 图标
const Icons = {
  filter: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
    </svg>
  ),
  download: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v8M5 7l3 3 3-3M3 12h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  refresh: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8a6 6 0 0110.5-4M14 8a6 6 0 01-10.5 4" strokeLinecap="round" />
      <path d="M12.5 1v3h-3M3.5 15v-3h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  order: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 2h10l2 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6l2-4z" />
      <path d="M3 6h14M7 10h6M7 14h4" strokeLinecap="round" />
    </svg>
  ),
  arrowUp: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9V3M3 5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrowDown: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3v6M3 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// Mock 数据 - KPI
const kpiData = {
  totalCount: 89,
  totalCountChange: 15.2,
  totalAmount: 4580000,
  totalAmountChange: 22.5,
  deliveredCount: 65,
  deliveryRate: 73.0,
  avgLeadTime: 5.8,
  avgLeadTimeChange: -8.5,
};

// Mock 数据 - 按状态分布
const statusDistribution = [
  { status: 'draft', label: '草稿', count: 5, amount: 120000, color: '#9ca3af' },
  { status: 'pending', label: '待确认', count: 8, amount: 280000, color: '#f59e0b' },
  { status: 'confirmed', label: '已确认', count: 12, amount: 520000, color: '#3b82f6' },
  { status: 'shipped', label: '已发货', count: 18, amount: 780000, color: '#06b6d4' },
  { status: 'delivered', label: '已交货', count: 42, amount: 2580000, color: '#10b981' },
  { status: 'cancelled', label: '已取消', count: 4, amount: 300000, color: '#ef4444' },
];

// Mock 数据 - 供应商排名
const vendorRanking = [
  { vendor: '联想集团', count: 25, amount: 1280000, deliveryRate: 96 },
  { vendor: '戴尔科技', count: 18, amount: 920000, deliveryRate: 89 },
  { vendor: '惠普中国', count: 15, amount: 680000, deliveryRate: 93 },
  { vendor: '华为终端', count: 12, amount: 580000, deliveryRate: 91 },
  { vendor: '小米科技', count: 10, amount: 420000, deliveryRate: 85 },
];

// Mock 数据 - 月度采购金额
const monthlyAmount = [
  { month: '2024-01', amount: 580000 },
  { month: '2024-02', amount: 720000 },
  { month: '2024-03', amount: 850000 },
  { month: '2024-04', amount: 680000 },
  { month: '2024-05', amount: 920000 },
  { month: '2024-06', amount: 830000 },
];

// Mock 数据 - 物料类别分布
const categoryDistribution = [
  { category: 'IT设备', amount: 1850000, percentage: 40 },
  { category: '办公用品', amount: 680000, percentage: 15 },
  { category: '原材料', amount: 920000, percentage: 20 },
  { category: '服务采购', amount: 580000, percentage: 13 },
  { category: '其他', amount: 550000, percentage: 12 },
];

// Mock 数据 - 明细列表
const detailList = [
  { id: '1', poNumber: 'PO-2024-0089', vendor: '联想集团', amount: 189000, itemCount: 10, status: 'delivered', deliveryDate: '2024-01-20', createdAt: '2024-01-10' },
  { id: '2', poNumber: 'PO-2024-0088', vendor: '戴尔科技', amount: 258000, itemCount: 5, status: 'shipped', deliveryDate: '2024-01-25', createdAt: '2024-01-09' },
  { id: '3', poNumber: 'PO-2024-0087', vendor: '惠普中国', amount: 68000, itemCount: 20, status: 'confirmed', deliveryDate: '2024-01-28', createdAt: '2024-01-08' },
  { id: '4', poNumber: 'PO-2024-0086', vendor: '华为终端', amount: 125000, itemCount: 8, status: 'delivered', deliveryDate: '2024-01-18', createdAt: '2024-01-05' },
  { id: '5', poNumber: 'PO-2024-0085', vendor: '小米科技', amount: 42000, itemCount: 15, status: 'cancelled', deliveryDate: '-', createdAt: '2024-01-03' },
];

// 状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  pending: { label: '待确认', color: 'bg-amber-50 text-amber-700' },
  confirmed: { label: '已确认', color: 'bg-blue-50 text-blue-600' },
  shipped: { label: '已发货', color: 'bg-cyan-50 text-cyan-700' },
  delivered: { label: '已交货', color: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: '已取消', color: 'bg-red-50 text-red-600' },
};

export function PurchaseOrderReport() {
  const [timeRange, setTimeRange] = useState('month');
  const [showFilter, setShowFilter] = useState(false);

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `¥${(amount / 10000).toFixed(1)}万`;
    }
    return `¥${amount.toLocaleString()}`;
  };

  const totalStatusCount = statusDistribution.reduce((sum, s) => sum + s.count, 0);
  const maxMonthlyAmount = Math.max(...monthlyAmount.map(m => m.amount));

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 relative overflow-hidden">
          <div className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              {Icons.order}
              <div>
                <h1 className="text-xl font-semibold">采购订单分析报表</h1>
                <p className="text-white/70 text-sm">Analytical List Page - 采购订单执行与供应商分析</p>
              </div>
            </div>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-auto"
              options={[
                { value: 'week', label: '本周' },
                { value: 'month', label: '本月' },
                { value: 'quarter', label: '本季度' },
                { value: 'year', label: '本年度' },
              ]}
            />
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={cn(
                "h-9 px-3 rounded-lg border text-sm flex items-center gap-2 transition-colors",
                showFilter ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {Icons.filter}
              <span>筛选</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              {Icons.refresh}
              <span>刷新</span>
            </button>
            <button className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              {Icons.download}
              <span>导出</span>
            </button>
          </div>
        </div>

        {/* 筛选区域 */}
        {showFilter && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="block text-xs font-medium text-gray-500 mb-1.5">状态</Label>
                <Select
                  options={[
                    { value: '', label: '全部' },
                    { value: 'confirmed', label: '已确认' },
                    { value: 'shipped', label: '已发货' },
                    { value: 'delivered', label: '已交货' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-500 mb-1.5">供应商</Label>
                <Select
                  options={[
                    { value: '', label: '全部' },
                    { value: 'lenovo', label: '联想集团' },
                    { value: 'dell', label: '戴尔科技' },
                    { value: 'hp', label: '惠普中国' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-500 mb-1.5">物料类别</Label>
                <Select
                  options={[
                    { value: '', label: '全部' },
                    { value: 'it', label: 'IT设备' },
                    { value: 'office', label: '办公用品' },
                    { value: 'material', label: '原材料' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-500 mb-1.5">金额范围</Label>
                <Select
                  options={[
                    { value: '', label: '全部' },
                    { value: '0-50000', label: '5万以下' },
                    { value: '50000-100000', label: '5-10万' },
                    { value: '100000+', label: '10万以上' },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI 卡片区域 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2">订单总数</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">{kpiData.totalCount}</p>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              kpiData.totalCountChange >= 0 ? "text-emerald-600" : "text-red-600"
            )}>
              {kpiData.totalCountChange >= 0 ? Icons.arrowUp : Icons.arrowDown}
              <span>{Math.abs(kpiData.totalCountChange)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">较上期</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2">采购总金额</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-teal-600">{formatAmount(kpiData.totalAmount)}</p>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              kpiData.totalAmountChange >= 0 ? "text-emerald-600" : "text-red-600"
            )}>
              {kpiData.totalAmountChange >= 0 ? Icons.arrowUp : Icons.arrowDown}
              <span>{Math.abs(kpiData.totalAmountChange)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">较上期</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2">交货完成率</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-emerald-600">{kpiData.deliveryRate}<span className="text-lg font-normal text-gray-500">%</span></p>
            <span className="text-sm text-gray-500">{kpiData.deliveredCount}/{kpiData.totalCount}</span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${kpiData.deliveryRate}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2">平均交货周期</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">{kpiData.avgLeadTime}<span className="text-lg font-normal text-gray-500">天</span></p>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              kpiData.avgLeadTimeChange >= 0 ? "text-red-600" : "text-emerald-600"
            )}>
              {kpiData.avgLeadTimeChange >= 0 ? Icons.arrowUp : Icons.arrowDown}
              <span>{Math.abs(kpiData.avgLeadTimeChange)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">较上期</p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 状态分布 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">订单状态分布</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {statusDistribution.map((item, index) => {
                    const percentage = (item.count / totalStatusCount) * 100;
                    const offset = statusDistribution.slice(0, index).reduce((sum, s) => sum + (s.count / totalStatusCount) * 100, 0);
                    return (
                      <circle
                        key={item.status}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="12"
                        stroke={item.color}
                        strokeDasharray={`${percentage * 2.51} 251`}
                        strokeDashoffset={`${-offset * 2.51}`}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{totalStatusCount}</p>
                    <p className="text-xs text-gray-500">总计</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {statusDistribution.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 供应商排名 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">供应商采购排名</h3>
          </div>
          <div className="p-5 space-y-4">
            {vendorRanking.map((item, index) => (
              <div key={item.vendor} className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 ? "bg-amber-100 text-amber-700" :
                  index === 1 ? "bg-gray-200 text-gray-600" :
                  index === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-500"
                )}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{item.vendor}</span>
                    <span className="text-sm text-gray-600">{formatAmount(item.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{item.count} 单</span>
                    <span className="text-xs text-emerald-600">交货率 {item.deliveryRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 月度采购趋势 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">月度采购金额</h3>
          </div>
          <div className="p-5">
            <div className="flex items-end justify-between h-40 gap-2">
              {monthlyAmount.map((item) => {
                const height = (item.amount / maxMonthlyAmount) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-end h-32">
                      <span className="text-xs text-gray-500 mb-1">{formatAmount(item.amount)}</span>
                      <div
                        className="w-full max-w-8 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 mt-2">{item.month.split('-')[1]}月</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 物料类别分布 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">物料类别采购分布</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-5 gap-4">
            {categoryDistribution.map((item) => (
              <div key={item.category} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-gray-100" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      strokeWidth="8"
                      className="stroke-teal-500"
                      strokeDasharray={`${item.percentage * 2.83} 283`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">{item.category}</p>
                <p className="text-xs text-gray-500">{formatAmount(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 明细列表 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">采购订单明细</h3>
          <span className="text-sm text-gray-500">共 {detailList.length} 条</span>
        </div>
        <DataTable<typeof detailList[0]>
          data={detailList}
          columns={[
            {
              id: 'poNumber',
              header: '订单编号',
              accessorKey: 'poNumber',
              cell: ({ row }) => (
                <span className="text-sm font-medium text-blue-600">{row.original.poNumber}</span>
              ),
            },
            {
              id: 'vendor',
              header: '供应商',
              accessorKey: 'vendor',
              cell: ({ row }) => (
                <span className="text-sm text-gray-900">{row.original.vendor}</span>
              ),
            },
            {
              id: 'amount',
              header: '金额',
              accessorKey: 'amount',
              align: 'right',
              cell: ({ row }) => (
                <span className="text-sm font-medium text-gray-900">¥{row.original.amount.toLocaleString()}</span>
              ),
            },
            {
              id: 'itemCount',
              header: '行项目',
              accessorKey: 'itemCount',
              align: 'center',
              cell: ({ row }) => (
                <span className="text-sm text-gray-600">{row.original.itemCount}</span>
              ),
            },
            {
              id: 'status',
              header: '状态',
              accessorKey: 'status',
              align: 'center',
              cell: ({ row }) => {
                const status = statusConfig[row.original.status];
                return (
                  <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
                    {status.label}
                  </span>
                );
              },
            },
            {
              id: 'deliveryDate',
              header: '交货日期',
              accessorKey: 'deliveryDate',
              cell: ({ row }) => (
                <span className="text-sm text-gray-500">{row.original.deliveryDate}</span>
              ),
            },
            {
              id: 'createdAt',
              header: '创建日期',
              accessorKey: 'createdAt',
              cell: ({ row }) => (
                <span className="text-sm text-gray-500">{row.original.createdAt}</span>
              ),
            },
          ] as DataTableColumn<typeof detailList[0]>[]}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}

export default PurchaseOrderReport;
