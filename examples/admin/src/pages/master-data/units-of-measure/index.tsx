/**
 * 计量单位主数据页面
 * 使用 Master-Detail 布局，Detail 区域内编辑
 */

import { useState } from 'react';
import { cn, Input, Label, Select } from '@aiko-boot/admin-component';
import { MasterDetail, DetailSection, DetailField, DetailFieldGrid, type MasterDetailItem, type EditMode } from '../../../components/MasterDetail';

// 计量单位图标
const UomIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 14h14M4 10v4M9 6v8M14 2v12" strokeLinecap="round" />
  </svg>
);

interface UnitOfMeasure extends MasterDetailItem {
  uomCode: string;
  uomName: string;
  dimension: string;
  baseUnit: string;
  conversionFactor: number;
  isoCode: string;
  createdAt: string;
  updatedAt: string;
}

const dimensionOptions = [
  { value: '数量', label: '数量' }, { value: '重量', label: '重量' }, { value: '长度', label: '长度' },
  { value: '体积', label: '体积' }, { value: '面积', label: '面积' }, { value: '时间', label: '时间' },
];

const initialUnits: UnitOfMeasure[] = [
  { id: '1', title: 'EA - 个/件', subtitle: '数量', uomCode: 'EA', uomName: '个/件', dimension: '数量', baseUnit: 'EA', conversionFactor: 1, isoCode: 'EA', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '2', title: 'PC - 台', subtitle: '数量', uomCode: 'PC', uomName: '台', dimension: '数量', baseUnit: 'EA', conversionFactor: 1, isoCode: 'H87', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '3', title: 'BOX - 箱', subtitle: '数量', uomCode: 'BOX', uomName: '箱', dimension: '数量', baseUnit: 'EA', conversionFactor: 12, isoCode: 'BX', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '4', title: 'KG - 千克', subtitle: '重量', uomCode: 'KG', uomName: '千克', dimension: '重量', baseUnit: 'KG', conversionFactor: 1, isoCode: 'KGM', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '5', title: 'G - 克', subtitle: '重量', uomCode: 'G', uomName: '克', dimension: '重量', baseUnit: 'KG', conversionFactor: 0.001, isoCode: 'GRM', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '6', title: 'T - 吨', subtitle: '重量', uomCode: 'T', uomName: '吨', dimension: '重量', baseUnit: 'KG', conversionFactor: 1000, isoCode: 'TNE', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '7', title: 'M - 米', subtitle: '长度', uomCode: 'M', uomName: '米', dimension: '长度', baseUnit: 'M', conversionFactor: 1, isoCode: 'MTR', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '8', title: 'L - 升', subtitle: '体积', uomCode: 'L', uomName: '升', dimension: '体积', baseUnit: 'L', conversionFactor: 1, isoCode: 'LTR', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
];

export function UnitsOfMeasurePage() {
  const [units, setUnits] = useState(initialUnits);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(units[0]?.id);
  const [formData, setFormData] = useState({ uomCode: '', uomName: '', dimension: '数量', baseUnit: '', conversionFactor: 1, isoCode: '', status: 'active' });

  const filteredUnits = units.filter(u => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return u.uomCode.toLowerCase().includes(keyword) || u.uomName.toLowerCase().includes(keyword) || u.dimension.toLowerCase().includes(keyword);
  });

  const initForm = (item: UnitOfMeasure | null) => {
    if (item) {
      setFormData({ uomCode: item.uomCode, uomName: item.uomName, dimension: item.dimension, baseUnit: item.baseUnit, conversionFactor: item.conversionFactor, isoCode: item.isoCode, status: item.status?.color === 'green' ? 'active' : 'inactive' });
    } else {
      setFormData({ uomCode: '', uomName: '', dimension: '数量', baseUnit: '', conversionFactor: 1, isoCode: '', status: 'active' });
    }
  };

  const handleSave = (item: UnitOfMeasure | null, mode: EditMode) => {
    const now = new Date().toISOString().split('T')[0];
    if (mode === 'create') {
      const newItem: UnitOfMeasure = {
        id: Date.now().toString(), title: `${formData.uomCode} - ${formData.uomName}`, subtitle: formData.dimension,
        uomCode: formData.uomCode, uomName: formData.uomName, dimension: formData.dimension, baseUnit: formData.baseUnit || formData.uomCode,
        conversionFactor: formData.conversionFactor, isoCode: formData.isoCode,
        status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' },
        createdAt: now, updatedAt: now,
      };
      setUnits([...units, newItem]);
      setSelectedId(newItem.id);
    } else if (item) {
      setUnits(units.map(u => u.id === item.id ? {
        ...u, title: `${formData.uomCode} - ${formData.uomName}`, subtitle: formData.dimension,
        uomCode: formData.uomCode, uomName: formData.uomName, dimension: formData.dimension, baseUnit: formData.baseUnit || formData.uomCode,
        conversionFactor: formData.conversionFactor, isoCode: formData.isoCode,
        status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' } as const,
        updatedAt: now,
      } : u));
    }
  };

  const handleDelete = (item: UnitOfMeasure) => {
    setUnits(units.filter(u => u.id !== item.id));
    if (selectedId === item.id) setSelectedId(units.find(u => u.id !== item.id)?.id);
  };

  const renderForm = (item: UnitOfMeasure | null, mode: EditMode) => {
    if (mode === 'edit' && item && formData.uomCode !== item.uomCode) initForm(item);
    else if (mode === 'create' && formData.uomCode !== '') initForm(null);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl font-bold">{formData.uomCode || '?'}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formData.uomName || '新单位'}</h2>
              <p className="text-sm text-gray-500 mt-1">{formData.uomCode || '-'} · {formData.dimension}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50"><h3 className="font-semibold text-gray-900">基本信息</h3></div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <div><Label className="block text-xs text-gray-500 mb-1">单位代码 *</Label><Input value={formData.uomCode} onChange={(e) => setFormData({ ...formData, uomCode: e.target.value.toUpperCase() })} placeholder="如: KG" maxLength={10} /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">单位名称 *</Label><Input value={formData.uomName} onChange={(e) => setFormData({ ...formData, uomName: e.target.value })} placeholder="如: 千克" /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">计量维度</Label><Select value={formData.dimension} onChange={(e) => setFormData({ ...formData, dimension: e.target.value })} options={dimensionOptions} /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">基本单位</Label><Input value={formData.baseUnit} onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value.toUpperCase() })} placeholder="如: KG" /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">ISO 代码</Label><Input value={formData.isoCode} onChange={(e) => setFormData({ ...formData, isoCode: e.target.value })} placeholder="如: KGM" /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">状态</Label><Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'active', label: '启用' }, { value: 'inactive', label: '停用' }]} /></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50"><h3 className="font-semibold text-gray-900">换算信息</h3></div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div><Label className="block text-xs text-gray-500 mb-1">换算系数</Label><Input type="number" value={formData.conversionFactor} onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) || 0 })} step={0.001} /></div>
              <div><Label className="block text-xs text-gray-500 mb-1">换算公式</Label><div className="h-10 px-3 flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200">1 {formData.uomCode || '?'} = {formData.conversionFactor} {formData.baseUnit || formData.uomCode || '?'}</div></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetail = (uom: UnitOfMeasure, actionButtons?: React.ReactNode) => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">{uom.uomCode}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{uom.uomName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{uom.uomCode} · {uom.dimension}</p>
          </div>
          <div className="text-right mr-4">
            <div className="text-2xl font-bold text-gray-900">{uom.conversionFactor}</div>
            <div className="text-xs text-gray-500">换算系数 (对{uom.baseUnit})</div>
          </div>
          {actionButtons}
        </div>
      </div>
      <DetailSection title="基本信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="单位代码" value={<span className="font-mono font-semibold text-emerald-600">{uom.uomCode}</span>} />
          <DetailField label="单位名称" value={uom.uomName} />
          <DetailField label="计量维度" value={uom.dimension} />
          <DetailField label="基本单位" value={uom.baseUnit} />
          <DetailField label="ISO 代码" value={uom.isoCode} />
          <DetailField label="状态" value={<span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', uom.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}><span className={cn('w-1.5 h-1.5 rounded-full', uom.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400')} />{uom.status?.label}</span>} />
        </DetailFieldGrid>
      </DetailSection>
      <DetailSection title="换算信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="换算系数" value={uom.conversionFactor} />
          <DetailField label="换算公式" value={`1 ${uom.uomCode} = ${uom.conversionFactor} ${uom.baseUnit}`} />
        </DetailFieldGrid>
      </DetailSection>
      <DetailSection title="系统信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="创建时间" value={uom.createdAt} />
          <DetailField label="最后更新" value={uom.updatedAt} />
        </DetailFieldGrid>
      </DetailSection>
    </div>
  );

  return (
    <MasterDetail title="计量单位" subtitle="管理系统中使用的计量单位和换算关系" headerIcon={UomIcon} items={filteredUnits} selectedId={selectedId} onSelect={(item) => setSelectedId(item.id)} onSearch={setSearchKeyword} searchPlaceholder="搜索单位代码、名称或维度..." createLabel="新建单位" renderDetail={renderDetail} renderForm={renderForm} onSave={handleSave} onDelete={handleDelete} masterWidth={300} />
  );
}

export default UnitsOfMeasurePage;
