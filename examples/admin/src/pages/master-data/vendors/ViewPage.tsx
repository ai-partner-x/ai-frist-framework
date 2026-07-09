/**
 * 供应商主数据详情页
 * 使用 ObjectPage 组件
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ObjectPage, type ObjectPageSection, type ObjectPageHeaderField, type ObjectPageKPI } from '../../../components/ObjectPage';

// 图标
const Icons = {
  vendor: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 16V4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
      <path d="M6 6h8M6 10h5M6 14h3" strokeLinecap="round" />
      <circle cx="14" cy="14" r="2" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  location: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 14s-5-4.5-5-7.5a5 5 0 1110 0c0 3-5 7.5-5 7.5z" />
      <circle cx="8" cy="6.5" r="1.5" />
    </svg>
  ),
  contact: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" />
    </svg>
  ),
  bank: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 6l6-4 6 4v2H2V6z" />
      <path d="M3 8v5M7 8v5M9 8v5M13 8v5M2 13h12" strokeLinecap="round" />
    </svg>
  ),
  stats: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 14V8M6 14V4M10 14V6M14 14V2" strokeLinecap="round" />
    </svg>
  ),
  history: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4v4l2.5 1.5" strokeLinecap="round" />
    </svg>
  ),
};

// Mock 数据
const mockVendor = {
  id: '1',
  vendorCode: 'VD-001',
  vendorName: '联想集团',
  vendorType: 'supplier',
  vendorTypeName: '供货商',
  status: 'active' as const,
  
  // 地址信息
  country: '中国',
  province: '北京市',
  city: '北京',
  district: '海淀区',
  address: '中关村软件园二期',
  postalCode: '100085',
  
  // 联系信息
  contactPerson: '王经理',
  phone: '010-12345678',
  mobile: '138-0000-0001',
  fax: '010-12345679',
  email: 'wang@lenovo.com',
  website: 'www.lenovo.com.cn',
  
  // 银行信息
  bankName: '中国工商银行北京分行',
  bankAccount: '6222 **** **** 1234',
  taxNumber: '91110000100001234X',
  
  // 业务信息
  paymentTerms: '30天净付',
  currency: 'CNY',
  incoterms: 'DDP',
  
  // 统计数据
  totalOrders: 156,
  totalAmount: 12580000,
  avgDeliveryDays: 3.5,
  qualityScore: 98.5,
  
  // 时间信息
  createdAt: '2023-01-15 09:00:00',
  createdBy: '系统管理员',
  updatedAt: '2024-01-10 15:30:00',
  updatedBy: '采购专员',
};

// 状态配置
const statusConfig = {
  active: { label: '合作中', color: 'green' as const },
  inactive: { label: '暂停', color: 'gray' as const },
  blocked: { label: '黑名单', color: 'red' as const },
};

export function ViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const data = mockVendor;
  const status = statusConfig[data.status];

  // Header 字段
  const headerFields: ObjectPageHeaderField[] = [
    { label: '供应商类型', value: data.vendorTypeName },
    { label: '联系人', value: data.contactPerson },
    { label: '所在城市', value: `${data.province} ${data.city}` },
    { label: '付款条件', value: data.paymentTerms },
  ];

  // KPI 指标
  const kpis: ObjectPageKPI[] = [
    { value: data.totalOrders, label: '订单数量', color: 'blue' },
    { value: `${(data.totalAmount / 10000).toFixed(0)}万`, label: '采购金额', color: 'green' },
    { value: `${data.qualityScore}%`, label: '质量评分', color: 'orange' },
  ];

  // Sections 定义
  const sections: ObjectPageSection[] = [
    {
      id: 'basic',
      title: '基本信息',
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">供应商编码</p>
            <p className="text-sm text-gray-900 font-medium">{data.vendorCode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">供应商名称</p>
            <p className="text-sm text-gray-900">{data.vendorName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">供应商类型</p>
            <p className="text-sm text-gray-900">{data.vendorTypeName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">状态</p>
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
              data.status === 'active' ? 'bg-green-50 text-green-600' :
              data.status === 'inactive' ? 'bg-gray-100 text-gray-500' :
              'bg-red-50 text-red-600'
            }`}>
              {status.label}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'address',
      title: '地址信息',
      icon: Icons.location,
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">国家/地区</p>
            <p className="text-sm text-gray-900">{data.country}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">省/市</p>
            <p className="text-sm text-gray-900">{data.province} · {data.city}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400 mb-1">详细地址</p>
            <p className="text-sm text-gray-900">{data.district} {data.address}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">邮政编码</p>
            <p className="text-sm text-gray-900">{data.postalCode}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: '联系信息',
      icon: Icons.contact,
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">联系人</p>
            <p className="text-sm text-gray-900">{data.contactPerson}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">电话</p>
            <p className="text-sm text-gray-900">{data.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">手机</p>
            <p className="text-sm text-gray-900">{data.mobile}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">传真</p>
            <p className="text-sm text-gray-900">{data.fax}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">邮箱</p>
            <p className="text-sm text-blue-600">{data.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">网站</p>
            <p className="text-sm text-blue-600">{data.website}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'bank',
      title: '银行与财务',
      icon: Icons.bank,
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">开户银行</p>
            <p className="text-sm text-gray-900">{data.bankName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">银行账号</p>
            <p className="text-sm text-gray-900 font-mono">{data.bankAccount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">税号</p>
            <p className="text-sm text-gray-900 font-mono">{data.taxNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">付款条件</p>
            <p className="text-sm text-gray-900">{data.paymentTerms}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">货币</p>
            <p className="text-sm text-gray-900">{data.currency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">贸易条款</p>
            <p className="text-sm text-gray-900">{data.incoterms}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'stats',
      title: '业务统计',
      icon: Icons.stats,
      sidebar: true,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">订单数量</span>
            <span className="text-sm font-semibold text-gray-900">{data.totalOrders} 单</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">采购金额</span>
            <span className="text-sm font-semibold text-blue-600">¥{(data.totalAmount / 10000).toFixed(0)}万</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">平均交货</span>
            <span className="text-sm font-semibold text-gray-900">{data.avgDeliveryDays} 天</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">质量评分</span>
            <span className="text-sm font-semibold text-green-600">{data.qualityScore}%</span>
          </div>
        </div>
      ),
    },
    {
      id: 'history',
      title: '变更记录',
      icon: Icons.history,
      sidebar: true,
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">创建时间</p>
            <p className="text-sm text-gray-900">{data.createdAt}</p>
            <p className="text-xs text-gray-500">由 {data.createdBy}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">最后更新</p>
            <p className="text-sm text-gray-900">{data.updatedAt}</p>
            <p className="text-xs text-gray-500">由 {data.updatedBy}</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <ObjectPage
      mode="display"
      backPath="/master-data/vendors"
      breadcrumb="供应商主数据"
      title={data.vendorName}
      subtitle={`${data.vendorCode} · ${data.vendorTypeName}`}
      status={status}
      headerIcon={Icons.vendor}
      headerFields={headerFields}
      kpis={kpis}
      sections={sections}
      actions={[
        {
          key: 'edit',
          label: '编辑',
          icon: Icons.edit,
          variant: 'primary',
          onClick: () => navigate(`/master-data/vendors/${id}/edit`),
        },
      ]}
    />
  );
}

export default ViewPage;
