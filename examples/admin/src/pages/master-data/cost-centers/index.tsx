/**
 * 成本中心主数据页面
 * 使用 Master-Detail 布局，Detail 区域内编辑
 */

import { useState } from 'react';
import { cn, Input, Label, Select } from '@aiko-boot/admin-component';
import { 
  MasterDetail, 
  DetailSection, 
  DetailField, 
  DetailFieldGrid,
  type MasterDetailItem,
  type EditMode 
} from '../../../components/MasterDetail';

// 成本中心图标
const CostCenterIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="7" />
    <path d="M9 5v4l3 2" strokeLinecap="round" />
  </svg>
);

// 数据类型
interface CostCenter extends MasterDetailItem {
  ccCode: string;
  ccName: string;
  ccType: string;
  department: string;
  companyCode: string;
  controllingArea: string;
  profitCenter: string;
  manager: string;
  budget: number;
  used: number;
  currency: string;
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
}

const ccTypeOptions = [
  { value: '研发', label: '研发' }, { value: '营销', label: '营销' }, { value: '生产', label: '生产' },
  { value: '销售', label: '销售' }, { value: '管理', label: '管理' }, { value: '其他', label: '其他' },
];

// 模拟数据
const initialCostCenters: CostCenter[] = [
  { id: '1', title: 'CC1001 - 研发中心', subtitle: '研发部', badge: '¥850万', ccCode: 'CC1001', ccName: '研发中心', ccType: '研发', department: '研发部', companyCode: '1000', controllingArea: '1000', profitCenter: 'PC1001', manager: '张三', budget: 8500000, used: 6230000, currency: 'CNY', validFrom: '2024-01-01', validTo: '2024-12-31', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '2', title: 'CC1002 - 市场营销', subtitle: '市场部', badge: '¥320万', ccCode: 'CC1002', ccName: '市场营销', ccType: '营销', department: '市场部', companyCode: '1000', controllingArea: '1000', profitCenter: 'PC1002', manager: '李四', budget: 3200000, used: 2890000, currency: 'CNY', validFrom: '2024-01-01', validTo: '2024-12-31', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '3', title: 'CC1003 - 行政管理', subtitle: '行政部', badge: '¥150万', ccCode: 'CC1003', ccName: '行政管理', ccType: '管理', department: '行政部', companyCode: '1000', controllingArea: '1000', profitCenter: 'PC1003', manager: '王五', budget: 1500000, used: 980000, currency: 'CNY', validFrom: '2024-01-01', validTo: '2024-12-31', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '4', title: 'CC1004 - 人力资源', subtitle: 'HR部', badge: '¥120万', ccCode: 'CC1004', ccName: '人力资源', ccType: '管理', department: 'HR部', companyCode: '1000', controllingArea: '1000', profitCenter: 'PC1003', manager: '赵六', budget: 1200000, used: 750000, currency: 'CNY', validFrom: '2024-01-01', validTo: '2024-12-31', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '5', title: 'CC1005 - 财务管理', subtitle: '财务部', badge: '¥80万', ccCode: 'CC1005', ccName: '财务管理', ccType: '管理', department: '财务部', companyCode: '1000', controllingArea: '1000', profitCenter: 'PC1003', manager: '钱七', budget: 800000, used: 520000, currency: 'CNY', validFrom: '2024-01-01', validTo: '2024-12-31', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '6', title: 'CC2001 - 华东销售', subtitle: '华东区', badge: '¥280万', ccCode: 'CC2001', ccName: '华东销售', ccType: '销售', department: '华东销售部', companyCode: '2000', controllingArea: '1000', profitCenter: 'PC2001', manager: '孙八', budget: 2800000, used: 2150000, currency: 'CNY', validFrom: '2024-01-01', validTo: '2024-12-31', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '7', title: 'CC3001 - 生产制造', subtitle: '生产部', badge: '¥1200万', ccCode: 'CC3001', ccName: '生产制造', ccType: '生产', department: '生产部', companyCode: '3000', controllingArea: '1000', profitCenter: 'PC3001', manager: '周九', budget: 12000000, used: 9800000, currency: 'CNY', validFrom: '2024-01-01', validTo: '2024-12-31', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
];

// 格式化金额
const formatAmount = (amount: number) => {
  if (amount >= 10000) return `¥${(amount / 10000).toFixed(0)}万`;
  return `¥${amount.toLocaleString()}`;
};

export function CostCentersPage() {
  const [costCenters, setCostCenters] = useState(initialCostCenters);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(costCenters[0]?.id);
  const [formData, setFormData] = useState({
    ccCode: '', ccName: '', ccType: '管理', department: '', companyCode: '1000', controllingArea: '1000',
    profitCenter: '', manager: '', budget: 0, currency: 'CNY', validFrom: '', validTo: '', status: 'active',
  });

  const filteredCostCenters = costCenters.filter(cc => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return cc.ccCode.toLowerCase().includes(keyword) || cc.ccName.toLowerCase().includes(keyword) || cc.department.toLowerCase().includes(keyword);
  });

  const initForm = (item: CostCenter | null) => {
    if (item) {
      setFormData({
        ccCode: item.ccCode, ccName: item.ccName, ccType: item.ccType, department: item.department,
        companyCode: item.companyCode, controllingArea: item.controllingArea, profitCenter: item.profitCenter,
        manager: item.manager, budget: item.budget, currency: item.currency,
        validFrom: item.validFrom, validTo: item.validTo, status: item.status?.color === 'green' ? 'active' : 'inactive',
      });
    } else {
      setFormData({
        ccCode: '', ccName: '', ccType: '管理', department: '', companyCode: '1000', controllingArea: '1000',
        profitCenter: '', manager: '', budget: 0, currency: 'CNY', validFrom: '', validTo: '', status: 'active',
      });
    }
  };

  const handleSave = (item: CostCenter | null, mode: EditMode) => {
    const now = new Date().toISOString().split('T')[0];
    if (mode === 'create') {
      const newItem: CostCenter = {
        id: Date.now().toString(),
        title: `${formData.ccCode} - ${formData.ccName}`,
        subtitle: formData.department,
        badge: formatAmount(formData.budget),
        ccCode: formData.ccCode, ccName: formData.ccName, ccType: formData.ccType, department: formData.department,
        companyCode: formData.companyCode, controllingArea: formData.controllingArea, profitCenter: formData.profitCenter,
        manager: formData.manager, budget: formData.budget, used: 0, currency: formData.currency,
        validFrom: formData.validFrom, validTo: formData.validTo,
        status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' },
        createdAt: now, updatedAt: now,
      };
      setCostCenters([...costCenters, newItem]);
      setSelectedId(newItem.id);
    } else if (item) {
      setCostCenters(costCenters.map(cc => cc.id === item.id ? {
        ...cc,
        title: `${formData.ccCode} - ${formData.ccName}`,
        subtitle: formData.department,
        badge: formatAmount(formData.budget),
        ccCode: formData.ccCode, ccName: formData.ccName, ccType: formData.ccType, department: formData.department,
        companyCode: formData.companyCode, controllingArea: formData.controllingArea, profitCenter: formData.profitCenter,
        manager: formData.manager, budget: formData.budget, currency: formData.currency,
        validFrom: formData.validFrom, validTo: formData.validTo,
        status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' } as const,
        updatedAt: now,
      } : cc));
    }
  };

  const handleDelete = (item: CostCenter) => {
    setCostCenters(costCenters.filter(cc => cc.id !== item.id));
    if (selectedId === item.id) setSelectedId(costCenters.find(cc => cc.id !== item.id)?.id);
  };

  const renderForm = (item: CostCenter | null, mode: EditMode) => {
    if (mode === 'edit' && item && formData.ccCode !== item.ccCode) initForm(item);
    else if (mode === 'create' && formData.ccCode !== '') initForm(null);

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center text-base font-bold">{formData.ccCode.slice(-4) || '?'}</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{formData.ccName || '新成本中心'}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{formData.ccCode || '-'} · {formData.department || '-'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50"><h3 className="font-semibold text-gray-900">基本信息</h3></div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <div><Label className="block text-xs text-gray-500 mb-1">成本中心代码 *</Label><Input value={formData.ccCode} onChange={(e) => setFormData({ ...formData, ccCode: e.target.value.toUpperCase() })} placeholder="如: CC1001" /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">成本中心名称 *</Label><Input value={formData.ccName} onChange={(e) => setFormData({ ...formData, ccName: e.target.value })} placeholder="如: 研发中心" /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">成本中心类型</Label><Select value={formData.ccType} onChange={(e) => setFormData({ ...formData, ccType: e.target.value })} options={ccTypeOptions} /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">所属部门</Label><Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="如: 研发部" /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">负责人</Label><Input value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} placeholder="姓名" /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">状态</Label><Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'active', label: '启用' }, { value: 'inactive', label: '停用' }]} /></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50"><h3 className="font-semibold text-gray-900">组织信息</h3></div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <div><Label className="block text-xs text-gray-500 mb-1">公司代码</Label><Input value={formData.companyCode} onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })} placeholder="如: 1000" /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">控制范围</Label><Input value={formData.controllingArea} onChange={(e) => setFormData({ ...formData, controllingArea: e.target.value })} placeholder="如: 1000" /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">利润中心</Label><Input value={formData.profitCenter} onChange={(e) => setFormData({ ...formData, profitCenter: e.target.value })} placeholder="如: PC1001" /></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50"><h3 className="font-semibold text-gray-900">预算与有效期</h3></div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-x-6 gap-y-4">
              <div><Label className="block text-xs text-gray-500 mb-1">预算金额</Label><Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">币种</Label><Select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} options={[{ value: 'CNY', label: 'CNY' }, { value: 'USD', label: 'USD' }]} /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">有效期从</Label><Input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">有效期至</Label><Input type="date" value={formData.validTo} onChange={(e) => setFormData({ ...formData, validTo: e.target.value })} /></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetail = (cc: CostCenter, actionButtons?: React.ReactNode) => {
    const usagePercent = cc.budget > 0 ? Math.round((cc.used / cc.budget) * 100) : 0;
    const remaining = cc.budget - cc.used;

    return (
      <div className="space-y-4">
        {/* 头部信息卡 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold">{cc.ccCode.slice(-4)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">{cc.ccName}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{cc.ccCode} · {cc.department}</p>
            </div>
            {actionButtons}
          </div>

          {/* 预算使用情况 */}
          {cc.budget > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">预算使用情况</span>
                <span className="text-sm font-medium text-gray-900">{usagePercent}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all', usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500')}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-gray-500">已使用 {formatAmount(cc.used)}</span>
                <span className="text-gray-500">剩余 {formatAmount(remaining)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 基本信息 */}
        <DetailSection title="基本信息">
          <DetailFieldGrid columns={3}>
            <DetailField label="成本中心代码" value={<span className="font-mono font-semibold text-orange-600">{cc.ccCode}</span>} />
            <DetailField label="成本中心名称" value={cc.ccName} />
            <DetailField label="成本中心类型" value={cc.ccType} />
            <DetailField label="所属部门" value={cc.department} />
            <DetailField label="负责人" value={cc.manager} />
            <DetailField label="状态" value={
              <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', cc.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                <span className={cn('w-1.5 h-1.5 rounded-full', cc.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400')} />
                {cc.status?.label}
              </span>
            } />
          </DetailFieldGrid>
        </DetailSection>

        {/* 组织信息 */}
        <DetailSection title="组织信息">
          <DetailFieldGrid columns={3}>
            <DetailField label="公司代码" value={cc.companyCode} />
            <DetailField label="控制范围" value={cc.controllingArea} />
            <DetailField label="利润中心" value={cc.profitCenter} />
          </DetailFieldGrid>
        </DetailSection>

        {/* 预算信息 */}
        <DetailSection title="预算信息">
          <DetailFieldGrid columns={4}>
            <DetailField label="预算金额" value={<span className="font-semibold">{formatAmount(cc.budget)}</span>} />
            <DetailField label="已使用" value={formatAmount(cc.used)} />
            <DetailField label="剩余" value={formatAmount(remaining)} />
            <DetailField label="币种" value={cc.currency} />
          </DetailFieldGrid>
        </DetailSection>

        {/* 有效期 */}
        <DetailSection title="有效期">
          <DetailFieldGrid columns={2}>
            <DetailField label="有效期从" value={cc.validFrom} />
            <DetailField label="有效期至" value={cc.validTo} />
          </DetailFieldGrid>
        </DetailSection>

        {/* 系统信息 */}
        <DetailSection title="系统信息">
          <DetailFieldGrid columns={2}>
            <DetailField label="创建时间" value={cc.createdAt} />
            <DetailField label="最后更新" value={cc.updatedAt} />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    );
  };

  return (
    <MasterDetail
      title="成本中心"
      subtitle="管理系统中的成本中心和预算分配"
      headerIcon={CostCenterIcon}
      items={filteredCostCenters}
      selectedId={selectedId}
      onSelect={(item) => setSelectedId(item.id)}
      onSearch={setSearchKeyword}
      searchPlaceholder="搜索成本中心代码、名称或部门..."
      createLabel="新建成本中心"
      renderDetail={renderDetail}
      renderForm={renderForm}
      onSave={handleSave}
      onDelete={handleDelete}
      masterWidth={320}
    />
  );
}

export default CostCentersPage;
