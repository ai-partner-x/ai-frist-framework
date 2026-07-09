/**
 * 物料主数据列表页
 * 使用 ListReport 组件
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, Select, Label } from '@aiko-boot/admin-component';
import type { DataTableColumn } from '@aiko-boot/admin-component';
import { ListReport } from '../../../components/ListReport';

// 物料图标
const MaterialIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="14" height="14" rx="2" />
    <path d="M6 6h6M6 9h6M6 12h4" strokeLinecap="round" />
  </svg>
);

// 图标
const Icons = {
  eye: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 2l2 2-7 7H3v-2l7-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// 物料类型
type Material = {
  id: string;
  materialCode: string;
  materialName: string;
  materialType: string;
  materialGroup: string;
  baseUnit: string;
  description: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
};

// 状态配置
const statusConfig = {
  active: { label: '启用', color: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
  inactive: { label: '停用', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
  blocked: { label: '冻结', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

// 物料类型配置
const materialTypeConfig: Record<string, string> = {
  ROH: '原材料',
  HALB: '半成品',
  FERT: '成品',
  HIBE: '辅助材料',
  NLAG: '非库存物料',
};

// Mock 数据
const mockMaterials: Material[] = [
  { id: '1', materialCode: 'IT-001', materialName: 'MacBook Pro 14" M3', materialType: 'FERT', materialGroup: 'IT设备', baseUnit: '台', description: 'Apple MacBook Pro 14英寸 M3芯片', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-15' },
  { id: '2', materialCode: 'IT-002', materialName: 'Dell XPS 15', materialType: 'FERT', materialGroup: 'IT设备', baseUnit: '台', description: 'Dell XPS 15英寸笔记本', status: 'active', createdAt: '2024-01-02', updatedAt: '2024-01-16' },
  { id: '3', materialCode: 'OF-001', materialName: 'A4打印纸', materialType: 'HIBE', materialGroup: '办公用品', baseUnit: '包', description: '70g A4打印纸 500张/包', status: 'active', createdAt: '2024-01-03', updatedAt: '2024-01-17' },
  { id: '4', materialCode: 'OF-002', materialName: '中性笔', materialType: 'HIBE', materialGroup: '办公用品', baseUnit: '支', description: '0.5mm黑色中性笔', status: 'active', createdAt: '2024-01-04', updatedAt: '2024-01-18' },
  { id: '5', materialCode: 'IT-003', materialName: '显示器支架', materialType: 'NLAG', materialGroup: 'IT配件', baseUnit: '个', description: '铝合金显示器支架', status: 'inactive', createdAt: '2024-01-05', updatedAt: '2024-01-19' },
  { id: '6', materialCode: 'ROH-001', materialName: '铝合金板材', materialType: 'ROH', materialGroup: '原材料', baseUnit: 'KG', description: '6061铝合金板材', status: 'active', createdAt: '2024-01-06', updatedAt: '2024-01-20' },
  { id: '7', materialCode: 'HALB-001', materialName: '主板组件', materialType: 'HALB', materialGroup: '半成品', baseUnit: '块', description: '电脑主板半成品组件', status: 'blocked', createdAt: '2024-01-07', updatedAt: '2024-01-21' },
];

export function ListPage() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    materialType: '',
    materialGroup: '',
  });

  // 列定义
  const columns: DataTableColumn<Material>[] = [
    {
      id: 'materialCode',
      header: '物料编码',
      accessorKey: 'materialCode',
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/master-data/materials/${row.original.id}`)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.original.materialCode}
        </button>
      ),
    },
    {
      id: 'materialName',
      header: '物料名称',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900">{row.original.materialName}</p>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{row.original.description}</p>
        </div>
      ),
    },
    {
      id: 'materialType',
      header: '物料类型',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {materialTypeConfig[row.original.materialType] || row.original.materialType}
        </span>
      ),
    },
    {
      id: 'materialGroup',
      header: '物料组',
      accessorKey: 'materialGroup',
    },
    {
      id: 'baseUnit',
      header: '基本单位',
      align: 'center',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.baseUnit}</span>
      ),
    },
    {
      id: 'status',
      header: '状态',
      align: 'center',
      cell: ({ row }) => {
        const status = statusConfig[row.original.status];
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        );
      },
    },
    {
      id: 'updatedAt',
      header: '更新时间',
      accessorKey: 'updatedAt',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.original.updatedAt}</span>
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
            onClick={() => navigate(`/master-data/materials/${row.original.id}`)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="查看"
          >
            {Icons.eye}
          </button>
          <button
            onClick={() => navigate(`/master-data/materials/${row.original.id}/edit`)}
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
      <ListReport<Material>
        header={{
          title: '物料主数据',
          subtitle: 'MM03 - 管理和维护物料基础信息',
          tag: 'Master Data',
          icon: MaterialIcon,
        }}
        data={mockMaterials}
        columns={columns}
        totalCount={mockMaterials.length}
        primaryAction={{
          id: 'create',
          label: '创建物料',
          onClick: () => navigate('/master-data/materials/create'),
        }}
        searchPlaceholder="搜索物料编码、名称..."
        showFilter={showFilter}
        onFilterToggle={() => setShowFilter(!showFilter)}
        filterCount={Object.values(filters).filter(Boolean).length}
        onFilterClear={() => setFilters({ status: '', materialType: '', materialGroup: '' })}
        filterContent={
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1.5">状态</Label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'active', label: '启用' },
                  { value: 'inactive', label: '停用' },
                  { value: 'blocked', label: '冻结' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1.5">物料类型</Label>
              <Select
                value={filters.materialType}
                onChange={(e) => setFilters({ ...filters, materialType: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'ROH', label: '原材料' },
                  { value: 'HALB', label: '半成品' },
                  { value: 'FERT', label: '成品' },
                  { value: 'HIBE', label: '辅助材料' },
                  { value: 'NLAG', label: '非库存物料' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1.5">物料组</Label>
              <Select
                value={filters.materialGroup}
                onChange={(e) => setFilters({ ...filters, materialGroup: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'IT设备', label: 'IT设备' },
                  { value: '办公用品', label: '办公用品' },
                  { value: 'IT配件', label: 'IT配件' },
                  { value: '原材料', label: '原材料' },
                  { value: '半成品', label: '半成品' },
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
