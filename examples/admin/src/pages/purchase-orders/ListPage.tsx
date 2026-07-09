/**
 * 采购订单列表页面
 * 使用 ListReport 组件 - 基于 SAP Fiori List Report 设计
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, Select, Input, Label } from '@aiko-boot/admin-component';
import type { DataTableColumn } from '@aiko-boot/admin-component';
import { ListReport } from '../../components/ListReport';

// 订单图标
const OrderIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 2h12a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
    <path d="M5 6h8M5 9h6M5 12h4" strokeLinecap="round" />
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
  confirmed: { label: '已确认', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  sent: { label: '已发送', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  received: { label: '已收货', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  invoiced: { label: '已开票', color: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' },
  completed: { label: '已完成', color: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
  cancelled: { label: '已取消', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

// 数据类型
interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierCode: string;
  material: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  buyer: string;
  prRef: string;
}

// 模拟数据
const mockData: PurchaseOrder[] = [
  { id: '1', poNumber: 'PO-2024-0089', supplier: 'Apple 授权经销商', supplierCode: 'VD-001', material: 'MacBook Pro 14" M3', quantity: 10, unit: '台', totalAmount: 189000, status: 'sent', createdAt: '2024-01-20 10:30', buyer: '张三', prRef: 'PR-2024-0156' },
  { id: '2', poNumber: 'PO-2024-0088', supplier: '办公用品供应商', supplierCode: 'VD-015', material: 'A4复印纸 80g', quantity: 500, unit: '包', totalAmount: 12500, status: 'received', createdAt: '2024-01-19 14:15', buyer: '李四', prRef: 'PR-2024-0155' },
  { id: '3', poNumber: 'PO-2024-0087', supplier: '家具制造商', supplierCode: 'VD-023', material: '人体工学办公椅', quantity: 20, unit: '把', totalAmount: 56000, status: 'confirmed', createdAt: '2024-01-18 09:20', buyer: '王五', prRef: 'PR-2024-0154' },
  { id: '4', poNumber: 'PO-2024-0086', supplier: 'Dell 官方商城', supplierCode: 'VD-008', material: 'Dell 27" 4K显示器', quantity: 15, unit: '台', totalAmount: 52500, status: 'invoiced', createdAt: '2024-01-17 16:45', buyer: '赵六', prRef: 'PR-2024-0153' },
  { id: '5', poNumber: 'PO-2024-0085', supplier: 'IT配件供应商', supplierCode: 'VD-031', material: '无线键鼠套装', quantity: 30, unit: '套', totalAmount: 8970, status: 'completed', createdAt: '2024-01-16 11:00', buyer: '钱七', prRef: 'PR-2024-0152' },
  { id: '6', poNumber: 'PO-2024-0084', supplier: '投影设备商', supplierCode: 'VD-042', material: '投影仪', quantity: 2, unit: '台', totalAmount: 15800, status: 'draft', createdAt: '2024-01-15 08:30', buyer: '孙八', prRef: 'PR-2024-0151' },
];

export function ListPage() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    buyer: '',
    dateFrom: '',
    dateTo: '',
  });

  // 计算已选筛选条件数量
  const filterCount = Object.values(filters).filter(v => v !== '').length;

  // 清除筛选
  const handleClearFilters = () => {
    setFilters({ status: '', buyer: '', dateFrom: '', dateTo: '' });
  };

  const formatAmount = (amount: number) => `¥${amount.toLocaleString()}`;

  // 列定义
  const columns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: 'poNumber',
      header: '采购订单号',
      accessorKey: 'poNumber',
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/purchase-orders/${row.original.id}`)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.original.poNumber}
        </button>
      ),
    },
    {
      id: 'supplier',
      header: '供应商',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900">{row.original.supplier}</p>
          <p className="text-xs text-gray-400">{row.original.supplierCode}</p>
        </div>
      ),
    },
    {
      id: 'material',
      header: '物料信息',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900">{row.original.material}</p>
          <p className="text-xs text-gray-400">参考: {row.original.prRef}</p>
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
      id: 'buyer',
      header: '采购员',
      accessorKey: 'buyer',
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
            onClick={() => navigate(`/purchase-orders/${row.original.id}`)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="查看"
          >
            {Icons.eye}
          </button>
          <button
            onClick={() => navigate(`/purchase-orders/${row.original.id}/edit`)}
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
      <ListReport<PurchaseOrder>
        header={{
          title: '采购订单管理',
          subtitle: 'ME21N - 管理和跟踪所有采购订单',
          tag: 'List Report',
          icon: OrderIcon,
        }}
        data={mockData}
        columns={columns}
        totalCount={89}
        primaryAction={{
          id: 'create',
          label: '创建',
          onClick: () => navigate('/purchase-orders/create'),
        }}
        selectionActions={[
          {
            id: 'view',
            label: '查看',
            icon: Icons.eye,
            onClick: () => {},
          },
          {
            id: 'edit',
            label: '编辑',
            icon: Icons.edit,
            onClick: () => {},
          },
        ]}
        searchPlaceholder="搜索采购订单号、供应商、物料..."
        showFilter={showFilter}
        onFilterToggle={() => setShowFilter(!showFilter)}
        filterCount={filterCount}
        onFilterClear={handleClearFilters}
        filterContent={
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="block text-xs text-gray-500 mb-1">状态</Label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'draft', label: '草稿' },
                  { value: 'confirmed', label: '已确认' },
                  { value: 'sent', label: '已发送' },
                  { value: 'received', label: '已收货' },
                  { value: 'invoiced', label: '已开票' },
                  { value: 'completed', label: '已完成' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">采购员</Label>
              <Select
                value={filters.buyer}
                onChange={(e) => setFilters({ ...filters, buyer: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: '张三', label: '张三' },
                  { value: '李四', label: '李四' },
                  { value: '王五', label: '王五' },
                  { value: '赵六', label: '赵六' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">开始日期</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">结束日期</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
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
