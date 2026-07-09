/**
 * 物料主数据详情页
 * 使用 ObjectPage 组件
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ObjectPage, type ObjectPageSection, type ObjectPageHeaderField, type ObjectPageKPI } from '../../../components/ObjectPage';

// 图标
const Icons = {
  material: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="16" height="16" rx="2" />
      <path d="M6 6h8M6 10h8M6 14h5" strokeLinecap="round" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  spec: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M5 8h6M8 5v6" strokeLinecap="round" />
    </svg>
  ),
  purchase: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <path d="M2 2h2l2 8h8l1-4H5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  stock: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="12" height="10" rx="1" />
      <path d="M5 4V2h6v2" strokeLinecap="round" />
      <path d="M5 9h6M8 7v4" strokeLinecap="round" />
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
const mockMaterial = {
  id: '1',
  materialCode: 'IT-001',
  materialName: 'MacBook Pro 14" M3',
  materialType: 'FERT',
  materialTypeName: '成品',
  materialGroup: 'IT设备',
  baseUnit: '台',
  description: 'Apple MacBook Pro 14英寸 M3芯片 16GB内存 512GB存储',
  status: 'active' as const,
  
  // 基本数据
  grossWeight: 1.55,
  netWeight: 1.50,
  weightUnit: 'KG',
  volume: 0.002,
  volumeUnit: 'M3',
  
  // 采购数据
  purchaseGroup: 'IT采购组',
  orderUnit: '台',
  minOrderQty: 1,
  standardPrice: 18900,
  priceUnit: 'CNY',
  
  // 库存数据
  totalStock: 25,
  availableStock: 20,
  reservedStock: 5,
  valuationType: '移动平均价',
  
  // 时间信息
  createdAt: '2024-01-01 10:00:00',
  createdBy: '张三',
  updatedAt: '2024-01-15 14:30:00',
  updatedBy: '李四',
};

// 状态配置
const statusConfig = {
  active: { label: '启用', color: 'green' as const },
  inactive: { label: '停用', color: 'gray' as const },
  blocked: { label: '冻结', color: 'red' as const },
};

export function ViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const data = mockMaterial;
  const status = statusConfig[data.status];

  // Header 字段
  const headerFields: ObjectPageHeaderField[] = [
    { label: '物料类型', value: data.materialTypeName },
    { label: '物料组', value: data.materialGroup },
    { label: '基本单位', value: data.baseUnit },
    { label: '标准价格', value: `¥${data.standardPrice.toLocaleString()}` },
  ];

  // KPI 指标
  const kpis: ObjectPageKPI[] = [
    { value: data.totalStock, label: '总库存', color: 'blue' },
    { value: data.availableStock, label: '可用库存', color: 'green' },
    { value: data.reservedStock, label: '预留库存', color: 'orange' },
  ];

  // Sections 定义
  const sections: ObjectPageSection[] = [
    {
      id: 'basic',
      title: '基本信息',
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">物料编码</p>
            <p className="text-sm text-gray-900 font-medium">{data.materialCode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">物料名称</p>
            <p className="text-sm text-gray-900">{data.materialName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">物料类型</p>
            <p className="text-sm text-gray-900">{data.materialTypeName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">物料组</p>
            <p className="text-sm text-gray-900">{data.materialGroup}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">基本单位</p>
            <p className="text-sm text-gray-900">{data.baseUnit}</p>
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
          <div className="col-span-2">
            <p className="text-xs text-gray-400 mb-1">描述</p>
            <p className="text-sm text-gray-900">{data.description}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'spec',
      title: '规格信息',
      icon: Icons.spec,
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">毛重</p>
            <p className="text-sm text-gray-900">{data.grossWeight} {data.weightUnit}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">净重</p>
            <p className="text-sm text-gray-900">{data.netWeight} {data.weightUnit}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">体积</p>
            <p className="text-sm text-gray-900">{data.volume} {data.volumeUnit}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'purchase',
      title: '采购数据',
      icon: Icons.purchase,
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">采购组</p>
            <p className="text-sm text-gray-900">{data.purchaseGroup}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">订单单位</p>
            <p className="text-sm text-gray-900">{data.orderUnit}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">最小订单量</p>
            <p className="text-sm text-gray-900">{data.minOrderQty}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">标准价格</p>
            <p className="text-sm text-gray-900 font-medium">¥{data.standardPrice.toLocaleString()}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'stock',
      title: '库存概览',
      icon: Icons.stock,
      sidebar: true,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">总库存</span>
            <span className="text-sm font-semibold text-gray-900">{data.totalStock} {data.baseUnit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">可用库存</span>
            <span className="text-sm font-semibold text-green-600">{data.availableStock} {data.baseUnit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">预留库存</span>
            <span className="text-sm font-semibold text-orange-600">{data.reservedStock} {data.baseUnit}</span>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">计价类型</span>
              <span className="text-sm text-gray-900">{data.valuationType}</span>
            </div>
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
      backPath="/master-data/materials"
      breadcrumb="物料主数据"
      title={data.materialName}
      subtitle={data.materialCode}
      status={status}
      headerIcon={Icons.material}
      headerFields={headerFields}
      kpis={kpis}
      sections={sections}
      actions={[
        {
          key: 'edit',
          label: '编辑',
          icon: Icons.edit,
          variant: 'primary',
          onClick: () => navigate(`/master-data/materials/${id}/edit`),
        },
      ]}
    />
  );
}

export default ViewPage;
