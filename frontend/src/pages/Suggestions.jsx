import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Header from '../components/layout/Header';
import { Lightbulb, Send, Trash2, User } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

const Suggestions = () => {
  const { user } = useAuth();
  const isSuper = user?.role === 'super';

  const [suggestions, setSuggestions] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/api/suggestions');
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.post('/api/suggestions', { title, description });
      setSuccess('Your suggestion has been submitted. Thank you!');
      setTitle('');
      setDescription('');
      fetchSuggestions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/suggestions/${deleteTarget.id}`);
      setSuccess('Suggestion deleted');
      setDeleteTarget(null);
      fetchSuggestions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={24} className="text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Suggestions</h2>
          </div>
          <p className="text-gray-600 dark:text-slate-400">
            {isSuper
              ? 'View all suggestions from team members and submit your own.'
              : 'Share your ideas to improve the dashboard.'}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm">{success}</div>}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submit a Suggestion</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="sug-title" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="sug-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                placeholder="e.g. Add data export feature"
              />
            </div>
            <div>
              <label htmlFor="sug-desc" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="sug-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors resize-none"
                placeholder="Describe your suggestion in detail..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </div>
        </form>

        {/* Suggestions List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isSuper ? 'All Suggestions' : 'Your Suggestions'}
            {suggestions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-slate-400">({suggestions.length})</span>
            )}
          </h3>

          {suggestions.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
              <Lightbulb size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-slate-400">
                {isSuper ? 'No suggestions yet.' : 'You haven\'t submitted any suggestions yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((s) => (
                <div key={s.suggestion_id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{s.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400 whitespace-pre-wrap">{s.description}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {s.submitted_by_name}
                        </span>
                        <span>
                          {new Date(s.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    {isSuper && (
                      <button
                        onClick={() => setDeleteTarget({ id: s.suggestion_id, title: s.title })}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                        title="Delete suggestion"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Suggestion"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete Suggestion"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Suggestions;
