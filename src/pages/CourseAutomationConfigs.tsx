import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courseAutomationConfigApi } from '../lib/api';
import type {
  CourseAutomationConfig,
  CourseAutomationConfigForm,
  CourseQuestion,
} from '../types';

const createEmptyQuestion = (): CourseQuestion => ({
  id: '',
  text: '',
  allowsTextReply: false,
  options: [
    { key: '', label: '' },
  ],
});

const createEmptyForm = (): CourseAutomationConfigForm => ({
  courseSlug: '',
  courseTitle: '',
  curriculumUrl: '',
  aliases: [],
  metaCampaignNames: [],
  metaAdsetNames: [],
  metaAdNames: [],
  whatsappQuestions: [createEmptyQuestion()],
  isActive: true,
});

const toCommaSeparated = (items: string[]): string => items.join(', ');

const fromCommaSeparated = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeForm = (form: CourseAutomationConfigForm): CourseAutomationConfigForm => ({
  ...form,
  courseSlug: form.courseSlug.trim().toLowerCase(),
  courseTitle: form.courseTitle.trim(),
  curriculumUrl: form.curriculumUrl.trim(),
  aliases: form.aliases.map((item) => item.trim()).filter(Boolean),
  metaCampaignNames: form.metaCampaignNames.map((item) => item.trim()).filter(Boolean),
  metaAdsetNames: form.metaAdsetNames.map((item) => item.trim()).filter(Boolean),
  metaAdNames: form.metaAdNames.map((item) => item.trim()).filter(Boolean),
  whatsappQuestions: form.whatsappQuestions.map((question) => ({
    ...question,
    id: question.id.trim(),
    text: question.text.trim(),
    options: question.options.map((option) => ({
      key: option.key.trim(),
      label: option.label.trim(),
    })),
  })),
});

const mapConfigToForm = (config: CourseAutomationConfig): CourseAutomationConfigForm => ({
  courseSlug: config.courseSlug,
  courseTitle: config.courseTitle,
  curriculumUrl: config.curriculumUrl,
  aliases: config.aliases || [],
  metaCampaignNames: config.metaCampaignNames || [],
  metaAdsetNames: config.metaAdsetNames || [],
  metaAdNames: config.metaAdNames || [],
  whatsappQuestions:
    config.whatsappQuestions?.length > 0
      ? config.whatsappQuestions
      : [createEmptyQuestion()],
  isActive: config.isActive,
});

