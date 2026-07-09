/**
 * 工厂/仓库列表页
 * 使用 ListReport 组件
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, Select, Label } from '@aiko-boot/admin-component';
import type { DataTableColumn } from '@aiko-boot/admin-component';
import { ListReport } from '../../../components/ListReport';

// 工厂图标
const PlantIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 16V8l5-5 5 5v8H2zM12 16V4h4v12h-4z" />
    <path d="M5 16v-4h4v4M14 8h0M14 11h0" strokeLinecap="round" />
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

// 工厂/仓库类型
type Plant = {
  id: string;
  plantCode: string;
  plantName: string;
  plantType: 'plant' | 'warehouse' | 'dc';
  companyCode: string;
  country: string;
  city: string;
  address: string;
  contactPerson: string;
  phone: string;
  storageLocations: number;
  status: 'active' | 'inactive';
  createdAt: string;
};

// 状态配置
const statusConfig = {
  active: { label: '运营中', color: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
  inactive: { label: '停用', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

// 工厂类型配置
const plantTypeConfig: Record<string, { label: string; color: string }> = {
  plant: { label: '生产工厂', color: 'bg-blue-50 text-blue-600' },
  warehouse: { label: '仓库', color: 'bg-orange-50 text-orange-600' },
  dc: { label: '配送中心', color: 'bg-purple-50 text-purple-600' },
};

// Mock 数据
const mockPlants: Plant[] = [
  { id: '1', plantCode: '1000', plantName: '北京总部工厂', plantType: 'plant', companyCode: 'CN01', country: '中国', city: '北京', address: '北京市海淀区中关村软件园', contactPerson: '张厂长', phone: '010-12345678', storageLocations: 5, status: 'active', createdAt: '2020-01-01' },
  { id: '2', plantCode: '2000', plantName: '上海分厂', plantType: 'plant', companyCode: 'CN01', country: '中国', city: '上海', address: '上海市浦东新区张江高科技园区', contactPerson: '李厂长', phone: '021-87654321', storageLocations: 3, status: 'active', createdAt: '2020-03-15' },
  { id: '3', plantCode: 'WH01', plantName: '北京中央仓库', plantType: 'warehouse', companyCode: 'CN01', country: '中国', city: '北京', address: '北京市大兴区物流园区', contactPerson: '王主管', phone: '010-11112222', storageLocations: 8, status: 'active', createdAt: '2020-06-01' },
  { id: '4', plantCode: 'WH02', plantName: '华东仓库', plantType: 'warehouse', companyCode: 'CN01', country: '中国', city: '苏州', address: '苏州市工业园区物流港', contactPerson: '赵主管', phone: '0512-33334444', storageLocations: 6, status: 'active', createdAt: '2021-01-10' },
  { id: '5', plantCode: 'DC01', plantName: '华南配送中心', plantType: 'dc', companyCode: 'CN01', country: '中国', city: '深圳', address: '深圳市龙岗区物流基地', contactPerson: '孙经理', phone: '0755-55556666', storageLocations: 4, status: 'active', createdAt: '2021-06-20' },
  { id: '6', plantCode: '3000', plantName: '成都分厂', plantType: 'plant', companyCode: 'CN01', country: '中国', city: '成都', address: '成都市高新区科技园', contactPerson: '周厂长', phone: '028-77778888', storageLocations: 2, status: 'inactive', createdAt: '2022-02-28' },
];

export function ListPage() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    plantType: '',
    city: '',
  });

  // 列定义
  const columns: DataTableColumn<Plant>[] = [
    {
      id: 'plantCode',
      header: '工厂/仓库编码',
      accessorKey: 'plantCode',
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/master-data/plants/${row.original.id}`)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.original.plantCode}
        </button>
      ),
    },
    {
      id: 'plantName',
      header: '名称',
      cell: ({ row }) => {
        const typeConfig = plantTypeConfig[row.original.plantType];
        return (
          <div>
            <p className="text-sm text-gray-900 font-medium">{row.original.plantName}</p>
            <span className={cn("inline-flex px-1.5 py-0.5 rounded text-xs font-medium mt-0.5", typeConfig.color)}>
              {typeConfig.label}
            </span>
          </div>
        );
      },
    },
    {
      id: 'location',
      header: '位置',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900">{row.original.city}</p>
          <p className="text-xs text-gray-400 truncate max-w-[180px]">{row.original.address}</p>
        </div>
      ),
    },
    {
      id: 'contact',
      header: '负责人',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900">{row.original.contactPerson}</p>
          <p className="text-xs text-gray-400">{row.original.phone}</p>
        </div>
      ),
    },
    {
      id: 'storageLocations',
      header: '存储位置',
      align: 'center',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.storageLocations} 个</span>
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
      id: 'actions',
      header: '操作',
      align: 'center',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => navigate(`/master-data/plants/${row.original.id}`)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="查看"
          >
            {Icons.eye}
          </button>
          <button
            onClick={() => navigate(`/master-data/plants/${row.original.id}/edit`)}
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
      <ListReport<Plant>
        header={{
          title: '工厂与仓库',
          subtitle: 'OX10 - 管理和维护工厂、仓库、配送中心',
          tag: 'Master Data',
          icon: PlantIcon,
        }}
        data={mockPlants}
        columns={columns}
        totalCount={mockPlants.length}
        primaryAction={{
          id: 'create',
          label: '创建工厂/仓库',
          onClick: () => navigate('/master-data/plants/create'),
        }}
        searchPlaceholder="搜索编码、名称..."
        showFilter={showFilter}
        onFilterToggle={() => setShowFilter(!showFilter)}
        filterCount={Object.values(filters).filter(Boolean).length}
        onFilterClear={() => setFilters({ status: '', plantType: '', city: '' })}
        filterContent={
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1.5">状态</Label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'active', label: '运营中' },
                  { value: 'inactive', label: '停用' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1.5">类型</Label>
              <Select
                value={filters.plantType}
                onChange={(e) => setFilters({ ...filters, plantType: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'plant', label: '生产工厂' },
                  { value: 'warehouse', label: '仓库' },
                  { value: 'dc', label: '配送中心' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1.5">城市</Label>
              <Select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: '北京', label: '北京' },
                  { value: '上海', label: '上海' },
                  { value: '深圳', label: '深圳' },
                  { value: '苏州', label: '苏州' },
                  { value: '成都', label: '成都' },
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
