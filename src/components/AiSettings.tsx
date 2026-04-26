import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { AiConfig } from '../lib/tauri';
import * as api from '../lib/tauri';

const DEFAULT_CONFIG: AiConfig = {
  enabled: false,
  provider: 'deepseek',
  base_url: 'https://api.deepseek.com/v1',
  api_key: '',
  model: 'deepseek-v4-flash',
  verified: [],
};

const PROVIDERS: { key: string; label: string; defaultUrl: string; defaultModel: string }[] = [
  { key: 'deepseek', label: 'DeepSeek', defaultUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-v4-flash' },
  { key: 'openai', label: 'OpenAI', defaultUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  { key: 'claude', label: 'Claude', defaultUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-3-haiku' },
  { key: 'ollama', label: 'Ollama 本地', defaultUrl: 'http://localhost:11434', defaultModel: 'qwen3.5:4b' },
];

interface AiSettingsProps {
  onClose: () => void;
}

export function AiSettings({ onClose }: AiSettingsProps) {
  const vaultPath = useProjectStore((s) => s.vaultPath);
  const [config, setConfig] = useState<AiConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (vaultPath) {
      api.getAiConfig(vaultPath).then(setConfig).catch(() => setConfig(DEFAULT_CONFIG));
    }
  }, [vaultPath]);

  const save = async () => {
    if (!vaultPath) return;
    setSaving(true);
    await api.saveAiConfig(vaultPath, config);
    setSaving(false);
  };

  const testConnection = async () => {
    if (!vaultPath) return;
    setTesting(true);
    setTestResult(null);
    try {
      // Save config first, mark as verified
      const updated = {
        ...config, enabled: true,
        verified: config.verified.includes(config.provider) ? config.verified : [...config.verified, config.provider],
      };
      await api.saveAiConfig(vaultPath, updated);
      setConfig(updated);
      const reply = await api.aiChat(vaultPath, {
        messages: [{ role: 'user', content: '你好，请回复"连接成功"' }],
        temperature: 0.1,
        max_tokens: 50,
      });
      setTestResult(`成功: ${reply}`);
    } catch (e) {
      setTestResult(`失败: ${e}`);
    }
    setTesting(false);
  };

  const setProvider = (key: string) => {
    const p = PROVIDERS.find((p) => p.key === key);
    setConfig({ ...config, provider: key, base_url: p?.defaultUrl || '', model: p?.defaultModel || '' });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 14,
        padding: 32, width: 460, maxHeight: '80vh', overflow: 'auto',
        boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink-green)' }}>AI 设置</span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-muted)', fontSize: 18, fontFamily: 'inherit' }}>
            ✕
          </button>
        </div>

        {/* 全局开关 */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, cursor: 'pointer' }}>
          <div style={{
            width: 44, height: 24, borderRadius: 12, position: 'relative',
            background: config.enabled ? 'var(--color-bamboo-green)' : '#ccc',
            transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: config.enabled ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          <span style={{ fontSize: 14, color: 'var(--color-ink-green)', fontWeight: 500 }}>
            {config.enabled ? 'AI 已开启' : 'AI 已关闭'}
          </span>
          <input type="checkbox" checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            style={{ display: 'none' }} />
        </label>

        {/* 服务商选择 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 8 }}>服务商</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {PROVIDERS.map((p) => (
              <button key={p.key} onClick={() => setProvider(p.key)}
                style={{
                  padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  border: config.provider === p.key ? 'none' : '1px solid rgba(107,155,107,0.2)',
                  borderRadius: 980,
                  background: config.provider === p.key ? 'var(--color-bamboo-green)' : 'transparent',
                  color: config.provider === p.key ? '#fff' : 'var(--color-ink-muted)',
                  transition: 'all 0.15s',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 输入框 */}
        <InputRow label="API 地址" value={config.base_url}
          onChange={(v) => setConfig({ ...config, base_url: v })} />
        <InputRow label="API Key" value={config.api_key} type="password"
          onChange={(v) => setConfig({ ...config, api_key: v })}
          placeholder={config.provider === 'ollama' ? 'Ollama 无需 Key' : 'sk-...'} />
        <InputRow label="模型名称" value={config.model}
          onChange={(v) => setConfig({ ...config, model: v })} />

        {/* 操作 */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={testConnection} disabled={testing}
            style={{
              padding: '9px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              border: '1px solid var(--color-accent-blue)', borderRadius: 980,
              background: 'transparent', color: 'var(--color-accent-blue)',
              transition: 'all 0.15s',
            }}>
            {testing ? '测试中...' : '测试连接'}
          </button>
          <button onClick={save} disabled={saving}
            style={{
              padding: '9px 28px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              border: 'none', borderRadius: 980, color: '#fff',
              background: 'linear-gradient(135deg, #6b9b6b, #5a8a5a)',
              boxShadow: '0 2px 6px rgba(107,155,107,0.3)', transition: 'all 0.15s',
            }}>
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>

        {testResult && (
          <div style={{
            marginTop: 16, padding: 12, borderRadius: 8, fontSize: 13,
            background: testResult.startsWith('成功') ? 'rgba(107,155,107,0.08)' : 'rgba(211,47,47,0.08)',
            color: testResult.startsWith('成功') ? 'var(--color-bamboo-green)' : '#d32f2f',
            wordBreak: 'break-all',
          }}>
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}

function InputRow({ label, value, type, placeholder, onChange }: {
  label: string; value: string; type?: string; placeholder?: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 4 }}>{label}</div>
      <input type={type || 'text'} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '8px 12px', fontSize: 13,
          border: '1px solid rgba(107,155,107,0.2)', borderRadius: 8,
          outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
          background: 'var(--color-paper-white)',
        }} />
    </div>
  );
}
