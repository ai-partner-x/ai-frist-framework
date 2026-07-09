/**
 * 币种主数据页面
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
  type EditMode,
} from '../../../components/MasterDetail';

// 币种图标
const CurrencyIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="7" />
    <path d="M6 7.5h6M6 10.5h6M9 5v8" strokeLinecap="round" />
  </svg>
);

// 数据类型
interface Currency extends MasterDetailItem {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  decimalPlaces: number;
  exchangeRate: number;
  country: string;
  isoCode: string;
  minorUnit: string;
  createdAt: string;
  updatedAt: string;
}

// 初始数据
const initialCurrencies: Currency[] = [
  { id: '1', title: 'CNY - 人民币', subtitle: '中国', currencyCode: 'CNY', currencyName: '人民币', symbol: '¥', decimalPlaces: 2, exchangeRate: 1, country: '中国', isoCode: '156', minorUnit: '分', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '2', title: 'USD - 美元', subtitle: '美国', currencyCode: 'USD', currencyName: '美元', symbol: '$', decimalPlaces: 2, exchangeRate: 7.24, country: '美国', isoCode: '840', minorUnit: '美分', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '3', title: 'EUR - 欧元', subtitle: '欧盟', currencyCode: 'EUR', currencyName: '欧元', symbol: '€', decimalPlaces: 2, exchangeRate: 7.89, country: '欧盟', isoCode: '978', minorUnit: '欧分', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '4', title: 'JPY - 日元', subtitle: '日本', currencyCode: 'JPY', currencyName: '日元', symbol: '¥', decimalPlaces: 0, exchangeRate: 0.048, country: '日本', isoCode: '392', minorUnit: '-', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '5', title: 'GBP - 英镑', subtitle: '英国', currencyCode: 'GBP', currencyName: '英镑', symbol: '£', decimalPlaces: 2, exchangeRate: 9.15, country: '英国', isoCode: '826', minorUnit: '便士', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
  { id: '6', title: 'HKD - 港币', subtitle: '中国香港', currencyCode: 'HKD', currencyName: '港币', symbol: 'HK$', decimalPlaces: 2, exchangeRate: 0.93, country: '中国香港', isoCode: '344', minorUnit: '仙', status: { label: '启用', color: 'green' }, createdAt: '2024-01-01', updatedAt: '2024-12-01' },
];

export function CurrenciesPage() {
  const [currencies, setCurrencies] = useState(initialCurrencies);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(currencies[0]?.id);
  
  // 表单数据
  const [formData, setFormData] = useState({
    currencyCode: '', currencyName: '', symbol: '', decimalPlaces: 2, exchangeRate: 1,
    country: '', isoCode: '', minorUnit: '', status: 'active',
  });

  // 搜索过滤
  const filteredCurrencies = currencies.filter(c => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return c.currencyCode.toLowerCase().includes(keyword) || c.currencyName.toLowerCase().includes(keyword) || c.country.toLowerCase().includes(keyword);
  });

  // 初始化表单（编辑时）
  const initForm = (item: Currency | null) => {
    if (item) {
      setFormData({
        currencyCode: item.currencyCode, currencyName: item.currencyName, symbol: item.symbol,
        decimalPlaces: item.decimalPlaces, exchangeRate: item.exchangeRate, country: item.country,
        isoCode: item.isoCode, minorUnit: item.minorUnit, status: item.status?.color === 'green' ? 'active' : 'inactive',
      });
    } else {
      setFormData({ currencyCode: '', currencyName: '', symbol: '', decimalPlaces: 2, exchangeRate: 1, country: '', isoCode: '', minorUnit: '', status: 'active' });
    }
  };

  // 保存处理
  const handleSave = (item: Currency | null, mode: EditMode) => {
    const now = new Date().toISOString().split('T')[0];
    
    if (mode === 'create') {
      const newItem: Currency = {
        id: Date.now().toString(),
        title: `${formData.currencyCode} - ${formData.currencyName}`,
        subtitle: formData.country,
        currencyCode: formData.currencyCode, currencyName: formData.currencyName, symbol: formData.symbol,
        decimalPlaces: formData.decimalPlaces, exchangeRate: formData.exchangeRate, country: formData.country,
        isoCode: formData.isoCode, minorUnit: formData.minorUnit,
        status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' },
        createdAt: now, updatedAt: now,
      };
      setCurrencies([...currencies, newItem]);
      setSelectedId(newItem.id);
    } else if (item) {
      setCurrencies(currencies.map(c => c.id === item.id ? {
        ...c,
        title: `${formData.currencyCode} - ${formData.currencyName}`,
        subtitle: formData.country,
        currencyCode: formData.currencyCode, currencyName: formData.currencyName, symbol: formData.symbol,
        decimalPlaces: formData.decimalPlaces, exchangeRate: formData.exchangeRate, country: formData.country,
        isoCode: formData.isoCode, minorUnit: formData.minorUnit,
        status: { label: formData.status === 'active' ? '启用' : '停用', color: formData.status === 'active' ? 'green' : 'gray' } as const,
        updatedAt: now,
      } : c));
    }
  };

  // 删除处理
  const handleDelete = (item: Currency) => {
    setCurrencies(currencies.filter(c => c.id !== item.id));
    if (selectedId === item.id) {
      setSelectedId(currencies.find(c => c.id !== item.id)?.id);
    }
  };

  // 渲染表单
  const renderForm = (item: Currency | null, mode: EditMode) => {
    // 进入编辑/新建模式时初始化表单
    if (mode === 'edit' && item && formData.currencyCode !== item.currencyCode) {
      initForm(item);
    } else if (mode === 'create' && formData.currencyCode !== '') {
      initForm(null);
    }

    return (
      <div className="space-y-6">
        {/* 头部卡片 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
              {formData.symbol || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formData.currencyName || '新币种'}</h2>
              <p className="text-sm text-gray-500 mt-1">{formData.currencyCode || '-'} · {formData.country || '-'}</p>
            </div>
          </div>
        </div>

        {/* 基本信息表单 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">基本信息</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <Label className="block text-xs text-gray-500 mb-1">币种代码 *</Label>
                <Input value={formData.currencyCode} onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value.toUpperCase() })} placeholder="如: USD" maxLength={3} />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">币种名称 *</Label>
                <Input value={formData.currencyName} onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })} placeholder="如: 美元" />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">货币符号 *</Label>
                <Input value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} placeholder="如: $" />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">国家/地区 *</Label>
                <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="如: 美国" />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">ISO 代码</Label>
                <Input value={formData.isoCode} onChange={(e) => setFormData({ ...formData, isoCode: e.target.value })} placeholder="如: 840" />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">辅币单位</Label>
                <Input value={formData.minorUnit} onChange={(e) => setFormData({ ...formData, minorUnit: e.target.value })} placeholder="如: 美分" />
              </div>
            </div>
          </div>
        </div>

        {/* 设置信息表单 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">设置信息</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <Label className="block text-xs text-gray-500 mb-1">小数位数</Label>
                <Input type="number" value={formData.decimalPlaces} onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) || 0 })} min={0} max={4} />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">汇率(对CNY)</Label>
                <Input type="number" value={formData.exchangeRate} onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0 })} step={0.0001} />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">状态</Label>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'active', label: '启用' }, { value: 'inactive', label: '停用' }]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染详情
  const renderDetail = (currency: Currency, actionButtons?: React.ReactNode) => (
    <div className="space-y-4">
      {/* 头部信息卡 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
            {currency.symbol}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{currency.currencyName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{currency.currencyCode} · {currency.country}</p>
          </div>
          <div className="text-right mr-4">
            <div className="text-2xl font-bold text-gray-900">{currency.exchangeRate.toFixed(4)}</div>
            <div className="text-xs text-gray-500">对人民币汇率</div>
          </div>
          {actionButtons}
        </div>
      </div>

      {/* 基本信息 */}
      <DetailSection title="基本信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="币种代码" value={<span className="font-mono font-semibold text-blue-600">{currency.currencyCode}</span>} />
          <DetailField label="币种名称" value={currency.currencyName} />
          <DetailField label="货币符号" value={<span className="text-lg">{currency.symbol}</span>} />
          <DetailField label="国家/地区" value={currency.country} />
          <DetailField label="ISO 代码" value={currency.isoCode} />
          <DetailField label="辅币单位" value={currency.minorUnit} />
        </DetailFieldGrid>
      </DetailSection>

      {/* 设置信息 */}
      <DetailSection title="设置信息">
        <DetailFieldGrid columns={3}>
          <DetailField label="小数位数" value={currency.decimalPlaces} />
          <DetailField label="汇率(对CNY)" value={currency.exchangeRate.toFixed(4)} />
          <DetailField label="状态" value={
            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', currency.status?.color === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
              <span className={cn('w-1.5 h-1.5 rounded-full', currency.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400')} />
              {currency.status?.label}
            </span>
          } />
        </DetailFieldGrid>
      </DetailSection>

      {/* 系统信息 */}
      <DetailSection title="系统信息">
        <DetailFieldGrid columns={2}>
          <DetailField label="创建时间" value={currency.createdAt} />
          <DetailField label="最后更新" value={currency.updatedAt} />
        </DetailFieldGrid>
      </DetailSection>
    </div>
  );

  return (
    <MasterDetail
      title="币种主数据"
      subtitle="管理系统中使用的货币类型和汇率"
      headerIcon={CurrencyIcon}
      items={filteredCurrencies}
      selectedId={selectedId}
      onSelect={(item) => setSelectedId(item.id)}
      onSearch={setSearchKeyword}
      searchPlaceholder="搜索币种代码、名称或国家..."
      createLabel="新建币种"
      renderDetail={renderDetail}
      renderForm={renderForm}
      onSave={handleSave}
      onDelete={handleDelete}
      masterWidth={320}
    />
  );
}

export default CurrenciesPage;
