/**
 * 采购申请报表页
 * 基于 SAP Fiori Analytical List Page (ALP) 设计
 */

import { useState } from 'react';
import { cn, DataTable, type DataTableColumn, Select, Input, Label } from '@aiko-boot/admin-component';

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
  chart: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 17V9M8 17V5M13 17V9M18 17V3" strokeLinecap="round" />
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
  totalCount: 156,
  totalCountChange: 12.5,
  totalAmount: 2850000,
  totalAmountChange: 8.3,
  pendingCount: 23,
  pendingCountChange: -5.2,
  avgProcessDays: 3.2,
  avgProcessDaysChange: -15.0,
};

// Mock 数据 - 按状态分布
const statusDistribution = [
  { status: 'draft', label: '草稿', count: 12, amount: 180000, color: '#9ca3af' },
  { status: 'pending', label: '待审批', count: 23, amount: 520000, color: '#f59e0b' },
  { status: 'approved', label: '已批准', count: 98, amount: 1650000, color: '#10b981' },
  { status: 'rejected', label: '已拒绝', count: 8, amount: 120000, color: '#ef4444' },
  { status: 'processing', label: '处理中', count: 15, amount: 380000, color: '#3b82f6' },
];

// Mock 数据 - 按部门分布
const departmentDistribution = [
  { dept: '研发部', count: 45, amount: 890000 },
  { dept: '市场部', count: 32, amount: 520000 },
  { dept: '运营部', count: 28, amount: 380000 },
  { dept: '行政部', count: 25, amount: 420000 },
  { dept: '财务部', count: 15, amount: 320000 },
  { dept: '其他', count: 11, amount: 320000 },
];

// Mock 数据 - 月度趋势
const monthlyTrend = [
  { month: '2024-01', count: 18, amount: 320000 },
  { month: '2024-02', count: 22, amount: 410000 },
  { month: '2024-03', count: 28, amount: 520000 },
  { month: '2024-04', count: 25, amount: 480000 },
  { month: '2024-05', count: 32, amount: 580000 },
  { month: '2024-06', count: 31, amount: 540000 },
];

// Mock 数据 - 明细列表
const detailList = [
  { id: '1', prNumber: 'PR-2024-0156', description: 'IT设备采购', requester: '张三', department: '研发部', amount: 189000, status: 'pending', createdAt: '2024-01-15' },
  { id: '2', prNumber: 'PR-2024-0155', description: '办公用品采购', requester: '李四', department: '行政部', amount: 15800, status: 'approved', createdAt: '2024-01-14' },
  { id: '3', prNumber: 'PR-2024-0154', description: '市场活动物料', requester: '王五', department: '市场部', amount: 68000, status: 'approved', createdAt: '2024-01-13' },
  { id: '4', prNumber: 'PR-2024-0153', description: '服务器采购', requester: '赵六', department: '研发部', amount: 258000, status: 'processing', createdAt: '2024-01-12' },
  { id: '5', prNumber: 'PR-2024-0152', description: '差旅费用报销', requester: '钱七', department: '市场部', amount: 12500, status: 'rejected', createdAt: '2024-01-11' },
];

// 状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  pending: { label: '待审批', color: 'bg-amber-50 text-amber-700' },
  approved: { label: '已批准', color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: '已拒绝', color: 'bg-red-50 text-red-600' },
  processing: { label: '处理中', color: 'bg-blue-50 text-blue-600' },
};