const CourseAutomationConfigs: React.FC = () => {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<CourseAutomationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [aliasInput, setAliasInput] = useState('');
  const [campaignInput, setCampaignInput] = useState('');
  const [adsetInput, setAdsetInput] = useState('');
  const [adInput, setAdInput] = useState('');
  const [form, setForm] = useState<CourseAutomationConfigForm>(createEmptyForm());

  useEffect(() => {
    fetchConfigs();
  }, []);

  const syncArrayInputs = (configForm: CourseAutomationConfigForm) => {
    setAliasInput(toCommaSeparated(configForm.aliases));
    setCampaignInput(toCommaSeparated(configForm.metaCampaignNames));
    setAdsetInput(toCommaSeparated(configForm.metaAdsetNames));
    setAdInput(toCommaSeparated(configForm.metaAdNames));
  };

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await courseAutomationConfigApi.getCourseAutomationConfigs(1, 100);
      if (response.success) {
        setConfigs(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch course automation configs');
      }
    } catch (error) {
      toast.error('Failed to fetch course automation configs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedConfigId(null);
    const emptyForm = createEmptyForm();
    setForm(emptyForm);
    syncArrayInputs(emptyForm);
  };

  const handleSelectConfig = (config: CourseAutomationConfig) => {
    setSelectedConfigId(config._id);
    const mapped = mapConfigToForm(config);
    setForm(mapped);
    syncArrayInputs(mapped);
  };

  const handleQuestionChange = (index: number, patch: Partial<CourseQuestion>) => {
    setForm((prev) => ({
      ...prev,
      whatsappQuestions: prev.whatsappQuestions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question
      ),
    }));
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    field: 'key' | 'label',
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      whatsappQuestions: prev.whatsappQuestions.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex ? { ...option, [field]: value } : option
          ),
        };
      }),
    }));
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      whatsappQuestions: [...prev.whatsappQuestions, createEmptyQuestion()],
    }));
  };

  const removeQuestion = (questionIndex: number) => {
    setForm((prev) => ({
      ...prev,
      whatsappQuestions:
        prev.whatsappQuestions.length === 1
          ? [createEmptyQuestion()]
          : prev.whatsappQuestions.filter((_, index) => index !== questionIndex),
    }));
  };

  const addOption = (questionIndex: number) => {
    setForm((prev) => ({
      ...prev,
      whatsappQuestions: prev.whatsappQuestions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: [...question.options, { key: '', label: '' }],
            }
          : question
      ),
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setForm((prev) => ({
      ...prev,
      whatsappQuestions: prev.whatsappQuestions.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options:
            question.options.length === 1
              ? [{ key: '', label: '' }]
              : question.options.filter((_, currentIndex) => currentIndex !== optionIndex),
        };
      }),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = normalizeForm({
      ...form,
      aliases: fromCommaSeparated(aliasInput),
      metaCampaignNames: fromCommaSeparated(campaignInput),
      metaAdsetNames: fromCommaSeparated(adsetInput),
      metaAdNames: fromCommaSeparated(adInput),
    });

    setSaving(true);
    try {
      const response = selectedConfigId
        ? await courseAutomationConfigApi.updateCourseAutomationConfig(selectedConfigId, payload)
        : await courseAutomationConfigApi.createCourseAutomationConfig(payload);

      if (!response.success) {
        toast.error(response.message || 'Failed to save configuration');
        return;
      }

      toast.success(selectedConfigId ? 'Configuration updated' : 'Configuration created');
      await fetchConfigs();

      if (response.data) {
        setSelectedConfigId(response.data._id);
        const mapped = mapConfigToForm(response.data);
        setForm(mapped);
        syncArrayInputs(mapped);
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this course automation config?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await courseAutomationConfigApi.deleteCourseAutomationConfig(id);
      if (!response.success) {
        toast.error(response.message || 'Failed to delete configuration');
        return;
      }

      toast.success('Configuration deleted');
      if (selectedConfigId === id) {
        handleCreateNew();
      }
      await fetchConfigs();
    } catch (error) {
      toast.error('Failed to delete configuration');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredConfigs = configs.filter((config) => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      config.courseSlug.toLowerCase().includes(query) ||
      config.courseTitle.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Automation Configs</h1>
          <p className="text-gray-600 mt-2">
            Manage slug mappings, curriculum links, and WhatsApp question flows from CRM.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/settings')} className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </button>
          <button onClick={fetchConfigs} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button onClick={handleCreateNew} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            New Config
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-1">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-gray-600" />
              <h2 className="card-title">Available Configs</h2>
            </div>
          </div>
          <div className="card-body space-y-4">
            <input
              type="text"
              className="form-input"
              placeholder="Search by slug or title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="loading-spinner w-6 h-6"></div>
              </div>
            ) : filteredConfigs.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No configs found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConfigs.map((config) => (
                  <button
                    key={config._id}
                    type="button"
                    onClick={() => handleSelectConfig(config)}
                    className={`w-full text-left border rounded-lg p-4 transition ${
                      selectedConfigId === config._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{config.courseTitle}</div>
                        <div className="text-sm text-gray-500 mt-1">{config.courseSlug}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {config.whatsappQuestions.length} questions
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            config.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {config.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(config._id);
                          }}
                          disabled={deletingId === config._id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card xl:col-span-2">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-gray-600" />
              <h2 className="card-title">
                {selectedConfigId ? 'Edit Automation Config' : 'Create Automation Config'}
              </h2>
            </div>
          </div>
          <form onSubmit={handleSave} className="card-body space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Course Slug</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.courseSlug}
                  onChange={(e) => setForm((prev) => ({ ...prev, courseSlug: e.target.value }))}
                  placeholder="data-analytics"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.courseTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, courseTitle: e.target.value }))}
                  placeholder="Data Analytics Course with Generative AI"
                  required
                />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Curriculum URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={form.curriculumUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, curriculumUrl: e.target.value }))}
                  placeholder="https://example.com/curriculum.pdf"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Aliases</label>
                <input
                  type="text"
                  className="form-input"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="data analytics genai, analytics ai"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Meta Campaign Names</label>
                <input
                  type="text"
                  className="form-input"
                  value={campaignInput}
                  onChange={(e) => setCampaignInput(e.target.value)}
                  placeholder="data analytics, generative ai"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Meta Adset Names</label>
                <input
                  type="text"
                  className="form-input"
                  value={adsetInput}
                  onChange={(e) => setAdsetInput(e.target.value)}
                  placeholder="freshers, working professionals"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Meta Ad Names</label>
                <input
                  type="text"
                  className="form-input"
                  value={adInput}
                  onChange={(e) => setAdInput(e.target.value)}
                  placeholder="lead ad 1, lead ad 2"
                />
              </div>
              <div className="form-group md:col-span-2">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active configuration
                </label>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">WhatsApp Questions</h3>
                  <p className="text-sm text-gray-500">Configure the question flow and clickable options.</p>
                </div>
                <button type="button" className="btn btn-secondary" onClick={addQuestion}>
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-4">
                {form.whatsappQuestions.map((question, questionIndex) => (
                  <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Question {questionIndex + 1}</h4>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">Question ID</label>
                        <input
                          type="text"
                          className="form-input"
                          value={question.id}
                          onChange={(e) => handleQuestionChange(questionIndex, { id: e.target.value })}
                          placeholder="preferred_call_slot"
                          required
                        />
                      </div>
                      <div className="form-group flex items-end">
                        <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={Boolean(question.allowsTextReply)}
                            onChange={(e) =>
                              handleQuestionChange(questionIndex, { allowsTextReply: e.target.checked })
                            }
                          />
                          Allow text reply
                        </label>
                      </div>
                      <div className="form-group md:col-span-2">
                        <label className="form-label">Question Text</label>
                        <textarea
                          className="form-input min-h-[88px]"
                          value={question.text}
                          onChange={(e) => handleQuestionChange(questionIndex, { text: e.target.value })}
                          placeholder="What call timing suits you best for today?"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-gray-900">Options</h5>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => addOption(questionIndex)}
                        >
                          <Plus className="w-4 h-4" />
                          Add Option
                        </button>
                      </div>

                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
                          <input
                            type="text"
                            className="form-input"
                            value={option.key}
                            onChange={(e) =>
                              handleOptionChange(questionIndex, optionIndex, 'key', e.target.value)
                            }
                            placeholder="first_half"
                            required
                          />
                          <input
                            type="text"
                            className="form-input"
                            value={option.label}
                            onChange={(e) =>
                              handleOptionChange(questionIndex, optionIndex, 'label', e.target.value)
                            }
                            placeholder="First half of the day"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
              <button type="button" className="btn btn-secondary" onClick={handleCreateNew}>
                Reset Form
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <div className="loading-spinner w-4 h-4 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Config
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseAutomationConfigs;
