/**
 * 系统设置页面
 * 基于 SAP Fiori 设计规范
 */

import { useState } from 'react';
import { cn, Input, Select, Label } from '@aiko-boot/admin-component';

// 图标
const Icons = {
  settings: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="3" /><path d="M10 1v2M10 17v2M19 10h-2M3 10H1M16.36 3.64l-1.42 1.42M5.05 14.95l-1.42 1.42M16.36 16.36l-1.42-1.42M5.05 5.05L3.64 3.64" strokeLinecap="round" /></svg>,
  user: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="5" r="3" /><path d="M3 16c0-3 2.5-5 6-5s6 2 6 5" strokeLinecap="round" /></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 6a5 5 0 0 0-10 0c0 5-2 7-2 7h14s-2-2-2-7M9 16a2 2 0 0 0 2-2H7a2 2 0 0 0 2 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  palette: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="7" /><circle cx="6" cy="7" r="1" fill="currentColor" /><circle cx="12" cy="7" r="1" fill="currentColor" /><circle cx="6" cy="11" r="1" fill="currentColor" /><circle cx="10" cy="12" r="1" fill="currentColor" /></svg>,
  globe: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="7" /><path d="M1 9h16M9 2c2 2.5 2 11 0 14M9 2c-2 2.5-2 11 0 14" /></svg>,
  security: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2L3 5v4c0 4 2.5 6 6 8 3.5-2 6-4 6-8V5L9 2z" strokeLinejoin="round" /><path d="M6.5 9l2 2 3.5-4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

// 设置区块组件
function SettingSection({ icon, title, description, children, iconBg }: { 
  icon: React.ReactNode; 
  title: string; 
  description?: string;
  children: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white", iconBg)}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// 开关组件
function Switch({ checked, onChange, label, description }: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-gray-200"
        )}
      >
        <span className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
          checked && "translate-x-5"
        )} />
      </button>
    </label>
  );
}

// 主题选项组件
function ThemeOption({ value, label, active, icon, onClick }: {
  value: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all",
        active 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        value === 'light' && "bg-gray-100",
        value === 'dark' && "bg-gray-800",
        value === 'system' && "bg-gradient-to-br from-gray-100 to-gray-800"
      )}>
        {icon}
      </div>
      <span className={cn("text-sm font-medium", active ? "text-blue-600" : "text-gray-700")}>{label}</span>
      {active && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white">
          {Icons.check}
        </span>
      )}
    </button>
  );
}

export function SettingsPage() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh-CN');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  return (
    <div className="h-[calc(100vh-56px-48px)] flex flex-col bg-gray-50 overflow-hidden rounded-lg shadow-sm">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            {Icons.settings}
          </div>
          <div>
            <h1 className="text-xl font-semibold">系统设置</h1>
            <p className="text-sm text-white/80 mt-0.5">管理您的账户和系统偏好设置</p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* 个人信息 */}
          <SettingSection icon={Icons.user} title="个人信息" description="管理您的账户基本信息" iconBg="bg-blue-500">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                A
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">Admin</h4>
                <p className="text-sm text-gray-500">系统管理员</p>
              </div>
              <button className="h-9 px-4 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors">
                编辑资料
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-xs text-gray-500 mb-1">用户名</Label>
                <Input value="admin" disabled className="bg-gray-50" />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">邮箱地址</Label>
                <Input value="admin@example.com" disabled className="bg-gray-50" />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">手机号码</Label>
                <Input value="+86 138****8888" disabled className="bg-gray-50" />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">部门</Label>
                <Input value="信息技术部" disabled className="bg-gray-50" />
              </div>
            </div>
          </SettingSection>

          {/* 通知设置 */}
          <SettingSection icon={Icons.bell} title="通知设置" description="配置消息通知方式" iconBg="bg-amber-500">
            <div className="divide-y divide-gray-100">
              <Switch
                checked={notifications.email}
                onChange={(v) => setNotifications({ ...notifications, email: v })}
                label="邮件通知"
                description="接收重要事项的邮件提醒"
              />
              <Switch
                checked={notifications.push}
                onChange={(v) => setNotifications({ ...notifications, push: v })}
                label="浏览器推送"
                description="在浏览器中接收实时通知"
              />
              <Switch
                checked={notifications.sms}
                onChange={(v) => setNotifications({ ...notifications, sms: v })}
                label="短信通知"
                description="接收紧急事项的短信提醒"
              />
            </div>
          </SettingSection>

          {/* 外观设置 */}
          <SettingSection icon={Icons.palette} title="外观设置" description="自定义界面外观主题" iconBg="bg-purple-500">
            <div className="flex gap-3">
              <ThemeOption
                value="light"
                label="浅色模式"
                active={theme === 'light'}
                onClick={() => setTheme('light')}
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" /></svg>}
              />
              <ThemeOption
                value="dark"
                label="深色模式"
                active={theme === 'dark'}
                onClick={() => setTheme('dark')}
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>}
              />
              <ThemeOption
                value="system"
                label="跟随系统"
                active={theme === 'system'}
                onClick={() => setTheme('system')}
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" strokeLinecap="round" /></svg>}
              />
            </div>
          </SettingSection>

          {/* 语言和地区 */}
          <SettingSection icon={Icons.globe} title="语言和地区" description="设置界面语言和区域格式" iconBg="bg-emerald-500">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-xs text-gray-500 mb-1">界面语言</Label>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  options={[
                    { value: 'zh-CN', label: '简体中文' },
                    { value: 'zh-TW', label: '繁體中文' },
                    { value: 'en-US', label: 'English (US)' },
                    { value: 'ja-JP', label: '日本語' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">时区</Label>
                <Select
                  value="Asia/Shanghai"
                  onChange={() => {}}
                  options={[
                    { value: 'Asia/Shanghai', label: '(UTC+8) 中国标准时间' },
                    { value: 'Asia/Tokyo', label: '(UTC+9) 日本标准时间' },
                    { value: 'America/New_York', label: '(UTC-5) 美国东部时间' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">日期格式</Label>
                <Select
                  value="YYYY-MM-DD"
                  onChange={() => {}}
                  options={[
                    { value: 'YYYY-MM-DD', label: '2024-12-31' },
                    { value: 'DD/MM/YYYY', label: '31/12/2024' },
                    { value: 'MM/DD/YYYY', label: '12/31/2024' },
                  ]}
                />
              </div>
              <div>
                <Label className="block text-xs text-gray-500 mb-1">数字格式</Label>
                <Select
                  value="1,234.56"
                  onChange={() => {}}
                  options={[
                    { value: '1,234.56', label: '1,234.56' },
                    { value: '1.234,56', label: '1.234,56' },
                    { value: '1 234.56', label: '1 234.56' },
                  ]}
                />
              </div>
            </div>
          </SettingSection>

          {/* 安全设置 */}
          <SettingSection icon={Icons.security} title="安全设置" description="管理账户安全选项" iconBg="bg-red-500">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">修改密码</span>
                  <p className="text-xs text-gray-500 mt-0.5">上次修改：30 天前</p>
                </div>
                <button className="h-9 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                  修改密码
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <span className="text-sm font-medium text-gray-900">双因素认证</span>
                  <p className="text-xs text-gray-500 mt-0.5">增强账户安全性</p>
                </div>
                <button className="h-9 px-4 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-medium hover:bg-emerald-100 transition-colors">
                  已启用
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <span className="text-sm font-medium text-gray-900">登录记录</span>
                  <p className="text-xs text-gray-500 mt-0.5">查看最近的登录活动</p>
                </div>
                <button className="h-9 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                  查看记录
                </button>
              </div>
            </div>
          </SettingSection>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