export function PurchaseRequisitionReport() {
  const [timeRange, setTimeRange] = useState('month');
  const [showFilter, setShowFilter] = useState(false);

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `¥${(amount / 10000).toFixed(1)}万`;
    }
    return `¥${amount.toLocaleString()}`;
  };

  const totalStatusCount = statusDistribution.reduce((sum, s) => sum + s.count, 0);
  const maxDeptAmount = Math.max(...departmentDistribution.map(d => d.amount));

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 relative overflow-hidden">
          <div className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              {Icons.chart}
              <div>
                <h1 className="text-xl font-semibold">采购申请分析报表</h1>
                <p className="text-white/70 text-sm">Analytical List Page - 多维度采购申请数据分析</p>
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
                    { value: 'pending', label: '待审批' },
                    { value: 'approved', label: '已批准' },
                    { value: 'rejected', label: '已拒绝' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-500 mb-1.5">部门</Label>
                <Select
                  options={[
                    { value: '', label: '全部' },
                    { value: 'dev', label: '研发部' },
                    { value: 'market', label: '市场部' },
                    { value: 'ops', label: '运营部' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-500 mb-1.5">申请人</Label>
                <Input
                  type="text"
                  placeholder="输入申请人姓名"
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-500 mb-1.5">金额范围</Label>
                <Select
                  options={[
                    { value: '', label: '全部' },
                    { value: '0-10000', label: '1万以下' },
                    { value: '10000-50000', label: '1-5万' },
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
          <p className="text-sm text-gray-500 mb-2">申请总数</p>
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
          <p className="text-sm text-gray-500 mb-2">申请总金额</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-blue-600">{formatAmount(kpiData.totalAmount)}</p>
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
          <p className="text-sm text-gray-500 mb-2">待审批数量</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-amber-600">{kpiData.pendingCount}</p>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              kpiData.pendingCountChange >= 0 ? "text-red-600" : "text-emerald-600"
            )}>
              {kpiData.pendingCountChange >= 0 ? Icons.arrowUp : Icons.arrowDown}
              <span>{Math.abs(kpiData.pendingCountChange)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">较上期</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2">平均处理天数</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">{kpiData.avgProcessDays}<span className="text-lg font-normal text-gray-500">天</span></p>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              kpiData.avgProcessDaysChange >= 0 ? "text-red-600" : "text-emerald-600"
            )}>
              {kpiData.avgProcessDaysChange >= 0 ? Icons.arrowUp : Icons.arrowDown}
              <span>{Math.abs(kpiData.avgProcessDaysChange)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">较上期</p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 状态分布 - 环形图 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">按状态分布</h3>
          </div>
          <div className="p-5">
            {/* 简易环形图 */}
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
            {/* 图例 */}
            <div className="space-y-2">
              {statusDistribution.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    <span className="text-xs text-gray-400 w-10 text-right">{((item.count / totalStatusCount) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 部门分布 - 横向条形图 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">按部门分布</h3>
          </div>
          <div className="p-5 space-y-3">
            {departmentDistribution.map((item) => (
              <div key={item.dept}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.dept}</span>
                  <span className="text-sm font-medium text-gray-900">{formatAmount(item.amount)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    style={{ width: `${(item.amount / maxDeptAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 月度趋势 - 柱状图 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">月度趋势</h3>
          </div>
          <div className="p-5">
            <div className="flex items-end justify-between h-40 gap-2">
              {monthlyTrend.map((item) => {
                const maxAmount = Math.max(...monthlyTrend.map(m => m.amount));
                const height = (item.amount / maxAmount) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-end h-32">
                      <span className="text-xs text-gray-500 mb-1">{formatAmount(item.amount)}</span>
                      <div
                        className="w-full max-w-8 bg-gradient-to-t from-violet-500 to-purple-400 rounded-t"
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

      {/* 明细列表 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">采购申请明细</h3>
          <span className="text-sm text-gray-500">共 {detailList.length} 条</span>
        </div>
        <DataTable<typeof detailList[0]>
          data={detailList}
          columns={[
            {
              id: 'prNumber',
              header: '申请编号',
              accessorKey: 'prNumber',
              cell: ({ row }) => (
                <span className="text-sm font-medium text-blue-600">{row.original.prNumber}</span>
              ),
            },
            {
              id: 'description',
              header: '描述',
              accessorKey: 'description',
              cell: ({ row }) => (
                <span className="text-sm text-gray-900">{row.original.description}</span>
              ),
            },
            {
              id: 'requester',
              header: '申请人',
              accessorKey: 'requester',
              cell: ({ row }) => (
                <span className="text-sm text-gray-600">{row.original.requester}</span>
              ),
            },
            {
              id: 'department',
              header: '部门',
              accessorKey: 'department',
              cell: ({ row }) => (
                <span className="text-sm text-gray-600">{row.original.department}</span>
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
              id: 'createdAt',
              header: '申请日期',
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

export default PurchaseRequisitionReport;
