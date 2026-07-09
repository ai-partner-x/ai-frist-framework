/**
 * 采购申请列表页面
 * 使用 ListReport 组件 - 基于 SAP Fiori List Report 设计
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, Select, Input, Label } from '@aiko-boot/admin-component';
import type { DataTableColumn } from '@aiko-boot/admin-component';
import { ListReport } from '../../components/ListReport';

// 购物车图标
const CartIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7" cy="15.5" r="1" />
    <circle cx="14" cy="15.5" r="1" />
    <path d="M1 1h2.5l2 10.5a1.5 1.5 0 001.5 1h7a1.5 1.5 0 001.5-1L17 4.5H4.5" />
  </svg>
);

// 操作图标
const Icons = {
  eye: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// 状态配置
const statusConfig = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  pending: { label: '待审批', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  approved: { label: '已批准', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: '已拒绝', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
  processing: { label: '处理中', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
};

// 数据类型
interface PurchaseRequisition {
  id: string;
  prNumber: string;
  material: string;
  materialCode: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  requester: string;
  department: string;
}

// 模拟数据
const mockData: PurchaseRequisition[] = [
  { id: '1', prNumber: 'PR-2024-0156', material: 'MacBook Pro 14" M3', materialCode: 'IT-001', quantity: 10, unit: '台', totalAmount: 189000, status: 'pending', createdAt: '2024-01-15 14:30', requester: '张三', department: '研发部' },
  { id: '2', prNumber: 'PR-2024-0155', material: 'A4复印纸 80g', materialCode: 'OF-023', quantity: 500, unit: '包', totalAmount: 12500, status: 'approved', createdAt: '2024-01-14 09:15', requester: '李四', department: '行政部' },
  { id: '3', prNumber: 'PR-2024-0154', material: '人体工学办公椅', materialCode: 'FN-008', quantity: 20, unit: '把', totalAmount: 56000, status: 'draft', createdAt: '2024-01-13 16:45', requester: '王五', department: '人力资源' },
  { id: '4', prNumber: 'PR-2024-0153', material: 'Dell 27" 4K显示器', materialCode: 'IT-015', quantity: 15, unit: '台', totalAmount: 52500, status: 'rejected', createdAt: '2024-01-12 11:20', requester: '赵六', department: '设计部' },
  { id: '5', prNumber: 'PR-2024-0152', material: '无线键鼠套装', materialCode: 'IT-032', quantity: 30, unit: '套', totalAmount: 8970, status: 'pending', createdAt: '2024-01-11 08:00', requester: '钱七', department: '运营部' },
  { id: '6', prNumber: 'PR-2024-0151', material: '投影仪', materialCode: 'IT-041', quantity: 2, unit: '台', totalAmount: 15800, status: 'processing', createdAt: '2024-01-10 15:30', requester: '孙八', department: '市场部' },
  { id: '7', prNumber: 'PR-2024-0150', material: '白板笔套装', materialCode: 'OF-056', quantity: 100, unit: '盒', totalAmount: 2800, status: 'approved', createdAt: '2024-01-09 10:00', requester: '周九', department: '培训部' },
];

export function ListPage() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    requester: '',
    department: '',
  });

  const filterCount = Object.values(filters).filter(v => v !== '').length;

  const handleClearFilters = () => {
    setFilters({ status: '', requester: '', department: '' });
  };

  const formatAmount = (amount: number) => `¥${amount.toLocaleString()}`;

  // 列定义
  const columns: DataTableColumn<PurchaseRequisition>[] = [
    {
      id: 'prNumber',
      header: '采购申请号',
      accessorKey: 'prNumber',
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/purchase-requisitions/${row.original.id}`)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.original.prNumber}
        </button>
      ),
    },
    {
      id: 'material',
      header: '物料信息',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900">{row.original.material}</p>
          <p className="text-xs text-gray-400">{row.original.materialCode}</p>
        </div>
      ),
    },
    {
      id: 'quantity',
      header: '数量',
      align: 'right',
      cell: ({ row }) => (
        <div>
          <span className="text-sm text-gray-900">{row.original.quantity}</span>
          <span className="text-xs text-gray-400 ml-1">{row.original.unit}</span>
        </div>
      ),
    },
    {
      id: 'totalAmount',
      header: '金额',
      align: 'right',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {formatAmount(row.original.totalAmount)}
        </span>
      ),
    },
    {
      id: 'status',
      header: '状态',
      align: 'center',
      cell: ({ row }) => {
        const status = statusConfig[row.original.status as keyof typeof statusConfig];
        return (
          <div className="flex items-center justify-center">
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
          </div>
        );
      },
    },
    {
      id: 'requester',
      header: '申请人',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900">{row.original.requester}</p>
          <p className="text-xs text-gray-400">{row.original.department}</p>
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: '创建时间',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.original.createdAt}</span>
      ),
    },
    {
      id: 'actions',
      header: '操作',
      align: 'center',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => navigate(`/purchase-requisitions/${row.original.id}`)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="查看"
          >
            {Icons.eye}
          </button>
          <button
            onClick={() => navigate(`/purchase-requisitions/${row.original.id}/edit`)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="编辑"
          >
            {Icons.edit}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pb-6">
      <ListReport<PurchaseRequisition>
        header={{
          title: '采购申请管理',
          subtitle: 'F1643 - 管理和跟踪所有采购申请单据',
          tag: 'List Report',
          icon: CartIcon,
        }}
        data={mockData}
        columns={columns}
        totalCount={156}
        primaryAction={{
          id: 'create',
          label: '创建',
          onClick: () => navigate('/purchase-requisitions/create'),
        }}
        selectionActions={[
          { id: 'view', label: '查看', icon: Icons.eye, onClick: () => {} },
          { id: 'edit', label: '编辑', icon: Icons.edit, onClick: () => {} },
        ]}
        searchPlaceholder="搜索采购申请号、物料、申请人..."
        showFilter={showFilter}
        onFilterToggle={() => setShowFilter(!showFilter)}
        filterCount={filterCount}
        onFilterClear={handleClearFilters}
        filterContent={
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="block text-xs text-gray-500 mb-1">状态</Label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'draft', label: '草稿' },
                  { value: 'pending', label: '待审批' },
                  { value: 'approved', label: '已批准' },
                  { value: 'rejected', label: '已拒绝' },
                  { value: 'processing', label: '处理中' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">申请人</Label>
              <Input
                type="text"
                placeholder="输入申请人"
                value={filters.requester}
                onChange={(e) => setFilters({ ...filters, requester: e.target.value })}
              />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">部门</Label>
              <Select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                options={[
                  { value: '', label: '全部部门' },
                  { value: '研发部', label: '研发部' },
                  { value: '行政部', label: '行政部' },
                  { value: '人力资源', label: '人力资源' },
                  { value: '设计部', label: '设计部' },
                  { value: '运营部', label: '运营部' },
                  { value: '市场部', label: '市场部' },
                ]}
              />
            </div>
          </div>
        }
        getRowId={(row) => row.id}
      />
    </div>
  );
}

export default ListPage;
