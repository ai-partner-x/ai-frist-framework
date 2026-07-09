/**
 * 供应商主数据列表页
 * 使用 ListReport 组件
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, Select, Label } from '@aiko-boot/admin-component';
import type { DataTableColumn } from '@aiko-boot/admin-component';
import { ListReport } from '../../../components/ListReport';

// 供应商图标
const VendorIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 14V4a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
    <path d="M6 6h6M6 9h4M6 12h2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" />
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

// 供应商类型
type Vendor = {
  id: string;
  vendorCode: string;
  vendorName: string;
  vendorType: string;
  country: string;
  city: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
};

// 状态配置
const statusConfig = {
  active: { label: '合作中', color: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
  inactive: { label: '暂停', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
  blocked: { label: '黑名单', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

// 供应商类型配置
const vendorTypeConfig: Record<string, string> = {
  supplier: '供货商',
  service: '服务商',
  contractor: '承包商',
  oneTime: '一次性供应商',
};

// Mock 数据
const mockVendors: Vendor[] = [
  { id: '1', vendorCode: 'VD-001', vendorName: '联想集团', vendorType: 'supplier', country: '中国', city: '北京', contactPerson: '王经理', phone: '010-12345678', email: 'wang@lenovo.com', status: 'active', createdAt: '2023-01-15' },
  { id: '2', vendorCode: 'VD-002', vendorName: '戴尔科技', vendorType: 'supplier', country: '中国', city: '上海', contactPerson: '李总', phone: '021-87654321', email: 'li@dell.com', status: 'active', createdAt: '2023-02-20' },
  { id: '3', vendorCode: 'VD-003', vendorName: '华为技术', vendorType: 'supplier', country: '中国', city: '深圳', contactPerson: '张工', phone: '0755-11112222', email: 'zhang@huawei.com', status: 'active', createdAt: '2023-03-10' },
  { id: '4', vendorCode: 'VD-004', vendorName: '京东物流', vendorType: 'service', country: '中国', city: '北京', contactPerson: '赵经理', phone: '010-33334444', email: 'zhao@jd.com', status: 'active', createdAt: '2023-04-05' },
  { id: '5', vendorCode: 'VD-005', vendorName: '顺丰速运', vendorType: 'service', country: '中国', city: '深圳', contactPerson: '孙总', phone: '0755-55556666', email: 'sun@sf.com', status: 'inactive', createdAt: '2023-05-12' },
  { id: '6', vendorCode: 'VD-006', vendorName: '办公易', vendorType: 'supplier', country: '中国', city: '广州', contactPerson: '周经理', phone: '020-77778888', email: 'zhou@office.com', status: 'blocked', createdAt: '2023-06-18' },
];

export function ListPage() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    vendorType: '',
    city: '',
  });

  // 列定义
  const columns: DataTableColumn<Vendor>[] = [
    {
      id: 'vendorCode',
      header: '供应商编码',
      accessorKey: 'vendorCode',
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/master-data/vendors/${row.original.id}`)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.original.vendorCode}
        </button>
      ),
    },
    {
      id: 'vendorName',
      header: '供应商名称',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900 font-medium">{row.original.vendorName}</p>
          <p className="text-xs text-gray-400">{vendorTypeConfig[row.original.vendorType]}</p>
        </div>
      ),
    },
    {
      id: 'location',
      header: '所在地',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.country} · {row.original.city}
        </span>
      ),
    },
    {
      id: 'contact',
      header: '联系人',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-gray-900">{row.original.contactPerson}</p>
          <p className="text-xs text-gray-400">{row.original.phone}</p>
        </div>
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
            onClick={() => navigate(`/master-data/vendors/${row.original.id}`)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="查看"
          >
            {Icons.eye}
          </button>
          <button
            onClick={() => navigate(`/master-data/vendors/${row.original.id}/edit`)}
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
      <ListReport<Vendor>
        header={{
          title: '供应商主数据',
          subtitle: 'XK03 - 管理和维护供应商信息',
          tag: 'Master Data',
          icon: VendorIcon,
        }}
        data={mockVendors}
        columns={columns}
        totalCount={mockVendors.length}
        primaryAction={{
          id: 'create',
          label: '创建供应商',
          onClick: () => navigate('/master-data/vendors/create'),
        }}
        searchPlaceholder="搜索供应商编码、名称..."
        showFilter={showFilter}
        onFilterToggle={() => setShowFilter(!showFilter)}
        filterCount={Object.values(filters).filter(Boolean).length}
        onFilterClear={() => setFilters({ status: '', vendorType: '', city: '' })}
        filterContent={
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1.5">状态</Label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'active', label: '合作中' },
                  { value: 'inactive', label: '暂停' },
                  { value: 'blocked', label: '黑名单' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1.5">供应商类型</Label>
              <Select
                value={filters.vendorType}
                onChange={(e) => setFilters({ ...filters, vendorType: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: 'supplier', label: '供货商' },
                  { value: 'service', label: '服务商' },
                  { value: 'contractor', label: '承包商' },
                  { value: 'oneTime', label: '一次性供应商' },
                ]}
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-500 mb-1.5">所在城市</Label>
              <Select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                options={[
                  { value: '', label: '全部' },
                  { value: '北京', label: '北京' },
                  { value: '上海', label: '上海' },
                  { value: '深圳', label: '深圳' },
                  { value: '广州', label: '广州' },
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
