/**
 * 收货管理列表页面
 * 使用 ListReport 组件 - 基于 SAP Fiori List Report 设计
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, Select, Label } from '@aiko-boot/admin-component';
import type { DataTableColumn } from '@aiko-boot/admin-component';
import { ListReport } from '../../components/ListReport';

// 卡车图标
const TruckIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 3h10v9H1zM11 7h3l2 3v5h-5z" />
    <circle cx="4" cy="14" r="1.5" />
    <circle cx="13" cy="14" r="1.5" />
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
  planned: { label: '计划中', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  inbound: { label: '运输中', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  arrived: { label: '已到达', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  inspecting: { label: '检验中', color: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' },
  received: { label: '已入库', color: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
  partial: { label: '部分收货', color: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
  rejected: { label: '已退回', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

// 数据类型
interface GoodsReceipt {
  id: string;
  grNumber: string;
  poRef: string;
  supplier: string;
  material: string;
  orderedQty: number;
  receivedQty: number;
  unit: string;
  status: string;
  plant: string;
  storageLocation: string;
  receivedAt: string;
  receiver: string;
}

// 模拟数据
const mockData: GoodsReceipt[] = [
  { id: '1', grNumber: 'GR-2024-0056', poRef: 'PO-2024-0089', supplier: 'Apple 授权经销商', material: 'MacBook Pro 14" M3', orderedQty: 10, receivedQty: 10, unit: '台', status: 'received', plant: '1000', storageLocation: 'WH01', receivedAt: '2024-01-25 14:30', receiver: '王五' },
  { id: '2', grNumber: 'GR-2024-0055', poRef: 'PO-2024-0088', supplier: '办公用品供应商', material: 'A4复印纸 80g', orderedQty: 500, receivedQty: 500, unit: '包', status: 'inspecting', plant: '1000', storageLocation: 'WH02', receivedAt: '2024-01-24 10:00', receiver: '赵六' },
  { id: '3', grNumber: 'GR-2024-0054', poRef: 'PO-2024-0087', supplier: '家具制造商', material: '人体工学办公椅', orderedQty: 20, receivedQty: 15, unit: '把', status: 'partial', plant: '1000', storageLocation: 'WH01', receivedAt: '2024-01-23 16:20', receiver: '钱七' },
  { id: '4', grNumber: 'GR-2024-0053', poRef: 'PO-2024-0086', supplier: 'Dell 官方商城', material: 'Dell 27" 4K显示器', orderedQty: 15, receivedQty: 0, unit: '台', status: 'inbound', plant: '1000', storageLocation: 'WH01', receivedAt: '-', receiver: '-' },
  { id: '5', grNumber: 'GR-2024-0052', poRef: 'PO-2024-0085', supplier: 'IT配件供应商', material: '无线键鼠套装', orderedQty: 30, receivedQty: 30, unit: '套', status: 'received', plant: '1000', storageLocation: 'WH02', receivedAt: '2024-01-22 09:15', receiver: '孙八' },
  { id: '6', grNumber: 'GR-2024-0051', poRef: 'PO-2024-0084', supplier: '投影设备商', material: '投影仪', orderedQty: 2, receivedQty: 0, unit: '台', status: 'planned', plant: '1000', storageLocation: 'WH01', receivedAt: '-', receiver: '-' },
];

export function ListPage() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    plant: '',
    storageLocation: '',
  });

  const filterCount = Object.values(filters).filter(v => v !== '').length;

  const handleClearFilters = () => {
    setFilters({ status: '', plant: '', storageLocation: '' });
  };

  // 列定义
  const columns: DataTableColumn<GoodsReceipt>[] = [
    {
      id: 'grNumber',
      header: '收货单号',
      accessorKey: 'grNumber',
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/goods-receipt/${row.original.id}`)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.original.grNumber}
        </button>
      ),
    },
    {
      id: 'poRef',
      header: '采购订单',
      accessorKey: 'poRef',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.poRef}</span>
      ),
    },
    {
      id: 'supplier',
      header: '供应商',
      accessorKey: 'supplier',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{row.original.supplier}</span>
      ),
    },
    {
      id: 'material',
      header: '物料',
      accessorKey: 'material',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{row.original.material}</span>
      ),
    },
    {
      id: 'quantity',
      header: '数量 (订单/已收)',
      align: 'right',
      cell: ({ row }) => (
        <div>
          <span className="text-sm text-gray-900">{row.original.receivedQty}</span>
          <span className="text-xs text-gray-400 mx-1">/</span>
          <span className="text-sm text-gray-500">{row.original.orderedQty}</span>
          <span className="text-xs text-gray-400 ml-1">{row.original.unit}</span>
        </div>
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
      id: 'location',
      header: '存储位置',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900">{row.original.plant}</p>
          <p className="text-xs text-gray-400">{row.original.storageLocation}</p>
        </div>
      ),
    },
    {
      id: 'receivedAt',
      header: '收货时间',
      accessorKey: 'receivedAt',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.original.receivedAt}</span>
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
            onClick={() => navigate(`/goods-receipt/${row.original.id}`)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="查看"
          >
            {Icons.eye}
          </button>
          <button
            onClick={() => navigate(`/goods-receipt/${row.original.id}/edit`)}
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
      <ListReport<GoodsReceipt>
        header={{
          title: '收货管理',
          subtitle: 'F1645 - 管理和跟踪所有采购订单的收货',
          tag: 'List Report',
          icon: TruckIcon,
        }}
        data={mockData}
        columns={columns}
        totalCount={56}
        primaryAction={{
          id: 'create',
          label: '收货',
          onClick: () => navigate('/goods-receipt/create'),
        }}
        selectionActions={[
          { id: 'view', label: '查看', icon: Icons.eye, onClick: () => {} },
        ]}
        searchPlaceholder="搜索收货单号、采购订单、供应商..."
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
                  { value: 'planned', label: '计划中' },
                  { value: 'inbound', label: '运输中' },
                  { value: 'arrived', label: '已到达' },
                  { value: 'inspecting', label: '检验中' },
                  { value: 'received', label: '已入库' },
                  { value: 'partial', label: '部分收货' },
                  { value: 'rejected', label: '已退回' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">工厂</Label>
              <Select
                value={filters.plant}
                onChange={(e) => setFilters({ ...filters, plant: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: '1000', label: '1000 - 总部' },
                  { value: '2000', label: '2000 - 华东分部' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">存储位置</Label>
              <Select
                value={filters.storageLocation}
                onChange={(e) => setFilters({ ...filters, storageLocation: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'WH01', label: 'WH01 - 主仓库' },
                  { value: 'WH02', label: 'WH02 - 备用仓库' },
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
