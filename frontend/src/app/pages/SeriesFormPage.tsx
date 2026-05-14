import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { seriesApi } from '../api';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function SeriesFormPage() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!seriesId;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    release_year: new Date().getFullYear(),
    status: 'ongoing' as 'ongoing' | 'completed' | 'cancelled',
    total_seasons: 1,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && seriesId) {
      loadSeries(seriesId);
    }
  }, [isEditing, seriesId]);

  async function loadSeries(id: string) {
    try {
      setLoading(true);
      const data = await seriesApi.getById(id);
      setFormData({
        title: data.title,
        description: data.description,
        genre: data.genre,
        release_year: data.release_year,
        status: data.status,
        total_seasons: data.total_seasons,
      });
    } catch (error) {
      toast.error('Failed to load series');
      navigate('/series');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing && seriesId) {
        await seriesApi.update(seriesId, formData);
        toast.success('Series updated successfully');
      } else {
        await seriesApi.create(formData);
        toast.success('Series created successfully');
      }
      navigate('/series');
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} series`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/series')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Series
        </Button>
        <h1 className="text-3xl text-gray-900">
          {isEditing ? 'Edit Series' : 'Create New Series'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Update series information' : 'Add a new series to your collection'}
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl text-gray-900">Series Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              required
              placeholder="Enter series title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Textarea
              label="Description"
              required
              placeholder="Enter series description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Genre"
                required
                placeholder="e.g., Drama, Comedy"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              />

              <Input
                label="Release Year"
                type="number"
                required
                min="1900"
                max={new Date().getFullYear()}
                value={formData.release_year}
                onChange={(e) =>
                  setFormData({ ...formData, release_year: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Status"
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'ongoing' | 'completed' | 'cancelled',
                  })
                }
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>

              <Input
                label="Total Seasons"
                type="number"
                required
                min="1"
                value={formData.total_seasons}
                onChange={(e) =>
                  setFormData({ ...formData, total_seasons: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/series')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Update Series' : 'Create Series'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
